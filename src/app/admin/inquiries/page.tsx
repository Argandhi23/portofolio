import { requireAdmin } from '@/lib/auth-guard';
import { InquiriesManager } from '@/components/admin/InquiriesManager';

export default async function AdminInquiriesPage() {
  const { supabase } = await requireAdmin();

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="border-b border-white/[0.07] pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF5510] uppercase tracking-wider mb-1">
          <span>Client Leads &amp; Briefs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Kotak Masuk Pesan Proyek
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          Tinjau, tandai status, dan balas langsung brief proyek dari calon klien atau rekruter.
        </p>
      </div>

      <InquiriesManager initialInquiries={inquiries ?? []} />
    </div>
  );
}
