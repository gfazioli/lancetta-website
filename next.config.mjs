import bundleAnalyzer from '@next/bundle-analyzer';
import nextra from 'nextra';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextra = nextra({
  // No `latex`: nothing on the site is math, and it bundled KaTeX into the MDX
  // compiler that the release notes' fallback loads.
  search: {
    codeblocks: false,
  },
  contentDirBasePath: '/docs',
});

export default withNextra(
  withBundleAnalyzer({
    reactStrictMode: false,
    cleanDistDir: true,
    // AVIF first, WebP for a browser that cannot take it. Encoded the way Next
    // does it (WebP q75 against AVIF q47, effort 3), the home page's pictures
    // came out 29-31% smaller: 186 -> 132 KiB at a phone's width, 239 -> 164
    // KiB on a Retina laptop, the panel 66.3 -> 44.5 KiB, and no difference at
    // 2x (2026-10-11). Next picks the format from the browser's Accept header
    // and caches each apart: every current browser takes AVIF, so the
    // transformations Vercel bills move to AVIF, and a WebP is made only for
    // one that cannot. The first request for each one encodes about half as
    // long again.
    images: {
      formats: ['image/avif', 'image/webp'],
    },
    experimental: {
      optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    },
    turbopack: {
      rules: {
        '*.svg': {
          loaders: ['turbopack-inline-svg-loader'],
          condition: {
            content: /^[\s\S]{0,4000}$/, // <-- Inline SVGs smaller than ~4Kb (since Next.js v16)
          },
          as: '*.js',
        },
      },
    },
  })
);
