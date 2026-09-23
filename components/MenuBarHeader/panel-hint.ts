/**
 * The character that walks in under the bar and points at the reading, and
 * the one fact it needs to remember: whether this browser has ever opened the
 * panel. Once it has, the hint has done its job and never comes back (user,
 * 2026-09-23).
 *
 * localStorage rather than a cookie: nothing on a server needs to know, and a
 * cookie would ride along on every request for nothing. It can also be
 * missing or throw — a private window, storage switched off — and then the
 * answer is "not opened yet", so the worst case is a hint shown again, never a
 * page that breaks.
 */

export const OPENED_KEY = 'lancetta.panelDemo.opened';

type Store = Pick<Storage, 'getItem' | 'setItem'>;

function local(): Store | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function hasOpenedPanel(store: Store | undefined = local()): boolean {
  try {
    return store?.getItem(OPENED_KEY) === '1';
  } catch {
    return false;
  }
}

export function rememberPanelOpened(store: Store | undefined = local()): void {
  try {
    store?.setItem(OPENED_KEY, '1');
  } catch {
    // Nowhere to remember it: the hint will simply come back next time.
  }
}

/**
 * The character is the app icon come alive: the icon's navy plate as a body,
 * its three bars on the belly in their own colours (`public/favicon.svg`, the
 * flat variant, measured off the master), two eyes above them, two legs, and
 * one arm that rises to point — tipped in the violet of the third bar, a
 * clock hand, which is what "lancetta" means. Drawn for this site, so it is
 * ours to use: the first sketch borrowed Claude Code's mascot, and a vendor's
 * character inviting clicks on this app reads as an endorsement it never gave
 * (user, 2026-09-23).
 *
 * In square cells, 17 wide and 13 tall, standing (`#` plate, `e` eye, `p`
 * pupil, `o` `t` `v` the three bars). This grid is GENERATED from the
 * rectangles in `PanelHint.tsx`, not drawn beside them; redraw it the same way
 * if the sprite changes:
 *
 *     ....##########...
 *     ...############..
 *     ...##ee####ee##..
 *     ...##pe####pe##..
 *     ...############..
 *     ...#####tt#####..
 *     ..######tt#vv###.
 *     ...##oo#tt#vv##..
 *     ...##oo#tt#vv##..
 *     ...##oo#tt#vv##..
 *     ....##########...
 *     .....##....##....
 *     .....##....##....
 *
 * Walking, the legs alternate; pointing, the left arm climbs two steps up and
 * out from the shoulder to a violet tip, and the pupils look up at the bar.
 */
export const MASCOT = {
  plate: '#08306F',
  ink: '#070E24',
  eye: '#FFFFFF',
  orange: '#FB8E00',
  teal: '#08F5C3',
  violet: '#9253F9',
} as const;
