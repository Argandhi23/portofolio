'use client';

import React, { useEffect, useRef } from 'react';
import { computeCardPerspectiveState } from '@/lib/scroll-math';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';
import { cn } from '@/lib/utils';

interface ScrollPerspectiveCardProps {
  children: React.ReactNode;
  className?: string;
  /** Multiplier for 3D tilt, scale, and vertical travel (default 1) */
  intensity?: number;
}

/**
 * Continuous Scroll-Scrubbed 3D Perspective & Depth-Stack Card Wrapper.
 * Rises from the bottom with 3D X-axis tilt & scale expansion, flattens at viewport center,
 * and recedes into depth as the next card scrolls up over it.
 */
export function ScrollPerspectiveCard({
  children,
  className,
  intensity = 1,
}: ScrollPerspectiveCardProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    if (!outer || !stage) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    let lastRotate = Number.NaN;
    let lastScale = Number.NaN;
    let lastY = Number.NaN;

    return registerScrollTarget(
      outer,
      ({ rectTop, height, viewportHeight }) => {
        if (rectTop + height < -220 || rectTop > viewportHeight + 220) {
          return;
        }

        const state = computeCardPerspectiveState(
          rectTop,
          height,
          viewportHeight,
          intensity
        );

        if (
          !Number.isNaN(lastRotate) &&
          Math.abs(state.rotateX - lastRotate) < 0.08 &&
          Math.abs(state.scale - lastScale) < 0.001 &&
          Math.abs(state.translateY - lastY) < 0.3
        ) {
          return;
        }

        lastRotate = state.rotateX;
        lastScale = state.scale;
        lastY = state.translateY;

        stage.style.transform = `perspective(1200px) translate3d(0, ${state.translateY}px, 0) scale(${state.scale}) rotateX(${state.rotateX}deg)`;
        stage.style.opacity = String(state.opacity);
      }
    );
  }, [intensity]);

  return (
    <div ref={outerRef} className={cn('relative', className)}>
      <div
        ref={stageRef}
        className="h-full w-full origin-center will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
