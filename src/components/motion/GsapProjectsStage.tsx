'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computeHorizontalCinemaState } from '@/lib/scroll-math';
import { SectionHeader } from '@/components/public/SectionHeader';
import { T } from '@/components/public/LanguageProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HorizontalProjectNavItem {
  slug: string;
  title: string;
}

interface GsapProjectsStageProps {
  items: HorizontalProjectNavItem[];
  children: React.ReactNode;
}

/**
 * Minimalist Awwwards GSAP Horizontal Scroll Gallery (#projects).
 * - Renders `SectionHeader` cleanly above the pinned stage so it never collides with the floating navbar
 *   or squeezes the vertical card height.
 * - Pins the horizontal viewport stage on desktop (`start: 'top top'`) with comfortable top/bottom padding
 *   so cards, titles, and descriptions are 100% visible without bottom clipping.
 */
export function GsapProjectsStage({ items, children }: GsapProjectsStageProps) {
  const pinSectionRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressLineRef = useRef<HTMLDivElement | null>(null);
  const indexLinkRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    const pinSection = pinSectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!pinSection || !viewport || !track || items.length === 0) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>('[data-gsap-project-card]')
    );
    const images = Array.from(
      track.querySelectorAll<HTMLElement>('[data-gsap-project-img]')
    );
    const textBlocks = Array.from(
      track.querySelectorAll<HTMLElement>('[data-gsap-project-text]')
    );

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop:
          '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        isMobile:
          '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
        isReduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, isReduced } = context.conditions ?? {};

        if (isReduced) {
          track.style.transform = 'none';
          return;
        }

        if (textBlocks.length > 0) {
          gsap.fromTo(
            textBlocks,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: pinSection,
                start: 'top 82%',
              },
            }
          );
        }

        if (isDesktop && cards.length > 1) {
          const getMaxScroll = () =>
            Math.max(0, track.scrollWidth - viewport.clientWidth);

          const tween = gsap.to(track, {
            x: () => -getMaxScroll(),
            ease: 'none',
            scrollTrigger: {
              trigger: pinSection,
              pin: viewport,
              start: 'top top',
              end: () => `+=${Math.max(600, getMaxScroll())}`,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const cinema = computeHorizontalCinemaState(
                  self.progress,
                  items.length,
                  self.getVelocity() / 400
                );

                if (progressLineRef.current) {
                  progressLineRef.current.style.transform = `scaleX(${cinema.progress.toFixed(4)})`;
                }

                const shiftPct = (self.progress - 0.5) * 10;
                images.forEach((img) => {
                  img.style.transform = `scale(1.08) translate3d(${shiftPct.toFixed(2)}%, 0, 0)`;
                });

                indexLinkRefs.current.forEach((linkEl, idx) => {
                  if (!linkEl) return;
                  linkEl.dataset.active =
                    idx === cinema.activeIndex ? 'true' : 'false';
                });
              },
            },
          });

          return () => {
            tween.kill();
          };
        }

        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
              },
            }
          );
        });
      }
    );

    return () => {
      mm.revert();
    };
  }, [items.length]);

  return (
    <div className="relative w-full pt-16 sm:pt-24">
      {/* 1. Static Editorial Section Header (Never pinned, never collides with floating navbar) */}
      <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pb-6 lg:pb-2">
        <SectionHeader
          eyebrow={<T en="Selected Works" id="Karya Pilihan" />}
          heading={<T en="Featured Projects" id="Proyek Pilihan" />}
          lead={
            <T
              en="Web applications, mobile APKs, and production systems."
              id="Aplikasi web, APK mobile, dan sistem produksi nyata."
            />
          }
          ctaHref="/projects"
          ctaLabel={<T en="All projects" id="Semua proyek" />}
        />
      </div>

      {/* 2. Pinned Horizontal Scroll Stage (Clears floating navbar at top & fits cards with zero bottom clipping) */}
      <div ref={pinSectionRef} className="relative w-full">
        <div
          ref={viewportRef}
          className="w-full lg:h-[100svh] flex flex-col justify-between py-10 lg:pt-24 lg:pb-12 overflow-hidden"
        >
          {/* Minimalist Project Index Bar */}
          {items.length > 0 && (
            <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 shrink-0">
              <div className="pt-3 pb-3 border-y border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-5 sm:gap-7">
                  {items.map((item, idx) => {
                    const num = String(idx + 1).padStart(2, '0');
                    return (
                      <Link
                        key={item.slug}
                        href={`/projects/${item.slug}`}
                        ref={(el) => {
                          indexLinkRefs.current[idx] = el;
                        }}
                        data-active={idx === 0 ? 'true' : 'false'}
                        className="group inline-flex items-baseline gap-2 py-0.5 text-white/45 hover:text-white data-[active=true]:text-white transition-colors"
                      >
                        <span className="font-mono text-[11px] text-[#9E1B32]">
                          {num}
                        </span>
                        <span className="font-medium tracking-[-0.01em] border-b border-transparent group-data-[active=true]:border-white/60 pb-0.5">
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <span className="hidden lg:inline-block font-mono text-[11px] text-white/35">
                  <T
                    en="Scroll to pan horizontally"
                    id="Gulir untuk geser ke samping"
                  />{' '}
                  &rarr;
                </span>
              </div>
            </div>
          )}

          {/* Center Horizontal Scroll Track */}
          <div className="w-full flex-1 flex items-center py-6 lg:py-4 min-h-0">
            <div
              ref={trackRef}
              className="flex flex-col lg:flex-row lg:flex-nowrap items-start gap-10 lg:gap-10 px-6 sm:px-12 lg:px-[max(3rem,calc((100vw-1140px)/2+3rem))] w-full lg:w-max will-change-transform"
            >
              {children}
            </div>
          </div>

          {/* Bottom 1px Progress Hairline */}
          <div className="hidden lg:block w-full max-w-[1140px] mx-auto px-6 sm:px-12 shrink-0">
            <div className="w-full h-[1px] bg-white/10 overflow-hidden">
              <div
                ref={progressLineRef}
                className="h-full w-full bg-white/70 origin-left scale-x-0 will-change-transform"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
