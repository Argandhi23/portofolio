/**
 * Pure, zero-dependency mathematical primitives for 60/120fps Smooth Scroll & ScrollTrigger scrubbing.
 */

export function clamp(value: number, min: number, max: number): number {
  if (min > max) return min;
  return Math.min(max, Math.max(min, value));
}

export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * clamp(factor, 0, 1);
}

/**
 * Frame-rate independent exponential damping (identical feel across 60Hz, 120Hz, and 165Hz displays).
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dtSeconds: number
): number {
  if (dtSeconds <= 0) return current;
  const factor = 1 - Math.exp(-Math.max(0, lambda) * Math.min(dtSeconds, 0.1));
  return lerp(current, target, factor);
}

/**
 * Returns [0..1] progress as an element traverses the full viewport height:
 * - 0 when element top touches bottom of viewport (rectTop === viewportHeight)
 * - 0.5 when element center aligns with viewport center
 * - 1 when element bottom exits top of viewport (rectTop === -rectHeight)
 */
export function computeViewportTraverseProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number
): number {
  const totalDistance = Math.max(1, viewportHeight + Math.max(0, rectHeight));
  const travelled = viewportHeight - rectTop;
  return clamp(travelled / totalDistance, 0, 1);
}

/**
 * Returns [0..1] progress between two viewport ratios:
 * - 0 when rectTop >= viewportHeight * enterRatio (e.g., 0.88)
 * - 1 when rectTop <= viewportHeight * completeRatio (e.g., 0.25)
 */
export function computeWindowedScrollProgress(
  rectTop: number,
  viewportHeight: number,
  enterRatio = 0.88,
  completeRatio = 0.25
): number {
  const startY = viewportHeight * enterRatio;
  const endY = viewportHeight * completeRatio;
  const span = Math.max(1, startY - endY);
  return clamp((startY - rectTop) / span, 0, 1);
}

/**
 * Returns [0..1] progress as a top hero section scrolls up out of view:
 * - 0 when rectTop >= 0
 * - 1 when rectTop <= -rectHeight
 */
export function computeHeroExitProgress(
  rectTop: number,
  rectHeight: number
): number {
  if (rectTop >= 0) return 0;
  const safeHeight = Math.max(1, rectHeight);
  return clamp(-rectTop / safeHeight, 0, 1);
}

/**
 * Smoothly computes an individual word's opacity [minOpacity..1] from overall block scroll progress [0..1].
 */
export function computeWordHighlightOpacity(
  progress: number,
  wordIndex: number,
  totalWords: number,
  minOpacity = 0.16
): number {
  const count = Math.max(1, totalWords);
  const clampedProgress = clamp(progress, 0, 1);
  const windowWidth = clamp(2.2 / count, 0.12, 0.45);
  const maxStart = 1 - windowWidth;
  const wordStart =
    count <= 1 ? 0 : (clamp(wordIndex, 0, count - 1) / (count - 1)) * maxStart;
  const local = clamp((clampedProgress - wordStart) / windowWidth, 0, 1);
  return Number((minOpacity + (1 - minOpacity) * local).toFixed(3));
}

/**
 * Smooth cubic ease-out curve for natural scroll-scrubbed settling.
 */
export function easeOutCubic(t: number): number {
  const clamped = clamp(t, 0, 1);
  return 1 - Math.pow(1 - clamped, 3);
}

/**
 * Hermite smoothstep interpolation (`t * t * (3 - 2 * t)`), matching GlyphPortal's `smooth(a, b, n)`.
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export interface EyePortalTarget {
  /** Eye X coordinate relative to the pinned viewport [0..viewportWidth] */
  x: number;
  /** Eye Y coordinate relative to the pinned viewport [0..viewportHeight] */
  y: number;
  /** Base pupil radius in viewport pixels at scale = 1 (typically ~2–3px) */
  radius: number;
}

