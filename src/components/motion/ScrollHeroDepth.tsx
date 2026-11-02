'use client';

import React, { useEffect, useRef } from 'react';
import { computeHeroExitProgress } from '@/lib/scroll-math';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';
import { cn } from '@/lib/utils';

interface ScrollHeroDepthProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Pure GPU-Composited Hero Parallax & Depth Veil (Zero fractional scale re-rasterization, zero reflows).
 * Uses translate3d + opacity only so crisp typography and SVG silhouettes never re-rasterize during scroll.
 */
export function ScrollHeroDepth({ children, className }: ScrollHeroDepthProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    const veil = veilRef.current;
    if (!outer || !inner) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    let lastProgress = -1;

    return registerScrollTarget(outer, ({ rectTop, height }) => {
      const progress = computeHeroExitProgress(rectTop, height);
      if (Math.abs(progress - lastProgress) < 0.002) return;
      lastProgress = progress;

      if (progress <= 0.001) {
        inner.style.transform = 'translate3d(0, 0px, 0)';
        if (veil) veil.style.opacity = '0';
        return;
      }

      const translateY = progress * 64;
      inner.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;

      if (veil) {
        veil.style.opacity = (progress * 0.46).toFixed(3);
      }
    });
  }, []);

  return (
    <div ref={outerRef} className={cn('relative overflow-hidden rounded-b-[42px]', className)}>
      <div ref={innerRef} className="relative">
        {children}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 rounded-b-[42px] bg-[#080808] opacity-0"
        />
      </div>
    </div>
  );
}
