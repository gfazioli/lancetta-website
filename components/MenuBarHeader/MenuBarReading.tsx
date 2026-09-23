'use client';

import { useEffect, useState, type Ref } from 'react';
import { useReducedMotion } from '@mantine/hooks';
import { ClaudeMark, CodexMark, ResetMark } from './AgentMark';
import { barReading, ledBand } from './reading';
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
 * Same four parts in the same order as the real one: the agent's mark in the
 * agent's tint, the LAMP, the percent of the 5-hour window used, and the time
 * it resets behind a refresh arrow. `BarArt.cell` composes the first two into
 * one image because the status item's button holds exactly one; here they are
 * two spans, which is the same picture by other means.
 *
 * THE ONLY THING THAT MOVES IS WHOSE TURN IT IS, and it moves on a timer. The
 * hero used to drive the numbers as the reader scrolled, so the bar always
 * quoted the picture beneath it; three readings went past on one pass down the
 * home page and it read as a glitch rather than as a demonstration (user,
 * 2026-09-22). A reading that changes while you are reading something else is
 * not what the app does either: a poll repaints the item wherever the person
 * happens to be looking.
 *
 * Faithful on the three points `StatusItemRotator.swift` makes:
 *
 * - the turn changes on a timer, and nothing else re-arms it.
 * - the change is a cross-fade with nothing overlapping — out, swap, in.
 * - the item holds a FIXED width so its neighbours never shift. See
 *   `.readingCell` in the stylesheet: the cells are stacked in one grid cell,
 *   so the box is the widest of them without anything measuring a string.
 *
 * The CELLS are `aria-hidden`, and deliberately: they are a picture of the
 * product, and a screen reader reading "4 percent, 3 hours 29 minutes" out of
 * a page header would be quoting a number that is not the reader's. What it
 * hears instead is the button's own label.
 *
 * It is a BUTTON since 2026-09-23, because in the app clicking this item is
 * how you meet Lancetta at all: it opens the panel, and here it opens a copy of
 * it (`PanelDemo`, owned by `MenuBarHeader`, which holds the open state and
 * closes it on an outside click, Escape or a change of page).
 */
export function MenuBarReading({
  open = false,
  onToggle,
  controls,
  buttonRef,
}: {
  open?: boolean;
  onToggle?: () => void;
  controls?: string;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dim, setDim] = useState(false);

  /*
   * A reader who asked for reduced motion gets no rotation at all: a thing that
   * changes in the header every four seconds is motion however small it is, and
   * the hero already stands still for them.
   */
  useEffect(() => {
    if (reduced || barReading.length < 2) {
      return undefined;
    }
    let swap: number | undefined;
    const turn = window.setInterval(() => {
      setDim(true);
      swap = window.setTimeout(() => {
        setIndex((i) => (i + 1) % barReading.length);
        setDim(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(turn);
      window.clearTimeout(swap);
    };
  }, [reduced]);

  const shown = index % barReading.length;

  return (
    <button
      ref={buttonRef}
      type="button"
      className={classes.reading}
      data-dim={dim}
      data-open={open}
      aria-expanded={open}
      aria-controls={controls}
      aria-haspopup="dialog"
      aria-label="Lancetta’s panel, with invented numbers"
      title="Open the panel"
      onClick={onToggle}
    >
      {barReading.map((cell, i) => {
        const Mark = cell.agent === 'codex' ? CodexMark : ClaudeMark;
        return (
          <span
            key={cell.agent}
            className={classes.readingCell}
            data-agent={cell.agent}
            data-shown={i === shown}
            aria-hidden
          >
            <span className={classes.readingMark}>
              <Mark />
            </span>
            <span className={classes.readingLed} data-band={ledBand(cell.percent)} />
            <span className={classes.readingValue}>{cell.percent}%</span>
            <span className={classes.readingDot}>·</span>
            <span className={classes.readingReset}>
              <ResetMark />
              {cell.resets}
            </span>
          </span>
        );
      })}
    </button>
  );
}
