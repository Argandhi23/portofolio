'use client';

/**
 * HeroEyePortal — Hybrid Smooth Scroll-Scrub + One-Shot Eye Dive Engine.
 * - Phase 1 (p: 0.00 -> 0.33, Scroll-Scrubbed with 60/120fps Damping):
 *   Follows user scroll smoothly as Hero UI elements slide/fade out, the 3D human bust rotates
 *   its head & shoulders from 90° side profile to 0° front view, and both hunter eyes ignite bright white.
 * - Phase 2 (p: 0.33 -> 1.00, One-Shot Auto-Triggered Eye Dive):
 *   Automatically commits in one uninterrupted shot into the anatomical right eye
 *   (viewer's left) so the camera never stops halfway inside the eye zoom.
 * - Return Journey (p: 1.00 -> 0.00):
 *   When scrolling back up to the top of Section 2, smoothly zooms out of the right eye
 *   and rotates the 3D character back to side profile while restoring 100% of the Hero UI.
 */
import {
  useId,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  clamp,
  computeEyePortalState,
  computeSectionOverlapState,
  smoothstep,
  type EyePortalTarget,
} from '@/lib/scroll-math';
import {
  notifyScrollPosition,
  scheduleRemeasure,
} from '@/components/motion/scroll-coordinator';
import { cn } from '@/lib/utils';

export interface HeroEyePortalProps {
  /** The Hero section rendered inside the fixed camera stage */
  hero: ReactNode;
  /** Section 2 (About) content revealed inside the Warm Cream (#F5F0EB) eye portal */
  children: ReactNode;
  /** Anchor ID for the revealed content section (default "about") */
  contentId?: string;
  className?: string;
  /** Whether to shrink/recede Section 2 when exiting (default false when using Portal Bridge) */
  recedeOnExit?: boolean;
  /** Called once per rendered animation frame, never through React state */
  onProgress?: (progress: number) => void;
}

type PortalPhase = 'scrub' | 'entering' | 'about' | 'exiting';

/** Progress threshold where Phase 1 (scroll-scrub head turn) hands off to Phase 2 (one-shot eye dive) */
const EYE_DIVE_THRESHOLD = 0.33;
const ENTER_EYE_DURATION_MS = 820;
const EXIT_EYE_DURATION_MS = 920;
const COOLDOWN_MS = 200;

