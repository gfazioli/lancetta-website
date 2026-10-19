import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import config from '@/config';
import { theme } from '@/theme';
import { HeroStage } from '../HeroStage/HeroStage';
import { DirectoryBadges } from './DirectoryBadges';

/**
 * Rendered to a string, as the server sends it: a directory that verifies its
 * badge fetches the home page, and runs none of its JavaScript.
 */
function served(node: ReactNode) {
  return renderToString(
    <MantineProvider theme={theme} env="test">
      {node}
    </MantineProvider>
  );
}

/** An attribute's value as a browser reads it: React escapes `&"'<>`. */
function attr(tag: string, name: string) {
  return tag
    .match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function anchors(html: string) {
  return html.match(/<a\s[^>]*>/g) ?? [];
}

const hero = config.directoryBadges.filter((badge) => badge.placement === 'hero');

describe('DirectoryBadges', () => {
  it('keeps Product Hunt alone under the hero, the only row drawn', () => {
    // Alone, because a hero row of badges got crowded on the sibling sites (the
    // user, 2026-10-08). And a `footer` entry would type-check and draw
    // nowhere: port findergit.app's footer row (`ListedOn`) with the first.
    expect(config.directoryBadges.map((badge) => [badge.name, badge.placement])).toEqual([
      ['Product Hunt', 'hero'],
    ]);
  });

  it("serves the hero's badge on the home page, linked to its directory", () => {
    // The hero itself, not the component alone: the wiring is what a
    // directory's verifier sees.
    const links = anchors(served(<HeroStage />)).map((a) => attr(a, 'href'));
    for (const badge of hero) {
      expect(links).toContain(badge.href);
    }
  });

  it('marks no link in a way that a backlink check refuses', () => {
    const links = anchors(served(<DirectoryBadges placement="hero" />));
    expect(links).toHaveLength(hero.length);
    for (const anchor of links) {
      expect(attr(anchor, 'rel')).not.toMatch(/nofollow|sponsored|ugc/);
    }
  });

  it('keeps every badge out of the preload queue', () => {
    // renderToString emits React's image preloads too, a fragment included:
    // with the badges eager, this string starts with one per badge.
    expect(served(<DirectoryBadges placement="hero" />)).not.toContain('rel="preload"');
  });

  it("loads each badge image from its directory's own domain", () => {
    // A directory's verifier looks for its badge image on the page, not only
    // the link: LaunchNest refused a copy served from findergit.app ("We
    // couldn't find the badge image on that page", 2026-10-08).
    const domain = (url: string) => new URL(url).hostname.split('.').slice(-2).join('.');
    for (const badge of config.directoryBadges) {
      expect(badge.src).toMatch(/^https:\/\//);
      expect(domain(badge.src)).toBe(domain(badge.href));
    }
  });

  it('draws each badge lazily, at the aspect ratio of its config', () => {
    const images = served(<DirectoryBadges placement="hero" />).match(/<img\s[^>]*>/g) ?? [];
    expect(images).toHaveLength(hero.length);
    images.forEach((img, i) => {
      expect(attr(img, 'loading')).toBe('lazy');
      expect(attr(img, 'width')).toBe(String(hero[i].width));
      expect(attr(img, 'height')).toBe(String(hero[i].height));
      expect(attr(img, 'alt')).toBe(hero[i].alt);
    });
  });
});
