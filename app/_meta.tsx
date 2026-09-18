import { Group } from '@mantine/core';
import { IconCoffee, IconHeartFilled } from '@tabler/icons-react';

/*
 * The global navigation is about the PRODUCT, in the order a visitor asks:
 * what does it do (Features, an anchor on the home page), the docs, the one
 * action (Download), where it is going, and the two menus that are not about
 * the product at all. Six entries and no more: Nextra's desktop navigation is
 * already cut off at 1200px (theme/global.css), and a seventh did not fit
 * above it once Download arrived, so "How it works" went — it is the first
 * page of the docs, and the product bar on the home page covers the rest.
 *
 * The `download` tab appeared with the first release (v0.2.0, 2026-09-18). It
 * points at `/download`, which resolves the newest release's .dmg from the
 * GitHub API at request time — so the tab carries no version and cannot go
 * stale. It was absent while `config.app.released` was false, because a
 * Download tab over an empty Releases page is a promise the site cannot keep.
 */
export default {
  index: {
    display: 'hidden',
  },
  features: {
    type: 'page',
    title: 'Features',
    href: '/#features',
  },
  docs: {
    type: 'page',
    title: 'Docs',
  },
  download: {
    type: 'page',
    title: 'Download',
    href: '/download',
  },
  roadmap: {
    type: 'page',
    title: 'Roadmap',
    href: '/docs/roadmap',
  },
  support: {
    title: 'Support',
    type: 'menu',
    items: {
      releases: {
        title: 'Releases',
        href: 'https://github.com/gfazioli/lancetta-website/releases',
      },
      issues: {
        title: 'Report an issue',
        href: 'mailto:feedback@lancetta.app?subject=Lancetta%20feedback',
      },
      // Scrolls to the on-page Sponsors section (footer) — internal anchor,
      // so Nextra shows no external arrow.
      sponsor: {
        title: (
          <Group component="span" gap={8} wrap="nowrap" align="center">
            <IconHeartFilled size={16} />
            Sponsor
          </Group>
        ),
        href: '#sponsors',
      },
      coffee: {
        title: (
          <Group component="span" gap={8} wrap="nowrap" align="center">
            <IconCoffee size={16} />
            Buy me a coffee
          </Group>
        ),
        href: 'https://donate.stripe.com/fZu4gy4Tn3b1dgudGx0co00',
      },
    },
  },
  about: {
    type: 'page',
    title: 'About',
    href: 'https://gfazioli.github.io/',
  },
};
