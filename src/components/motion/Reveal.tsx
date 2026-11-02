'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type RevealVariant =
  | 'fade-up'
  | 'scale'
  | 'mask-up'
  | 'curtain-up'
  | 'hairline';

export interface RevealProps {
  children?: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
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
        // Enters 7% above bottom edge: visible right where the eye looks, while still firing cleanly for footer items
        rootMargin: '0px 0px -7% 0px',
        threshold: 0.01,
      }
    );
  }
  return sharedObserver;
}

/**
 * Zero-scroll-listener GPU scroll entrance wrapper (1.25s - 1.4s).
 * Runs 100% via native C++ IntersectionObserver with zero JS execution during scrolling,
 * and releases GPU layer memory (`will-change: auto`) once revealed.
 */
export function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration,
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

    const isInInitialView = () => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.93 && rect.bottom > 0;
    };

    el.setAttribute('data-reveal-state', 'pending');

    if (isInInitialView()) {
      const rafId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(markVisible);
      });
      return () => window.cancelAnimationFrame(rafId);
    }

    observerCallbacks.set(el, markVisible);
    observer.observe(el);

    const postNavTimer = window.setTimeout(() => {
      if (!revealed && isInInitialView()) {
        markVisible();
      }
    }, 100);

    return () => {
      window.clearTimeout(postNavTimer);
      observerCallbacks.delete(el);
      observer.unobserve(el);
    };
  }, []);

  const customStyle: React.CSSProperties = {};
  if (delay > 0) {
    (customStyle as Record<string, string>)['--reveal-delay'] = `${delay}ms`;
  }
  if (duration && duration > 0) {
    (customStyle as Record<string, string>)['--reveal-duration'] = `${duration}ms`;
  }

  return (
    <Component
      ref={ref as React.RefObject<never>}
      data-reveal-variant={variant}
      style={Object.keys(customStyle).length > 0 ? customStyle : undefined}
      className={cn('reveal-item', className)}
    >
      {children}
    </Component>
  );
}
