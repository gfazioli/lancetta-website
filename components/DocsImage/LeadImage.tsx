import type { StaticImageData } from 'next/image';
import { useMDXComponents } from '@/mdx-components';
import { DocsImage, type DocsImageProps } from './DocsImage';

/**
 * The picture a docs page opens on, when it is the page's largest paint:
 * fetched at once and first, where a Markdown image is always lazy. The panel
 * on /docs and /docs/the-menu waited for layout, its request starting at
 * ~2.0 s against 0.64 s for the same file on the home page, and mobile LCP
 * was 5.1 s (2026-10-11).
 *
 * Written in the MDX as `<LeadImage src={imported} alt="…" />`, the file
 * imported there: only an import carries the size and the blur this needs. A
 * path fails the page's prerender, so the build, on `placeholder="blur"` and
 * the missing size; the type refuses one in TSX, but MDX is not type-checked.
 *
 * Two traps on the way: MDX maps only Markdown images to `DocsImage`, so a
 * literal `<img>` with an imported `src` was served as `src="[object Object]"`;
 * and a JSX element is not set in a paragraph the way a Markdown image is, so
 * without one it lost the 20px above it. The paragraph is the site's own MDX
 * `p`, so it stays the one every other picture sits in.
 *
 * Its own module because `mdx-components.ts` imports `DocsImage`: reading the
 * component map from there would be circular.
 */
export function LeadImage(props: Omit<DocsImageProps, 'src'> & { src: StaticImageData }) {
  const { p: Paragraph } = useMDXComponents();

  return (
    <Paragraph>
      <DocsImage placeholder="blur" loading="eager" fetchPriority="high" {...props} />
    </Paragraph>
  );
}
