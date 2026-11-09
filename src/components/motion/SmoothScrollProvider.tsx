'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  notifyScrollPosition,
  scheduleRemeasure,
} from '@/components/motion/scroll-coordinator';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Featherlight, ultra-responsive smooth scrolling powered by official Lenis + GSAP ScrollTrigger sync.
 * - Tuned with `lerp: 0.12` & `wheelMultiplier: 1.05` so scrolling feels effortless, crisp, and buttery (zero drag/heaviness).
 * - Syncs directly into both GSAP ScrollTrigger and the Zero-Reflow ScrollCoordinator inside the same requestAnimationFrame tick.
 * - Preserves 100% native touch scrolling on mobile devices.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

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
      ScrollTrigger.update();
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
        window.requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
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

    // Next's hash jump can run before ScrollTrigger inserts the gallery pin spacer.
    // Resolve the destination again AFTER refresh, using the final document geometry.
    const routeHash = window.location.hash;
    let interrupted = false;
    let disposed = false;
    const cancelAlignment = () => { interrupted = true; };
    const alignRouteHash = () => {
      if (disposed || interrupted || !routeHash || routeHash === '#home' || window.location.hash !== routeHash) return;
      const phase = document.documentElement.dataset.heroPortal;
      if (phase === 'hero' || phase === 'entering' || phase === 'exiting') return;
      let target: HTMLElement | null;
      try {
        target = document.getElementById(decodeURIComponent(routeHash.slice(1)));
      } catch {
        return;
      }
      if (!target) return;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 24);
      if (lenisRef.current) {
        lenisRef.current.scrollTo(top, { immediate: true, force: true });
      } else {
        window.scrollTo({ top, behavior: 'instant' });
      }
      notifyScrollPosition(window.scrollY);
    };
    const refreshRouteLayout = () => {
      if (disposed) return;
      ScrollTrigger.refresh();
      if (lenisRef.current && !isPortalLocked) {
        lenisRef.current.start();
        // Lenis must see the new pin spacing before clamping the destination.
        lenisRef.current.resize();
      }
      alignRouteHash();
      scheduleRemeasure();
    };
    window.addEventListener('wheel', cancelAlignment, { passive: true });
    window.addEventListener('touchstart', cancelAlignment, { passive: true });
    window.addEventListener('pointerdown', cancelAlignment, { passive: true });
    window.addEventListener('keydown', cancelAlignment);

    const rafId = window.requestAnimationFrame(refreshRouteLayout);
    const settleTimer = window.setTimeout(refreshRouteLayout, 150);
    // Fonts can change the about section's height after the first layout pass.
    void document.fonts.ready.then(() => {
      if (!disposed && !interrupted) refreshRouteLayout();
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
      window.removeEventListener('wheel', cancelAlignment);
      window.removeEventListener('touchstart', cancelAlignment);
      window.removeEventListener('pointerdown', cancelAlignment);
      window.removeEventListener('keydown', cancelAlignment);
    };
  }, [pathname]);

  return <>{children}</>;
}
