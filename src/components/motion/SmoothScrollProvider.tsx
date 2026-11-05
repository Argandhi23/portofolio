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
      autoToggle: false,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });

    lenisRef.current = lenis;

    const unsubscribe = lenis.on('scroll', (instance) => {
      notifyScrollPosition(instance.scroll);
    });

    const syncPortalState = () => {
      const portalPhase = document.documentElement.dataset.heroPortal;
      if (
        portalPhase === 'hero' ||
        portalPhase === 'entering' ||
        portalPhase === 'exiting'
      ) {
        lenis.scrollTo(0, { immediate: true, force: true });
        lenis.stop();
      } else {
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('overflow');
        document.documentElement.classList.remove('lenis-stopped');
        lenis.start();
        lenis.resize();
      }
    };

    syncPortalState();
    window.addEventListener('hero-portal-change', syncPortalState);

    return () => {
      window.removeEventListener('hero-portal-change', syncPortalState);
      unsubscribe();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Unlock scroll, restart Lenis if leaving Home portal, and re-measure geometry after Next.js route transitions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (pathname !== '/') {
      delete document.documentElement.dataset.heroPortal;
    }

    const portalPhase = document.documentElement.dataset.heroPortal;
    const isPortalLocked =
      pathname === '/' &&
      (portalPhase === 'hero' ||
        portalPhase === 'entering' ||
        portalPhase === 'exiting');

    if (!isPortalLocked) {
      document.documentElement.style.removeProperty('overflow');
      document.body.style.removeProperty('overflow');
      document.documentElement.classList.remove('lenis-stopped');
    }

    const instance = lenisRef.current;
    if (instance) {
      if (isPortalLocked) {
        instance.scrollTo(0, { immediate: true, force: true });
        instance.stop();
      } else {
        instance.start();
        if (!window.location.hash) {
          instance.scrollTo(0, { immediate: true, force: true });
        }
        instance.resize();
      }
    } else if (!isPortalLocked && !window.location.hash) {
      window.scrollTo(0, 0);
    }

    notifyScrollPosition(window.scrollY);
    scheduleRemeasure();

    const rafId = window.requestAnimationFrame(() => {
      if (lenisRef.current && !isPortalLocked) {
        lenisRef.current.start();
        lenisRef.current.resize();
      }
      scheduleRemeasure();
    });

    const settleTimer = window.setTimeout(() => {
      if (lenisRef.current && !isPortalLocked) {
        lenisRef.current.resize();
      }
      scheduleRemeasure();
    }, 150);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
    };
  }, [pathname]);

  return <>{children}</>;
}
