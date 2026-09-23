/**
 * What the menu-bar item in the header shows, and the lamp's bands.
 *
 * It used to be a store the hero wrote to as the reader scrolled, so the bar at
 * the top of the page always quoted the picture underneath it. That was the
 * intent and it read as a defect (user, 2026-09-22: *"controlla che cambia solo
 * con il timer e non con lo scroll, che al momento sembra cambiare anche quando
 * si scrolla il sito web in basso"*) — three different readings went past on one
 * pass down the home page, and a number in a header that moves while you are
 * reading something else looks broken rather than live.
 *
 * So the reading is a CONSTANT now, and the only thing that moves in the header
 * is whose turn it is. That is also the truer picture of the app: the item
 * repaints when a poll lands and rotates on its own timer, and neither has
 * anything to do with what the person is looking at.
 */

/**
 * One agent's turn in the bar. The app's `BarCell`: the mark, the lamp, the
 * percent of the 5-hour window and when it resets. The bar holds one per agent
 * and shows them in turn — see `MenuBarReading.tsx`.
 */
export interface AgentReading {
  /** Which agent this cell is quoting. Decides the mark and the tint. */
  agent: 'claude' | 'codex';
  /** Percent of the 5-hour window USED, as the app draws it — and what the lamp reads. */
  percent: number;
  /** How long until that window resets, already formatted. */
  resets: string;
}

/**
 * The lamp's four bands, mirroring `BarLED.of` in `LancettaCore`.
 *
 * They TILE the range on purpose: a gap between two of them is not a missing
 * colour, it is the lamp holding the previous one across a boundary. Written as
 * a descending ladder with no branch that can fall through, and pinned by
 * `reading.test.ts` at both sides of every edge — this is a second copy of a
 * decision that lives in Swift, and a second copy drifts unless something
 * compares it.
 */
export type LedBand = 'calm' | 'warm' | 'hot' | 'dead';

export function ledBand(percent: number): LedBand {
  if (percent >= 99) {
    return 'dead';
  }
  if (percent > 80) {
    return 'hot';
  }
  if (percent > 50) {
    return 'warm';
  }
  return 'calm';
}

/**
 * The reading the header quotes, for both agents, because the bar shows them in
 * turn. It is read OFF the menu screenshot in the hero, so the thing at the top
 * of the page and the picture under it tell one story.
 *
 * ILLUSTRATION, not a claim: one developer's numbers on one afternoon. Every
 * figure the prose states comes from the measurement table in CLAUDE.md instead.
 */
export const barReading: AgentReading[] = [
  { agent: 'claude', percent: 10, resets: '47m' },
  { agent: 'codex', percent: 0, resets: '4h59m' },
];
