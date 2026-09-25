import type { MetadataRoute } from 'next';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import config from '@/config';

/**
 * Build-time sitemap. Enumerates the MDX pages under `content/` (served by
 * Nextra at `/docs/...`) plus the homepage, so crawlers get the full URL set
 * — there was no sitemap before, which left discovery entirely to internal
 * linking.
 *
 * No `lastModified` anywhere. It used to come from each file's mtime, meant to
 * scope re-crawls to pages that changed, and on Vercel it could not: the build
 * works on a fresh checkout, so every mtime is the moment of the clone, and
 * production listed all fourteen docs pages at the same second
 * (2026-09-25T06:49:41Z). A date that moves on every deploy for every page is
 * one a search engine learns to ignore; omitting it is the honest signal, the
 * same one the homepage already gave.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = config.metadata.metadataBase.toString().replace(/\/$/, '');
  const contentDir = path.join(process.cwd(), 'content');

  const docs: MetadataRoute.Sitemap = readdirSync(contentDir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const url = slug === 'index' ? `${base}/docs` : `${base}/docs/${slug}`;
      // The docs landing and the release notes are the liveliest pages.
      const priority = slug === 'index' || slug === 'release-notes' ? 0.9 : 0.8;
      return { url, changeFrequency: 'weekly', priority };
    });

  return [{ url: `${base}/`, changeFrequency: 'weekly', priority: 1 }, ...docs];
}
