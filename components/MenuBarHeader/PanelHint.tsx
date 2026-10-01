'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { useReducedMotion } from '@mantine/hooks';
import {
  ANCHOR,
  DELAY_MS,
  dismissGuide,
  guideMemory,
  markPanelOpened,
  onGuideDismissed,
} from '../Mascot/guide';
import { Mascot } from '../Mascot/Mascot';
import classes from './PanelHint.module.css';

type Phase = 'hidden' | 'walking' | 'pointing' | 'leaving';

export { DELAY_MS } from '../Mascot/guide';

/** Matches `walk-in` in the stylesheet. */
export const WALK_MS = 2400;
/** Matches the fade on `.hint`. */
export const LEAVE_MS = 260;

interface PanelHintProps {
  /** Only where it makes sense to arrive: the home page. */
  enabled: boolean;
  /** Whether the panel is open. The moment it is, the hint's job is done. */
  open: boolean;
  onOpen: () => void;
}

/**
 * The reading in the bar opens a copy of the app's panel, and nothing on the
 * page says so. This says so: the app icon, walking — see `MASCOT` for how it
 * is drawn and why it is ours — comes in under the bar from the right, stops
 * beside the reading, raises an arm at it and says what it does. The user's
 * idea (2026-09-23).
 *
 * It comes back on EVERY load. Until 2026-09-24 it came once per browser —
 * localStorage remembered that the panel had been opened — and the user took
 * that out: *"facciamolo apparire sempre ad ogni reload della pagina"*. What
 * it remembers lives in `guide.ts`, for the life of the page only: once the
 * panel has been opened or the character dismissed, it does not walk in again
 * when the reader comes back to the home page through a link (the header, and
 * this with it, stays mounted across client navigations), and a reload brings
 * it back.
 *
 * It belongs to the top of the page (2026-10-01, when the character learnt to
 * follow the scroll the way netfox.app's fox does): it stands under the bar
 * while the hero's row of buttons is in view, steps away once the row is
 * scrolled past -- the one in the corner of the window takes over
 * (`ScrollGuide`) -- and comes back standing and pointing, with no second
 * walk, when the reader scrolls back up to it. Where nothing can say where the
 * row is, it stays, as it did before.
 *
 * Everything is decided AFTER mount, so the served markup carries nothing. A
 * reader who asked for reduced motion gets it standing in place, no walk.
 */
export function PanelHint({ enabled, open, onOpen }: PanelHintProps) {
  const reduced = useReducedMotion();
  // Read when a timer runs out, not when the page mounts: the hook answers
  // `false` on the first render and the real value after it.
  const reducedNow = useRef(reduced);
  const [phase, setPhase] = useState<Phase>('hidden');
  // The phase as the timers and the observer see it: they run outside React's
  // render, where the state would be a stale closure.
  const phaseNow = useRef<Phase>('hidden');
  const move = useCallback((next: Phase) => {
    phaseNow.current = next;
    setPhase(next);
  }, []);
  const hint = useRef<HTMLDivElement>(null);
  const timers = useRef(new Set<number>());

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  const cancelTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  /**
   * The keyboard was on something of the hint's that is about to go: hand the
   * focus to the reading it was pointing at, rather than let it drop to the
   * page.
   */
  const handFocusBack = useCallback(() => {
    if (hint.current?.contains(document.activeElement)) {
      document
        .querySelector<HTMLElement>('[aria-controls="lancetta-panel-demo"]')
        ?.focus({ preventScroll: true });
    }
  }, []);

  /** Fades out where it stands; `hidden` once the fade has run. */
  const leave = useCallback(() => {
    if (phaseNow.current === 'hidden' || phaseNow.current === 'leaving') {
      return;
    }
    handFocusBack();
    move('leaving');
    later(
      () => {
        if (phaseNow.current === 'leaving') {
          move('hidden');
        }
      },
      reducedNow.current ? 0 : LEAVE_MS
    );
  }, [handFocusBack, later, move]);

  useEffect(() => {
    if (!enabled) {
      cancelTimers();
      move('hidden');
      return undefined;
    }
    const done = () => guideMemory.dismissed || guideMemory.panelOpened;
    if (done()) {
      return undefined;
    }
    // One walk per arrival on the home page; after it, coming back to the top
    // brings it back standing.
    let walked = false;
    const show = () => {
      if (done()) {
        return;
      }
      const now = phaseNow.current;
      if (now === 'leaving') {
        // Back before the fade had run: it stays.
        move('pointing');
        return;
      }
      if (now !== 'hidden') {
        return;
      }
      if (walked || reducedNow.current) {
        walked = true;
        move('pointing');
        return;
      }
      walked = true;
      move('walking');
      later(() => {
        if (phaseNow.current === 'walking') {
          move('pointing');
        }
      }, WALK_MS);
    };

    let observer: IntersectionObserver | undefined;
    later(() => {
      const row = document.querySelector(ANCHOR);
      // Where nothing can say where the row is, it comes and stays, as it did
      // before it learnt to step away.
      if (!row || typeof IntersectionObserver === 'undefined') {
        show();
        return;
      }
      // Its first answer says where the row is NOW: a page reloaded halfway
      // down does not get the hint until the reader scrolls back up to it.
      observer = new IntersectionObserver((entries) => {
        if (entries[entries.length - 1].isIntersecting) {
          show();
        } else {
          leave();
        }
      });
      observer.observe(row);
    }, DELAY_MS);
    return () => {
      observer?.disconnect();
      cancelTimers();
    };
  }, [enabled, cancelTimers, later, leave, move]);

  // Reduce Motion switched on mid-walk: land where the walk was going, now.
  useEffect(() => {
    reducedNow.current = reduced;
    if (reduced && phaseNow.current === 'walking') {
      move('pointing');
    }
  }, [reduced, move]);

  // The panel opened: the hint's job is done, here and for the rest of the
  // page's life.
  useEffect(() => {
    if (open) {
      markPanelOpened();
      leave();
    }
  }, [open, leave]);

  // Dismissed here or wherever else the character is (`guide.ts`).
  useEffect(() => onGuideDismissed(leave), [leave]);

  if (phase === 'hidden') {
    return null;
  }

  return (
    <div className={classes.lane}>
      <div
        ref={hint}
        className={classes.hint}
        data-phase={phase}
        // Fading out, it is out of reach: a Tab during the fade would land on
        // a hint about to unmount and drop the focus.
        inert={phase === 'leaving'}
      >
        <button
          type="button"
          className={classes.walker}
          aria-label="Open Lancetta’s panel"
          onClick={onOpen}
        >
          <Mascot
            walking={phase === 'walking'}
            pointing={phase === 'pointing'}
            stepA={classes.stepA}
            stepB={classes.stepB}
          />
        </button>
        {phase === 'pointing' && (
          <div className={classes.bubble}>
            <button type="button" className={classes.say} onClick={onOpen}>
              Click the reading up there — it opens the real panel.
            </button>
            <button
              type="button"
              className={classes.dismiss}
              aria-label="Dismiss"
              onClick={dismissGuide}
            >
              <IconX size={12} stroke={2.2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
