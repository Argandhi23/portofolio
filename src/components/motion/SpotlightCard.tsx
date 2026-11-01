'use client';

import React, { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface SpotlightCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
}

/**
 * Zero-rerender cursor-tracking fiery spotlight surface.
 * Writes --spot-x and --spot-y directly to the DOM element inside requestAnimationFrame
 * so React never re-renders during mouse movement (guaranteed 60/120fps).
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(255, 85, 16, 0.13)',
  style,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch') return;
      const el = cardRef.current;
      if (!el) return;

      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = window.requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--spot-x', `${Math.round(clientX - rect.left)}px`);
        el.style.setProperty('--spot-y', `${Math.round(clientY - rect.top)}px`);
        rafRef.current = null;
      });
    },
    []
  );

  return (
    <div
      ref={cardRef}
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
