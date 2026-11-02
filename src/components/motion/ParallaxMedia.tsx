'use client';

import React, { useEffect, useRef } from 'react';
import {
  computeViewportTraverseProgress,
  computeWindowedScrollProgress,
} from '@/lib/scroll-math';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';
import { cn } from '@/lib/utils';

interface ParallaxMediaProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  /** Maximum vertical parallax shift in pixels (e.g. 16 shifts from -16px to +16px) */
  intensity?: number;
  /** Apple-style scroll-scrubbed lift/reveal as frame enters center view */
  cinemaExpand?: boolean;
}

/**
 * Zero-reflow GPU Image Parallax & Cinema Stage primitive.
 * Uses cached document coordinates (0 `getBoundingClientRect()` calls during scroll)
 * and dirty-checks values so off-screen media consumes 0% CPU/GPU.
 */
export function ParallaxMedia({
  children,
  className,
  innerClassName,
  intensity = 16,
  cinemaExpand = false,
}: ParallaxMediaProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    let lastTraverse = -1;
    let lastExpand = -1;

    return registerScrollTarget(
      outer,
      ({ rectTop, height, viewportHeight }) => {
        if (rectTop + height < -100 || rectTop > viewportHeight + 100) {
          return;
        }

        if (intensity > 0) {
          const traverse = computeViewportTraverseProgress(
            rectTop,
            height,
            viewportHeight
          );
          if (Math.abs(traverse - lastTraverse) >= 0.003) {
            lastTraverse = traverse;
            const shiftY = (traverse - 0.5) * 2 * intensity;
            inner.style.transform = `translate3d(0, ${shiftY.toFixed(
              1
            )}px, 0) scale(1.06)`;
          }
        }

        if (cinemaExpand) {
          const expandProgress = computeWindowedScrollProgress(
            rectTop,
            viewportHeight,
            0.94,
            0.34
          );
          if (Math.abs(expandProgress - lastExpand) >= 0.003) {
            lastExpand = expandProgress;
            const stageScale = 0.945 + expandProgress * 0.055;
            const stageLift = (1 - expandProgress) * 22;
            outer.style.transform = `translate3d(0, ${stageLift.toFixed(
              1
            )}px, 0) scale(${stageScale.toFixed(3)})`;
          }
        }
      }
    );
  }, [intensity, cinemaExpand]);

  return (
    <div ref={outerRef} className={cn('relative overflow-hidden', className)}>
      <div ref={innerRef} className={cn('h-full w-full', innerClassName)}>
        {children}
      </div>
    </div>
  );
}
