'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type RevealVariant = 'fade-up' | 'scale' | 'mask-up';

export interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header' | 'span' | 'li';
}

type ObserverCallback = () => void;

const observerCallbacks = new WeakMap<Element, ObserverCallback>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const cb = observerCallbacks.get(entry.target);
            if (cb) {
              cb();
              observerCallbacks.delete(entry.target);
            }
            sharedObserver?.unobserve(entry.target);
          }
        }
      },
      {
        rootMargin: '0px',
        threshold: 0,
      }
    );
  }
  return sharedObserver;
}

/**
 * Ultra-lightweight GPU-composited scroll reveal wrapper.
 * - Shares a single IntersectionObserver (threshold: 0) across the entire page.
 * - Never uses clip-path on the observed target so IntersectionObserver bounding rects never collapse to 0px.
 * - Handles Next.js client-side route transitions & scroll restoration cleanly.
 */
export function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  className,
  as: Component = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let revealed = false;
    const markVisible = () => {
      if (revealed) return;
      revealed = true;
      el.setAttribute('data-reveal-state', 'visible');
      observerCallbacks.delete(el);
      sharedObserver?.unobserve(el);
    };

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      markVisible();
      return;
    }

    const observer = getSharedObserver();
    if (!observer) {
      markVisible();
      return;
    }

    const isCurrentlyInViewport = () => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    el.setAttribute('data-reveal-state', 'pending');

    if (isCurrentlyInViewport()) {
      const rafId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(markVisible);
      });
      return () => window.cancelAnimationFrame(rafId);
    }

    observerCallbacks.set(el, markVisible);
    observer.observe(el);

    // Safety check after Next.js client-side navigation scroll-to-top completes
    const postNavTimer = window.setTimeout(() => {
      if (!revealed && isCurrentlyInViewport()) {
        markVisible();
      }
    }, 90);

    return () => {
      window.clearTimeout(postNavTimer);
      observerCallbacks.delete(el);
      observer.unobserve(el);
    };
  }, []);

  return (
    <Component
      ref={ref as React.RefObject<never>}
      data-reveal-variant={variant}
      style={
        delay > 0
          ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties)
          : undefined
      }
      className={cn('reveal-item', className)}
    >
      {children}
    </Component>
  );
}
