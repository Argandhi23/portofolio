import { requireAdmin } from '@/lib/auth-guard';
import { ServicesManager } from '@/components/admin/ServicesManager';
import type { Service } from '@/types/database.types';


export default async function AdminServicesPage() {
  const { supabase } = await requireAdmin();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true });

  const serviceList: Service[] = services ?? [];

  return <ServicesManager initialServices={serviceList} />;
}
