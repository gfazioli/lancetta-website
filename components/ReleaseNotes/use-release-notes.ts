import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { compileReleaseBodies } from './load-releases';

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
 * The releases for the page. `initial` is what the build compiled (see
 * `loadReleases`); when it holds anything the hook returns it as is, final from
 * the first render, and the browser never calls the API. Only an empty
 * `initial` -- the build could not reach GitHub -- falls back to fetching at
 * runtime, as the page always did.
 */
export function useReleaseNotes(initial: Release[] = []) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const prebuilt = initial.length > 0;

  const [compiledReleases, setCompiledReleases] = useState<Release[]>(initial);
  const [error, setError] = useState<string | null>(null);
  // True once the list is FINAL: compiled, or confirmed empty. `isLoading` is
  // SWR's and goes false the moment the API answers, while the MDX compile
  // that fills `compiledReleases` is still running -- so for a moment the
  // caller sees "not loading" and "no releases" at once. The first version of
  // the component papered over that by treating an empty list as loading, and
  // on a repo with NO releases yet that skeleton never went away: lancetta.app
  // showed "Loading releases..." forever on 2026-09-17.
  const [ready, setReady] = useState(prebuilt);

  const {
    data,
    error: swrError,
    isLoading,
  } = useSWR<{
    releases: Release[];
  }>(prebuilt ? null : '/api/github-releases', fetcher);

  useEffect(() => {
    if (!prebuilt && data && !isLoading && !error) {
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
  }, [prebuilt, data, isLoading, error]);

  return { data: compiledReleases, error: error || swrError, isLoading, ready } as const;
}
