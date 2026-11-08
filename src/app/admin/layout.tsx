import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guard';
import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
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
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#080808] text-white selection:bg-[#9E1B32] selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:flex w-60 flex-col border-r border-white/[0.07] bg-[#121212]">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.07] px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#9E1B32] text-white">
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
          <div className="rounded-xl bg-[#181818] border border-white/[0.06] px-3 py-2 flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
            <span className="truncate text-xs font-medium text-white/80">
              {user.email}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Top Navigation Bar */}
      <header className="sticky top-0 z-30 lg:hidden border-b border-white/[0.07] bg-[#121212] px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9E1B32] text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Argandhi. <span className="text-[10px] text-[#9E1B32] uppercase">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-full bg-[#181818] border border-white/[0.08] px-3 py-1 text-[11px] font-medium text-white/75 hover:text-white"
            >
              Lihat Web
            </Link>
            <div className="w-9 shrink-0 [&_button]:justify-center [&_button]:px-2 [&_button_span]:sr-only">
              <LogoutButton />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { name: 'Dashboard', href: '/admin' },
            { name: 'Projects', href: '/admin/projects' },
            { name: 'Pesan', href: '/admin/inquiries' },
            { name: 'Layanan', href: '/admin/services' },
            { name: 'Tech Stack', href: '/admin/brands' },
            { name: 'Pengaturan', href: '/admin/settings' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full bg-[#181818] border border-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-white/75 hover:text-white hover:border-[#9E1B32]/40"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-60">
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
