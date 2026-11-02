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
