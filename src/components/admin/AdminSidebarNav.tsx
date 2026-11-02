'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderGit2,
  Inbox,
  Sparkles,
  Code2,
  Settings,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Projects',
    href: '/admin/projects',
    icon: FolderGit2,
    exact: false,
  },
  {
    name: 'Pesan',
    href: '/admin/inquiries',
    icon: Inbox,
    exact: false,
  },
  {
    name: 'Layanan',
    href: '/admin/services',
    icon: Sparkles,
    exact: false,
  },
  {
    name: 'Tech Stack',
    href: '/admin/brands',
    icon: Code2,
    exact: false,
  },
  {
    name: 'Pengaturan',
    href: '/admin/settings',
    icon: Settings,
    exact: false,
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-[#181818] text-[#FF5510] shadow-sm border border-[#FF5510]/30'
                : 'text-white/70 hover:bg-[#181818] hover:text-white border border-transparent'
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                isActive
                  ? 'text-[#FF5510]'
                  : 'text-white/40 group-hover:text-white/80'
              }`}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}

      <div className="pt-3 mt-3 border-t border-white/[0.07]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-2xl px-3.5 py-2 text-xs font-medium text-white/55 hover:bg-[#181818] hover:text-white transition"
        >
          <span>Lihat Web</span>
          <ExternalLink className="h-3.5 w-3.5 text-[#FF5510]" />
        </Link>
      </div>
    </nav>
  );
}
