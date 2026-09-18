import { Group } from '@mantine/core';
import { IconCoffee, IconHeartFilled } from '@tabler/icons-react';

/*
 * The `download` tab appeared with the first release (v0.2.0, 2026-09-18). It points
 * at `/download`, which resolves the newest release's .dmg from the GitHub API at
 * request time — so the tab carries no version and cannot go stale. It was absent
 * while `config.app.released` was false, because a Download tab over an empty
 * Releases page is a promise the site cannot keep.
 */
export default {
  index: {
    display: 'hidden',
  },
  docs: {
    type: 'page',
    title: 'Documentation',
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
  community: {
    title: 'Community',
    type: 'menu',
    items: {
      releases: {
        title: 'Releases',
        href: 'https://github.com/gfazioli/lancetta-website/releases',
      },
      issues: {
        title: 'Report an Issue',
        href: 'mailto:feedback@lancetta.app?subject=Lancetta%20feedback',
      },
    },
  },
  about: {
    type: 'page',
    title: 'About',
    href: 'https://gfazioli.github.io/',
  },
  support: {
    title: 'Support',
    type: 'menu',
    items: {
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
};
