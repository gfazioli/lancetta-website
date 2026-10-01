import { act, fireEvent, render, screen } from '@/test-utils';
import { DELAY_MS, dismissGuide, guideMemory, markPanelOpened, registerPanelOpener } from './guide';
import {
  CARD_IN_MS,
  CORNER_IN_MS,
  HERO_FOLD_MS,
  HERO_LINE,
  HOP_MS,
  LEAVE_MS,
  ScrollGuide,
  SPONSOR_LINE,
  STILL_MS,
} from './ScrollGuide';

describe('ScrollGuide', () => {
  // jsdom has no IntersectionObserver. This one records what each observer
  // watches, so a test can say what came into view and what left it.
  let watches: { callback: IntersectionObserverCallback; targets: Element[] }[];
  let opened: number;
  let unregister: () => void;
  // Swapped, never spied: a spy on the setup's `matchMedia` mock replaces that
  // mock's own implementation, and `restoreAllMocks` does not give it back, so
  // one test's phone stayed a phone for every test after it.
  const matchMedia = window.matchMedia;

  beforeEach(() => {
    guideMemory.dismissed = false;
    guideMemory.panelOpened = false;
    watches = [];
    opened = 0;
    unregister = registerPanelOpener(() => {
      opened += 1;
    });
    globalThis.IntersectionObserver = class {
      callback: IntersectionObserverCallback;
      targets: Element[] = [];
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        watches.push(this);
      }
      observe(target: Element) {
        this.targets.push(target);
      }
      disconnect() {
        this.targets = [];
      }
    } as unknown as typeof IntersectionObserver;
    // Rendered, as far as the focus handoff can tell.
    jest.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    jest.useFakeTimers();
  });

  afterEach(() => {
    window.matchMedia = matchMedia;
    unregister();
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const wait = (ms: number) => act(() => jest.advanceTimersByTime(ms));

  /** A window whose media queries answer `matches` for the queries containing `part`. */
  const matching = (part: string) => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes(part),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
  };
  /** A window where the one under the bar has no room: a phone, 36em and under. */
  const onAPhone = () => matching('max-width: 36em');

  function Page() {
    return (
      <div>
        <a href="/in-view">In view</a>
        <div data-guide-anchor="" />
        <a href="/docs">See what it does</a>
        <ScrollGuide />
        <footer>
          <div id="sponsors">
            <a href="https://github.com/sponsors/gfazioli">Become a sponsor</a>
          </div>
        </footer>
      </div>
    );
  }

  const row = () => document.querySelector('[data-guide-anchor]')!;
  const sponsors = () => document.getElementById('sponsors')!;
  const fire = (target: Element, entry: Partial<IntersectionObserverEntry>) =>
    act(() =>
      watches
        .filter((watch) => watch.targets.includes(target))
        .forEach((watch) =>
          watch.callback(
            [{ target, ...entry } as IntersectionObserverEntry],
            watch as unknown as IntersectionObserver
          )
        )
    );
  const rowOnScreen = () =>
    fire(row(), { isIntersecting: true, boundingClientRect: { bottom: 400 } as DOMRectReadOnly });
  const rowPassed = () =>
    fire(row(), { isIntersecting: false, boundingClientRect: { bottom: -10 } as DOMRectReadOnly });
  const cardShowing = (ratio: number) =>
    fire(sponsors(), { isIntersecting: ratio > 0, intersectionRatio: ratio });

  const corner = () => document.querySelector<HTMLElement>('.corner');
  const onCard = () => sponsors().querySelector<HTMLElement>('.card');
  const figure = () => screen.queryByRole('button', { name: /^Open Lancetta’s panel$/ });

  /** Mounted, a beat later, the row scrolled past: it walks into the corner and stands. */
  const inTheCorner = () => {
    render(<Page />);
    wait(DELAY_MS);
    rowPassed();
    wait(CORNER_IN_MS);
    expect(corner()).toHaveAttribute('data-phase', 'here');
  };

  it('stays away while the one under the bar points at the reading', () => {
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    wait(10_000);
    expect(corner()).toBeNull();
  });

  it('comes to the corner once the row is scrolled past, and leaves when it is back', () => {
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    rowPassed();
    expect(corner()).toHaveAttribute('data-phase', 'arriving');
    wait(CORNER_IN_MS);
    expect(corner()).toHaveAttribute('data-phase', 'here');
    // Past the hero it only rides along.
    expect(screen.queryByText(HERO_LINE)).toBeNull();

    rowOnScreen();
    expect(corner()).toHaveAttribute('data-phase', 'leaving');
    wait(LEAVE_MS);
    expect(corner()).toBeNull();
  });

  it('is the one on screen at the top too, once the panel has been opened', () => {
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    expect(corner()).toBeNull();
    act(() => markPanelOpened());
    expect(corner()).toHaveAttribute('data-phase', 'arriving');
    wait(CORNER_IN_MS);
    expect(corner()).toHaveAttribute('data-phase', 'here');
  });

  it('opens the panel when clicked, and marks itself as one way in', () => {
    inTheCorner();
    fireEvent.click(figure()!);
    expect(opened).toBe(1);
    // The header's outside-click close lets anything carrying this be.
    expect(corner()).toHaveAttribute('data-panel-opener');
  });

  it('lands at once when clicked on its way in', () => {
    render(<Page />);
    wait(DELAY_MS);
    rowPassed();
    fireEvent.click(figure()!);
    expect(corner()).toHaveAttribute('data-phase', 'here');
    expect(opened).toBe(1);
  });

  it('says the sentence of the one under the bar from the corner on a phone, then folds it', () => {
    onAPhone();
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    expect(corner()).toHaveAttribute('data-phase', 'arriving');
    wait(CORNER_IN_MS);
    expect(screen.queryByText(HERO_LINE)).toBeNull();
    wait(HOP_MS);
    expect(screen.getByText(HERO_LINE)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: HERO_LINE }));
    expect(opened).toBe(1);

    wait(HERO_FOLD_MS);
    expect(screen.queryByText(HERO_LINE)).toBeNull();
    expect(corner()).toHaveAttribute('data-phase', 'here');
  });

  it('folds its sentence as soon as the row is scrolled past, or the panel opens', () => {
    onAPhone();
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    wait(CORNER_IN_MS + HOP_MS);
    expect(screen.getByText(HERO_LINE)).toBeInTheDocument();
    rowPassed();
    expect(screen.queryByText(HERO_LINE)).toBeNull();
  });

  it('says nothing on a phone once the panel has been opened', () => {
    onAPhone();
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    act(() => markPanelOpened());
    wait(CORNER_IN_MS + HOP_MS);
    expect(corner()).toHaveAttribute('data-phase', 'here');
    expect(screen.queryByText(HERO_LINE)).toBeNull();
  });

  it('walks while the page scrolls, and stands when it stops', () => {
    inTheCorner();
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(corner()).toHaveAttribute('data-moving');
    wait(STILL_MS);
    expect(corner()).not.toHaveAttribute('data-moving');
  });

  it('goes to the Support card, in the FAQ’s words, and back to the corner when it has gone', () => {
    inTheCorner();
    cardShowing(0.5);
    expect(corner()).toHaveAttribute('data-phase', 'leaving');
    wait(LEAVE_MS);
    expect(corner()).toBeNull();
    expect(onCard()).toHaveAttribute('data-phase', 'arriving');
    wait(CARD_IN_MS);
    expect(onCard()).toHaveAttribute('data-phase', 'here');
    expect(sponsors()).toHaveTextContent(SPONSOR_LINE);

    // Half out of view, it stays: no back and forth at the edge.
    cardShowing(0.1);
    expect(onCard()).toHaveAttribute('data-phase', 'here');

    cardShowing(0);
    wait(LEAVE_MS);
    expect(onCard()).toBeNull();
    expect(corner()).toHaveAttribute('data-phase', 'arriving');
  });

  it('goes from everywhere when dismissed, and stays gone', () => {
    inTheCorner();
    cardShowing(0.5);
    wait(LEAVE_MS + CARD_IN_MS);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(guideMemory.dismissed).toBe(true);
    wait(LEAVE_MS);
    expect(onCard()).toBeNull();
    cardShowing(0);
    rowPassed();
    wait(10_000);
    expect(corner()).toBeNull();
    expect(onCard()).toBeNull();
  });

  it('leaves when the one under the bar is dismissed', () => {
    inTheCorner();
    act(() => dismissGuide());
    wait(LEAVE_MS);
    expect(corner()).toBeNull();
  });

  it('hands the keyboard focus to a control in view rather than the one before it', () => {
    inTheCorner();
    const inView = screen.getByRole('link', { name: 'In view' });
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect(
      this: Element
    ) {
      return (
        this === inView ? { top: 100, bottom: 120, left: 20, right: 200 } : { bottom: -10 }
      ) as DOMRect;
    });
    act(() => figure()!.focus());
    rowOnScreen();
    expect(document.activeElement).toBe(inView);
  });

  it('hands the keyboard focus back when it goes', () => {
    inTheCorner();
    act(() => figure()!.focus());
    rowOnScreen();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'See what it does' }));
  });

  it('is out of reach while it fades out', () => {
    inTheCorner();
    rowOnScreen();
    expect(corner()).toHaveAttribute('inert');
  });

  it('arrives standing, and never walks, for a reader who asked for less motion', () => {
    matching('prefers-reduced-motion');
    render(<Page />);
    wait(DELAY_MS);
    rowPassed();
    expect(corner()).toHaveAttribute('data-phase', 'here');
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(corner()).not.toHaveAttribute('data-moving');
  });
});
