import { requireAdmin } from '@/lib/auth-guard';
import { BrandsManager } from '@/components/admin/BrandsManager';
import type { Brand } from '@/types/database.types';


export default async function AdminBrandsPage() {
  const { supabase } = await requireAdmin();

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('display_order', { ascending: true });

  const brandList: Brand[] = brands ?? [];

  return <BrandsManager initialBrands={brandList} />;
}
