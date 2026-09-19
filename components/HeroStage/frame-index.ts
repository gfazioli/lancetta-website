/**
 * Which frame a scroll progress in [0, 1] lands on, for `count` frames.
 *
 * The one piece of arithmetic behind every scroll-driven stage on the site,
 * kept pure so a test can pin the boundaries: the last frame owns progress
 * 1.0 rather than falling off the end, and nothing outside [0, 1] can pick a
 * frame that does not exist.
 */
export function frameIndex(progress: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(count - 1, Math.floor(p * count));
}
