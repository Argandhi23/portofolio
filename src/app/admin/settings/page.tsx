import { requireAdmin } from '@/lib/auth-guard';
import { SettingsForm } from '@/components/admin/SettingsForm';
import type { SiteSettings } from '@/types/database.types';


export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();

  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();

  return <SettingsForm initialSettings={settings as SiteSettings | null} />;
}
