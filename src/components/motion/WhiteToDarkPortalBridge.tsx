'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computePortalBridgeState } from '@/lib/scroll-math';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Minimalist Editorial Curtain Transition (#F5F0EB Warm Cream -> #080808 Obsidian).
 * Smoothly expands a clean dark frame into full-bleed #080808 using GSAP ScrollTrigger clip-path scrub
 * without duplicate headings or visual clutter.
 */
export function WhiteToDarkPortalBridge() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    if (!section || !panel) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isMotionAllowed: '(prefers-reduced-motion: no-preference)',
        isReduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isReduced } = context.conditions ?? {};

        if (isReduced) {
          panel.style.clipPath = 'inset(0% 0% 0% 0% round 0px)';
          return;
        }

        const initial = computePortalBridgeState(0, 0);
        panel.style.clipPath = initial.clipPath;

        ScrollTrigger.create({
          trigger: section,
          start: 'top 85%',
          end: 'bottom bottom',
          scrub: 0.4,
          onUpdate: (self) => {
            const metrics = computePortalBridgeState(self.progress, 0);
            panel.style.clipPath = metrics.clipPath;

            if (lineRef.current) {
              lineRef.current.style.transform = `scaleX(${metrics.progress.toFixed(3)})`;
            }
          },
        });
      }
    );

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      data-portal-bridge
      className="relative w-full h-[42svh] bg-[#F5F0EB] select-none"
    >
      <div className="sticky top-0 h-[42svh] w-full overflow-hidden flex items-center justify-center">
        <div
          ref={panelRef}
          data-portal-bridge-monolith
          style={{
            clipPath: 'inset(18% 14% 18% 14% round 48px)',
          }}
          className="relative w-full h-full bg-[#080808] overflow-hidden flex items-end justify-center pb-10 will-change-[clip-path]"
        >
          <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12">
            <div className="w-full h-[1px] bg-white/10 overflow-hidden">
              <div
                ref={lineRef}
                className="h-full w-full bg-white/35 origin-left scale-x-0 will-change-transform"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
