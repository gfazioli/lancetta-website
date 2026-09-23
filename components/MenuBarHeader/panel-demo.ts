/**
 * What opens when the reading in the header is clicked: the app's own status
 * panel (`MenuPanelView.swift`), rebuilt with invented numbers.
 *
 * The idea is blume.codes', whose landing page shows the product as the product
 * rather than as a picture of it. Theirs is the real UI package with mock data;
 * this app is SwiftUI, so here it is a copy, and a copy drifts. Three things
 * keep it honest:
 *
 * - the numbers are the ones in the hero's menu screenshot, so the reading in
 *   the bar, the panel it opens and the picture under it tell one story
 *   (`panel-demo.test.ts` compares the bar against this file);
 * - the two rules that decide what text appears are PORTED, not paraphrased,
 *   and tested at their edges: `shortDuration` from `Preferences.swift`, and
 *   the refresh stamp's label from `RefreshStamp` in `MenuPanelView.swift`;
 * - the sizes, colours and order are `Theme.swift`, `GlassBar.swift` and
 *   `PanelMetrics.swift`, named beside each value in the stylesheet.
 *
 * ILLUSTRATION, not a claim: like `barReading`, one developer's afternoon.
 */

export type AgentId = 'claude' | 'codex';

export interface PanelRow {
  /** `5h`, `7d`, or the name the account gives a window one model keeps to itself. */
  label: string;
  /** Percent USED. `null` is an unknown, which the app draws as a dashed groove. */
  percent: number | null;
  /** When it resets, already formatted the way `Preferences.resetCountdown` prints it. */
  reset: string;
  /** The pace caption under the bar, when the app has one to say. */
  pace?: { text: string; urgent?: boolean };
}

export interface PanelAgent {
  agent: AgentId;
  name: string;
  /** The plan chip beside the name. */
  plan?: string;
  rows: PanelRow[];
  /** "codex exhausted": the bucket that refused, named. */
  exhausted?: string;
  /** Free resets the account has granted (Codex only). */
  credit?: { label: string; detail: string; resettable: boolean };
}

export interface PanelState {
  /** How old the numbers are when the panel opens, in seconds. */
  updatedAgo: number;
  agents: PanelAgent[];
}

/** `ClaudeSource.tintHex` and `CodexSource.tintHex`: the colours an unconfigured Mac gets. */
export const agentTint: Record<AgentId, string> = {
  claude: '#E8833A',
  codex: '#2FBFA8',
};

/**
 * `Preferences.shortDuration`, ported. Seconds under 90, then minutes, then
 * `1h05m`, then `2d03h` — and a whole day with no hours is `2d`, not `2d00h`.
 */
export function shortDuration(seconds: number): string {
  const t = Math.floor(Math.abs(seconds));
  if (t < 90) {
    return `${t}s`;
  }
  if (t < 3600) {
    return `${Math.floor(t / 60)}m`;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  if (t < 86_400) {
    return `${Math.floor(t / 3600)}h${pad(Math.floor((t % 3600) / 60))}m`;
  }
  const days = Math.floor(t / 86_400);
  const hours = Math.floor((t % 86_400) / 3600);
  return hours === 0 ? `${days}d` : `${days}d${pad(hours)}h`;
}

/**
 * What the panel's refresh stamp says, and whether it has turned amber:
 * `RefreshStamp.label(at:)`. Amber once three polls — and at least three
 * minutes — have gone by, and 45 s is the interval an unconfigured Mac polls
 * at, so leaving the demo open long enough turns it amber exactly as the app
 * would.
 */
export const REFRESH_SECONDS = 45;

export function refreshLabel(ageSeconds: number, refreshing = false) {
  if (refreshing) {
    return { text: 'Refreshing…', stale: false };
  }
  const age = Math.max(0, ageSeconds);
  const stale = age > Math.max(3 * REFRESH_SECONDS, 180);
  if (age < 5) {
    return { text: 'Updated just now', stale };
  }
  return { text: `Updated ${shortDuration(age)} ago`, stale };
}

/** The panel in the hero's menu screenshot, row for row. */
export const panelDemo: PanelState = {
  updatedAgo: 16,
  agents: [
    {
      agent: 'claude',
      name: 'Claude',
      plan: 'max 20×',
      rows: [
        {
          label: '5h',
          percent: 10,
          reset: '47m',
          pace: { text: '10% in 4h12m · at this pace 12% by reset' },
        },
        {
          label: '7d',
          percent: 3,
          reset: '2d03h',
          pace: { text: '3% in 4 days · at this pace 4% by reset' },
        },
        { label: 'Fable', percent: 0, reset: '2d03h' },
      ],
    },
    {
      agent: 'codex',
      name: 'Codex',
      plan: 'plus',
      rows: [
        { label: '5h', percent: 0, reset: '4h59m' },
        { label: '7d', percent: 100, reset: '5h44m' },
      ],
      exhausted: 'codex exhausted',
      credit: {
        label: '1 free reset · until 22 Oct',
        detail: 'Full reset (Weekly + 5 hr) · granted 22 September · valid until 22 October',
        resettable: true,
      },
    },
  ],
};
