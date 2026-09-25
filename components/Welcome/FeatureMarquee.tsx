'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Marquee } from '@gfazioli/mantine-marquee';
import classes from './FeatureMarquee.module.css';

/*
 * The feature cards as one full-width row that scrolls, stopping under the
 * pointer (user, 2026-09-25: a marquee to shorten the page, not another grid).
 *
 * Three things the marquee does not do on its own, each checked in its source
 * (`@gfazioli/mantine-marquee` 4.1.6, `dist/esm/Marquee.mjs`):
 *
 * - It renders `children` `repeat` times, and every copy is live: eleven links
 *   read and tabbed twice. After mount the copies past the first are `inert`
 *   and `aria-hidden`, so a screen reader and the Tab key meet each card once.
 *   The served HTML still carries both copies, which costs a crawler nothing.
 * - It pauses on `mouseenter` only. A card reached with Tab would keep sliding
 *   away under its own focus ring, so `:focus-within` pauses it too.
 * - Under `prefers-reduced-motion` its stylesheet sets `animation: none`, which
 *   leaves a still row wider than the window inside `overflow: hidden` — the
 *   cards past the right edge simply unreachable. There, the copies are hidden
 *   and the row scrolls by hand instead.
 */
/** Put on each card: a fixed width, so the row is a track and not a squeeze. */
export const featureMarqueeItem = classes.item;

export function FeatureMarquee({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const groups = root.current?.firstElementChild?.children;
    if (!groups) return;
    Array.from(groups)
      .slice(1)
      .forEach((copy) => {
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('inert', '');
      });
  }, []);

  return (
    <Marquee
      ref={root}
      className={classes.marquee}
      pauseOnHover
      fadeEdges
      gap="24px"
      duration={80}
      py="md"
    >
      {children}
    </Marquee>
  );
}
