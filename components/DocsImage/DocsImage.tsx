import type { ComponentProps } from 'react';
import { ImageZoom } from 'nextra/components';

export type DocsImageProps = ComponentProps<typeof ImageZoom>;

/** The docs column: the viewport on a phone, 832px at most elsewhere (672px at 1024). */
const COLUMN = 832;

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
 * a phone and a laptop alike: 262 KB for its five screenshots. Told the
 * column, it takes 1080w on a laptop (120 KB), 1920w on a Retina one and 1200w
 * on a 3x phone (138 KB), measured 2026-09-29. A capture narrower than the
 * column in points says its own width instead.
 */
export function DocsImage(props: DocsImageProps) {
  const points = pointWidth(props.src);
  const drawn = Math.min(points ?? COLUMN, COLUMN);

  return (
    <ImageZoom
      sizes={`(max-width: 768px) 100vw, ${drawn}px`}
      {...props}
      style={points ? { maxWidth: `min(100%, ${points}px)`, ...props.style } : props.style}
    />
  );
}
