import { requireAdmin } from '@/lib/auth-guard';
import { InquiriesManager } from '@/components/admin/InquiriesManager';

export default async function AdminInquiriesPage() {
  const { supabase } = await requireAdmin();

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.07] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Pesan Klien
        </h1>
      </div>

      <InquiriesManager initialInquiries={inquiries ?? []} />
    </div>
  );
}
