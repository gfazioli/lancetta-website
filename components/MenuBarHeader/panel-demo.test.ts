import { panelDemo, refreshLabel, shortDuration } from './panel-demo';
import { barReading } from './reading';

describe('shortDuration', () => {
  // `Preferences.shortDuration`, at both sides of every edge it has.
  it.each([
    [0, '0s'],
    [16, '16s'],
    [89, '89s'],
    [90, '1m'],
    [3599, '59m'],
    [3600, '1h00m'],
    [3660, '1h01m'],
    [86_399, '23h59m'],
    [86_400, '1d'],
    [183_600, '2d03h'],
  ])('%i s reads %s', (seconds, text) => {
    expect(shortDuration(seconds)).toBe(text);
  });
});

describe('refreshLabel', () => {
  it('says "just now" under five seconds, then the age', () => {
    expect(refreshLabel(4.9).text).toBe('Updated just now');
    expect(refreshLabel(5).text).toBe('Updated 5s ago');
    expect(refreshLabel(16).text).toBe('Updated 16s ago');
  });

  it('turns amber past three minutes, not at them', () => {
    expect(refreshLabel(180).stale).toBe(false);
    expect(refreshLabel(181).stale).toBe(true);
  });

  it('says it is refreshing, and nothing is stale while it does', () => {
    expect(refreshLabel(600, true)).toEqual({ text: 'Refreshing…', stale: false });
  });
});

describe('the panel the bar opens', () => {
  // The bar quotes each agent's five-hour window: its percentage and its reset.
  // A panel that disagreed with the item it hangs from is the drift this
  // header has already shipped once, against the hero's screenshot.
  it.each(barReading.map((cell) => [cell.agent, cell]))(
    'agrees with the bar about %s',
    (_, cell) => {
      const agent = panelDemo.agents.find((a) => a.agent === cell.agent);
      const five = agent?.rows.find((row) => row.label === '5h');
      expect(five?.percent).toBe(cell.percent);
      expect(five?.reset).toBe(cell.resets);
    }
  );

  const rows = panelDemo.agents.flatMap((agent) =>
    agent.rows.map((row) => [`${agent.name} ${row.label}`, row] as const)
  );

  // `Projection.ghost`: the ghost carries the bar on from its own figure to
  // the reset, so it can never end before the fill, nor past a full window.
  it.each(rows.filter(([, row]) => row.ghost))('draws %s’s ghost inside its bar', (_, row) => {
    expect(row.percent).not.toBeNull();
    expect(row.ghost!.to).toBeGreaterThanOrEqual(row.percent!);
    expect(row.ghost!.to).toBeLessThanOrEqual(100);
  });

  // The amber is the caption's "at this rate you run out", nowhere else, on
  // either side: a stop the caption does not state is an alarm the app never
  // raises, and an urgent caption over a calm bar is the drift this file has
  // shipped before. A stop runs the window out, so its ghost reaches 100.
  it.each(rows)('stops %s only where its caption is urgent', (_, row) => {
    expect(row.ghost?.stop ?? false).toBe(row.pace?.urgent ?? false);
    if (row.ghost?.stop) {
      expect(row.ghost.to).toBe(100);
    }
  });

  it('draws the one stop the cast has, so the tests above see input', () => {
    expect(rows.filter(([, row]) => row.ghost?.stop)).toHaveLength(1);
  });

  // A week carried forward from one afternoon would be a forecast: any other
  // window gets a ghost only when it stops the agent. No row has one today;
  // this holds the next edit to the rule.
  it('gives a window other than the 5 hours a ghost only when it stops', () => {
    for (const [, row] of rows) {
      if (row.ghost && row.label !== '5h') {
        expect(row.ghost.stop).toBe(true);
      }
    }
  });

  // The step that opens the stop suggestion and the sentence under it count
  // the same sessions, as `Guidance.swift` builds both from one number.
  it('counts the same working sessions in the stop step and its basis', () => {
    const stop = panelDemo.suggestions.find((s) => s.id === 'stop.Claude');
    const step = stop?.steps[0].match(/^(\d+) sessions of Claude are working at once/);
    const basis = stop?.basis.match(/shows (\d+) of its sessions working now\.$/);
    expect(step?.[1]).toBeDefined();
    expect(basis?.[1]).toBe(step?.[1]);
  });
});
