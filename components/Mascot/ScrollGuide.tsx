'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '@tabler/icons-react';
import { useReducedMotion } from '@mantine/hooks';
import {
  ANCHOR,
  DELAY_MS,
  dismissGuide,
  guideMemory,
  onGuideDismissed,
  onPanelOpened,
  openPanel,
  PANEL_OPENER_ATTRIBUTE,
  panelHintFits,
} from './guide';
import { Mascot } from './Mascot';
import classes from './ScrollGuide.module.css';

/** Where it is: nowhere, in the corner of the window, or on the Support card. */
type Place = 'none' | 'corner' | 'card';
type Phase = 'hidden' | 'arriving' | 'here' | 'leaving';

/** Matches `corner-in` in the stylesheet. */
export const CORNER_IN_MS = 900;
/** Matches `card-in`. */
export const CARD_IN_MS = 420;
/** Matches the fade on the way out. */
export const LEAVE_MS = 260;
/** The hop on arrival (`hop`), before it says anything. */
export const HOP_MS = 420;
/**
 * How long its own sentence stays open in the corner, on a phone. Under the
 * bar the hint stays, over nothing; in the corner it covers the page, so it
 * folds away and the character is left, for a tap to open the panel.
 */
export const HERO_FOLD_MS = 8000;
/** After the last scroll event, before its legs stop. */
export const STILL_MS = 160;
/**
 * How much of the Support card has to be on screen for it to go there. It
 * leaves once none of it is, so a card half in view does not send it back and
 * forth.
 */
export const CARD_RATIO = 0.3;

/** What it says on the Support card: the FAQ's own words, so no new claim. */
export const SPONSOR_LINE =
  'Lancetta is free. If you find it useful, consider sponsoring the project.';

/** What it says in the corner on a phone, where the one under the bar never comes. */
export const HERO_LINE = 'Tap the reading up there — it opens the real panel.';

/** What the page has said about where it belongs. */
interface Seen {
  /** A beat has passed since the page mounted. */
  ready: boolean;
  /** The hero's row of buttons has been on screen, or is above it. */
  reached: boolean;
  /** The row is on screen now. */
  rowVisible: boolean;
  /** The one under the bar has room to be seen (`panelHintFits`). */
  heroRoom: boolean;
  /** Enough of the Support card is on screen. */
  card: boolean;
}

