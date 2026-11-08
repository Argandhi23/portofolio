import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ result: { data: [] as unknown[], error: null as unknown } }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ order: async () => mocks.result }) }) }) }) }));
import { getBrands, getServices } from '@/lib/queries/portfolio.queries';
beforeEach(() => { mocks.result = { data: [], error: null }; });
it('keeps intentionally empty active brands empty', async () => { expect(await getBrands()).toEqual([]); });
it('keeps intentionally empty active services empty', async () => { expect(await getServices()).toEqual([]); });