export function HeroEyePortal({
  hero,
  children,
  contentId = 'about',
  className,
  recedeOnExit = false,
  onProgress,
}: HeroEyePortalProps) {
  const uid = `gp-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const engineVersionRef = useRef('v5-flowing-no-snap');
  const progressRef = useRef(onProgress);

  useLayoutEffect(() => {
    progressRef.current = onProgress;
  }, [onProgress]);

  const q = `:where(#${uid})`;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const stage = stageRef.current;
    const veil = veilRef.current;
    if (!section || !content || !stage) return;

    const pin = section.querySelector<HTMLElement>('[data-gp-pin]')!;
    const backdrop = section.querySelector<HTMLElement>('[data-gp-backdrop]')!;
    const camera = section.querySelector<HTMLElement>('[data-gp-camera]')!;
    const art = section.querySelector<SVGSVGElement>('[data-gp-art]')!;
    const irisGroup =
      section.querySelector<SVGGElement>('[data-gp-iris-group]')!;
    const irisHalo =
      section.querySelector<SVGCircleElement>('[data-gp-iris-halo]')!;
    const irisCore =
      section.querySelector<SVGCircleElement>('[data-gp-iris-core]')!;
    const viewportProbe =
      section.querySelector<HTMLElement>('[data-gp-viewport]')!;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let disposed = false;
    let scrubRaf = 0;
    let animRaf = 0;
    let scrollRaf = 0;
    let W = 1;
    let H = 1;
    let scrubDistancePx = 420;
    let contentHeight = 1;
    let lastCover = -1;
    const initialHash = window.location.hash;
    const findHashTarget = (hash: string): HTMLElement | null => {
      try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
      catch { return null; }
    };
    const hasSectionHash = Boolean(
      initialHash && initialHash !== '#' && initialHash !== '#home'
    );
    let lastScrollY = window.scrollY;
    let hasLeftTopInAbout = hasSectionHash || window.scrollY > 24;

    let phase: PortalPhase =
      hasSectionHash || window.scrollY > 24 ? 'about' : 'scrub';
    let progress = phase === 'about' ? 1 : 0;

    // Normalized [0..1] scrub state for Phase 1 (maps to progress [0..EYE_DIVE_THRESHOLD])
    let targetScrub = phase === 'about' ? 1 : 0;
    let currentScrub = phase === 'about' ? 1 : 0;

    // One-shot animation state for Phase 2 (EYE_DIVE_THRESHOLD -> 1.0) & Return (1.0 -> 0.0)
    let animStartTime = 0;
    let animFrom = EYE_DIVE_THRESHOLD;
    let animTo = 1;
    let animDuration = ENTER_EYE_DURATION_MS;
    let cooldownUntil = 0;
    let pendingHashAfterEnter: string | null = null;
    let touchLastY = 0;

    let target: EyePortalTarget = { x: 500, y: 300, radius: 2.4 };

    const syncPortalDataset = (nextPhase: PortalPhase) => {
      document.documentElement.dataset.heroPortal =
        nextPhase === 'scrub' ? 'hero' : nextPhase;
      if (nextPhase === 'about') {
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('overflow');
        document.documentElement.classList.remove('lenis-stopped');
      }
      window.dispatchEvent(new Event('hero-portal-change'));
    };

    const measureEyeTarget = () => {
      const anchor = camera.querySelector<Element>('[data-eye-portal-anchor]');
      const prevTransform = camera.style.transform;
      const prevPinVisibility = pin.style.visibility;
      camera.style.transform = 'none';
      pin.style.visibility = 'visible';

      const pinRect = pin.getBoundingClientRect();
      if (anchor && pinRect.width > 0 && pinRect.height > 0) {
        const anchorRect = anchor.getBoundingClientRect();
        if (anchorRect.width > 0 && anchorRect.height > 0) {
          target = {
            x: anchorRect.left - pinRect.left + anchorRect.width / 2,
            y: anchorRect.top - pinRect.top + anchorRect.height / 2,
            radius: clamp(
              Math.min(anchorRect.width, anchorRect.height) / 2,
              1.8,
              4
            ),
          };
        } else {
          target = { x: W * 0.465, y: H * 0.365, radius: 2.4 };
        }
      } else {
        target = { x: W * 0.465, y: H * 0.365, radius: 2.4 };
      }

      camera.style.transform = prevTransform;
      pin.style.visibility = prevPinVisibility;

      irisHalo.setAttribute('cx', target.x.toFixed(2));
      irisHalo.setAttribute('cy', target.y.toFixed(2));
      irisCore.setAttribute('cx', target.x.toFixed(2));
      irisCore.setAttribute('cy', target.y.toFixed(2));
    };

    const paintPortal = (p: number) => {
      progress = clamp(p, 0, 1);

      if (motion.matches) {
        pin.style.visibility = 'visible';
        pin.style.opacity = '1';
        pin.style.pointerEvents = 'auto';
        camera.style.transform = 'none';
        art.style.visibility = 'hidden';
        backdrop.style.opacity = '0';
        section.style.setProperty('--gp-scrub', '0');
        section.style.setProperty('--gp-head-turn', '0');
        section.style.setProperty('--gp-eyes-glow', '0');
        section.style.setProperty('--gp-front-opacity', '1');
        section.style.setProperty('--gp-front-hit', 'auto');
        return;
      }

      const state = computeEyePortalState(progress, W, H, target);
      const ht = state.headTurnProgress;

      section.style.setProperty('--gp-scrub', String(ht));
      section.style.setProperty('--gp-head-turn', String(ht));
      section.style.setProperty(
        '--gp-eyes-glow',
        String(state.eyesGlowProgress)
      );
      section.style.setProperty(
        '--gp-front-opacity',
        String(state.frontOpacity)
      );
      section.style.setProperty(
        '--gp-front-hit',
        state.progress <= EYE_DIVE_THRESHOLD ? 'auto' : 'none'
      );
      section.dispatchEvent(new Event('hero-head-turn'));

      if (state.progress <= 0.0005) {
        pin.style.visibility = 'visible';
        pin.style.opacity = '1';
        pin.style.pointerEvents = 'auto';
        camera.style.transform = '';
        art.style.visibility = 'hidden';
        backdrop.style.opacity = '0';
      } else if (state.progress >= 0.9995) {
        pin.style.opacity = '0';
        pin.style.visibility = 'hidden';
        pin.style.pointerEvents = 'none';
        camera.style.transform = '';
        art.style.visibility = 'hidden';
        backdrop.style.opacity = '1';
      } else {
        pin.style.visibility = 'visible';
        pin.style.pointerEvents = 'auto';
        pin.style.opacity = String(
          Number((1 - state.revealOpacity).toFixed(4))
        );

        const tx1 = (W / 2).toFixed(2);
        const ty1 = (H / 2).toFixed(2);
        const s = state.scale.toFixed(4);
        const camScale = Math.min(state.scale, 3.2).toFixed(4);
        const r = state.roll.toFixed(3);
        const tx2 = (-state.focusX).toFixed(2);
        const ty2 = (-state.focusY).toFixed(2);

        camera.style.transform =
          state.progress <= EYE_DIVE_THRESHOLD
            ? ''
            : `translate(${tx1}px, ${ty1}px) scale(${camScale}) rotate(${r}deg) translate(${tx2}px, ${ty2}px)`;

        if (state.portalComplete) {
          backdrop.style.opacity = '1';
          art.style.visibility = 'hidden';
        } else {
          backdrop.style.opacity = '0';
          art.style.visibility =
            state.irisOpacity > 0.005 ? 'visible' : 'hidden';

          irisCore.setAttribute('r', state.irisRadius.toFixed(2));
          irisHalo.setAttribute('r', (state.irisRadius * 1.25).toFixed(2));
          irisGroup.setAttribute(
            'transform',
            `translate(${tx1} ${ty1}) scale(${s}) rotate(${r}) translate(${tx2} ${ty2})`
          );
          irisGroup.style.opacity = String(state.irisOpacity);
        }
      }

      section.dataset.gpProgress = state.progress.toFixed(4);
      progressRef.current?.(state.progress);
    };

    const resetSectionOverlap = () => {
      lastCover = 0;
      stage.style.transform = 'none';
      if (veil) veil.style.opacity = '0';
    };

    const paintSectionOverlap = () => {
      if (!recedeOnExit || motion.matches) return;
      if (phase !== 'about') {
        if (lastCover !== 0) {
          resetSectionOverlap();
        }
        return;
      }
      const contentRectTop = content.getBoundingClientRect().top;
      const overlap = computeSectionOverlapState(
        contentRectTop,
        contentHeight,
        H
      );
      const isBoundary =
        (overlap.coverProgress === 0 && lastCover !== 0) ||
        (overlap.coverProgress === 1 && lastCover !== 1);

      if (
        isBoundary ||
        Math.abs(overlap.coverProgress - lastCover) >= 0.002 ||
        lastCover < 0
      ) {
        lastCover = overlap.coverProgress;
        if (overlap.coverProgress <= 0.001) {
          stage.style.transform = 'none';
          if (veil) veil.style.opacity = '0';
        } else {
          stage.style.transform = `perspective(1400px) translate3d(0, ${overlap.translateY}px, 0) scale(${overlap.scale})`;
          if (veil) {
            veil.style.opacity = String(overlap.veilOpacity);
          }
        }
      }
    };

    const tickEyeDive = (now: number) => {
      animRaf = 0;
      if (disposed) return;

      const elapsed = Math.max(0, now - animStartTime);
      const rawT = clamp(elapsed / animDuration, 0, 1);
      // Smooth Hermite interpolation for the one-shot eye dive & return
      const easedT = smoothstep(0, 1, rawT);
      const nextProgress = animFrom + (animTo - animFrom) * easedT;

      paintPortal(nextProgress);

      if (rawT < 1) {
        animRaf = window.requestAnimationFrame(tickEyeDive);
        return;
      }

      cooldownUntil = performance.now() + COOLDOWN_MS;
      if (animTo === 1) {
        phase = 'about';
        targetScrub = 1;
        currentScrub = 1;
        hasLeftTopInAbout = false;
        window.scrollTo(0, 0);
        lastScrollY = 0;
        notifyScrollPosition(0);
        resetSectionOverlap();
        paintPortal(1);
        syncPortalDataset('about');
        scheduleRemeasure();

        if (pendingHashAfterEnter) {
          const targetEl = findHashTarget(pendingHashAfterEnter);
          pendingHashAfterEnter = null;
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } else {
        // Finished exiting out of the right eye & rotating back to side profile -> 100% restored Hero!
        phase = 'scrub';
        targetScrub = 0;
        currentScrub = 0;
        hasLeftTopInAbout = false;
        window.scrollTo(0, 0);
        lastScrollY = 0;
        notifyScrollPosition(0);
        resetSectionOverlap();
        paintPortal(0);
        syncPortalDataset('scrub');
        scheduleRemeasure();
      }
    };

    const startEyeDive = (
      direction: 'entering' | 'exiting',
      customFrom?: number
    ) => {
      if (motion.matches) return;
      if (phase === 'entering' || phase === 'exiting') return;

      window.cancelAnimationFrame(scrubRaf);
      scrubRaf = 0;
      window.cancelAnimationFrame(animRaf);
      window.scrollTo(0, 0);
      lastScrollY = 0;
      notifyScrollPosition(0);
      resetSectionOverlap();

      pin.style.visibility = 'visible';
      measureEyeTarget();

      if (direction === 'entering') {
        phase = 'entering';
        animFrom = customFrom ?? progress;
        animTo = 1;
        animDuration = ENTER_EYE_DURATION_MS;
        syncPortalDataset('entering');
      } else {
        phase = 'exiting';
        animFrom = 1;
        animTo = 0;
        animDuration = EXIT_EYE_DURATION_MS;
        paintPortal(1);
        syncPortalDataset('exiting');
      }

      animStartTime = performance.now();
      animRaf = window.requestAnimationFrame(tickEyeDive);
    };

    const tickScrub = () => {
      scrubRaf = 0;
      if (disposed || phase !== 'scrub') return;

      const diff = targetScrub - currentScrub;
      if (Math.abs(diff) <= 0.0008) {
        currentScrub = targetScrub;
      } else {
        // Smooth, flowing inertia damping ("ngalir") without ever bouncing/snapping back
        currentScrub += diff * 0.12;
      }

      if (targetScrub === 0 && currentScrub < 0.002) {
        currentScrub = 0;
      }

      const nextProgress = currentScrub * EYE_DIVE_THRESHOLD;
      paintPortal(nextProgress);

      // As soon as the character reaches the front-facing pose with glowing eyes, flow seamlessly into the eye dive!
      if (targetScrub >= 0.82 && currentScrub >= 0.84) {
        startEyeDive('entering', nextProgress);
        return;
      }

      if (Math.abs(targetScrub - currentScrub) > 0.0008) {
        scrubRaf = window.requestAnimationFrame(tickScrub);
      }
    };

    const scheduleScrub = () => {
      if (!scrubRaf && phase === 'scrub') {
        scrubRaf = window.requestAnimationFrame(tickScrub);
      }
    };

    const advanceScrub = (deltaY: number) => {
      // Continuous forward/backward flow ("ngalir terus, ga mental"):
      // Never resets or bounces back when the user pauses between scroll strokes!
      const step = clamp(deltaY / scrubDistancePx, -0.34, 0.34);
      targetScrub = clamp(targetScrub + step, 0, 1);

      if (targetScrub < 0.02 && deltaY < 0) {
        targetScrub = 0;
      } else if (targetScrub >= 0.82 && deltaY > 0) {
        // Once head turn reaches front view, let it flow all the way into the eye portal trigger
        targetScrub = 1;
      }

      scheduleScrub();
    };

    const layout = () => {
      if (!section.clientWidth) return;
      W = Math.max(1, window.innerWidth);
      H = Math.max(1, viewportProbe.offsetHeight || window.innerHeight);
      scrubDistancePx = Math.max(340, Math.round(H * 0.42));
      section.style.setProperty('--gp-height', `${H}px`);
      art.setAttribute('viewBox', `0 0 ${W} ${H}`);
      contentHeight = Math.max(1, content.offsetHeight);

      measureEyeTarget();

      section.dataset.gpReady = engineVersionRef.current;
      section.dataset.gpMotion = motion.matches ? 'off' : 'on';
      paintPortal(progress);
      paintSectionOverlap();
      scheduleRemeasure();
    };

    const onWheel = (e: WheelEvent) => {
      if (motion.matches) return;

      if (phase === 'entering' || phase === 'exiting') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      const now = performance.now();

      if (phase === 'scrub') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (now < cooldownUntil && e.deltaY < 0) {
          targetScrub = 0;
          scheduleScrub();
          return;
        }
        advanceScrub(e.deltaY);
        return;
      }

      if (phase === 'about' && window.scrollY <= 18 && e.deltaY < -1.5) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (now >= cooldownUntil) {
          startEyeDive('exiting');
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchLastY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (motion.matches || e.touches.length === 0) return;

      if (phase === 'entering' || phase === 'exiting') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = (touchLastY - currentY) * 1.35;
      touchLastY = currentY;
      const now = performance.now();

      if (phase === 'scrub') {
        e.preventDefault();
        e.stopImmediatePropagation();
        advanceScrub(deltaY);
        return;
      }

      if (phase === 'about' && window.scrollY <= 18 && deltaY < -5) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (now >= cooldownUntil) {
          startEyeDive('exiting');
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (motion.matches) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (phase === 'entering' || phase === 'exiting') {
        if (
          [
            'ArrowDown',
            'ArrowUp',
            'PageDown',
            'PageUp',
            ' ',
            'Home',
            'End',
          ].includes(e.key)
        ) {
          e.preventDefault();
        }
        return;
      }

      const now = performance.now();
      if (now < cooldownUntil) return;

      if (phase === 'scrub') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          advanceScrub(scrubDistancePx * 0.34);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          advanceScrub(-scrubDistancePx * 0.34);
        } else if (e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault();
          targetScrub = 1;
          scheduleScrub();
        }
      } else if (
        phase === 'about' &&
        window.scrollY <= 18 &&
        ['ArrowUp', 'PageUp', 'Home'].includes(e.key)
      ) {
        e.preventDefault();
        startEyeDive('exiting');
      }
    };

    const onDocumentClick = (e: MouseEvent) => {
      if (motion.matches) return;
      const anchor = (
        e.target as HTMLElement | null
      )?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';

      if (phase === 'scrub' && href.startsWith('#') && href !== '#home') {
        e.preventDefault();
        pendingHashAfterEnter = href === `#${contentId}` ? null : href;
        targetScrub = 1;
        scheduleScrub();
      } else if (
        phase === 'about' &&
        (href === '/' || href === '#home' || href === '/#home')
      ) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'instant' });
        startEyeDive('exiting');
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (phase === 'scrub' && y > 80 && !motion.matches) {
        // Programmatic scroll / anchor jump / Find-in-page while in scrub phase -> open portal cleanly
        window.cancelAnimationFrame(scrubRaf);
        scrubRaf = 0;
        phase = 'about';
        targetScrub = 1;
        currentScrub = 1;
        hasLeftTopInAbout = true;
        lastScrollY = y;
        paintPortal(1);
        syncPortalDataset('about');
        paintSectionOverlap();
        scheduleRemeasure();
        return;
      }

      if (
        (phase === 'scrub' || phase === 'entering' || phase === 'exiting') &&
        y > 0 &&
        !motion.matches
      ) {
        window.scrollTo(0, 0);
        lastScrollY = 0;
        return;
      }

      if (phase === 'about' && y > 18) {
        hasLeftTopInAbout = true;
      }

      // Reliable scroll-back trigger: if user scrolled down in Section 2+ and then
      // smooth-scrolled, dragged scrollbar, or flicked all the way back to top (y <= 5),
      // automatically exit the eye portal back to the Hero section!
      if (
        phase === 'about' &&
        !motion.matches &&
        hasLeftTopInAbout &&
        y <= 5 &&
        y < lastScrollY &&
        performance.now() >= cooldownUntil
      ) {
        hasLeftTopInAbout = false;
        lastScrollY = 0;
        startEyeDive('exiting');
        return;
      }

      lastScrollY = y;

      if (!scrollRaf) {
        scrollRaf = window.requestAnimationFrame(() => {
          scrollRaf = 0;
          paintSectionOverlap();
        });
      }
    };

    const onResize = () => {
      layout();
    };

    const observer = new ResizeObserver(() => {
      const nextContentH = content.offsetHeight;
      if (Math.abs(nextContentH - contentHeight) >= 2) {
        contentHeight = Math.max(1, nextContentH);
        paintSectionOverlap();
      }
    });
    observer.observe(content);

    syncPortalDataset(phase);
    layout();

    if (hasSectionHash && window.scrollY <= 24) {
      const hashTarget = findHashTarget(initialHash);
      if (hashTarget) {
        window.requestAnimationFrame(() => {
          hashTarget.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }

    window.addEventListener('wheel', onWheel, {
      capture: true,
      passive: false,
    });
    window.addEventListener('touchstart', onTouchStart, {
      capture: true,
      passive: true,
    });
    window.addEventListener('touchmove', onTouchMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onDocumentClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    motion.addEventListener('change', onResize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(scrubRaf);
      window.cancelAnimationFrame(animRaf);
      window.cancelAnimationFrame(scrollRaf);
      observer.disconnect();
      delete document.documentElement.dataset.heroPortal;
      document.documentElement.style.removeProperty('overflow');
      document.body.style.removeProperty('overflow');
      document.documentElement.classList.remove('lenis-stopped');
      window.dispatchEvent(new Event('hero-portal-change'));
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchstart', onTouchStart, { capture: true });
      window.removeEventListener('touchmove', onTouchMove, { capture: true });
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onDocumentClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      motion.removeEventListener('change', onResize);
    };
  }, [contentId, recedeOnExit]);

  return (
    <section
      ref={sectionRef}
      id={uid}
      data-gp-motion="on"
      className={cn('relative', className)}
      style={
        {
          '--gp-paper': '#080808',
          '--gp-field': '#F5F0EB',
          '--gp-foreground': '#0D0D0D',
        } as CSSProperties
      }
    >
      <style>{`
        ${q}{position:relative;background:var(--gp-field);}
        ${q}>[data-gp-viewport]{position:absolute;inset:0 auto auto 0;height:100vh;height:100svh;width:0;pointer-events:none;visibility:hidden;}
        ${q} [data-gp-pin]{position:fixed;inset:0;width:100%;height:var(--gp-height,100svh);overflow:clip;isolation:isolate;z-index:45;background:var(--gp-paper);}
        ${q} [data-gp-backdrop]{position:absolute;inset:0;background:var(--gp-field);opacity:0;pointer-events:none;z-index:5;}
        ${q} [data-gp-camera]{position:relative;width:100%;height:100%;transform-origin:0 0;z-index:2;}
        ${q} [data-gp-front]{opacity:var(--gp-front-opacity,1);pointer-events:var(--gp-front-hit,auto);}
        ${q} [data-gp-art]{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:4;visibility:hidden;}
        ${q} [data-gp-content]{box-sizing:border-box;position:relative;z-index:20;min-height:var(--gp-height,100svh);color:var(--gp-foreground);background:var(--gp-field);}
        @media(prefers-reduced-motion:reduce){
          ${q} [data-gp-pin]{position:relative!important;height:auto!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;}
          ${q} [data-gp-camera]{transform:none!important;}
          ${q} [data-gp-content]{background:var(--gp-field)!important;}
          ${q} [data-gp-front]{opacity:1!important;pointer-events:auto!important;transform:none!important;}
        }
      `}</style>

      <div data-gp-viewport aria-hidden="true" />

      <div key="gp-pin-v5" data-gp-pin>
        <div data-gp-backdrop aria-hidden="true" />
        <div data-gp-camera>{hero}</div>
        <svg data-gp-art aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id={`${uid}-iris-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="65%" stopColor="#F5F0EB" stopOpacity="0.98" />
              <stop offset="88%" stopColor="#FFE4EC" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E04D70" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g data-gp-iris-group>
            <circle data-gp-iris-halo fill={`url(#${uid}-iris-glow)`} />
            <circle data-gp-iris-core fill="#F5F0EB" />
          </g>
        </svg>
      </div>

      <div
        ref={contentRef}
        data-gp-content
        id={contentId}
        style={
          {
            '--sec-fg': '#0D0D0D',
            '--sec-muted': '#57504A',
            '--sec-card-bg': '#FFFFFF',
            '--sec-card-border': 'rgba(13, 13, 13, 0.1)',
            '--sec-divider': 'rgba(13, 13, 13, 0.12)',
            '--sec-morph': '1',
          } as CSSProperties
        }
      >
        <div ref={stageRef} className="relative origin-bottom">
          {children}
        </div>
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 bg-[#050102] opacity-0"
        />
      </div>
    </section>
  );
}
