import type { ComponentProps } from 'react';
import { ImageZoom } from 'nextra/components';

/**
 * A docs image: Nextra's own zoomable image, told how wide it is drawn.
 *
 * Without `sizes` the browser cannot know the column is narrower than the
 * file, and every picture on /docs/the-window came as the 3840w rendering, on
 * a phone and a laptop alike: 262 KB for its five screenshots. Told the
 * column, it takes 1080w on a laptop (120 KB), 1920w on a Retina one and 1200w
 * on a 3x phone (138 KB), measured 2026-09-29. The column is the viewport on a
 * phone and 832px at most elsewhere (672px at 1024).
 */
export function DocsImage(props: ComponentProps<typeof ImageZoom>) {
  return <ImageZoom sizes="(max-width: 768px) 100vw, 832px" {...props} />;
}
