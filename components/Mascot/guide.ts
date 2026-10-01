/**
 * After the bar has arrived (`bar-arrive` is 620ms), and a beat more: when the
 * one under the bar sets out (`PanelHint`), and when the one in the corner is
 * ready (`ScrollGuide`), so neither is first.
 */
export const DELAY_MS = 1200;

/**
 * The hero's row of buttons, which says whether the reader is still at the top
 * of the page. Marked in `HeroStage`; `PanelHint` and `ScrollGuide` watch it.
 */
export const ANCHOR = '[data-guide-anchor]';

/**
 * Whether the one under the bar has room to be seen: `PanelHint.module.css`
 * hides it at `$mantine-breakpoint-xs` (36em) and below, where its bubble
 * covered the headline. Both ask this one question, so the two never both
 * come, or both stay away.
 *
 * These three live here rather than in `PanelHint.tsx` for the stylesheets'
 * sake: the home page importing that file pulled `PanelHint.module.css` into
 * the page's own CSS order as well as the layout's, and Turbopack split the
 * site's shared stylesheet to satisfy both -- one more render-blocking request
 * on every page, docs included (measured: 4 stylesheets on main, 5 with the
 * import, 4 without it).
 */
export function panelHintFits() {
  return typeof window === 'undefined' || !window.matchMedia?.('(max-width: 36em)').matches;
}

/**
 * What the character remembers, for the life of the page. It is one character
 * in three places -- under the bar, pointing at the reading (`PanelHint`), in
 * the corner of the window as the home page scrolls, and on the footer's
 * Support card (both `ScrollGuide`) -- so sending it away from one sends it
 * away from all three. Ported from netfox.app's fox (`guide.ts` there).
 *
 * Module state survives a client navigation and is gone on a reload: once
 * dismissed it does not come back when the reader returns to the home page
 * through a link, and a reload brings it back (user, 2026-09-24: "facciamolo
 * apparire sempre ad ogni reload della pagina").
 */
export const guideMemory = {
  dismissed: false,
  /**
   * The panel has been opened at least once, by any means: the job of the one
   * under the bar is done, and from then on the one in the corner is the
   * character on screen, at the top of the page too.
   */
  panelOpened: false,
};

const dismissedListeners = new Set<() => void>();
const openedListeners = new Set<() => void>();

/** Sends the character away from every place it is, for the rest of the page's life. */
export function dismissGuide() {
  guideMemory.dismissed = true;
  dismissedListeners.forEach((listener) => listener());
}

/** Called when the character is dismissed anywhere. Returns the unsubscribe. */
export function onGuideDismissed(listener: () => void) {
  dismissedListeners.add(listener);
  return () => {
    dismissedListeners.delete(listener);
  };
}

/** The panel has opened: said once, the first time. */
export function markPanelOpened() {
  if (guideMemory.panelOpened) {
    return;
  }
  guideMemory.panelOpened = true;
  openedListeners.forEach((listener) => listener());
}

/** Called the first time the panel opens. Returns the unsubscribe. */
export function onPanelOpened(listener: () => void) {
  openedListeners.add(listener);
  return () => {
    openedListeners.delete(listener);
  };
}

/**
 * How the corner asks the header to open the panel. The open state is the
 * header's (`MenuBarHeader`), which is on every page and registers the one
 * opener; the character in the corner is the home page's and only asks.
 */
let opener: (() => void) | null = null;

export function registerPanelOpener(open: () => void) {
  opener = open;
  return () => {
    if (opener === open) {
      opener = null;
    }
  };
}

export function openPanel() {
  opener?.();
}

/**
 * Marks what opens the panel from outside the header, so the header's
 * outside-click close lets it be: a click on the character in the corner is
 * outside the panel, and closing on its `pointerdown` only to open again on
 * its `click` would drop the panel and draw it afresh.
 */
export const PANEL_OPENER_ATTRIBUTE = 'data-panel-opener';
