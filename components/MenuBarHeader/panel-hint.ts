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
