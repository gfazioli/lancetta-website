import '@mantine/core/styles.css';
// !! The order of these imports is important !!
import '@gfazioli/mantine-marquee/styles.css';
import '@gfazioli/mantine-text-animate/styles.css';
import '@gfazioli/mantine-scene/styles.css';
// Mantine theme overrides (body background, marquee fade edges, etc.)
import '@/theme/global.css';

import { Analytics } from '@vercel/analytics/react';
import { Layout } from 'nextra-theme-docs';
import { Banner, Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
// !! End of important imports !!

import { MantineFooter, MantineNavBar } from '@/components';
import { WebsiteJsonLd } from '@/components/StructuredData/StructuredData';
import config from '@/config';
import { theme } from '../theme';

import './global.css';

export const metadata = config.metadata;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap();
  const { nextraLayout, head } = config;

  return (
    <html lang="en" dir="ltr" {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript
          nonce={head.mantine.nonce}
          defaultColorScheme={head.mantine.defaultColorScheme}
        />
        {/*
          The tab icons are the TAB MARK (public/favicon.svg and the two PNGs
          rendered from it), not the app icon: at 16px the app icon's plate eats
          the tile and the three bars smear into each other. The SVG is declared
          first and carries no `sizes`, which is how a browser that supports one
          picks it at every density; the PNGs and the .ico are what the rest
          fall back to. apple-touch-icon stays the app icon — at 180px it reads,
          and a home-screen icon should be the app's own face.
        */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/*
          No manual viewport meta: Next emits `width=device-width,
          initial-scale=1` by default. The previous override added
          `user-scalable=no`, which blocks pinch-zoom — an accessibility
          regression (and a Lighthouse flag). Let the default stand so
          users can zoom.
        */}
      </Head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme={head.mantine.defaultColorScheme}>
          <Layout
            banner={
              <Banner storageKey={`lancetta-${config.app.version}`}>
                {/*
                  Wrap the banner body in a single span. Nextra's Banner maps
                  over its children internally; two siblings (a text node plus
                  the <a>) trip React 19's unique-key warning.
                */}
                <span>
                  Lancetta v{config.app.version} is being built in the open —{' '}
                  <a href="/docs/roadmap">see what is in it</a>
                </span>
              </Banner>
            }
            navbar={<MantineNavBar />}
            pageMap={pageMap}
            docsRepositoryBase={nextraLayout.docsRepositoryBase}
            footer={<MantineFooter />}
            sidebar={nextraLayout.sidebar}
          >
            {children}
          </Layout>
        </MantineProvider>
        <WebsiteJsonLd />
        <Analytics />
      </body>
    </html>
  );
}
