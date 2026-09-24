import type { ComponentProps } from 'react';
import { act, fireEvent, render, screen } from '@/test-utils';
import { PanelHint } from './PanelHint';

type Props = ComponentProps<typeof PanelHint>;

/**
 * `render` from test-utils wraps its tree in a fragment and a bare `rerender`
 * does not, so the first rerender REMOUNTS the component (measured: two mounts
 * for three renders). Here a remount is a reload — the one thing these tests
 * tell apart — so every later render keeps the first one's shape.
 */
function mount(props: Props) {
  const view = render(<PanelHint {...props} />);
  const update = (next: Props) =>
    view.rerender(
      <>
        <PanelHint {...next} />
      </>
    );
  return { ...view, update };
}

describe('PanelHint', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => jest.useRealTimers());

  const noop = () => undefined;
  const home = { enabled: true, open: false, onOpen: noop };
  const bubble = () => screen.queryByText(/opens the real panel/);
  const walker = () => screen.queryByRole('button', { name: /open lancetta/i });

  it('walks in, then points and says what the reading does', () => {
    mount(home);
    expect(walker()).toBeNull();
    act(() => jest.advanceTimersByTime(1300));
    expect(walker()).toBeInTheDocument();
    expect(bubble()).toBeNull();
    act(() => jest.advanceTimersByTime(2500));
    expect(bubble()).toBeInTheDocument();
  });

  it('comes back on every load, even in a browser that once opened the panel', () => {
    // The key the hint used to write until 2026-09-24: every browser that
    // opened the panel before then still carries it.
    window.localStorage.setItem('lancetta.panelDemo.opened', '1');
    const first = mount(home);
    act(() => jest.advanceTimersByTime(4000));
    first.update({ ...home, open: true });
    act(() => jest.advanceTimersByTime(400));
    first.unmount();

    mount(home);
    act(() => jest.advanceTimersByTime(4000));
    expect(bubble()).toBeInTheDocument();
  });

  it('stays away from every page but the one it is enabled on', () => {
    mount({ ...home, enabled: false });
    act(() => jest.advanceTimersByTime(10_000));
    expect(walker()).toBeNull();
  });

  it('leaves when the panel opens, and stays gone for the rest of the load', () => {
    const { update } = mount(home);
    act(() => jest.advanceTimersByTime(4000));
    expect(bubble()).toBeInTheDocument();
    update({ ...home, open: true });
    act(() => jest.advanceTimersByTime(400));
    expect(walker()).toBeNull();

    // Off to the docs and back through a link: the header never unmounted.
    update({ ...home, enabled: false });
    update(home);
    act(() => jest.advanceTimersByTime(10_000));
    expect(walker()).toBeNull();
  });

  it('stays gone for the rest of the load once dismissed', () => {
    const { update } = mount(home);
    act(() => jest.advanceTimersByTime(4000));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    act(() => jest.advanceTimersByTime(400));
    expect(walker()).toBeNull();

    update({ ...home, enabled: false });
    update(home);
    act(() => jest.advanceTimersByTime(10_000));
    expect(walker()).toBeNull();
  });

  it('comes back on the way home if it was never answered', () => {
    const { update } = mount(home);
    act(() => jest.advanceTimersByTime(4000));
    expect(bubble()).toBeInTheDocument();

    update({ ...home, enabled: false });
    expect(walker()).toBeNull();
    update(home);
    act(() => jest.advanceTimersByTime(4000));
    expect(bubble()).toBeInTheDocument();
  });
});
