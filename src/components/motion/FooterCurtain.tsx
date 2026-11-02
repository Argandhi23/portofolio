'use client';

import React, { useEffect, useRef } from 'react';
import { computeWindowedScrollProgress } from '@/lib/scroll-math';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';
import { cn } from '@/lib/utils';

interface FooterCurtainProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Pure GPU-composited Curtain Unveil for the Fiery Bookend Footer ("Let's Talk.").
 * Uses translate3d only (no giant container scale re-rasterization) and 0 DOM reads during scroll.
 */
export function FooterCurtain({ children, className }: FooterCurtainProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    let lastProgress = -1;

    return registerScrollTarget(
      wrapper,
      ({ rectTop, scrollY, viewportHeight, maxScroll }) => {
        const nearBottom = maxScroll > 0 && scrollY >= maxScroll - 24;
        const rawProgress = computeWindowedScrollProgress(
          rectTop,
          viewportHeight,
          0.98,
          0.46
        );
        const progress = nearBottom ? 1 : rawProgress;

        if (Math.abs(progress - lastProgress) < 0.003) return;
        lastProgress = progress;

        const translateY = (1 - progress) * 42;
        stage.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      }
    );
  }, []);

  return (
    <div ref={wrapperRef} className={cn('overflow-hidden', className)}>
      <div ref={stageRef}>{children}</div>
    </div>
  );
}
