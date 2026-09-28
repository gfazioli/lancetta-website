import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_PACE, sample, settle, spr, springFor, springs, springsCss } from './springs';

describe('the film spring', () => {
  it('samples netfox.app’s landing spring to the digit', () => {
    // The positive control: `--nf-spring` on netfox.app (its #77), f 1.4 Hz and
    // zeta 0.5, which is also the app's card landing. A generator that drifted
    // from it would make the two pages move differently for no reason.
    const land = sample({ name: '--x', f: 1.4, zeta: 0.5, note: '' });
    expect(land.ms).toBe(1255);
    expect(land.stops.slice(0, 6)).toEqual([
      '0',
      '0.0244 2.08%',
      '0.0898 4.17%',
      '0.1845 6.25%',
      '0.2982 8.33%',
      '0.4216 10.42%',
    ]);
    expect(land.stops.slice(-4)).toEqual(['1.0036 93.75%', '1.0041 95.83%', '1.0043 97.92%', '1']);
    expect(land.overshoot).toBeCloseTo(16.3, 1);
  });

  it('rests at 0, lands on 1, and never passes 1 when critically damped', () => {
    expect(spr(0, 1.4, 0.5)).toBe(0);
    expect(spr(settle(1.4, 0.5) * 2, 1.4, 0.5)).toBeCloseTo(1, 3);
    const roll = springs.find((s) => s.name === '--lan-panel-roll');
    // Its last sample is still 0.4% short of 1 (that is where the duration is
    // cut), so "no overshoot" is a peak at or under 1, not a peak of exactly 1.
    expect(roll && sample(roll).overshoot).toBeLessThanOrEqual(0);
  });

  it('plays the app’s springs at its pace: 0.7 of the film’s time', () => {
    expect(settle(1.4 / APP_PACE, 0.5) / settle(1.4, 0.5)).toBeCloseTo(APP_PACE, 6);
  });

  it('hands Web Animations the same spring the stylesheet runs, in milliseconds', () => {
    // The panel's press used to read this back out of the CSS, where the
    // minifier serves `879ms` as `.879s`: the spring-back lasted under 1 ms.
    const land = springFor('--lan-panel-land');
    expect(land.ms).toBe(879);
    const css = readFileSync(join(__dirname, '../../theme/global.css'), 'utf8');
    const block = css.split('--lan-panel-land: linear(')[1]?.split(');')[0] ?? '';
    const stops = block.split(',').map((stop) => stop.trim());
    expect(land.easing).toBe(`linear(${stops.join(', ')})`);
    expect(() => springFor('--lan-nothing')).toThrow();
  });
});

describe('theme/global.css', () => {
  it('carries exactly the springs springs.ts generates', () => {
    const css = readFileSync(join(__dirname, '../../theme/global.css'), 'utf8');
    const block = css.split('/* springs:begin */\n')[1]?.split('\n  /* springs:end */')[0];
    // On a mismatch the expected value below IS the block: paste it between the
    // markers rather than editing a number.
    expect(block).toBe(springsCss());
  });
});
