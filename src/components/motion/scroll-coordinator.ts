'use client';

export interface ScrollTargetMetrics {
  /** Cached element top relative to current viewport (computed via pure subtraction: docTop - scrollY) */
  rectTop: number;
  /** Cached element height (measured only on mount/resize, NEVER during scroll) */
  height: number;
  /** Current scrollY */
  scrollY: number;
  /** Cached window.innerHeight */
  viewportHeight: number;
  /** Cached max scrollable distance */
  maxScroll: number;
}

type TargetUpdateFn = (metrics: ScrollTargetMetrics) => void;

interface RegisteredTarget {
  el: HTMLElement;
  update: TargetUpdateFn;
  docTop: number;
  height: number;
}

const targets = new Set<RegisteredTarget>();

let cachedViewportHeight = 0;
let cachedViewportWidth = 0;
let cachedMaxScroll = 0;
let currentScrollY = 0;

let rafScrollId: number | null = null;
let rafMeasureId: number | null = null;
let resizeTimer: number | null = null;
let listenersAttached = false;
let resizeObserver: ResizeObserver | null = null;

/**
 * Single READ-ONLY geometry pass.
 * Never mutates styles while measuring so the browser performs at most 1 layout pass on load/resize,
 * and ZERO layout reads (`getBoundingClientRect` / `scrollHeight`) ever happen during scrolling!
 */
function measureAllNow(): void {
  rafMeasureId = null;
  if (typeof window === 'undefined' || targets.size === 0) return;

  currentScrollY = window.scrollY;
  cachedViewportHeight = window.innerHeight;
  cachedViewportWidth = window.innerWidth;
  const docHeight = document.documentElement.scrollHeight;
  cachedMaxScroll = Math.max(0, docHeight - cachedViewportHeight);

  // Pure DOM READ batch (zero writes here -> zero layout thrashing)
  targets.forEach((item) => {
    const rect = item.el.getBoundingClientRect();
    item.docTop = rect.top + currentScrollY;
    item.height = rect.height;
  });

  // Pure DOM WRITE batch using cached numbers
  dispatchUpdates();
}

export function scheduleRemeasure(): void {
  if (typeof window === 'undefined' || rafMeasureId !== null) return;
  rafMeasureId = window.requestAnimationFrame(measureAllNow);
}

/**
 * Pure arithmetic + DOM WRITE pass executed during scroll (0 DOM reads, 0 reflows).
 */
function dispatchUpdates(): void {
  rafScrollId = null;
  if (targets.size === 0) return;

  const sy = currentScrollY;
  const vh = cachedViewportHeight || window.innerHeight;
  const maxS = cachedMaxScroll;

  targets.forEach((item) => {
    const rectTop = item.docTop - sy;
    item.update({
      rectTop,
      height: item.height,
      scrollY: sy,
      viewportHeight: vh,
      maxScroll: maxS,
    });
  });
}

/**
 * Allows Lenis smooth scroll to push exact scrollY directly within its own RAF tick (zero extra frame delay).
 */
export function notifyScrollPosition(scrollY: number): void {
  currentScrollY = scrollY;
  dispatchUpdates();
}

function onNativeScroll(): void {
  currentScrollY = window.scrollY;
  if (rafScrollId === null) {
    rafScrollId = window.requestAnimationFrame(dispatchUpdates);
  }
}

function onWindowResize(): void {
  if (typeof window === 'undefined') return;
  // Ignore mobile address-bar tiny vertical jitter if width didn't change much
  if (
    Math.abs(window.innerWidth - cachedViewportWidth) < 2 &&
    Math.abs(window.innerHeight - cachedViewportHeight) < 80
  ) {
    cachedViewportHeight = window.innerHeight;
    return;
  }
  if (resizeTimer !== null) {
    window.clearTimeout(resizeTimer);
  }
  resizeTimer = window.setTimeout(() => {
    scheduleRemeasure();
  }, 90);
}

function attachListeners(): void {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;

  window.addEventListener('scroll', onNativeScroll, { passive: true });
  window.addEventListener('resize', onWindowResize, { passive: true });

  if ('ResizeObserver' in window && !resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      scheduleRemeasure();
    });
    resizeObserver.observe(document.body);
  }
}

function detachListeners(): void {
  if (!listenersAttached || typeof window === 'undefined') return;
  listenersAttached = false;

  window.removeEventListener('scroll', onNativeScroll);
  window.removeEventListener('resize', onWindowResize);

  if (rafScrollId !== null) {
    window.cancelAnimationFrame(rafScrollId);
    rafScrollId = null;
  }
  if (rafMeasureId !== null) {
    window.cancelAnimationFrame(rafMeasureId);
    rafMeasureId = null;
  }
  if (resizeTimer !== null) {
    window.clearTimeout(resizeTimer);
    resizeTimer = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
}

/**
 * Registers an element with the Zero-Reflow ScrollTrigger Coordinator.
 * Geometry is cached on mount & ResizeObserver; scroll updates perform 0 DOM reads.
 */
export function registerScrollTarget(
  el: HTMLElement,
  update: TargetUpdateFn
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const record: RegisteredTarget = {
    el,
    update,
    docTop: 0,
    height: 0,
  };

  targets.add(record);
  attachListeners();
  scheduleRemeasure();

  return () => {
    targets.delete(record);
    if (targets.size === 0) {
      detachListeners();
    }
  };
}
