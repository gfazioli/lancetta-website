import { render, screen } from '@/test-utils';
import { frameIndex, ScrollGallery } from './ScrollGallery';

const shots = [
  { src: '/a.png', alt: 'A', title: 'First', caption: 'one' },
  { src: '/b.png', alt: 'B', title: 'Second', caption: 'two' },
  { src: '/c.png', alt: 'C', title: 'Third', caption: 'three' },
];

describe('frameIndex', () => {
  // The boundaries are the whole point: the first frame owns the top of the
  // track, the last frame owns progress 1.0 rather than falling off the end,
  // and nothing outside [0, 1] can pick a frame that does not exist.
  it('maps progress onto frames with the last frame owning the end', () => {
    expect(frameIndex(0, 3)).toBe(0);
    expect(frameIndex(0.33, 3)).toBe(0);
    expect(frameIndex(0.34, 3)).toBe(1);
    expect(frameIndex(0.99, 3)).toBe(2);
    expect(frameIndex(1, 3)).toBe(2);
  });

  it('clamps, and survives an empty gallery', () => {
    expect(frameIndex(-5, 3)).toBe(0);
    expect(frameIndex(7, 3)).toBe(2);
    expect(frameIndex(0.5, 0)).toBe(0);
  });
});

describe('ScrollGallery', () => {
  it('renders every frame, with the first one active, before any scrolling', () => {
    render(<ScrollGallery shots={shots} eyebrow="Where" title="Three places" />);
    // jsdom has no layout, so getBoundingClientRect answers zeros, the travel is
    // zero, and the measurement bails out — which leaves the initial state, and
    // the initial state has to be the first frame or the page opens on nothing.
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Three places');
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    // Every frame is in the DOM (they cross-fade in place, nothing is unmounted).
    expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(3);
  });
});
