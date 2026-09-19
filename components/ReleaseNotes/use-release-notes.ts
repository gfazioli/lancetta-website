import { useEffect, useState } from 'react';
import { compileMdx } from 'nextra/compile';
import useSWR from 'swr';

import { formatReleaseDate } from './format-release-date';

export interface Author {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
}

export interface Release {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: Author;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  /** Null on a draft release, which is why every read of it needs a fallback. */
  published_at: string | null;
  /** `published_at` formatted for display. Set by `useReleaseNotes`. */
  displayDate?: string;
  assets: any[];
  tarball_url: string;
  zipball_url: string;
  /**
   * The compiled source for `MDXRemote`, or `null` when this one body could not
   * be compiled. Never a reason to drop the release: `rawBody` still holds it.
   */
  body: string | null;
  /** The body exactly as GitHub published it, for the plain-text fallback. */
  rawBody?: string;
}

export interface TOC {
  value: string;
  depth: string;
  id: string;
}

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
 * jsdom to load nextra's compiler. The `try` is the whole point: these bodies are
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

export function useReleaseNotes() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const [compiledReleases, setCompiledReleases] = useState<Release[]>([]);
  const [error, setError] = useState<string | null>(null);
  // True once the list is FINAL: compiled, or confirmed empty. `isLoading` is
  // SWR's and goes false the moment the API answers, while the MDX compile
  // that fills `compiledReleases` is still running -- so for a moment the
  // caller sees "not loading" and "no releases" at once. The first version of
  // the component papered over that by treating an empty list as loading, and
  // on a repo with NO releases yet that skeleton never went away: lancetta.app
  // showed "Loading releases..." forever on 2026-09-17.
  const [ready, setReady] = useState(false);

  const {
    data,
    error: swrError,
    isLoading,
  } = useSWR<{
    releases: Release[];
  }>('/api/github-releases', fetcher);

  useEffect(() => {
    if (data && !isLoading && !error) {
      if (data.toString() === 'rate limit exceeded') {
        setError('Rate limit exceeded. Please try again later. Or check your API key.');
        return;
      }

      const fetchReleases = async () => {
        try {
          setCompiledReleases(await compileReleaseBodies(data.releases ?? []));
        } finally {
          // In a `finally` on purpose. The skeleton is not a state this page may
          // end in: whatever happened above, the reader gets an answer.
          setReady(true);
        }
      };
      fetchReleases();
    }
  }, [data, isLoading, error]); // Add isLoading and error to the dependency array

  return { data: compiledReleases, error: error || swrError, isLoading, ready } as const;
}
