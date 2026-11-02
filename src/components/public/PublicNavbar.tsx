'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PillButton } from '@/components/public/PillButton';
import {
  LanguageToggle,
  useLanguage,
} from '@/components/public/LanguageProvider';
import { PUBLIC_COPY, tPick } from '@/lib/i18n/dictionary';
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
      className="relative z-50 inline-flex items-center justify-center w-10 h-10 bg-transparent border-0 p-0 text-white cursor-pointer focus:outline-none select-none shrink-0"
    >
      <div className="relative w-6 h-6 flex items-center justify-center pointer-events-none">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 overflow-visible"
        >
          <line
            x1="3"
            y1="12"
            x2="21"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transformOrigin: '12px 12px',
              transform: open
                ? 'translateY(0px) rotate(45deg)'
                : 'translateY(-4.5px) rotate(0deg)',
              transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          <line
            x1="3"
            y1="12"
            x2="21"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transformOrigin: '12px 12px',
              transform: open
                ? 'translateY(0px) rotate(-45deg)'
                : 'translateY(4.5px) rotate(0deg)',
              transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>
      </div>
    </button>
  );
}

export function PublicNavbar({
  brandName,
  ctaUrl = '#contact',
  ctaLabel,
  isSubPage = false,
  surfaceVariant = 'fiery',
}: PublicNavbarProps) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useIsMounted();
  const isObsidian = surfaceVariant === 'obsidian';

  const resolvedCta =
    isSubPage && ctaUrl.startsWith('#') ? `/${ctaUrl}` : ctaUrl;
  const resolvedCtaLabel = ctaLabel ?? tPick(PUBLIC_COPY.nav.cta, lang);

  const navLinks = [
    {
      label: tPick(PUBLIC_COPY.nav.home, lang),
      href: '/',
      active: pathname === '/',
    },
    {
      label: tPick(PUBLIC_COPY.nav.about, lang),
      href: '/about',
      active: pathname === '/about',
    },
    {
      label: tPick(PUBLIC_COPY.nav.projects, lang),
      href: '/projects',
      active: pathname.startsWith('/projects'),
    },
    {
      label: tPick(PUBLIC_COPY.nav.services, lang),
      href: isSubPage ? '/#services' : '#services',
      active: false,
    },
    {
      label: tPick(PUBLIC_COPY.nav.contact, lang),
      href: isSubPage ? '/#contact' : '#contact',
      active: false,
    },
  ];

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
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

  // Lock scroll cleanly via touch-action on the overlay without triggering scrollbar layout shift
  useEffect(() => {
    if (!mobileOpen) return;
    const preventTouch = (e: TouchEvent) => {
      // Prevent background scrolling, allow navigation list scrolling if viewport is small
      const target = e.target as HTMLElement | null;
      if (!target?.closest('nav')) {
        e.preventDefault();
      }
    };
    window.addEventListener('touchmove', preventTouch, { passive: false });
    return () => window.removeEventListener('touchmove', preventTouch);
  }, [mobileOpen]);

  return (
    <>
      {/* 1. Primary Desktop Top Bar (in-flow within Hero cards) */}
      <header
        className={cn(
          'relative z-30 w-full max-w-[1140px] mx-auto items-center justify-between',
          mounted ? 'hidden md:flex' : 'flex'
        )}
      >
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

          <div className="hidden sm:flex items-center gap-3">
            <LanguageToggle variant={isObsidian ? 'obsidian' : 'fiery'} />
            <PillButton
              href={resolvedCta}
              variant={isObsidian ? 'orange' : 'white'}
            >
              {resolvedCtaLabel}
            </PillButton>
          </div>

          {/* Placeholder for SSR before hydration */}
          {!mounted && (
            <div className="md:hidden w-10 h-10 flex items-center justify-center">
              <div className="w-6 h-6 flex items-center justify-center relative">
                <span className="absolute left-0 top-[7.5px] w-6 h-[2px] bg-white rounded-full" />
                <span className="absolute left-0 top-[16.5px] w-6 h-[2px] bg-white rounded-full" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. Portal: Dedicated Mobile Top Bar, Floating Desktop Navbar, & Fullscreen Menu */}
      {mounted &&
        createPortal(
          <>
            {/* Mobile Brand Name (Pinned permanently to top-7 left-6) */}
            <div className="md:hidden fixed top-7 left-6 z-50 pointer-events-auto">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="text-white font-bold text-[19px] tracking-[-0.03em] hover:opacity-90 transition block"
              >
                {brandName}
              </Link>
            </div>

            {/* Mobile Menu Button (Pinned permanently to top-7 right-6 - ZERO flex shifts) */}
            <div className="md:hidden fixed top-7 right-6 z-50 pointer-events-auto">
              <MobileMenuButton
                open={mobileOpen}
                onClick={() => setMobileOpen((prev) => !prev)}
                ariaLabel={
                  mobileOpen ? 'Close navigation menu' : 'Open navigation menu'
                }
              />
            </div>

            {/* Mobile Header Glass Background on Scroll */}
            <div
              className={cn(
                'md:hidden fixed top-0 inset-x-0 h-[76px] z-40 transition-opacity duration-300 pointer-events-none',
                isScrolled && !mobileOpen
                  ? 'opacity-100 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.6)]'
                  : 'opacity-0'
              )}
            />

            {/* Adaptive Floating Obsidian-Glass Pill Navbar on Scroll (Desktop only) */}
            <div
              aria-hidden={!isScrolled}
              className={cn(
                'hidden md:flex fixed top-4 inset-x-0 z-40 px-4 justify-center pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isScrolled
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-16 opacity-0'
              )}
            >
              <div className="pointer-events-auto flex items-center justify-between gap-7 rounded-full bg-[#0D0D0D]/95 backdrop-blur-md border border-white/[0.11] pl-5 pr-3 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
                <Link
                  href="/"
                  className="text-white font-bold text-[15px] tracking-[-0.03em] hover:text-[#FF5510] transition shrink-0"
                >
                  {brandName}
                </Link>

                <nav
                  aria-label="Floating navigation"
                  className="flex items-center gap-6 text-[12.5px] font-medium text-white/80"
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

                <div className="flex items-center gap-2.5">
                  <LanguageToggle variant="obsidian" />
                  <PillButton
                    href={resolvedCta}
                    variant="orange"
                  >
                    {resolvedCtaLabel}
                  </PillButton>
                </div>
              </div>
            </div>

            {/* 3. Fullscreen Mobile Menu Overlay */}
            <div
              aria-hidden={!mobileOpen}
              className={cn(
                'fixed inset-0 z-40 md:hidden flex flex-col justify-between px-6 pt-28 pb-8 bg-[#000000] text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] min-h-screen min-h-dvh overscroll-contain touch-pan-y',
                mobileOpen
                  ? 'opacity-100 pointer-events-auto visible'
                  : 'opacity-0 pointer-events-none invisible'
              )}
            >
              {/* Clean Navigation with Staggered Entrance */}
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col space-y-1 my-auto py-4"
              >
                {navLinks.map((item, idx) => (
                  <Link
                    key={`mob-${item.label}`}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      transitionDelay: mobileOpen ? `${90 + idx * 40}ms` : '0ms',
                    }}
                    className={cn(
                      'flex items-center justify-between py-3.5 border-b border-white/[0.08] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group',
                      mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5510] shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-[30px] sm:text-[34px] tracking-[-0.03em] transition-all duration-200 group-hover:translate-x-1',
                          item.active
                            ? 'font-bold text-[#FF5510]'
                            : 'font-medium text-white/75 group-hover:text-white'
                        )}
                      >
                        {item.label}
                      </span>
                    </div>

                    {/* Arrow icon replacing the # page numbers */}
                    <svg
                      className={cn(
                        'w-4 h-4 transition-all duration-300 group-hover:translate-x-1 shrink-0',
                        item.active
                          ? 'text-[#FF5510]'
                          : 'text-white/30 group-hover:text-white'
                      )}
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                ))}
              </nav>

              {/* Fullscreen Mobile Menu Bottom Language Switcher & CTA */}
              <div
                style={{
                  transitionDelay: mobileOpen ? '280ms' : '0ms',
                }}
                className={cn(
                  'pt-4 pb-2 flex flex-col items-center gap-4 transition-all duration-300',
                  mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                )}
              >
                <LanguageToggle variant="mobile" />
                <div onClick={() => setMobileOpen(false)} className="w-full">
                  <PillButton
                    href={resolvedCta}
                    variant="orange"
                    className="w-full justify-center !py-2.5 !text-[13px] shadow-[0_4px_20px_rgba(255,85,16,0.25)]"
                  >
                    {resolvedCtaLabel}
                  </PillButton>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}