export interface EyePortalMetrics {
  /** Clamped overall animation progress [0..1] */
  progress: number;
  /** Head turn progress from side profile (0) to facing forward (1) */
  headTurnProgress: number;
  /** Sharp white eye ignition intensity [0..1] when facing forward */
  eyesGlowProgress: number;
  /** Normalized zoom travel progress [0..1] (spans p = 0.20 -> 0.84) */
  zoomProgress: number;
  /** Exponential camera scale factor [1..10] */
  scale: number;
  /** Camera focal point X in stage coordinates */
  focusX: number;
  /** Camera focal point Y in stage coordinates */
  focusY: number;
  /** Subtle banking camera rotation in degrees (-4deg peak mid-flight) */
  roll: number;
  /** Dynamic right-eye portal aperture radius in stage pixels */
  irisRadius: number;
  /** Opacity for foreground Hero UI (navbar, texts, services, tech stack) [1..0] */
  frontOpacity: number;
  /** Opacity for the expanding portal core inside the right eye [0..1] */
  irisOpacity: number;
  /** True when the right-eye portal has completely filled the viewport (zoomProgress >= 1) */
  portalComplete: boolean;
  /** Opacity for Section 2 (About) content emerging inside the Warm Cream space [0..1] */
  revealOpacity: number;
}

/**
 * Computes 3-phase cinematic choreography:
 * 1. Silhouette turns head from side profile to facing forward + both sharp eyes glow white (p: 0 -> 0.34).
 * 2. Camera banks (-4deg) & zooms exponentially into the anatomical right eye (viewer's left) (p: 0.20 -> 0.84).
 * 3. Right eye white/cream light fills 100% of viewport and reveals Section 2 (p: 0.80 -> 1.00).
 */
export function computeEyePortalState(
  progress: number,
  viewportWidth: number,
  viewportHeight: number,
  target: EyePortalTarget
): EyePortalMetrics {
  const p = clamp(progress, 0, 1);
  const W = Math.max(1, viewportWidth);
  const H = Math.max(1, viewportHeight);
  const centerX = W / 2;
  const centerY = H / 2;
  const baseRadius = clamp(target.radius, 1.5, 4);

  // Phase 1 (Scroll-Scrubbed p: 0.00 -> 0.33):
  // Body & head smoothly rotate forward, Hero UI slides/fades out, and sharp white eyes ignite.
  const headTurnProgress = Number(smoothstep(0.01, 0.31, p).toFixed(4));
  const eyesGlowProgress = Number(smoothstep(0.12, 0.33, p).toFixed(4));
  const frontOpacity = Number((1 - smoothstep(0.01, 0.3, p)).toFixed(4));

  // Phase 2 (One-Shot Triggered Eye Dive p: 0.33 -> 0.86):
  // Camera banks (-4deg) & zooms exponentially into the anatomical right eye (viewer's left).
  const startScale = 1 + headTurnProgress * 0.06;
  const endScale = 10;

  const rawT = clamp((p - 0.33) / 0.53, 0, 1);
  const t = rawT > 0.9999 ? 1 : rawT;
  const eased =
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const scale = Number(
    Math.exp(
      Math.log(startScale) + Math.log(endScale / startScale) * eased
    ).toFixed(4)
  );

  const blend =
    t === 0
      ? 0
      : (1 / scale - 1 / startScale) / (1 / endScale - 1 / startScale);

  const focusX = centerX + (target.x - centerX) * blend;
  const focusY = centerY + (target.y - centerY) * blend;
  const rawRoll =
    -4 * smoothstep(0.04, 0.5, t) * (1 - smoothstep(0.62, 0.94, t));
  const roll = Math.abs(rawRoll) < 1e-6 ? 0 : Number(rawRoll.toFixed(4));

  // Expand the right-eye portal aperture as the camera dives into the glowing eye
  const maxIrisRadius = Math.max(
    baseRadius + 1,
    Math.hypot(W, H) / (endScale * 1.28)
  );
  const apertureT = smoothstep(0.12, 1.0, t);
  const irisRadius = Number(
    (
      baseRadius * Math.pow(maxIrisRadius / baseRadius, apertureT * apertureT)
    ).toFixed(3)
  );

  const irisOpacity = Number(smoothstep(0.32, 0.45, p).toFixed(4));
  const portalComplete = t >= 1;
  const revealOpacity = Number(smoothstep(0.82, 0.98, p).toFixed(4));

  return {
    progress: p,
    headTurnProgress,
    eyesGlowProgress,
    zoomProgress: t,
    scale,
    focusX,
    focusY,
    roll,
    irisRadius,
    frontOpacity,
    irisOpacity,
    portalComplete,
    revealOpacity,
  };
}

