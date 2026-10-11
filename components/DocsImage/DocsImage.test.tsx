import type { CSSProperties, ReactNode } from 'react';
import { render } from '@/test-utils';
import { DocsImage, docsSizes } from './DocsImage';
import { LeadImage } from './LeadImage';

// Nextra ships ESM that Jest does not transform. What is under test is what
// DocsImage hands to ImageZoom, so a stand-in records exactly that.
// LeadImage reads the paragraph through the site's own mdx-components.ts,
// which builds its map from nextra-theme-docs: that is stood in for too.
jest.mock(
  'nextra/components',
  () => ({
    ImageZoom: (props: {
      alt?: string;
      sizes?: string;
      style?: CSSProperties;
      loading?: string;
      fetchPriority?: string;
    }) => (
      <img
        alt={props.alt}
        data-sizes={props.sizes}
        style={props.style}
        loading={props.loading as 'eager' | 'lazy' | undefined}
        data-priority={props.fetchPriority}
      />
    ),
  }),
  { virtual: true }
);
jest.mock(
  'nextra-theme-docs',
  () => ({
    useMDXComponents: () => ({
      p: (props: { children?: ReactNode }) => <p data-docs-paragraph="" {...props} />,
    }),
  }),
  { virtual: true }
);

// A static import, the shape Nextra makes of a Markdown image in `public/`.
const capture = {
  src: '/_next/static/media/screenshot-menu-dark.1z71mrr.png',
  width: 760,
  height: 1478,
};

function drawn(props: Parameters<typeof DocsImage>[0]) {
  const { container } = render(<DocsImage {...props} />);
  return container.querySelector('img')!;
}

describe('DocsImage', () => {
  it('draws a Retina capture at its size in points, and asks for that width', () => {
    const img = drawn({ src: capture, alt: 'The panel' });
    expect(img.style.maxWidth).toBe('min(100%, 380px)');
    expect(img.dataset.sizes).toBe('(max-width: 412px) calc(100vw - 32px), 380px');
  });

  it('caps the width it asks for at the column when the capture is wider in points', () => {
    const img = drawn({ src: { ...capture, width: 2400, height: 1600 }, alt: 'The window' });
    expect(img.style.maxWidth).toBe('min(100%, 1200px)');
    expect(img.dataset.sizes).toBe(
      '(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) calc(100vw - 352px), (max-width: 1439px) calc(100vw - 608px), 832px'
    );
  });

  it('reads a capture imported as a module the same way', () => {
    const img = drawn({ src: { default: capture }, alt: 'The panel' });
    expect(img.style.maxWidth).toBe('min(100%, 380px)');
  });

  it('leaves anything that is not a capture as it was', () => {
    const icon = drawn({
      src: { ...capture, src: '/_next/static/media/icon-512x512.png' },
      alt: '',
    });
    expect(icon.style.maxWidth).toBe('');
    expect(icon.dataset.sizes).toBe(
      '(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) calc(100vw - 352px), (max-width: 1439px) calc(100vw - 608px), 832px'
    );

    const remote = drawn({ src: 'https://example.com/screenshot-x.png', alt: '' });
    expect(remote.style.maxWidth).toBe('');
  });

  it('sets the lead picture in the docs paragraph, fetched at once and first', () => {
    const { container } = render(<LeadImage src={capture} alt="The panel" />);
    const img = container.querySelector<HTMLImageElement>('p[data-docs-paragraph] > img')!;
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('data-priority', 'high');
    expect(img.style.maxWidth).toBe('min(100%, 380px)');
  });

  it('keeps a style passed in, over its own', () => {
    const img = drawn({ src: capture, alt: '', style: { maxWidth: '100%' } });
    expect(img.style.maxWidth).toBe('100%');
  });
});

// The column, measured: the viewport less 32px under 768, less 352px under
// 1280, less 608px above, and never wider than 832px.
describe('docsSizes', () => {
  it('follows the column for a picture as wide as it, or wider', () => {
    expect(docsSizes()).toBe(
      '(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) calc(100vw - 352px), (max-width: 1439px) calc(100vw - 608px), 832px'
    );
    expect(docsSizes(1200)).toBe(docsSizes());
  });

  it('gives a picture narrower than the column its own width', () => {
    expect(docsSizes(380)).toBe('(max-width: 412px) calc(100vw - 32px), 380px');
    expect(docsSizes(600)).toBe(
      '(max-width: 632px) calc(100vw - 32px), (max-width: 767px) 600px, (max-width: 952px) calc(100vw - 352px), 600px'
    );
  });

  it('switches from the column to the picture where they cross on a laptop', () => {
    expect(docsSizes(760)).toBe(
      '(max-width: 767px) calc(100vw - 32px), (max-width: 1112px) calc(100vw - 352px), (max-width: 1279px) 760px, (max-width: 1368px) calc(100vw - 608px), 760px'
    );
  });
});