/** Where it belongs, from what the page last said. */
function placeFor(page: Seen): Place {
  if (guideMemory.dismissed || !page.ready) {
    return 'none';
  }
  if (page.card) {
    return 'card';
  }
  if (!page.reached) {
    return 'none';
  }
  // At the top of the page, the one under the bar is pointing at the reading
  // -- until the panel has been opened, after which its job is done and this
  // one is the character on screen everywhere.
  if (page.rowVisible && page.heroRoom && !guideMemory.panelOpened) {
    return 'none';
  }
  return 'corner';
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The character that follows the reader down the home page, ported from
 * netfox.app's fox (`ScrollGuide` there, 2026-10-01; the user: *"molto carino
 * il fatto che su netfox la mascotte rimane sempre visibile e poi suggerisca
 * il 'support' nel footer"*). Past the hero it rides in the corner of the
 * window, walking while the page scrolls and standing when it stops; a click
 * on it opens the copy of the app's panel, which is what the one under the bar
 * points at. At the footer it goes to the Support card and suggests
 * sponsoring the project, in the FAQ's own words.
 *
 * One character at a time: never in the corner while the one under the bar
 * (`PanelHint`) is pointing at the reading, which it does while the hero's row
 * of buttons is in view, and never in the corner while it stands on the card.
 * Once the panel has been opened the one under the bar is done, so this one
 * comes to the corner even at the top of the page.
 *
 * On a phone the one under the bar never comes (its bubble covered the
 * headline), so this one says its sentence from the corner instead: once the
 * row is in view it walks in, hops, and opens it, a tap on it opening the
 * panel; it folds once the row is scrolled past, or after 8 s, because in
 * the corner it covers the page.
 *
 * Nothing it says on its own is announced: it moves with the scroll, and a
 * screen reader reading something else should not be interrupted by it.
 */
export function ScrollGuide() {
  const reduced = useReducedMotion();
  const reducedNow = useRef(reduced);
  const [at, setAt] = useState<Place>('none');
  const [phase, setPhase] = useState<Phase>('hidden');
  // Where it is and what it is doing, as the timers and observers see it.
  // Every change goes through `go`, which keeps the two together.
  const now = useRef<{ at: Place; phase: Phase }>({ at: 'none', phase: 'hidden' });
  const go = useCallback((nextAt: Place, nextPhase: Phase) => {
    now.current = { at: nextAt, phase: nextPhase };
    setAt(nextAt);
    setPhase(nextPhase);
  }, []);
  const [bubble, setBubbleState] = useState(false);
  const bubbleNow = useRef(false);
  const setBubble = useCallback((open: boolean) => {
    bubbleNow.current = open;
    setBubbleState(open);
  }, []);
  // Its sentence has been said from here, once.
  const told = useRef(false);
  const [moving, setMoving] = useState(false);
  const movingNow = useRef(false);
  // The Support card, once found: it is drawn into it there.
  const [card, setCard] = useState<HTMLElement | null>(null);
  // Its box, in whichever place it is.
  const box = useRef<HTMLDivElement>(null);
  // What the page says about where it belongs.
  const seen = useRef<Seen>({
    ready: false,
    reached: false,
    rowVisible: false,
    heroRoom: true,
    card: false,
  });
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
   * The keyboard was on it, and it is about to go: hand the focus to a
   * control on screen rather than let it drop, and without scrolling, so the
   * reader stays where they are. The last one before it on the page that is
   * in view; else any in view; else, with none in view, the last one before
   * it. It rides in the corner at any height of the page, so the control
   * before it in the markup is usually a screen or more away (Codex, round 1
   * of netfox.app's #83).
   */
  const handFocusBack = useCallback(() => {
    const el = box.current;
    if (!el?.contains(document.activeElement)) {
      return;
    }
    const others = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (other) => !el.contains(other) && other.getClientRects().length > 0
    );
    const before = others.filter(
      (other) => el.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_PRECEDING
    );
    const inView = (other: HTMLElement) => {
      const { top, bottom, left, right } = other.getBoundingClientRect();
      return bottom > 0 && top < window.innerHeight && right > 0 && left < window.innerWidth;
    };
    const target = before.filter(inView).at(-1) ?? others.find(inView) ?? before.at(-1);
    target?.focus({ preventScroll: true });
  }, []);

  /**
   * Once it stands in the corner with the row in view where the one under the
   * bar has no room, it says that one's sentence, once, after its hop.
   */
  const arrived = useCallback(
    (place: Place) => {
      if (place !== 'corner' || told.current) {
        return;
      }
      const open = () => {
        const page = seen.current;
        if (
          now.current.at === 'corner' &&
          now.current.phase === 'here' &&
          page.rowVisible &&
          !page.heroRoom &&
          !guideMemory.panelOpened &&
          !bubbleNow.current &&
          !told.current
        ) {
          told.current = true;
          setBubble(true);
          later(() => setBubble(false), HERO_FOLD_MS);
        }
      };
      if (reducedNow.current) {
        open();
      } else {
        later(open, HOP_MS);
      }
    },
    [later, setBubble]
  );

  /** Moves it to where it belongs: out of where it is first, then in. */
  const sync = useCallback(
    function syncPlace() {
      const want = placeFor(seen.current);
      const { at: here, phase: doing } = now.current;
      if (doing === 'leaving' || here === want) {
        return;
      }
      if (here !== 'none') {
        handFocusBack();
        cancelTimers();
        movingNow.current = false;
        setMoving(false);
        setBubble(false);
        go(here, 'leaving');
        later(
          () => {
            go('none', 'hidden');
            syncPlace();
          },
          reducedNow.current ? 0 : LEAVE_MS
        );
        return;
      }
      if (reducedNow.current) {
        go(want, 'here');
        arrived(want);
        return;
      }
      go(want, 'arriving');
      later(
        () => {
          if (now.current.at === want && now.current.phase === 'arriving') {
            go(want, 'here');
            arrived(want);
          }
        },
        want === 'corner' ? CORNER_IN_MS : CARD_IN_MS
      );
    },
    [arrived, cancelTimers, go, handFocusBack, later, setBubble]
  );

  // Ready when the one under the bar would set out, so neither is first.
  useEffect(() => {
    const id = window.setTimeout(() => {
      seen.current.ready = true;
      seen.current.heroRoom = panelHintFits();
      sync();
    }, DELAY_MS);
    return () => {
      window.clearTimeout(id);
      cancelTimers();
    };
  }, [sync, cancelTimers]);

  // The hero's row of buttons: whether the reader has reached it, and whether
  // it is on screen.
  useEffect(() => {
    const row = document.querySelector(ANCHOR);
    const page = seen.current;
    // Where nothing can say where the row is, the one under the bar stays
    // (`PanelHint` has its own way in) and this one never comes to the corner.
    if (!row || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      page.rowVisible = entry.isIntersecting;
      // Above the window counts: a page reloaded halfway down has passed it.
      page.reached = entry.isIntersecting || entry.boundingClientRect.bottom <= 0;
      if (!entry.isIntersecting) {
        setBubble(false);
      }
      sync();
    });
    observer.observe(row);
    const resized = () => {
      page.heroRoom = panelHintFits();
      sync();
    };
    window.addEventListener('resize', resized);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resized);
    };
  }, [sync, setBubble]);

  // The footer's Support card.
  useEffect(() => {
    const el = document.getElementById('sponsors');
    if (!el || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    setCard(el);
    const page = seen.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        const was = page.card;
        if (entry.isIntersecting && entry.intersectionRatio >= CARD_RATIO) {
          page.card = true;
        } else if (!entry.isIntersecting) {
          page.card = false;
        }
        if (page.card !== was) {
          sync();
        }
      },
      { threshold: [0, CARD_RATIO] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  // Its legs go while the page scrolls. One listener, passive; the state
  // changes only when it starts and when it stops.
  useEffect(() => {
    let still: number | undefined;
    const scrolled = () => {
      if (now.current.at !== 'corner' || now.current.phase !== 'here' || reducedNow.current) {
        return;
      }
      if (!movingNow.current) {
        movingNow.current = true;
        setMoving(true);
      }
      window.clearTimeout(still);
      still = window.setTimeout(() => {
        movingNow.current = false;
        setMoving(false);
      }, STILL_MS);
    };
    window.addEventListener('scroll', scrolled, { passive: true });
    return () => {
      window.clearTimeout(still);
      window.removeEventListener('scroll', scrolled);
    };
  }, []);

  // Dismissed here, or under the bar: it goes from everywhere.
  useEffect(() => onGuideDismissed(sync), [sync]);

  // The panel opened, by any means: its sentence has nothing left to say, and
  // the one under the bar is done, so this one may be wanted at the top.
  useEffect(
    () =>
      onPanelOpened(() => {
        setBubble(false);
        sync();
      }),
    [sync, setBubble]
  );

  // Reduce Motion switched on mid-way: arrive now, and stand still.
  useEffect(() => {
    reducedNow.current = reduced;
    if (!reduced) {
      return;
    }
    movingNow.current = false;
    setMoving(false);
    if (now.current.phase === 'arriving') {
      cancelTimers();
      go(now.current.at, 'here');
      arrived(now.current.at);
    }
  }, [reduced, arrived, cancelTimers, go]);

  /** A click on it: lands it if it is on its way in, then opens the panel. */
  const fromFigure = () => {
    const { at: here, phase: doing } = now.current;
    if (here !== 'corner' || doing === 'leaving' || doing === 'hidden') {
      return;
    }
    if (doing === 'arriving') {
      cancelTimers();
      go('corner', 'here');
    }
    openPanel();
  };

  const dismiss = (
    <button type="button" className={classes.dismiss} aria-label="Dismiss" onClick={dismissGuide}>
      <IconX size={12} stroke={2.2} />
    </button>
  );

  const inCorner = at === 'corner' && (
    <div
      ref={box}
      className={classes.corner}
      data-phase={phase}
      data-moving={moving ? '' : undefined}
      {...{ [PANEL_OPENER_ATTRIBUTE]: '' }}
      inert={phase === 'leaving'}
    >
      <button
        type="button"
        className={classes.walker}
        aria-label="Open Lancetta’s panel"
        onClick={fromFigure}
      >
        <Mascot
          walking={phase === 'arriving' || moving}
          pointing={bubble}
          className={classes.sprite}
          stepA={classes.stepA}
          stepB={classes.stepB}
        />
      </button>
      {bubble && phase === 'here' && (
        <div className={classes.cornerBubble}>
          <button type="button" className={classes.say} onClick={openPanel}>
            {HERO_LINE}
          </button>
          {dismiss}
        </div>
      )}
    </div>
  );

  const onCard =
    at === 'card' &&
    card &&
    createPortal(
      <div ref={box} className={classes.card} data-phase={phase} inert={phase === 'leaving'}>
        <span className={classes.sitter}>
          <Mascot pointing className={classes.sprite} />
        </span>
        <div className={classes.cardBubble}>
          <p className={classes.cardLine}>{SPONSOR_LINE}</p>
          {dismiss}
        </div>
      </div>,
      card
    );

  return (
    <>
      {inCorner}
      {onCard}
    </>
  );
}
