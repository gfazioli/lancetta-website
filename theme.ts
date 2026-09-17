'use client';

import { createTheme } from '@mantine/core';

/**
 * Lancetta's colours are the APP ICON's colours, sampled rather than picked.
 *
 * The icon is three rounded bars on a near-black navy plate with a blue→violet
 * rim. The bars were measured off the 1254px master (a common baseline at
 * y=907; widths 213 / 229 / 216 px) and their fills read:
 *
 *   orange  #FFCB60 → #F05F3C
 *   teal    #86F3D9 → #00A6D2
 *   violet  #CE9AFD → #7350F9
 *
 * Two of those three hues are already SPOKEN FOR inside the app: teal is
 * Codex (`CodexSource.tintHex = 0x2FBFA8`) and orange is Claude
 * (`ClaudeSource.tintHex = 0xE8833A`). Colour there means *which agent*, so
 * the site keeps them for exactly that and takes its brand accent from the
 * third bar — the one the app spends on no agent. A site accent borrowed from
 * an agent hue would disagree with every screenshot on the page.
 */

/** The agent tints, copied from the app's own sources so the two never drift. */
export const AGENT_TINT = {
  codex: '#2FBFA8',
  claude: '#E8833A',
  /** What a source with no reading renders as — grey, never a colour. */
  unknown: '#8E8E93',
} as const;

/** The three bar gradients in the icon, top → bottom, sampled off the master. */
export const ICON_BARS = {
  claude: ['#FFCB60', '#F05F3C'],
  codex: ['#86F3D9', '#00A6D2'],
  third: ['#CE9AFD', '#7350F9'],
} as const;

/** The plate and its rim: the ground the mark sits on. */
export const ICON_PLATE = {
  /** Between the bars — the darkest point on the plate. */
  core: '#0A1524',
  /** The blue wash at the top-left corner. */
  wash: '#1B3E70',
  rimStart: '#4FC3FD',
  rimEnd: '#7351EA',
} as const;

export const theme = createTheme({
  primaryColor: 'lancetta',
  colors: {
    /**
     * THE ICON'S THIRD BAR, laddered — not eyeballed.
     *
     * `#7350F9` is the violet the bar ends on. Converted to OKLCH
     * (h = 288.3°) and stepped down a lightness ladder with the chroma
     * tapering at the pale end, so the tints stay violet instead of going
     * to pastel mud. Shade 6 is `#7A5BEA`: white on it measures 4.65:1,
     * which clears AA for normal text — Mantine's own blue-6 is 3.1:1 and
     * findergit-6 is 3.7:1, so the button label here is the readable one.
     * Shade 4 (`#9E8FFC`, 7.0:1 on dark-9) is the dark-scheme accent.
     */
    lancetta: [
      '#F4F3FF',
      '#E6E4FF',
      '#CEC9FF',
      '#B4ABFF',
      '#9E8FFC',
      '#8D78F5',
      '#7A5BEA',
      '#6B49D6',
      '#5C3BBD',
      '#4C319D',
    ],
  },
  headings: {
    fontWeight: '600',
  },
  defaultRadius: 'md',
});
