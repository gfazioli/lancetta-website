'use client';

import { createTheme } from '@mantine/core';

/**
 * Lancetta's colours are the APP ICON's colours, sampled rather than picked.
 *
 * The icon (the 1254px master of 2026-09-18) is three rounded bars on a plate
 * lit like neon: azure along the top edge, a near-black navy core behind the
 * bars, deep violet at the bottom-right, and a rim that runs cyan at the
 * top-left through violet to magenta at the bottom-right. Sampled off the
 * master with a CoreGraphics probe reading the bitmap top-down — the first
 * pass read it bottom-up and had every bar upside down, which is why each
 * value below names where on the icon it came from:
 *
 *   orange  #FCBE34 (top) —> #FC7524 —> #F23328 (foot)
 *   teal    #84F9D7 (top) —> #0ED5D4 —> #0292F1 (foot)
 *   violet  #CC84FA (top) —> #9248FA —> #672AFA (foot)
 *   plate   #0546BF (top edge) - #070E24 (core, between the bars) - #1C0F50 (bottom-right)
 *   rim     #13D1FB (top-left) - #683DFB (top-right) - #B117C5 (bottom-right)
 *
 * Two of the three bar hues are already SPOKEN FOR inside the app: teal is
 * Codex (`CodexSource.tintHex = 0x2FBFA8`) and orange is Claude
 * (`ClaudeSource.tintHex = 0xE8833A`). Colour there means *which agent*, so
 * the site keeps them for exactly that and takes its brand accent from the
 * third bar — the one the app spends on no agent.
 *
 * THE SITE IS LIGHT-ONLY (2026-09-19). There is no scheme switch and no dark
 * ladder any more: the icon is a dark object, and the page around it is the
 * light it is lit by. What used to be the `dark` ladder is gone; the greys
 * below are a LIGHT ladder cut on the plate's own hue, so a dimmed line on
 * this page is the plate's navy diluted rather than a neutral grey, which
 * beside this icon reads as a different product.
 *
 * The page-level tokens cut from the plate and the rim (`--lan-plate`,
 * `--lan-azure`, `--lan-cyan`, `--lan-magenta`, ...) live in
 * `theme/global.css`.
 */

/** The agent tints, copied from the app's own sources so the two never drift. */
export const AGENT_TINT = {
  codex: '#2FBFA8',
  claude: '#E8833A',
  /** What a source with no reading renders as — grey, never a colour. */
  unknown: '#8E8E93',
} as const;

/** The three bar gradients in the icon, top to foot, sampled off the master. */
export const ICON_BARS = {
  claude: ['#FCBE34', '#F23328'],
  codex: ['#84F9D7', '#0292F1'],
  third: ['#CC84FA', '#672AFA'],
} as const;

/** The plate and its rim: the ground the mark sits on, and the light on it. */
export const ICON_PLATE = {
  /** Between the bars — the darkest point on the plate. */
  core: '#070E24',
  /** The azure along the top edge. */
  top: '#0546BF',
  /** The violet at the bottom-right. */
  edge: '#1C0F50',
  rimStart: '#13D1FB',
  rimMid: '#683DFB',
  rimEnd: '#B117C5',
} as const;

export const theme = createTheme({
  primaryColor: 'lancetta',
  /**
   * Not `#000`: the page's ink is the plate's navy at text weight, so a
   * heading and the icon beside it belong to one family. 16.2:1 on the body.
   */
  black: '#141B33',
  white: '#FFFFFF',
  colors: {
    /**
     * THE ICON'S THIRD BAR, laddered — not eyeballed.
     *
     * The bar runs `#9248FA` to `#672AFA`; its midpoint sits at OKLCH hue
     * 291 degrees, and the ladder steps that hue down a lightness scale with
     * the chroma tapering at the pale end, so the tints stay violet instead
     * of going to pastel mud. Shade 6 is `#824BFC`: white on it measures
     * 4.82:1 and it measures 4.57:1 on the body, both of which clear AA for
     * normal text. Shade 7 (`#7132E5`, 6.06:1) is the accent where the
     * accent is TYPE rather than a fill.
     */
    lancetta: [
      '#F6F5FF',
      '#ECE8FF',
      '#DCD3FF',
      '#C8B8FF',
      '#B096FF',
      '#9872FF',
      '#824BFC',
      '#7132E5',
      '#5F1AC9',
      '#4D09A7',
    ],
    /**
     * THE PLATE'S NAVY, diluted into a LIGHT grey ladder.
     *
     * Cut on the plate's hue with the chroma held low, so it reads as cool
     * depth rather than as blue. Contrast, measured against the `#FAF8FF`
     * body: gray-6 (Mantine's dimmed in a light scheme) 4.55:1, gray-7
     * 5.9:1, gray-8 9.2:1. The default Mantine gray-6 lands at 4.0:1 here,
     * which is why this ladder exists at all: every dimmed line on the page
     * reads that token.
     */
    gray: [
      '#F7F7FC',
      '#EFEFF7',
      '#E1E3F0',
      '#CDD0E3',
      '#AFB4CD',
      '#8B91B1',
      '#6A7191',
      '#525978',
      '#3A415C',
      '#262C42',
    ],
  },
  headings: {
    fontWeight: '600',
  },
  defaultRadius: 'md',
});
