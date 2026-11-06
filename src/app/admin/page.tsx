import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guard';
import { computeVisitorAnalytics } from '@/lib/visitor-utils';
import { VisitorAnalyticsPanel } from '@/components/admin/VisitorAnalyticsPanel';
import type { PageView } from '@/types/database.types';
import {
  FolderGit2,
  Inbox,
  Sparkles,
  Code2,
  Settings,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [
    { count: totalProjects },
    { count: publishedProjects },
    { count: totalServices },
    { count: totalBrands },
    { count: unreadInquiries },
    { data: pageViewsData },
  ] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('brands')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'unread'),
    supabase
      .from('page_views')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000),
  ]);

  const recentViews: PageView[] = (pageViewsData as PageView[] | null) ?? [];
  const analyticsSummary = computeVisitorAnalytics(recentViews);

  const contentShortcuts = [
    {
      href: '/admin/projects',
      title: 'Projects',
      stat: `${totalProjects ?? 0} total (${publishedProjects ?? 0} tayang)`,
      icon: FolderGit2,
    },
    {
      href: '/admin/inquiries',
      title: 'Pesan Klien',
      stat: `${unreadInquiries ?? 0} belum dibaca`,
      icon: Inbox,
      highlight: (unreadInquiries ?? 0) > 0,
    },
    {
      href: '/admin/services',
      title: 'Layanan',
      stat: `${totalServices ?? 0} aktif`,
      icon: Sparkles,
    },
    {
      href: '/admin/brands',
      title: 'Tech Stack',
      stat: `${totalBrands ?? 0} aktif`,
      icon: Code2,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Pantau kunjungan website dan kelola konten portofolio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-full bg-[#181818] hover:bg-[#202020] border border-white/[0.08] px-4 py-2 text-xs font-semibold text-white/80 hover:text-white transition"
          >
            <Settings className="h-3.5 w-3.5 text-[#9E1B32]" />
            <span>Pengaturan</span>
          </Link>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#9E1B32] hover:bg-[#B8233E] px-4 py-2 text-xs font-bold text-white transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Project</span>
          </Link>
        </div>
      </div>

      {/* 1. Visitor Analytics Panel (Today, Week, Month, Year, All-Time + Who Visited) */}
      <VisitorAnalyticsPanel
        summary={analyticsSummary}
        recentViews={recentViews}
      />

      {/* 2. Compact Content Management Shortcuts */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/55">
          Kelola Konten Portofolio
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {contentShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group rounded-2xl border p-4 transition-colors flex items-center justify-between ${
                  item.highlight
                    ? 'border-[#9E1B32]/45 bg-[#151213] hover:border-[#9E1B32]'
                    : 'border-white/[0.07] bg-[#121212] hover:border-white/[0.16]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#181818] border border-white/[0.07] text-[#9E1B32] flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-[#9E1B32] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {item.stat}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
