import { act, render, screen } from '@/test-utils';
import { hasOpenedPanel, OPENED_KEY, rememberPanelOpened } from './panel-hint';
import { PanelHint } from './PanelHint';

describe('what the hint remembers', () => {
  beforeEach(() => window.localStorage.clear());

  it('has nothing to remember until the panel is opened', () => {
    expect(hasOpenedPanel()).toBe(false);
    rememberPanelOpened();
    expect(window.localStorage.getItem(OPENED_KEY)).toBe('1');
    expect(hasOpenedPanel()).toBe(true);
  });

  it('treats storage that throws as "not opened", and never throws itself', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    };
    expect(hasOpenedPanel(broken)).toBe(false);
    expect(() => rememberPanelOpened(broken)).not.toThrow();
    expect(hasOpenedPanel(undefined)).toBe(false);
  });
});

describe('PanelHint', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => jest.useRealTimers());

  const noop = () => undefined;
  const bubble = () => screen.queryByText(/opens the real panel/);

  it('walks in, then points and says what the reading does', () => {
    render(<PanelHint enabled open={false} onOpen={noop} onDismiss={noop} />);
    expect(screen.queryByRole('button', { name: /open lancetta/i })).toBeNull();
    act(() => jest.advanceTimersByTime(1300));
    expect(screen.getByRole('button', { name: /open lancetta/i })).toBeInTheDocument();
    expect(bubble()).toBeNull();
    act(() => jest.advanceTimersByTime(2500));
    expect(bubble()).toBeInTheDocument();
  });

  it('never comes back once this browser has opened the panel', () => {
    rememberPanelOpened();
    render(<PanelHint enabled open={false} onOpen={noop} onDismiss={noop} />);
    act(() => jest.advanceTimersByTime(10_000));
    expect(screen.queryByRole('button', { name: /open lancetta/i })).toBeNull();
  });

  it('stays away from every page but the one it is enabled on', () => {
    render(<PanelHint enabled={false} open={false} onOpen={noop} onDismiss={noop} />);
    act(() => jest.advanceTimersByTime(10_000));
    expect(screen.queryByRole('button', { name: /open lancetta/i })).toBeNull();
  });

  it('leaves when the panel opens', () => {
    const { rerender } = render(<PanelHint enabled open={false} onOpen={noop} onDismiss={noop} />);
    act(() => jest.advanceTimersByTime(4000));
    expect(bubble()).toBeInTheDocument();
    rerender(<PanelHint enabled open onOpen={noop} onDismiss={noop} />);
    act(() => jest.advanceTimersByTime(400));
    expect(screen.queryByRole('button', { name: /open lancetta/i })).toBeNull();
  });
});
