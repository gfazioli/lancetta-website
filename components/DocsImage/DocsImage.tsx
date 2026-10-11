import type { ComponentProps } from 'react';
import { ImageZoom } from 'nextra/components';
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';

type DocsImageProps = ComponentProps<typeof ImageZoom>;

/** The docs column: the viewport on a phone, 832px at most elsewhere (672px at 1024). */
const COLUMN = 832;

/** Nextra's own paragraph, the one a Markdown image is set in. */
const { p: DocsParagraph } = getDocsMDXComponents();

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

/**
 * The picture a docs page opens on, when it is the page's largest paint:
 * fetched at once and first, where a Markdown image is always lazy. The panel
 * on /docs and /docs/the-menu waited for layout, its request starting at
 * ~2.0 s against 0.64 s for the same file on the home page, and mobile LCP
 * was 5.1 s (2026-10-11).
 *
 * Written in the MDX as `<LeadImage src={imported} alt="…" />`, the file
 * imported there. Two traps on the way: MDX maps only Markdown images to
 * `DocsImage`, so a literal `<img>` with an imported `src` was served as
 * `src="[object Object]"`; and a JSX element is not set in a paragraph the way
 * a Markdown image is, so without `DocsParagraph` it lost the 20px above it.
 */
export function LeadImage(props: DocsImageProps) {
  return (
    <DocsParagraph>
      <DocsImage placeholder="blur" loading="eager" fetchPriority="high" {...props} />
    </DocsParagraph>
  );
}
