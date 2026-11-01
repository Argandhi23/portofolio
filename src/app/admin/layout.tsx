import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Panel Kontrol Admin — Argandhi.',
  description: 'Panel manajemen konten portofolio Argandhi CMS.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure admin authentication at layout level
  const { user } = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#080808] text-white selection:bg-[#FF5510] selection:text-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/[0.07] bg-[#121212]">
        {/* Brand Header */}
        <div className="flex h-18 items-center gap-3 border-b border-white/[0.07] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5510] to-[#B82808] text-white shadow-md shadow-[#FF5510]/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">
              Argandhi.
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#FF5510] font-semibold block">
              Admin CMS Control
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <AdminSidebarNav />

        {/* User Account & Logout */}
        <div className="border-t border-white/[0.07] p-4 space-y-2.5">
          <div className="rounded-2xl bg-[#181818] border border-white/[0.06] p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
                Sesi Administrator
              </span>
            </div>
            <span className="block truncate text-xs font-semibold text-white/90">
              {user.email}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pl-64">
        <main className="flex-1 p-8 sm:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
