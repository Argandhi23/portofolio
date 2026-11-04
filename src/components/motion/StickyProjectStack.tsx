'use client';

import React, { useEffect, useRef } from 'react';
import {
  clamp,
  computeWindowedScrollProgress,
  easeOutCubic,
  interpolateHexColor,
} from '@/lib/scroll-math';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';
import { cn } from '@/lib/utils';

interface StickyProjectCardProps {
  children: React.ReactNode;
  index: number;
  total: number;
  className?: string;
}

/**
 * Awwwards-Style Sticky Card Stack Item with Scroll-Scrubbed Scale Recession & Burgundy Color Shift.
 * - Pins at the top of the viewport (`sticky`) as the user scrolls.
 * - Morphs its surface & border into deep Burgundy when active in the viewport center.
 * - Scales down (`1 -> 0.91`) and darkens as subsequent cards in the stack slide up on top of it.
 */
export function StickyProjectCard({
  children,
  index,
  total,
  className,
}: StickyProjectCardProps) {
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stickyEl = stickyRef.current;
    const cardEl = cardRef.current;
    const veilEl = veilRef.current;
    if (!stickyEl || !cardEl) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    let lastBuried = -1;
    let lastActive = -1;

    return registerScrollTarget(
      stickyEl,
      ({ rectTop, height, viewportHeight }) => {
        // 1. Active Burgundy highlight as card enters and sits in the primary reading zone
        const enterRaw = computeWindowedScrollProgress(
          rectTop,
          viewportHeight,
          0.85,
          0.32
        );
        const enter = easeOutCubic(enterRaw);

        // 2. How far this card has been scrolled past its sticky lock point (buried under next card)
        const stickyTopPx = 84 + index * 22;
        const buriedDistance = Math.max(0, stickyTopPx - rectTop);
        const maxBuriedSpan = Math.max(260, height * 0.85);
        const buriedRaw =
          index < total - 1 ? clamp(buriedDistance / maxBuriedSpan, 0, 1) : 0;
        const buried = easeOutCubic(buriedRaw);

        // Active intensity peaks when card is in view and not yet buried
        const activeColorIntensity = clamp(enter * (1 - buried * 0.85), 0, 1);

        const isBoundary =
          (buried === 0 && lastBuried !== 0) ||
          (buried === 1 && lastBuried !== 1) ||
          (enter === 0 && lastActive !== 0) ||
          (enter === 1 && buried === 0 && lastActive !== 1);

        if (
          !isBoundary &&
          Math.abs(buried - lastBuried) < 0.002 &&
          Math.abs(activeColorIntensity - lastActive) < 0.004
        ) {
          return;
        }
        lastBuried = buried;
        lastActive = activeColorIntensity;

        // Entry lift when rising from bottom + scale recession when buried by next card
        const entryLack = 1 - enter;
        const scale = 1 - entryLack * 0.06 - buried * 0.085;
        const translateY = entryLack * 36 - buried * 14;
        const rotateX = entryLack * 6;

        const surfaceBg = interpolateHexColor(
          '#121212',
          '#26060E',
          activeColorIntensity
        );
        const borderAlpha = (0.08 + activeColorIntensity * 0.42).toFixed(3);

        if (entryLack <= 0.001 && buried <= 0.001) {
          cardEl.style.transform = 'none';
        } else {
          cardEl.style.transform = `perspective(1300px) translate3d(0, ${translateY.toFixed(
            1
          )}px, 0) scale(${scale.toFixed(4)}) rotateX(${rotateX.toFixed(2)}deg)`;
        }
        cardEl.style.backgroundColor = surfaceBg;
        cardEl.style.borderColor = `rgba(158, 27, 50, ${borderAlpha})`;

        if (veilEl) {
          veilEl.style.opacity =
            buried <= 0.001 ? '0' : (buried * 0.56).toFixed(3);
        }
      }
    );
  }, [index, total]);

  const stickyTop = 76 + index * 22;

  return (
    <div
      ref={stickyRef}
      style={{
        top: `${stickyTop}px`,
        zIndex: 10 + index * 10,
      }}
      className={cn('sticky pb-8 sm:pb-12', className)}
    >
      <div
        ref={cardRef}
        className="relative rounded-[32px] bg-[#121212] border border-white/[0.08] overflow-hidden shadow-[0_-24px_70px_rgba(0,0,0,0.82)] origin-top will-change-transform"
      >
        {children}

        {/* Darkening veil as the next card stacks on top of this card */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 bg-[#070103] opacity-0"
        />
      </div>
    </div>
  );
}
