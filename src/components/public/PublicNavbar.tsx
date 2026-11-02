'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PillButton } from '@/components/public/PillButton';
import { cn } from '@/lib/utils';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

interface PublicNavbarProps {
  brandName: string;
  ctaUrl?: string;
  ctaLabel?: string;
  isSubPage?: boolean;
  surfaceVariant?: 'fiery' | 'obsidian';
}

function MobileMenuButton({
  open,
  onClick,
  ariaLabel,
}: {
  open: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-expanded={open}
      onClick={onClick}
      className="md:hidden relative z-50 inline-flex items-center justify-center w-10 h-10 bg-transparent border-0 p-0 text-white cursor-pointer focus:outline-none"
    >
      <div className="relative w-6 h-[10px] flex flex-col justify-between">
        <span
          className={cn(
            'block h-[2px] w-6 bg-white rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center',
            open ? 'translate-y-[4px] rotate-45' : 'translate-y-0'
          )}
        />
        <span
          className={cn(
            'block h-[2px] w-6 bg-white rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center',
            open ? '-translate-y-[4px] -rotate-45' : 'translate-y-0'
          )}
        />
      </div>
    </button>
  );
}

export function PublicNavbar({
  brandName,
  ctaUrl = '#contact',
  ctaLabel = 'Get in touch',
  isSubPage = false,
  surfaceVariant = 'fiery',
}: PublicNavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useIsMounted();
  const isObsidian = surfaceVariant === 'obsidian';

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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
            className={cn(
              'hidden md:flex items-center gap-7 text-[13px] font-medium',
              isObsidian ? 'text-white/75' : 'text-white/90'
            )}
          >
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'relative py-1 transition-colors hover:text-white',
                  item.active
                    ? 'text-white font-semibold'
                    : isObsidian
                      ? 'text-white/70'
                      : 'text-white/85'
                )}
              >
                {item.label}
                {item.active && (
                  <span
                    className={cn(
                      'absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full',
                      isObsidian ? 'bg-[#FF5510]' : 'bg-white'
                    )}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:block">
            <PillButton
              href={resolvedCta}
              variant={isObsidian ? 'orange' : 'white'}
            >
              {ctaLabel}
            </PillButton>
          </div>

          {/* Mobile Drawer Trigger (2 clean lines with transparent background) */}
          <MobileMenuButton
            open={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            ariaLabel={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          />
        </div>
      </header>

      {/* 2. Floating Navbar & Fullscreen Mobile Menu (Rendered to body via Portal) */}
      {mounted &&
        createPortal(
          <>
            {/* Adaptive Floating Obsidian-Glass Pill Navbar on Scroll */}
            <div
              aria-hidden={!isScrolled}
              className={cn(
                'fixed top-4 inset-x-0 z-40 px-4 flex justify-center pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isScrolled
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-16 opacity-0'
              )}
            >
              <div className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-7 rounded-full bg-[#0D0D0D]/95 backdrop-blur-md border border-white/[0.11] pl-5 pr-3 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.6)] max-w-[740px] w-full md:w-auto">
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

                <div className="flex items-center gap-3">
                  <PillButton
                    href={resolvedCta}
                    variant="orange"
                    className="hidden sm:inline-flex"
                  >
                    {ctaLabel}
                  </PillButton>

                  <MobileMenuButton
                    open={mobileOpen}
                    onClick={() => setMobileOpen((prev) => !prev)}
                    ariaLabel={
                      mobileOpen
                        ? 'Close navigation menu'
                        : 'Open navigation menu'
                    }
                  />
                </div>
              </div>
            </div>

            {/* 3. Fullscreen Solid Black Mobile Menu Overlay */}
            {mobileOpen && (
              <div
                className="fixed inset-0 z-50 md:hidden flex flex-col justify-between p-6 sm:p-8 bg-[#000000] text-white animate-in fade-in duration-200 min-h-screen min-h-dvh w-screen"
              >
                {/* Fullscreen Header */}
                <div className="flex items-center justify-between">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="text-white font-bold text-[20px] tracking-[-0.03em]"
                  >
                    {brandName}
                  </Link>

                  <MobileMenuButton
                    open={mobileOpen}
                    onClick={() => setMobileOpen(false)}
                    ariaLabel="Close navigation menu"
                  />
                </div>

                {/* Simple Clean Navigation */}
                <nav
                  aria-label="Mobile navigation"
                  className="flex flex-col space-y-2 my-auto py-6"
                >
                  {navLinks.map((item, idx) => (
                    <Link
                      key={`mob-${item.label}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-baseline justify-between py-3 border-b border-white/[0.08] transition-colors group',
                        item.active
                          ? 'text-[#FF5510]'
                          : 'text-white/80 hover:text-white'
                      )}
                    >
                      <span className="text-[32px] sm:text-[36px] font-bold tracking-[-0.03em] group-hover:text-[#FF5510] transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[12px] font-mono font-semibold text-white/35 group-hover:text-[#FF5510] transition-colors">
                        #0{idx + 1}
                      </span>
                    </Link>
                  ))}
                </nav>

                {/* Fullscreen Footer */}
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-[12px] font-mono text-white/45 uppercase tracking-wider">
                    Surabaya, ID &bull; Available
                  </span>
                  <div onClick={() => setMobileOpen(false)}>
                    <PillButton href={resolvedCta} variant="orange">
                      {ctaLabel}
                    </PillButton>
                  </div>
                </div>
              </div>
            )}
          </>,
          document.body
        )}
    </>
  );
}
