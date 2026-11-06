'use client';

import { useState } from 'react';
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
  Loader2,
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
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending indicator as soon as pathname matches
  const activeTarget =
    pendingHref && pendingHref !== pathname ? pendingHref : pathname;

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive = item.exact
          ? activeTarget === item.href
          : activeTarget.startsWith(item.href);

        const isRouteMatch = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        const isLoadingThis = pendingHref === item.href && !isRouteMatch;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onClick={() => {
              if (!isRouteMatch) {
                setPendingHref(item.href);
              }
            }}
            className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors duration-150 ${
              isActive
                ? 'bg-[#181818] text-white border border-[#9E1B32]/40'
                : 'text-white/65 hover:bg-[#181818]/70 hover:text-white border border-transparent'
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#9E1B32]'
                    : 'text-white/40 group-hover:text-white/80'
                }`}
              />
              <span>{item.name}</span>
            </span>

            {isLoadingThis && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9E1B32]" />
            )}
          </Link>
        );
      })}

      <div className="pt-3 mt-3 border-t border-white/[0.07]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-white/55 hover:bg-[#181818] hover:text-white transition-colors"
        >
          <span>Lihat Website</span>
          <ExternalLink className="h-3.5 w-3.5 text-[#9E1B32]" />
        </Link>
      </div>
    </nav>
  );
}
