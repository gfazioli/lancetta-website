import { frameIndex } from './frame-index';

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

  it('clamps, and survives an empty stage', () => {
    expect(frameIndex(-5, 3)).toBe(0);
    expect(frameIndex(7, 3)).toBe(2);
    expect(frameIndex(0.5, 0)).toBe(0);
  });
});
