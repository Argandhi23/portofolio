'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface HeroAmbientGlowProps {
  className?: string;
}

/**
 * Interactive damped studio lighting layer for Fiery Hero & Footer Bookend surfaces.
 * Automatically sleeps (0% CPU/GPU) whenever pointer movement settles.
 */
export function HeroAmbientGlow({ className }: HeroAmbientGlowProps) {
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = glowRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || isCoarsePointer) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number | null = null;

    const tick = () => {
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;

      el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(
        2
      )}px, 0)`;

      if (
        Math.abs(targetX - currentX) > 0.15 ||
        Math.abs(targetY - currentY) > 0.15
      ) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      const normY = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;

      targetX = normX * 44;
      targetY = normY * 32;

      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    parent.addEventListener('pointermove', handlePointerMove, { passive: true });
    parent.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      parent.removeEventListener('pointermove', handlePointerMove);
      parent.removeEventListener('pointerleave', handlePointerLeave);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className={cn('hero-glow-left ambient-breathe will-change-transform', className)}
    />
  );
}
