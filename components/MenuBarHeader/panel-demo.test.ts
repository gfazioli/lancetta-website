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
});
