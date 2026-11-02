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

  const shortcuts = [
    { href: '/admin/projects', title: 'Projects', icon: FolderGit2 },
    { href: '/admin/inquiries', title: 'Pesan Klien', icon: Inbox },
    { href: '/admin/services', title: 'Layanan', icon: Sparkles },
    { href: '/admin/settings', title: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <Link
          href="/admin/projects/new"
          className="pill-btn inline-flex items-center gap-2 rounded-full bg-[#FF5510] hover:bg-[#FF6B2B] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#FF5510]/20 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Project</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-[24px] border border-white/[0.07] bg-[#121212] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Projects
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

        <div className="rounded-[24px] border border-white/[0.07] bg-[#121212] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Featured
            </span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {featuredProjects ?? 0}
            </span>
          </div>
        </div>

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
          </div>
        </Link>

        <div className="rounded-[24px] border border-white/[0.07] bg-[#121212] p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Layanan
            </span>
            <Sparkles className="h-4 w-4 text-[#FF5510]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {totalServices ?? 0}
            </span>
          </div>
        </div>

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
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[24px] border border-white/[0.07] bg-[#121212] p-5 hover:border-[#FF5510]/45 hover:bg-[#151515] transition-all duration-300 shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-2xl bg-[#181818] border border-white/[0.08] text-[#FF5510] flex items-center justify-center group-hover:scale-105 transition">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-white group-hover:text-[#FF5510] transition-colors">
                  {item.title}
                </h2>
              </div>
              <span className="h-8 w-8 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white/60 group-hover:bg-[#FF5510] group-hover:text-white transition">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
