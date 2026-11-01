'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { PillButton } from '@/components/public/PillButton';
import { cn } from '@/lib/utils';

interface PublicNavbarProps {
  brandName: string;
  ctaUrl?: string;
  ctaLabel?: string;
  isSubPage?: boolean;
}

export function PublicNavbar({
  brandName,
  ctaUrl = '#contact',
  ctaLabel = 'Get in touch',
  isSubPage = false,
}: PublicNavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const resolvedCta =
    isSubPage && ctaUrl.startsWith('#') ? `/${ctaUrl}` : ctaUrl;

  const navLinks = [
    { label: 'Home', href: '/', active: pathname === '/' },
    { label: 'About', href: '/about', active: pathname === '/about' },
    {
      label: 'Projects',
      href: '/projects',
      active: pathname.startsWith('/projects'),
    },
    {
      label: 'Services',
      href: isSubPage ? '/#services' : '#services',
      active: false,
    },
    {
      label: 'Contact',
      href: isSubPage ? '/#contact' : '#contact',
      active: false,
    },
  ];

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 150);
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* 1. Primary Hero Top Bar */}
      <header className="relative z-30 w-full max-w-[1140px] mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-white font-bold text-[19px] sm:text-[20px] tracking-[-0.03em] hover:opacity-90 transition"
        >
          {brandName}
        </Link>

        <div className="flex items-center gap-3 sm:gap-7">
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-[13px] font-medium text-white/90"
          >
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'relative py-1 transition-colors hover:text-white',
                  item.active ? 'text-white font-semibold' : 'text-white/85'
                )}
              >
                {item.label}
                {item.active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:block">
            <PillButton href={resolvedCta} variant="white">
              {ctaLabel}
            </PillButton>
          </div>

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-white hover:bg-black/45 transition cursor-pointer"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* 2. Adaptive Floating Obsidian-Glass Pill Navbar on Scroll */}
      <div
        aria-hidden={!isScrolled}
        className={cn(
          'fixed top-4 inset-x-0 z-40 px-4 flex justify-center pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isScrolled
            ? 'translate-y-0 opacity-100'
            : '-translate-y-16 opacity-0'
        )}
      >
        <div className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-7 rounded-full bg-[#0C0C0C]/85 backdrop-blur-xl border border-white/[0.11] pl-5 pr-2 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.65)] max-w-[740px] w-full md:w-auto">
          <Link
            href="/"
            className="text-white font-bold text-[15px] tracking-[-0.03em] hover:text-[#FF5510] transition shrink-0"
          >
            {brandName}
          </Link>

          <nav
            aria-label="Floating navigation"
            className="hidden md:flex items-center gap-6 text-[12.5px] font-medium text-white/80"
          >
            {navLinks.map((item) => (
              <Link
                key={`float-${item.label}`}
                href={item.href}
                className={cn(
                  'hover:text-white transition-colors',
                  item.active && 'text-[#FF5510] font-semibold'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <PillButton href={resolvedCta} variant="orange" className="hidden sm:inline-flex">
              {ctaLabel}
            </PillButton>

            <button
              type="button"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#181818] border border-white/10 text-white hover:border-[#FF5510]/50 transition cursor-pointer"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Obsidian-Glass Navigation Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-start p-4 pt-20 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="rounded-[28px] bg-[#121212] border border-white/[0.1] p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <span className="text-white font-bold text-[17px] tracking-[-0.03em]">
                {brandName}
              </span>
              <button
                type="button"
                aria-label="Close mobile menu"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#181818] border border-white/10 text-white/80 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="flex flex-col space-y-2">
              {navLinks.map((item, idx) => (
                <Link
                  key={`mob-${item.label}`}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3 text-[14.5px] font-semibold transition',
                    item.active
                      ? 'bg-[#181818] text-[#FF5510] border border-[#FF5510]/30'
                      : 'text-white/85 hover:bg-[#181818] hover:text-white'
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-[11px] font-bold text-[#7A7A7A]">
                    #0{idx + 1}
                  </span>
                </Link>
              ))}
            </nav>

            <div
              className="pt-2 border-t border-white/[0.07] flex items-center justify-between"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-[11.5px] text-[#7A7A7A]">
                Surabaya, ID &bull; Available
              </span>
              <PillButton href={resolvedCta} variant="orange">
                {ctaLabel}
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
