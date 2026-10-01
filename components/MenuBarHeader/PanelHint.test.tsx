import type { ComponentProps } from 'react';
import { act, fireEvent, render, screen } from '@/test-utils';
import { dismissGuide, guideMemory } from '../Mascot/guide';
import { DELAY_MS, LEAVE_MS, PanelHint, WALK_MS } from './PanelHint';

type Props = ComponentProps<typeof PanelHint>;

/**
 * `update` re-renders in place, never remounts (`test-utils/render.test.tsx`):
 * here a remount is a reload, the one thing these tests tell apart. A reload
 * also starts `guide.ts` afresh, which `reload` does by hand, since jest keeps
 * the module between mounts.
 */
function mount(props: Props) {
  const view = render(<PanelHint {...props} />);
  return { ...view, update: (next: Props) => view.rerender(<PanelHint {...next} />) };
}

function reload() {
  guideMemory.dismissed = false;
  guideMemory.panelOpened = false;
}

describe('PanelHint', () => {
  beforeEach(() => {
    window.localStorage.clear();
    reload();
    jest.useFakeTimers();
  });

  afterEach(() => jest.useRealTimers());

  const noop = () => undefined;
  const home = { enabled: true, open: false, onOpen: noop };
  const bubble = () => screen.queryByText(/opens the real panel/);
  const walker = () => screen.queryByRole('button', { name: /open lancetta/i });
  const wait = (ms: number) => act(() => jest.advanceTimersByTime(ms));

  it('walks in, then points and says what the reading does', () => {
    mount(home);
    expect(walker()).toBeNull();
    wait(1300);
    expect(walker()).toBeInTheDocument();
    expect(bubble()).toBeNull();
    wait(2500);
    expect(bubble()).toBeInTheDocument();
  });

  it('comes back on every load, even in a browser that once opened the panel', () => {
    // The key the hint used to write until 2026-09-24: every browser that
    // opened the panel before then still carries it.
    window.localStorage.setItem('lancetta.panelDemo.opened', '1');
    const first = mount(home);
    wait(4000);
    first.update({ ...home, open: true });
    wait(400);
    first.unmount();

    reload();
    mount(home);
    wait(4000);
    expect(bubble()).toBeInTheDocument();
  });

  it('stays away from every page but the one it is enabled on', () => {
    mount({ ...home, enabled: false });
    wait(10_000);
    expect(walker()).toBeNull();
  });

  it('leaves when the panel opens, and stays gone for the rest of the load', () => {
    const { update } = mount(home);
    wait(4000);
    expect(bubble()).toBeInTheDocument();
    update({ ...home, open: true });
    expect(guideMemory.panelOpened).toBe(true);
    wait(400);
    expect(walker()).toBeNull();

    // Off to the docs and back through a link: the header never unmounted.
    update({ ...home, enabled: false });
    update(home);
    wait(10_000);
    expect(walker()).toBeNull();
  });

  it('stays gone for the rest of the load once dismissed, everywhere', () => {
    const { update } = mount(home);
    wait(4000);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(guideMemory.dismissed).toBe(true);
    wait(400);
    expect(walker()).toBeNull();

    update({ ...home, enabled: false });
    update(home);
    wait(10_000);
    expect(walker()).toBeNull();
  });

  it('leaves when the character is dismissed in the corner or on the card', () => {
    mount(home);
    wait(4000);
    act(() => dismissGuide());
    wait(LEAVE_MS);
    expect(walker()).toBeNull();
  });

  it('comes back on the way home if it was never answered', () => {
    const { update } = mount(home);
    wait(4000);
    expect(bubble()).toBeInTheDocument();

    update({ ...home, enabled: false });
    expect(walker()).toBeNull();
    update(home);
    wait(4000);
    expect(bubble()).toBeInTheDocument();
  });

  describe('with the hero’s row of buttons to watch', () => {
    // jsdom has no IntersectionObserver. This one hands the test the callback
    // of whichever observer watches the row, to say when it is in view.
    let watch: IntersectionObserverCallback | undefined;

    beforeEach(() => {
      watch = undefined;
      globalThis.IntersectionObserver = class {
        constructor(callback: IntersectionObserverCallback) {
          watch = callback;
        }
        observe() {}
        disconnect() {}
      } as unknown as typeof IntersectionObserver;
      const row = document.createElement('div');
      row.setAttribute('data-guide-anchor', '');
      document.body.append(row);
    });

    afterEach(() => {
      delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
      document.querySelector('[data-guide-anchor]')?.remove();
    });

    const row = (isIntersecting: boolean) =>
      act(() =>
        watch!(
          [{ isIntersecting } as IntersectionObserverEntry],
          {} as unknown as IntersectionObserver
        )
      );

    it('steps away once the row is scrolled past, and comes back standing', () => {
      mount(home);
      wait(DELAY_MS);
      row(true);
      wait(WALK_MS);
      expect(bubble()).toBeInTheDocument();

      row(false);
      expect(walker()?.closest('[data-phase]')).toHaveAttribute('data-phase', 'leaving');
      wait(LEAVE_MS);
      expect(walker()).toBeNull();

      // Back up: pointing at once, no second walk.
      row(true);
      expect(walker()?.closest('[data-phase]')).toHaveAttribute('data-phase', 'pointing');
      expect(bubble()).toBeInTheDocument();
    });

    it('does not come on a page reloaded below the row, until the reader scrolls back up', () => {
      mount(home);
      wait(DELAY_MS);
      row(false);
      wait(10_000);
      expect(walker()).toBeNull();

      row(true);
      expect(walker()?.closest('[data-phase]')).toHaveAttribute('data-phase', 'walking');
    });

    it('does not come back to the row once the panel has been opened', () => {
      const { update } = mount(home);
      wait(DELAY_MS);
      row(true);
      wait(WALK_MS);
      update({ ...home, open: true });
      wait(LEAVE_MS);
      row(false);
      row(true);
      wait(10_000);
      expect(walker()).toBeNull();
    });
  });
});
