import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin — Argandhi.',
  description: 'Panel admin portofolio Argandhi.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure admin authentication at layout level
  const { user } = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#080808] text-white selection:bg-[#9E1B32] selection:text-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-white/[0.07] bg-[#121212]">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.07] px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E1B32] to-[#7D1426] text-white shadow-md shadow-[#9E1B32]/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold tracking-tight text-white">
              Argandhi.
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#9E1B32] font-semibold">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <AdminSidebarNav />

        {/* User Account & Logout */}
        <div className="border-t border-white/[0.07] p-4 space-y-2">
          <div className="rounded-2xl bg-[#181818] border border-white/[0.06] px-3 py-2.5 flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
            <span className="truncate text-xs font-medium text-white/85">
              {user.email}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pl-60">
        <main className="flex-1 p-8 sm:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
