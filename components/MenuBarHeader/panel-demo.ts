/**
 * What opens when the reading in the header is clicked: the app's own status
 * panel (`MenuPanelView.swift`), rebuilt with invented numbers. Since 0.50.0 it
 * opens on the SUGGESTIONS (`GuidanceViews.swift`), the first open and the rest
 * by title, then the window in brief: one card per agent and per pane
 * (`PanelDeck`), each opening in place.
 *
 * The idea is blume.codes', whose landing page shows the product as the product
 * rather than as a picture of it. Theirs is the real UI package with mock data;
 * this app is SwiftUI, so here it is a copy, and a copy drifts. Three things
 * keep it honest:
 *
 * - the numbers are the ones in the hero's menu screenshot, so the reading in
 *   the bar, the panel it opens and the picture under it tell one story
 *   (`panel-demo.test.ts` compares the bar against this file). Since 0.50.0
 *   that screenshot is the app's capture cast (`LANCETTA_DEMO_AGENT=showcase`),
 *   posed with these same numbers, and every sentence of a suggestion is the
 *   app's own (`Guidance.swift`) with them filled in;
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

/** `Guidance.Tone`: red for an agent that stops, amber for a cost later, green for room. */
export type Tone = 'warning' | 'caution' | 'encourage' | 'info';

/** `Guidance.Tone.color`, from `Theme.swift`. */
export const toneColor: Record<Tone, string> = {
  warning: '#FF6B5E',
  caution: '#F5A524',
  encourage: '#5FCFB0',
  info: '#4C8AFF',
};

/** What a suggestion is about, which picks its glyph (`Guidance.Item.symbol`). */
export type SuggestionKind = 'stop' | 'room' | 'maintenance';

/** One `Guidance.Item`: what is happening, what to do, and what it rests on. */
export interface Suggestion {
  id: string;
  kind: SuggestionKind;
  tone: Tone;
  title: string;
  steps: string[];
  basis: string;
  /** The one control an item carries, pointed at the page that explains it. */
  action?: { label: string; href: string };
}

/** A pane's card in the deck (`PaneTile`): its figure and the line under it. */
export interface PaneTile {
  pane: 'usage' | 'maintenance';
  title: string;
  value: string;
  footnote: string;
  /** `OverviewSection.tint`. */
  tint: string;
  href: string;
  /** What the card says when it is opened. */
  detail: string[];
}

export interface PanelState {
  /** How old the numbers are when the panel opens, in seconds. */
  updatedAgo: number;
  /** Most urgent first; the panel shows three (`GuidanceList(limit: 3)`). */
  suggestions: Suggestion[];
  agents: PanelAgent[];
  panes: PaneTile[];
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
 * What an agent's card in the deck shows: `LimitsHeadline`, ported. The figure
 * is the fuller of the two windows and the line under it that window's name
 * and its reset; a model's own week is not a candidate, as in the app.
 */
export function agentHeadline(agent: PanelAgent) {
  const windows = agent.rows.filter(
    (row) => (row.label === '5h' || row.label === '7d') && row.percent !== null
  );
  if (windows.length === 0) {
    return { value: '\u2014', footnote: '' };
  }
  const top = windows.reduce((a, b) => ((b.percent ?? 0) > (a.percent ?? 0) ? b : a));
  const name = top.label === '5h' ? '5 hours' : '7 days';
  return { value: `${top.percent}%`, footnote: `${name} \u00b7 \u21bb ${top.reset}` };
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

/**
 * The panel in the hero's menu screenshot, row for row: one afternoon on which
 * Claude is about to stop and Codex has a window about to go unused.
 */
export const panelDemo: PanelState = {
  updatedAgo: 42,
  suggestions: [
    {
      id: 'stop.Claude',
      kind: 'stop',
      tone: 'warning',
      title: 'At this pace Claude stops in 51m, then waits 1h18m for its reset.',
      steps: [
        'Lower the effort: it is set to xhigh.',
        'Give routine work to a lighter model.',
        'There is no free reset to fall back on: keep what is left for what matters most.',
        'Move the next tasks to Codex: 88% of its 5-hour window and 80% of its week are left.',
      ],
      basis: '5 hours: 82% used, 21% an hour over the last 1h00m, from 14 readings.',
    },
    {
      id: 'room.Codex',
      kind: 'room',
      tone: 'encourage',
      title: 'Codex has room: 88% of this 5-hour window is unused, and it resets in 40m.',
      steps: [
        'Spend it: start the long task now.',
        'Lancetta keeps watching the pace, and warns you in time.',
      ],
      basis: '5 hours: 12% used, it resets at 16:40. 7 days: 20% used.',
    },
    {
      id: 'maintenance',
      kind: 'maintenance',
      tone: 'info',
      title: 'Maintenance found 4 warnings in your agents\u2019 setup.',
      steps: [
        'Each says what to change: fixing them trims what every session loads, and the tokens with it.',
      ],
      basis: 'The heaviest start loads 6% of the size Claude Code warns at.',
      action: { label: 'Open Maintenance\u2026', href: '/docs/maintenance' },
    },
  ],
  agents: [
    {
      agent: 'claude',
      name: 'Claude',
      plan: 'max 20\u00d7',
      rows: [
        {
          label: '5h',
          percent: 82,
          reset: '2h10m',
          pace: { text: 'at this rate you run out in 51m', urgent: true },
        },
        { label: '7d', percent: 41, reset: '4d18h' },
        { label: 'Fable', percent: 30, reset: '4d18h' },
      ],
    },
    {
      agent: 'codex',
      name: 'Codex',
      plan: 'plus',
      rows: [
        { label: '5h', percent: 12, reset: '40m', pace: { text: '12% in 4h20m' } },
        { label: '7d', percent: 20, reset: '4d06h' },
      ],
    },
  ],
  panes: [
    {
      pane: 'usage',
      title: 'Usage',
      value: '142.8M',
      footnote: 'tokens, last 7 days',
      tint: '#4C8AFF',
      href: '/docs/the-window',
      detail: ['Daily tokens for both agents over 7, 30 or 90 days, in the window.'],
    },
    {
      pane: 'maintenance',
      title: 'Maintenance',
      value: '4',
      footnote: 'warnings \u00b7 heaviest start 6%',
      tint: '#FF9F0A',
      href: '/docs/maintenance',
      detail: [
        'What your agents load at every start, across 4 repositories, and what is wrong in it.',
        'A fix that needs no choosing is shown in full before it is applied.',
      ],
    },
  ],
};
