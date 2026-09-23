'use client';

import { useEffect, useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { useReducedMotion } from '@mantine/hooks';
import { hasOpenedPanel, MASCOT } from './panel-hint';
import classes from './PanelHint.module.css';

type Phase = 'hidden' | 'walking' | 'pointing' | 'leaving';

/** After the bar has arrived (`bar-arrive` is 620ms), and a beat more. */
const DELAY_MS = 1200;
/** Matches `walk-in` in the stylesheet. */
const WALK_MS = 2400;
/** Matches the fade on `.hint`. */
const LEAVE_MS = 260;

interface PanelHintProps {
  /** Only where it makes sense to arrive: the home page. */
  enabled: boolean;
  /** Whether the panel is open. The moment it is, the hint's job is done. */
  open: boolean;
  onOpen: () => void;
  onDismiss: () => void;
}

/**
 * The reading in the bar opens a copy of the app's panel, and nothing on the
 * page says so. This says so: the app icon, walking — see `MASCOT` for how it
 * is drawn and why it is ours — comes in under the bar from the right, stops
 * beside the reading, raises an arm at it and says what it does. The user's idea (2026-09-23), and its one rule is theirs too: once
 * this browser has opened the panel, it never comes back.
 *
 * Everything is decided AFTER mount, from localStorage, so a returning reader
 * never sees a frame of it and the served markup carries nothing. A reader who
 * asked for reduced motion gets it standing in place, no walk.
 */
export function PanelHint({ enabled, open, onOpen, onDismiss }: PanelHintProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('hidden');

  useEffect(() => {
    if (!enabled) {
      setPhase('hidden');
      return undefined;
    }
    if (hasOpenedPanel()) {
      return undefined;
    }
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        if (hasOpenedPanel()) {
          return;
        }
        if (reduced) {
          setPhase('pointing');
          return;
        }
        setPhase('walking');
        timers.push(
          window.setTimeout(
            () => setPhase((now) => (now === 'walking' ? 'pointing' : now)),
            WALK_MS
          )
        );
      }, DELAY_MS)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [enabled, reduced]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    setPhase((now) => (now === 'hidden' ? now : 'leaving'));
    const gone = window.setTimeout(() => setPhase('hidden'), LEAVE_MS);
    return () => window.clearTimeout(gone);
  }, [open]);

  if (phase === 'hidden') {
    return null;
  }

  const dismiss = () => {
    onDismiss();
    setPhase('leaving');
    window.setTimeout(() => setPhase('hidden'), LEAVE_MS);
  };

  return (
    <div className={classes.lane}>
      <div className={classes.hint} data-phase={phase}>
        <button
          type="button"
          className={classes.walker}
          aria-label="Open Lancetta’s panel"
          onClick={onOpen}
        >
          <Mascot walking={phase === 'walking'} pointing={phase === 'pointing'} />
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
              onClick={dismiss}
            >
              <IconX size={12} stroke={2.2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The sprite, in square cells (see `panel-hint.ts`). It walks LEFT, so its
 * pupils sit in the left half of each eye, and the arm that points is the
 * left one: a diagonal up from the shoulder, tipped like a clock hand.
 */
function Mascot({ walking, pointing }: { walking: boolean; pointing: boolean }) {
  // Looking where it walks; looking up at the bar once it points.
  const pupilY = pointing ? 2 : 3;
  return (
    <svg
      viewBox="0 0 17 13"
      width={51}
      height={39}
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      <g fill={MASCOT.plate}>
        <rect x={4} y={0} width={10} height={11} />
        <rect x={3} y={1} width={12} height={9} />
        <rect x={2} y={6} width={1} height={1} />
        <rect x={15} y={6} width={1} height={1} />
        {/*
          The pointing arm is a STAIRCASE, each step sharing an edge with the
          last: a diagonal of single cells touches only at corners, and at
          three pixels a cell that reads as a row of dots, not as an arm.
        */}
        {pointing && (
          <>
            <rect x={2} y={5} width={1} height={1} />
            <rect x={1} y={4} width={1} height={2} />
            <rect x={0} y={4} width={1} height={1} />
          </>
        )}
        {walking ? (
          <>
            <g className={classes.stepA}>
              <Legs down={[5]} up={[11]} />
            </g>
            <g className={classes.stepB}>
              <Legs down={[11]} up={[5]} />
            </g>
          </>
        ) : (
          <Legs down={[5, 11]} up={[]} />
        )}
      </g>
      {pointing && <rect x={0} y={3} width={1} height={1} fill={MASCOT.violet} />}
      <g fill={MASCOT.eye}>
        <rect x={5} y={2} width={2} height={2} />
        <rect x={11} y={2} width={2} height={2} />
      </g>
      <g fill={MASCOT.ink}>
        <rect x={5} y={pupilY} width={1} height={1} />
        <rect x={11} y={pupilY} width={1} height={1} />
      </g>
      <rect x={5} y={7} width={2} height={3} fill={MASCOT.orange} />
      <rect x={8} y={5} width={2} height={5} fill={MASCOT.teal} />
      <rect x={11} y={6} width={2} height={4} fill={MASCOT.violet} />
    </svg>
  );
}

/** A leg on the ground is two cells tall; a lifted one is one, off the ground. */
function Legs({ down, up }: { down: number[]; up: number[] }) {
  return (
    <>
      {down.map((x) => (
        <rect key={`d${x}`} x={x} y={11} width={2} height={2} />
      ))}
      {up.map((x) => (
        <rect key={`u${x}`} x={x} y={11} width={2} height={1} />
      ))}
    </>
  );
}
