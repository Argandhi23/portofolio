'use client';

import React, { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface SpotlightCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
}

/**
 * Zero-rerender & zero-scroll-reflow cursor-tracking fiery spotlight surface.
 * Caches bounding rect on pointerenter so `getBoundingClientRect()` is NEVER called
 * during pointermove or while scrolling past cards.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(158, 27, 50, 0.15)',
  style,
  onPointerEnter,
  onPointerMove,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const cachedBox = useRef<{
    left: number;
    top: number;
    scrollY: number;
  } | null>(null);

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(e);
      if (e.pointerType === 'touch') return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      cachedBox.current = {
        left: rect.left,
        top: rect.top,
        scrollY: window.scrollY,
      };
    },
    [onPointerEnter]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(e);
      if (e.pointerType === 'touch') return;
      const el = cardRef.current;
      const box = cachedBox.current;
      if (!el || !box) return;

      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        const scrollDelta = window.scrollY - box.scrollY;
        const spotX = Math.round(clientX - box.left);
        const spotY = Math.round(clientY - (box.top - scrollDelta));
        el.style.setProperty('--spot-x', `${spotX}px`);
        el.style.setProperty('--spot-y', `${spotY}px`);
        rafRef.current = null;
      });
    },
    [onPointerMove]
  );

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      style={
        {
          '--spot-color': spotlightColor,
          ...style,
        } as React.CSSProperties
      }
      className={cn('spotlight-card relative', className)}
      {...props}
    >
      {children}
    </div>
  );
}
