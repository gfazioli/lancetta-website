import { barReading, ledBand } from './reading';

/**
 * THE BANDS ARE A SECOND COPY. `BarLED.of` in `LancettaCore` is the original;
 * this file's `ledBand` exists because the header draws the same lamp and the
 * site does not import Swift. A second copy of a decision drifts unless
 * something compares it, and nothing can compare these two automatically — so
 * the edges are written out here in the same shape as `BarLEDTests.swift`, and
 * a change on one side that is not made on the other shows up as a picture of
 * the app that the app does not draw.
 *
 * The edges rather than the middles, for the reason the Swift suite gives: a
 * ladder that is right at 20 and 90 and wrong on its own boundary is the
 * failure no screenshot catches.
 */
describe('ledBand', () => {
  it.each([
    [0, 'calm'],
    [49.9, 'calm'],
    [50, 'calm'],
    [50.1, 'warm'],
    [66, 'warm'],
    [80, 'warm'],
    [80.1, 'hot'],
    [90, 'hot'],
    [98.9, 'hot'],
    [99, 'dead'],
    [100, 'dead'],
  ])('puts %p in the %s band', (percent, band) => {
    expect(ledBand(percent as number)).toBe(band);
  });

  /*
   * Not a restatement of the table: that one asserts the value AT each edge,
   * this one asserts there is nothing BETWEEN two bands. A ladder written with
   * a hole in it returns `undefined` here rather than the previous colour,
   * which on a lamp is the one failure that looks like nothing at all.
   */
  it('leaves no percentage without a band', () => {
    for (let tenth = 0; tenth <= 1000; tenth += 1) {
      expect(['calm', 'warm', 'hot', 'dead']).toContain(ledBand(tenth / 10));
    }
  });
});

describe('barReading', () => {
  /*
   * The header rotates between the cells, and the rotation is the only thing in
   * it that moves. One cell is a bar with nothing to turn — a state the app has
   * too, with a single agent configured — but it would make the timer in
   * `MenuBarReading` dead code without saying so.
   */
  it('has a cell per agent, so there is a turn to take', () => {
    expect(barReading.length).toBeGreaterThan(1);
    expect(new Set(barReading.map((cell) => cell.agent)).size).toBe(barReading.length);
  });

  /*
   * The percentages are what the lamp reads, and they are the percentages USED —
   * the app's `shown` setting can invert what the bar prints, and a page that
   * copied the inverted figure would draw a green lamp on a spent window. These
   * are read off the menu screenshot in the hero, where both are low.
   */
  it('quotes usage, so every lamp has a band', () => {
    for (const cell of barReading) {
      expect(cell.percent).toBeGreaterThanOrEqual(0);
      expect(cell.percent).toBeLessThanOrEqual(100);
      expect(ledBand(cell.percent)).toBeDefined();
    }
  });
});