export interface CardPerspectiveMetrics {
  /** [0..1] progress from bottom entry into viewport center */
  entryProgress: number;
  /** [0..1] progress as card exits top of viewport */
  exitProgress: number;
  /** 3D X-axis rotation in degrees (+tilt on entry, 0 at center, -tilt on exit) */
  rotateX: number;
  /** Uniform scale factor (0.91 -> 1.0 -> 0.95) */
  scale: number;
  /** Vertical offset in pixels (+44 -> 0 -> +24) */
  translateY: number;
  /** Opacity factor (0.4 -> 1.0 -> 0.82) */
  opacity: number;
}

/**
 * Computes continuous 3D scroll-scrubbed perspective transform metrics for showcase cards.
 */
export function computeCardPerspectiveState(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
  intensity = 1
): CardPerspectiveMetrics {
  const safeVh = Math.max(1, viewportHeight);
  const safeHeight = Math.max(1, rectHeight);

  // Entry: starts when rectTop is at 98% of viewport, completes when rectTop reaches 42% of viewport
  const rawEntry = computeWindowedScrollProgress(rectTop, safeVh, 0.98, 0.42);
  const entryProgress = easeOutCubic(rawEntry);

  // Exit: starts when rectTop goes above 8% of viewport, completes when rectTop reaches -65% of card height
  const exitStart = safeVh * 0.08;
  const exitEnd = -safeHeight * 0.65;
  const exitSpan = Math.max(1, exitStart - exitEnd);
  const rawExit = clamp((exitStart - rectTop) / exitSpan, 0, 1);
  const exitProgress = easeOutCubic(rawExit);

  const entryLack = 1 - entryProgress;
  const rotateX = Number(
    ((entryLack * 10.5 - exitProgress * 4.2) * intensity).toFixed(2)
  );
  const scale = Number(
    (1 - entryLack * 0.085 * intensity - exitProgress * 0.048 * intensity).toFixed(4)
  );
  const translateY = Number(
    ((entryLack * 44 + exitProgress * 26) * intensity).toFixed(1)
  );
  const opacity = Number(
    clamp(1 - entryLack * 0.55 - exitProgress * 0.22, 0.35, 1).toFixed(3)
  );

  return {
    entryProgress,
    exitProgress,
    rotateX,
    scale,
    translateY,
    opacity,
  };
}

function parseHexChannel(hex: string, start: number): number {
  const val = Number.parseInt(hex.slice(start, start + 2), 16);
  return Number.isNaN(val) ? 0 : val;
}

/**
 * Smoothly interpolates between two 6-digit hex colors (`#RRGGBB`) for scroll-scrubbed color morphing.
 */
export function interpolateHexColor(
  fromHex: string,
  toHex: string,
  progress: number
): string {
  const t = clamp(progress, 0, 1);
  const a = fromHex.replace('#', '').padEnd(6, '0');
  const b = toHex.replace('#', '').padEnd(6, '0');

  const r1 = parseHexChannel(a, 0);
  const g1 = parseHexChannel(a, 2);
  const b1 = parseHexChannel(a, 4);

  const r2 = parseHexChannel(b, 0);
  const g2 = parseHexChannel(b, 2);
  const b2 = parseHexChannel(b, 4);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);

  return `rgb(${r}, ${g}, ${bl})`;
}

export interface SectionOverlapMetrics {
  /** [0..1] progress as the next section rises over the bottom of this section */
  coverProgress: number;
  /** Scale recession as section is covered (1 -> 0.93) */
  scale: number;
  /** Downward counter-translation so section feels pinned while next section covers it */
  translateY: number;
  /** Shadow veil opacity (0 -> 0.62) */
  veilOpacity: number;
}

/**
 * Computes Awwwards-style Curtain Overlap metrics when the next section slides up over the current section.
 */
export function computeSectionOverlapState(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number
): SectionOverlapMetrics {
  const safeVh = Math.max(1, viewportHeight);
  const rectBottom = rectTop + Math.max(1, rectHeight);

  // Starts when section bottom reaches 105% of viewport height, completes when it reaches 18% of viewport height
  const startBottom = safeVh * 1.05;
  const endBottom = safeVh * 0.18;
  const span = Math.max(1, startBottom - endBottom);
  const rawCover = clamp((startBottom - rectBottom) / span, 0, 1);
  const coverProgress = easeOutCubic(rawCover);

  return {
    coverProgress,
    scale: Number((1 - coverProgress * 0.068).toFixed(4)),
    translateY: Number((coverProgress * 115).toFixed(1)),
    veilOpacity: Number((coverProgress * 0.58).toFixed(3)),
  };
}
