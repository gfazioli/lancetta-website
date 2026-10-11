import type { ComponentProps } from 'react';
import { ImageZoom } from 'nextra/components';

export type DocsImageProps = ComponentProps<typeof ImageZoom>;

/**
 * The docs column of the Nextra 4.6.1 layout, measured from 700 to 2000 px
 * wide on the four app sites, with the browser's default font at 16 and at
 * 20px (2026-10-11). Nextra lays it out in rem, so it moves with the visitor's
 * font: the viewport less 2rem on a phone; less 22rem once the sidebar shows,
 * at 48em; less 38rem once the table of contents shows too, at 80em; and never
 * wider than 52rem. At 16px that is 32, 352 and 608 px, and 832 at most; at
 * 20px, 40, 440, 760 and 1040.
 *
 * In px, the first version under-asked for a visitor with a larger font: at
 * 20px and 900 px wide the column is 860, still the phone's, and a px `sizes`
 * said 548 (found in review). Each stretch ends where the layout switches,
 * with range syntax (`width < 48em`), which excludes the breakpoint itself, so
 * no viewport, however fractional, falls between two. Chrome and Safari read
 * it in `sizes` (measured); a browser that does not skips those clauses and
 * takes `52rem`: more bytes, never a rendering too small.
 */
const STRETCHES: { below?: string; column: string }[] = [
  { below: '48em', column: 'calc(100vw - 2rem)' },
  { below: '80em', column: 'calc(100vw - 22rem)' },
  { below: '90em', column: 'calc(100vw - 38rem)' },
  { column: '52rem' },
];

/**
 * `sizes` for a picture drawn at the column's width, or at `width` CSS px when
 * the column is wider: `min()` of the two in each stretch. Chrome and Safari
 * take `min()` in `sizes` (measured); a browser that does not falls back to
 * `100vw`, which fetches more, never a rendering too small.
 */
export function docsSizes(width?: number): string {
  return STRETCHES.map(({ below, column }) => {
    const size = width === undefined ? column : `min(${column}, ${width}px)`;
    return below ? `(width < ${below}) ${size}` : size;
  }).join(', ');
}

/**
 * How wide a capture is in POINTS, which is the size it is drawn at.
 *
 * Every `public/screenshot-*.png` is a Retina capture, two pixels per point,
 * and a docs page used to draw each one a CSS pixel per file pixel: twice the
 * size of the thing it shows, and upscaled 2x on the Retina screens it was
 * taken for. At 1440 the panel (760x1478) stood 1478 CSS px tall, a screen
 * and a half, visibly soft (measured 2026-10-11). Halved, it is the size the
 * panel is on the Mac and sharp; the window shots (2400 px, 1200 pt) are wider
 * than the column either way and do not move.
 *
 * Only a static import knows its size, and only the captures follow the 2x
 * rule: anything else is drawn as it was.
 */
function pointWidth(src: DocsImageProps['src']): number | undefined {
  if (typeof src !== 'object') {
    return undefined;
  }
  const image = 'default' in src ? src.default : src;
  return image.src.includes('/screenshot-') ? Math.round(image.width / 2) : undefined;
}

/**
 * A docs image: Nextra's own zoomable image, told how wide it is drawn.
 *
 * Without `sizes` the browser cannot know the column is narrower than the
 * file, and every picture on /docs/the-window came as the 3840w rendering, on
 * a phone and a laptop alike: 262 KB for its five screenshots (2026-09-29).
 * `docsSizes` follows the column as it was measured, and a capture narrower
 * than the column says its own width.
 */
export function DocsImage(props: DocsImageProps) {
  const points = pointWidth(props.src);

  return (
    <ImageZoom
      sizes={docsSizes(points)}
      {...props}
      style={points ? { maxWidth: `min(100%, ${points}px)`, ...props.style } : props.style}
    />
  );
}
