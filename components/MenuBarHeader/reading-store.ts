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
export interface MenuBarReadingState {
  /** Which agent the bar is quoting. Decides the mark and the tint. */
  agent: 'claude' | 'codex';
  /** Percent of the 5-hour window used, as the app draws it. */
  percent: number;
  /** How long until that window resets, already formatted. */
  resets: string;
  /** True while the hero is showing the menu open under the bar. */
  open: boolean;
}

export const initialReading: MenuBarReadingState = {
  agent: 'claude',
  percent: 9,
  resets: '4h03m',
  open: false,
};

let state: MenuBarReadingState = initialReading;
const listeners = new Set<() => void>();

export function setMenuBarReading(next: Partial<MenuBarReadingState>): void {
  const merged = { ...state, ...next };
  // Same story, same object: a new identity every scroll frame would tear
  // `useSyncExternalStore` out of its own memoisation and re-render the bar
  // sixty times a second for nothing.
  if (
    merged.agent === state.agent &&
    merged.percent === state.percent &&
    merged.resets === state.resets &&
    merged.open === state.open
  ) {
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
