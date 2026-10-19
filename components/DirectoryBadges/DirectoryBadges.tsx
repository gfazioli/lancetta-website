import { Group, type GroupProps } from '@mantine/core';
import config from '@/config';

type Placement = (typeof config.directoryBadges)[number]['placement'];

/**
 * The badges of the directories Lancetta is listed on (`config.directoryBadges`)
 * that go in one place. Nothing at all when none goes there.
 *
 * No stylesheet of its own, unlike findergit.app's, and for `Mascot`'s reason:
 * here a CSS module split the shared CSS chunk, and every page, docs included,
 * gained a fourth render-blocking stylesheet (3 -> 4 on / and /docs/the-menu,
 * 2026-10-19). The host passes `badgeClassName`, which sets the one height
 * every badge in its row is drawn at; the width follows from the
 * `width`/`height` attributes, which are the badge's own.
 *
 * Lazy, unlike the hero's shot: React 19 preloads, at the top of the document,
 * every `<img>` the server renders without `loading="lazy"`, and an eager badge
 * from a third-party origin would be queued there beside the page's largest
 * paint. A lazy image near the viewport is still fetched as soon as the page is
 * laid out; it is just no longer queued ahead of what the hero is made of.
 *
 * The links carry no `nofollow`, `sponsored` or `ugc`: a directory that checks
 * its backlink refuses a link marked with any of them. And no `noreferrer`,
 * the site's usual pairing: a directory counts the visits it sends.
 */
export function DirectoryBadges({
  placement,
  badgeClassName,
  ...props
}: { placement: Placement; badgeClassName?: string } & Omit<GroupProps, 'children'>) {
  const badges = config.directoryBadges.filter((badge) => badge.placement === placement);
  if (badges.length === 0) {
    return null;
  }
  return (
    <Group justify="center" gap="md" {...props}>
      {badges.map((badge) => (
        <a key={badge.name} href={badge.href} target="_blank" rel="noopener">
          <img
            className={badgeClassName}
            src={badge.src}
            alt={badge.alt}
            width={badge.width}
            height={badge.height}
            loading="lazy"
          />
        </a>
      ))}
    </Group>
  );
}
