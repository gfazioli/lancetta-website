'use client';

import { ClaudeMark, CodexMark, ResetMark } from './AgentMark';
import { useMenuBarReading } from './reading-store';
import classes from './MenuBarHeader.module.css';

/**
 * The app's own menu-bar item, rebuilt in the header.
 *
 * Same three parts in the same order as the real one: the agent's mark in the
 * agent's tint, the percent of the 5-hour window used, and the time it resets
 * behind a refresh arrow. The hero drives it as the reader scrolls, so the
 * thing at the top of the page behaves like the thing the page is about.
 *
 * `aria-hidden`, and deliberately: it is a picture of the product, and a
 * screen reader reading "9 percent, 4 hours 3 minutes" out of a page header
 * would be quoting a number that is not the reader's. The header's accessible
 * name comes from the nav around it.
 */
export function MenuBarReading() {
  const { agent, percent, resets, open } = useMenuBarReading();
  const Mark = agent === 'codex' ? CodexMark : ClaudeMark;

  return (
    <span className={classes.reading} data-agent={agent} data-open={open} aria-hidden>
      <span className={classes.readingMark}>
        <Mark />
      </span>
      <span className={classes.readingValue}>{percent}%</span>
      <span className={classes.readingDot}>·</span>
      <span className={classes.readingReset}>
        <ResetMark />
        {resets}
      </span>
    </span>
  );
}
