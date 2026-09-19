'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@mantine/hooks';
import { ClaudeMark, CodexMark, ResetMark } from './AgentMark';
import { useMenuBarReading } from './reading-store';
import classes from './MenuBarHeader.module.css';

/**
 * The app's own default, `barRotateSeconds = defaults.object(...) as? Int ?? 4`
 * in `Preferences.swift`. The setting exists ("Rotate agents every", in
 * Settings — General) and 4 seconds is what an unconfigured Mac gets, so it is
 * what the page shows.
 */
const ROTATE_MS = 4000;

/**
 * The app's cross-fade: `NSAnimationContext` duration 0.16 out, repaint, 0.16
 * back in. A fade rather than a horizontal scroll for the reason
 * `StatusItemRotator.swift` gives — the menu bar is a surface you look PAST,
 * and a scroll is motion up there for as long as it lasts.
 */
const FADE_MS = 160;

/**
 * The app's own menu-bar item, rebuilt in the header.
 *
 * Same three parts in the same order as the real one: the agent's mark in the
 * agent's tint, the percent of the 5-hour window used, and the time it resets
 * behind a refresh arrow. The hero drives the NUMBERS as the reader scrolls,
 * so the thing at the top of the page shows the same reading as the picture
 * under it.
 *
 * Whose turn it is, though, is this component's — and it turns on a timer, not
 * on the scroll. That is the app: with more than one agent in the bar they
 * take turns every few seconds whether or not anything else happens, and a
 * page where the item only ever moves while you drag the scrollbar is
 * demonstrating something the app does not do.
 *
 * Faithful on the three points `StatusItemRotator.swift` makes:
 *
 * - the turn changes on a timer, and a fresh POLL does not restart it. Here a
 *   poll is a change of frame: the numbers repaint in place and the index
 *   stays where it was, which is the rotator's `.repaint` case.
 * - the change is a cross-fade with nothing overlapping — out, swap, in.
 * - the item holds a FIXED width so its neighbours never shift. See
 *   `.readingCell` in the stylesheet: the cells are stacked in one grid cell,
 *   so the box is the widest of them without anything measuring a string.
 *
 * `aria-hidden`, and deliberately: it is a picture of the product, and a
 * screen reader reading "9 percent, 4 hours 3 minutes" out of a page header
 * would be quoting a number that is not the reader's. The header's accessible
 * name comes from the nav around it.
 */
export function MenuBarReading() {
  const { cells, open } = useMenuBarReading();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dim, setDim] = useState(false);

  /*
   * `cells.length` is the whole dependency, so the hero moving the numbers on
   * does not re-arm the timer — only an agent joining or leaving does. A
   * reader who asked for reduced motion gets no rotation at all: a thing that
   * changes in the header every four seconds is motion however small it is,
   * and the hero already stands still for them.
   */
  useEffect(() => {
    if (reduced || cells.length < 2) {
      return undefined;
    }
    let swap: number | undefined;
    const turn = window.setInterval(() => {
      setDim(true);
      swap = window.setTimeout(() => {
        setIndex((i) => (i + 1) % cells.length);
        setDim(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(turn);
      window.clearTimeout(swap);
    };
  }, [reduced, cells.length]);

  // An agent leaving while its turn is up would index past the end.
  const shown = index % cells.length;

  return (
    <span className={classes.reading} data-open={open} data-dim={dim} aria-hidden>
      {cells.map((cell, i) => {
        const Mark = cell.agent === 'codex' ? CodexMark : ClaudeMark;
        return (
          <span
            key={cell.agent}
            className={classes.readingCell}
            data-agent={cell.agent}
            data-shown={i === shown}
          >
            <span className={classes.readingMark}>
              <Mark />
            </span>
            <span className={classes.readingValue}>{cell.percent}%</span>
            <span className={classes.readingDot}>·</span>
            <span className={classes.readingReset}>
              <ResetMark />
              {cell.resets}
            </span>
          </span>
        );
      })}
    </span>
  );
}
