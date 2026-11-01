import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guard';
import {
  FolderGit2,
  Inbox,
  Sparkles,
  Code2,
  Settings,
  Plus,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [
    { count: totalProjects },
    { count: publishedProjects },
    { count: featuredProjects },
    { count: totalServices },
    { count: totalBrands },
    { count: unreadInquiries },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true),
    supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('brands')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread'),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF5510] uppercase tracking-wider mb-1">
            <span>Argandhi Portfolio Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ringkasan Kontrol Admin
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Kelola dan pantau seluruh konten portofolio serta brief klien secara terpusat.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="pill-btn inline-flex items-center gap-2.5 rounded-full bg-[#FF5510] hover:bg-[#FF6B2B] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#FF5510]/20 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Project Baru</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Metric 1 */}
        <div className="rounded-[24px] border border-white/[0.07] bg-[#121212] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Project
            </span>
            <FolderGit2 className="h-4 w-4 text-[#FF5510]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {totalProjects ?? 0}
            </span>
            <span className="text-xs text-white/50">
              ({publishedProjects ?? 0} tayang)
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-[24px] border border-white/[0.07] bg-[#121212] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Unggulan
            </span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {featuredProjects ?? 0}
            </span>
            <span className="text-xs text-white/50">featured</span>
          </div>
        </div>

        {/* Metric 3: Unread Inquiries */}
        <Link
          href="/admin/inquiries"
          className="rounded-[24px] border border-white/[0.07] hover:border-[#FF5510]/45 bg-[#121212] p-5 shadow-lg transition-colors"
        >
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Pesan Baru
            </span>
            <Inbox className="h-4 w-4 text-[#FF5510]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {unreadInquiries ?? 0}
            </span>
            <span className="text-xs text-[#FF5510] font-semibold">
              belum dibaca
            </span>
          </div>
        </Link>

        {/* Metric 4 */}
        <div className="rounded-[24px] border border-white/[0.07] bg-[#121212] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Layanan Aktif
            </span>
            <Sparkles className="h-4 w-4 text-[#FF5510]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {totalServices ?? 0}
            </span>
            <span className="text-xs text-white/50">#01-#04</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="rounded-[24px] border border-white/[0.07] bg-[#121212] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Tech Stack
            </span>
            <Code2 className="h-4 w-4 text-[#FF5510]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {totalBrands ?? 0}
            </span>
            <span className="text-xs text-white/50">ekosistem</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/projects"
          className="group rounded-[28px] border border-white/[0.07] bg-[#121212] p-6 hover:border-[#FF5510]/45 hover:bg-[#151515] transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-2xl bg-[#181818] border border-white/[0.08] text-[#FF5510] flex items-center justify-center group-hover:scale-105 transition">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <span className="h-8 w-8 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white/60 group-hover:bg-[#FF5510] group-hover:text-white transition">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-[#FF5510] transition-colors">
              Kelola Portofolio
            </h2>
            <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
              Tambah, sunting, ubah status publish, dan susun urutan proyek studi kasus.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/inquiries"
          className="group rounded-[28px] border border-white/[0.07] bg-[#121212] p-6 hover:border-[#FF5510]/45 hover:bg-[#151515] transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-2xl bg-[#181818] border border-white/[0.08] text-[#FF5510] flex items-center justify-center group-hover:scale-105 transition">
              <Inbox className="h-5 w-5" />
            </div>
            <span className="h-8 w-8 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white/60 group-hover:bg-[#FF5510] group-hover:text-white transition">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-[#FF5510] transition-colors">
              Kotak Masuk Klien
            </h2>
            <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
              Baca brief proyek yang masuk dari pengunjung dan balas dengan 1 klik.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/services"
          className="group rounded-[28px] border border-white/[0.07] bg-[#121212] p-6 hover:border-[#FF5510]/45 hover:bg-[#151515] transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-2xl bg-[#181818] border border-white/[0.08] text-[#FF5510] flex items-center justify-center group-hover:scale-105 transition">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="h-8 w-8 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white/60 group-hover:bg-[#FF5510] group-hover:text-white transition">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-[#FF5510] transition-colors">
              Kelola Layanan (#01-#04)
            </h2>
            <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
              Sesuaikan 4 layanan spesialisasi di bawah hero dan section capabilities.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="group rounded-[28px] border border-white/[0.07] bg-[#121212] p-6 hover:border-[#FF5510]/45 hover:bg-[#151515] transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-2xl bg-[#181818] border border-white/[0.08] text-[#FF5510] flex items-center justify-center group-hover:scale-105 transition">
              <Settings className="h-5 w-5" />
            </div>
            <span className="h-8 w-8 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white/60 group-hover:bg-[#FF5510] group-hover:text-white transition">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-[#FF5510] transition-colors">
              Pengaturan Profil &amp; Teks
            </h2>
            <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
              Perbarui teks Hero, About, email kontak, nomor WhatsApp, dan tombol CTA.
            </p>
          </div>
        </Link>
      </div>

      {/* Info Callout */}
      <div className="rounded-[24px] border border-white/[0.07] bg-[#121212] p-5 text-xs text-white/70 flex items-start gap-3.5 shadow-lg">
        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white font-semibold">
            On-Demand Cache Revalidation Aktif:
          </strong>{' '}
          Setiap kali Anda menambahkan, mengubah, atau menghapus item dari panel ini,
          Next.js secara otomatis merevalidasi cache pengunjung publik secara instan
          tanpa membebani database di setiap kunjungan.
        </p>
      </div>
    </div>
  );
}
