import { compileMdx } from 'nextra/compile';
import config from '@/config';
import { formatReleaseDate } from './format-release-date';
import type { Release } from './use-release-notes';

/**
 * A release body is MARKDOWN, not MDX, and compiling it as MDX is what took this
 * page down on 2026-09-19: Lancetta 0.3.3 quotes an agent's raw error object,
 * `{ code = "-32600"; message = "Invalid request" }`, and in MDX a brace opens a
 * JavaScript expression -- `Could not parse expression with acorn`. Measured with
 * this same compiler: as `mdx` that body throws while 0.3.2 and 0.3.1 compile, and
 * as `md` all three pass, along with a body carrying `<br/>`, an autolink and
 * `Array<String>` in prose. Nothing in these notes is ever meant as JSX, so the
 * format is not a workaround, it is the correct reading of the input.
 */
const MARKDOWN: Parameters<typeof compileMdx>[1] = { mdxOptions: { format: 'md' } };

/**
 * Compile every body, and let one bad body cost only its own formatting.
 *
 * The compiler is injected so a test can drive the failing branch without asking
 * jsdom to load nextra's compiler. Moved here from the hook on 2026-09-24, when
 * the build started compiling the releases too: this module has no React in it,
 * so the page can import it on the server. The `try` is the whole point: these bodies are
 * written on GitHub, after the site is built and by hand, so they are the least
 * trusted input on the site -- and until today a single one of them that would
 * not parse rejected the `Promise.all`, left the hook's `ready` false for ever,
 * and hid the OTHER releases behind a skeleton that never resolved.
 */
export async function compileReleaseBodies(
  releases: Release[],
  compile: typeof compileMdx = compileMdx
): Promise<Release[]> {
  return Promise.all(
    releases.map(async (release) => {
      const rawBody = release.body ?? '';
      const common = {
        ...release,
        rawBody,
        displayDate: formatReleaseDate(release.published_at, release.created_at),
      };
      try {
        return { ...common, body: await compile(rawBody, MARKDOWN) };
      } catch {
        // Shown as plain text rather than dropped. A release nobody can read is
        // still better than a release nobody is told about.
        return { ...common, body: null };
      }
    })
  );
}

/**
 * Only Lancetta's own releases, newest first, as many as the page shows.
 *
 * The website repo also carries the template's `v6.x` releases, hence the name
 * prefix (see `config.releaseNotes.appReleaseNamePrefix`). Sliced AFTER the
 * filter so a template release cannot eat a visible slot.
 */
export function appReleases(releases: unknown): Release[] {
  if (!Array.isArray(releases)) {
    return [];
  }
  const prefix = config.releaseNotes.appReleaseNamePrefix;
  return releases
    .filter((release) => typeof release?.name === 'string' && release.name.startsWith(prefix))
    .slice(0, config.releaseNotes.displayCount);
}

/**
 * The releases for /docs/release-notes, fetched and compiled at BUILD time.
 *
 * The page used to fetch them in the browser from `/api/github-releases`, which
 * answers 403 to any user agent containing "bot" -- Googlebot's included. The
 * hook never checked the status, so the 403 body threw inside it and the page
 * stayed on its "Loading releases..." skeleton: about 30 words, which Search
 * Console filed under "Crawled - currently not indexed" (2026-09-24).
 * Built here, the releases are in the served HTML for every crawler, whether or
 * not it runs JavaScript, and a visitor's browser makes no request at all.
 *
 * Fresh at every release: release.sh publishes the GitHub release BEFORE it
 * pushes the website commit, so the deploy that follows always sees it -- the
 * same guarantee the page's table of contents has relied on all along.
 *
 * Never throws. An empty list sends the component back to its runtime fetch,
 * which is exactly what the page did before this existed.
 */
export async function loadReleases(fetchImpl: typeof fetch = fetch): Promise<Release[]> {
  const url = `${config.gitHub.releasesUrl}?per_page=${config.releaseNotes.maxReleases}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'lancetta-website',
  };
  // Without a token the build shares GitHub's 60 requests/hour with every other
  // build on the same pooled Vercel IP; with one, the owner's 5,000 apply.
  const token = process.env.GITHUB_TOKEN;
  try {
    let response = await fetchImpl(
      url,
      token ? { headers: { ...headers, Authorization: `Bearer ${token}` } } : { headers }
    );
    // A token that is invalid or refused by policy still leaves public
    // releases readable anonymously -- same fallback as the API route.
    if (!response.ok && token) {
      response = await fetchImpl(url, { headers });
    }
    if (!response.ok) {
      return [];
    }
    return await compileReleaseBodies(appReleases(await response.json()));
  } catch {
    return [];
  }
}
