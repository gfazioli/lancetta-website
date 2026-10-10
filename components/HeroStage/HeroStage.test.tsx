import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { act, render, screen } from '@/test-utils';
import { theme } from '@/theme';
import { HeroStage } from './HeroStage';

/**
 * The frames' motion: what the server sends, which way each picture comes in,
 * and that each part of a frame waits for its own way into view.
 */
describe('HeroStage frames', () => {
  let observed: { el: Element; callback: IntersectionObserverCallback }[];

  beforeEach(() => {
    observed = [];
    // jsdom has none. This one records what it was asked to watch, so a test
    // can say which element "scrolls in".
    globalThis.IntersectionObserver = class {
      callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe(el: Element) {
        observed.push({ el, callback: this.callback });
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
    // Every frame below the fold when the page mounts, as at 1440x900: laid
    // out there, which is what the hook reads (`layoutBox`).
    jest.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(window.innerHeight + 40);
    jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
  });

  afterEach(() => {
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    jest.restoreAllMocks();
  });

  const scrollIn = (el: Element) =>
    act(() => {
      for (const o of observed.filter((o) => o.el === el)) {
        o.callback(
          [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

  it('sends every frame as it is laid out: nothing is armed in the HTML', () => {
    // A frame parked in its starting pose before a script has run is the blank
    // page this site has shipped once already; see useReveal.
    const html = renderToString(
      <MantineProvider theme={theme}>
        <HeroStage />
      </MantineProvider>
    );
    expect(html).toContain('data-side="left"');
    expect(html).not.toContain('data-armed');
    expect(html).not.toContain('data-revealed');
  });

  it('gives each picture its frame’s side, alternating from the left as the page did', () => {
    const { container } = render(<HeroStage />);
    const frames = [...container.querySelectorAll('section[data-side]')];
    expect(frames.length).toBeGreaterThan(3);
    frames.forEach((frame, i) => {
      // Every frame counts, the card with no picture included, as the grid's
      // `:nth-child(even)` did before `data-side` replaced it.
      expect(frame).toHaveAttribute('data-side', i % 2 === 0 ? 'left' : 'right');
      const picture = frame.querySelector('img')?.parentElement;
      if (picture) {
        expect(picture).toHaveAttribute('data-reveal', frame.getAttribute('data-side'));
      }
    });
  });

  it('puts a right picture in the right column and starts it from the right', () => {
    // Jest swaps every CSS module for a proxy, so no render above ever meets
    // the rules that give `data-side` its meaning: they are read from source.
    const hero = readFileSync(join(__dirname, 'HeroStage.module.css'), 'utf8');
    const motion = readFileSync(join(__dirname, '../Motion/Motion.module.css'), 'utf8');
    const [wide, narrow] = hero.split('@media (max-width: 62em)');
    const order = (css: string) =>
      css.match(/\.frame\[data-side='right'\] \.frameShot \{\s*order: (\d+);/)?.[1];
    expect(order(wide)).toBe('2');
    expect(order(narrow)).toBe('0');
    const start = (side: string) =>
      Number(
        motion.match(
          new RegExp(
            `\\.item\\[data-reveal='${side}'\\]\\[data-armed\\]:not\\(\\[data-revealed\\]\\) \\{\\s*transform: translate3d\\((-?\\d+)px`
          )
        )?.[1]
      );
    expect(start('right')).toBeGreaterThan(0);
    expect(start('left')).toBeLessThan(0);
  });

  it('reveals the picture, the copy and the figures each on its own way into view', () => {
    // On a phone the frame is one column and these are a screen apart: fired
    // by the frame, the copy and the figures moved below the fold.
    const { container } = render(<HeroStage />);
    // The first frame WITH a picture: since 0.50.0 the page opens on one without.
    const frame = container.querySelector('section[data-textonly="false"]')!;
    const picture = frame.querySelector('img')!.parentElement!;
    const copy = frame.querySelector('a')!.parentElement!;
    const figures = screen
      .getByText('the window that actually hurts')
      .closest('[data-reveal="pop"]')!.parentElement!;
    for (const part of [picture, copy, figures]) {
      expect(part).toHaveAttribute('data-armed');
    }
    expect(frame).not.toHaveAttribute('data-armed');

    scrollIn(picture);
    expect(picture).toHaveAttribute('data-revealed');
    expect(copy).not.toHaveAttribute('data-revealed');

    scrollIn(copy);
    expect(copy).toHaveAttribute('data-revealed');
    expect(figures).not.toHaveAttribute('data-revealed');

    scrollIn(figures);
    expect(figures).toHaveAttribute('data-revealed');
  });

  it('lands the frame with no picture whole, its copy rising with the card', () => {
    const { container } = render(<HeroStage />);
    const card = container.querySelector('section[data-textonly="true"]')!;
    const copy = card.querySelector('a')!.parentElement!;
    expect(card).toHaveAttribute('data-reveal', 'morph');
    expect(card).toHaveAttribute('data-armed');
    // One scope, the card's. A copy watching for itself landed an empty
    // bordered card a quarter of a second before its text.
    expect(copy).toHaveAttribute('data-reveal', 'rise');
    expect(copy).not.toHaveAttribute('data-armed');
    scrollIn(card);
    expect(card).toHaveAttribute('data-revealed');
  });
});
