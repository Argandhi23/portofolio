'use client';

import React, { useEffect, useRef } from 'react';
import { computeViewportTraverseProgress } from '@/lib/scroll-math';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';
import { cn } from '@/lib/utils';

interface ParallaxColumnProps {
  children: React.ReactNode;
  offsetPx?: number;
  className?: string;
}

/**
 * Zero-reflow column parallax primitive (desktop >= 768px only).
 * Uses cached coordinates from scroll-coordinator (0 DOM reads on scroll).
 */
export function ParallaxColumn({
  children,
  offsetPx = 22,
  className,
}: ParallaxColumnProps) {
  const colRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = colRef.current;
    if (!el || offsetPx === 0) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    let lastY = Number.NaN;

    return registerScrollTarget(el, ({ rectTop, height, viewportHeight }) => {
      if (window.innerWidth < 768) {
        if (lastY !== 0) {
          lastY = 0;
          el.style.transform = 'translate3d(0, 0, 0)';
        }
        return;
      }

      if (rectTop + height < -140 || rectTop > viewportHeight + 140) return;

      const progress = computeViewportTraverseProgress(
        rectTop,
        height,
        viewportHeight
      );
      const y = (0.5 - progress) * 2 * offsetPx;
      if (!Number.isNaN(lastY) && Math.abs(y - lastY) < 0.25) return;
      lastY = y;

      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    });
  }, [offsetPx]);

  return (
    <div ref={colRef} className={cn(className)}>
      {children}
    </div>
  );
}
