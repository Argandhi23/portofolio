import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(), cleanup: vi.fn(), single: vi.fn(), from: vi.fn(),
}));
vi.mock('@/lib/auth-guard', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('@/actions/storage.actions', () => ({ deleteMedia: mocks.cleanup, deleteMultipleMedia: mocks.cleanup }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
import { updateProject, deleteProject, toggleProjectStatus } from '@/actions/project.actions';
import { updateBrand, deleteBrand } from '@/actions/brand.actions';
import { updateSettings } from '@/actions/settings.actions';

const id = '10000000-0000-4000-8000-000000000001';
const input = {
  title: 'Project', slug: 'project', category: 'Web', thumbnail_url: '/new.webp',
  gallery_urls: [], tech_stack: [], status: 'published' as const, is_featured: false, display_order: 0,
};
const old = { thumbnail_url: '/old.webp', gallery_urls: ['/gallery.webp'], slug: 'old' };
let chain: Record<string, ReturnType<typeof vi.fn>>;
beforeEach(() => {
  vi.clearAllMocks();
  chain = Object.fromEntries(['select', 'eq', 'update', 'delete', 'upsert'].map((key) => [key, vi.fn().mockImplementation(() => chain)]));
  chain.single = mocks.single;
  mocks.from.mockReturnValue(chain);
  mocks.requireAdmin.mockResolvedValue({ supabase: { from: mocks.from } });
  mocks.cleanup.mockResolvedValue({ success: true, message: 'ok' });
});

describe('database-first media cleanup', () => {
  it('keeps project files if save fails', async () => {
    mocks.single.mockResolvedValueOnce({ data: old }).mockResolvedValueOnce({ error: { code: '23505' } });
    expect((await updateProject(id, input)).success).toBe(false);
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });
  it('keeps media moved between thumbnail and gallery', async () => {
    const swapped = { ...input, thumbnail_url: '/gallery.webp', gallery_urls: ['/old.webp'] };
    mocks.single.mockResolvedValueOnce({ data: old }).mockResolvedValueOnce({ data: swapped });
    expect((await updateProject(id, swapped)).success).toBe(true);
    expect(mocks.cleanup).toHaveBeenCalledWith([]);
  });
  it('reports a cleanup failure after a successful save without pretending the save failed', async () => {
    mocks.single.mockResolvedValueOnce({ data: old }).mockResolvedValueOnce({ data: input });
    mocks.cleanup.mockResolvedValue({ success: false, message: 'Storage offline' });
    const result = await updateProject(id, input);
    expect(result.success).toBe(true);
    expect(result.message).toContain('Storage offline');
    expect(result.warning).toContain('Storage offline');
    expect(mocks.cleanup).toHaveBeenCalledWith(['/old.webp', '/gallery.webp']);
  });
  it('stops if previous media cannot be loaded', async () => {
    mocks.single.mockResolvedValueOnce({ error: { message: 'offline' } });
    expect((await updateProject(id, input)).success).toBe(false);
    expect(chain.update).not.toHaveBeenCalled();
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });
  it.each(['project', 'brand'])('keeps %s media if deletion fails', async (kind) => {
    mocks.single.mockResolvedValueOnce({ data: { ...old, logo_url: '/old.webp' } });
    chain.eq.mockImplementationOnce(() => chain).mockResolvedValueOnce({ error: { message: 'offline' } });
    const result = kind === 'project' ? await deleteProject(id) : await deleteBrand(id);
    expect(result.success).toBe(false);
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });
  it('keeps brand logo if update fails', async () => {
    mocks.single.mockResolvedValueOnce({ data: { logo_url: 'https://example.com/old.webp' } }).mockResolvedValueOnce({ error: { message: 'offline' } });
    expect((await updateBrand(id, { name: 'Brand', logo_url: 'https://example.com/new.webp', display_order: 0, is_active: true })).success).toBe(false);
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });
  it('keeps hero image if settings save fails', async () => {
    mocks.single.mockResolvedValueOnce({ data: { hero_image_url: '/old.webp' } }).mockResolvedValueOnce({ error: { message: 'offline' } });
    const result = await updateSettings({ brand_name: 'Brand', hero_greeting: 'Hello', hero_title: 'Title', hero_subtitle: 'Subtitle', hero_description: 'Description', about_label: 'About', about_heading: 'Heading', about_description: 'Description', whatsapp_number: '123', cta_url: '#contact' });
    expect(result.success).toBe(false);
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });
  it('rejects malformed mutation IDs before querying', async () => {
    expect((await toggleProjectStatus('invalid', 'published')).success).toBe(false);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
