import '@mantine/core/styles.css';
// !! The order of these imports is important !!
import '@gfazioli/mantine-marquee/styles.css';
import '@gfazioli/mantine-text-animate/styles.css';
import '@gfazioli/mantine-scene/styles.css';
// Mantine theme overrides (body background, marquee fade edges, etc.)
import '@/theme/global.css';

import { Analytics } from '@vercel/analytics/react';
import { Layout } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
// !! End of important imports !!

import { MantineFooter } from '@/components';
import { MenuBarHeader } from '@/components/MenuBarHeader/MenuBarHeader';
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
        {/*
          Forced, not defaulted. The site is light-only: `forceColorScheme`
          makes the pre-hydration script write `light` whatever is in local
          storage, so a visitor who toggled the old switch is not left on a
          dark scheme the stylesheets no longer carry.
        */}
        <ColorSchemeScript nonce={head.mantine.nonce} forceColorScheme="light" />
        {/*
          The tab icons are the TAB MARK (public/favicon.svg and the two PNGs
          rendered from it), not the app icon: at 16px the app icon's plate eats
          the tile and the three bars smear into each other. The SVG is declared
          first and carries no `sizes`, which is how a browser that supports one
          picks it at every density; the PNGs and the .ico are what the rest
          fall back to. apple-touch-icon stays the app icon — at 180px it
          reads, and a home-screen icon should be the app's own face.
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
        <MantineProvider theme={theme} forceColorScheme="light">
          {/*
            `navbar` is OUR bar. Nextra renders whatever is in this slot in
            place of its own `<Navbar>`, so the default header is gone rather
            than hidden — which is why `MenuBarHeader` has to carry the two
            things that bar used to: the search, and the hamburger that opens
            the sidebar on a phone.

            No `banner`: the bar is attached to the top edge, and a strip
            above it would push it down and break exactly that. What the
            banner announced (the current version) is in the hero's meta line
            and on the releases page.
          */}
          <Layout
            navbar={<MenuBarHeader />}
            pageMap={pageMap}
            docsRepositoryBase={nextraLayout.docsRepositoryBase}
            footer={<MantineFooter />}
            sidebar={nextraLayout.sidebar}
            darkMode={false}
            nextThemes={{ defaultTheme: 'light', forcedTheme: 'light' }}
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
