import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), remove: vi.fn(), references: [] as unknown[], error: null as unknown, range: vi.fn() }));
vi.mock('@/lib/auth-guard', () => ({ requireAdmin: mocks.requireAdmin }));
import { deleteMedia, deleteMultipleMedia } from '@/actions/storage.actions';
const url = 'https://example-project.supabase.co/storage/v1/object/public/portfolio-media/uploads/a.webp';
beforeEach(() => {
  vi.clearAllMocks(); mocks.references = []; mocks.error = null;
  mocks.range.mockImplementation(async (start: number) => ({ data: start === 0 ? mocks.references : [], error: mocks.error }));
  const chain = { select: () => chain, order: () => chain, range: mocks.range };
  mocks.requireAdmin.mockResolvedValue({ supabase: {
    from: () => chain,
    storage: { from: () => ({ getPublicUrl: (path: string) => ({ data: { publicUrl: `https://example-project.supabase.co/storage/v1/object/public/portfolio-media/${path}` } }), remove: mocks.remove }) },
  } });
  mocks.remove.mockResolvedValue({ error: null });
});
it('preserves media still referenced by CMS rows', async () => {
  mocks.references = [{ thumbnail_url: url, gallery_urls: [], logo_url: null, hero_image_url: null }];
  expect((await deleteMedia(url)).success).toBe(true);
  expect(mocks.remove).not.toHaveBeenCalled();
});
it('fails closed when reference checks fail', async () => {
  mocks.error = { message: 'offline' };
  expect((await deleteMedia(url)).success).toBe(false);
  expect(mocks.remove).not.toHaveBeenCalled();
});
it('removes unreferenced bucket files and ignores local and foreign assets', async () => {
  expect((await deleteMultipleMedia([url, '/local.webp', url.replace('example-project', 'foreign-project')])).success).toBe(true);
  expect(mocks.remove).toHaveBeenCalledExactlyOnceWith(['uploads/a.webp']);
});
it('verifies authorization even for an empty deletion batch', async () => {
  mocks.requireAdmin.mockRejectedValue(new Error('Unauthorized'));
  expect((await deleteMultipleMedia([])).success).toBe(false);
});
it('validates deletion entries before touching storage', async () => {
  expect((await deleteMultipleMedia([42] as unknown as string[])).success).toBe(false);
  expect(mocks.remove).not.toHaveBeenCalled();
});

it('preserves a query/fragment alias with encoded object name in any reference table', async () => {
  mocks.references = [{ thumbnail_url: null, gallery_urls: [], logo_url: url.replace('a.webp', '%61.webp?download=1#preview'), hero_image_url: null }];
  expect((await deleteMedia(url)).success).toBe(true);
  expect(mocks.remove).not.toHaveBeenCalled();
});
it('checks subsequent reference pages even when the service caps pages below requested size', async () => {
  mocks.range.mockImplementation(async (start: number) => ({ error: null, data: start === 0
    ? [{ thumbnail_url: '/local.webp', gallery_urls: [] }]
    : [{ thumbnail_url: url, gallery_urls: [] }] }));
  expect((await deleteMedia(url)).success).toBe(true);
  expect(mocks.range).toHaveBeenCalledWith(1, 200);
  expect(mocks.remove).not.toHaveBeenCalled();
});
it('deduplicates URL aliases before removing the object', async () => {
  await deleteMultipleMedia([url, url + '?download=1', 'uploads/a.webp']);
  expect(mocks.remove).toHaveBeenCalledExactlyOnceWith(['uploads/a.webp']);
});

it('preserves objects if a reference response has no data even without an explicit error', async () => {
  mocks.range.mockResolvedValue({ data: null, error: null });
  expect((await deleteMedia(url)).success).toBe(false);
  expect(mocks.remove).not.toHaveBeenCalled();
});
