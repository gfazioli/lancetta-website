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
    // Every frame below the fold when the page mounts, as at 1440x900.
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: window.innerHeight + 40,
      bottom: window.innerHeight + 240,
    } as DOMRect);
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

  it('brings each picture in from the side it sits on, alternating as the page did', () => {
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

  it('reveals the picture, the copy and the figures each on its own way into view', () => {
    // On a phone the frame is one column and these are a screen apart: fired
    // by the frame, the copy and the figures moved below the fold.
    const { container } = render(<HeroStage />);
    const frame = container.querySelector('section[data-side]')!;
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

  it('lands the frame with no picture whole, as a card', () => {
    const { container } = render(<HeroStage />);
    const card = container.querySelector('section[data-textonly="true"]')!;
    expect(card).toHaveAttribute('data-reveal', 'morph');
    expect(card).toHaveAttribute('data-armed');
    scrollIn(card);
    expect(card).toHaveAttribute('data-revealed');
  });
});
