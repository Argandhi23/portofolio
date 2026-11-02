'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import {
  notifyScrollPosition,
  scheduleRemeasure,
} from '@/components/motion/scroll-coordinator';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Featherlight, ultra-responsive smooth scrolling powered by official Lenis.
 * - Tuned with `lerp: 0.12` & `wheelMultiplier: 1.05` so scrolling feels effortless, crisp, and buttery (zero drag/heaviness).
 * - Syncs directly into the Zero-Reflow ScrollCoordinator inside the same requestAnimationFrame tick.
 * - Preserves 100% native touch scrolling on mobile devices.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReduced || !isFinePointer) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      wheelMultiplier: 1.05,
      smoothWheel: true,
      syncTouch: false,
      anchors: { offset: -24 },
      autoToggle: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });

    lenisRef.current = lenis;

    const unsubscribe = lenis.on('scroll', (instance) => {
      notifyScrollPosition(instance.scroll);
    });

    return () => {
      unsubscribe();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Re-measure cached geometry cleanly after Next.js client-side route transitions
  useEffect(() => {
    const instance = lenisRef.current;
    if (instance) {
      instance.resize();
    }
    scheduleRemeasure();
  }, [pathname]);

  return <>{children}</>;
}
