import { useSyncExternalStore } from 'react';

/**
 * What the menu-bar item in the header is currently showing.
 *
 * The header renders as a sibling of the page content (Nextra's Layout puts
 * its `navbar` slot beside `children`, not around it), so a React context
 * cannot reach from the hero down to the bar. This is the smallest thing that
 * can: a module-level value plus `useSyncExternalStore`, which is also what
 * keeps the bar from re-rendering the whole tree on every scroll frame.
 *
 * The hero writes it as the reader scrolls; the bar reads it. Nothing else
 * should write it — a second writer and the bar starts flickering between
 * two stories.
 */

/**
 * One agent's turn in the bar. The app's `BarCell`: the mark, the percent of
 * the 5-hour window and when it resets. The bar holds one per agent and shows
 * them in turn — see `MenuBarReading.tsx`.
 */
export interface AgentReading {
  /** Which agent this cell is quoting. Decides the mark and the tint. */
  agent: 'claude' | 'codex';
  /** Percent of the 5-hour window used, as the app draws it. */
  percent: number;
  /** How long until that window resets, already formatted. */
  resets: string;
}

export interface MenuBarReadingState {
  /**
   * One cell per agent, in the order the app puts them in the bar. A single
   * cell is a bar with nothing to rotate, which is a state the app has too
   * (one agent configured) and which the rotator handles by standing still.
   */
  cells: AgentReading[];
  /** True while the hero is showing the menu open under the bar. */
  open: boolean;
}

/**
 * What the bar shows before the hero has said anything, and on every page that
 * is not the home page. It matches the hero's first frame, which matches the
 * menu screenshot in it: the server and the first client paint have to agree,
 * so this is the value both render.
 */
export const initialReading: MenuBarReadingState = {
  cells: [
    { agent: 'claude', percent: 20, resets: '1h44m' },
    { agent: 'codex', percent: 5, resets: '3h23m' },
  ],
  open: false,
};

let state: MenuBarReadingState = initialReading;
const listeners = new Set<() => void>();

function sameCells(a: AgentReading[], b: AgentReading[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (cell, i) =>
        cell.agent === b[i].agent && cell.percent === b[i].percent && cell.resets === b[i].resets
    )
  );
}

export function setMenuBarReading(next: Partial<MenuBarReadingState>): void {
  const merged = { ...state, ...next };
  // Same story, same object: a new identity every scroll frame would tear
  // `useSyncExternalStore` out of its own memoisation and re-render the bar
  // sixty times a second for nothing.
  if (merged.open === state.open && sameCells(merged.cells, state.cells)) {
    return;
  }
  state = merged;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMenuBarReading(): MenuBarReadingState {
  // The server snapshot is the initial one: the bar has to render the same
  // reading on the server as on the first client paint, or React replaces it.
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initialReading
  );
}

/** Test helper: puts the store back where it started between cases. */
export function resetMenuBarReading(): void {
  state = initialReading;
  listeners.forEach((listener) => listener());
}
