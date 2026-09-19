import { render, screen } from '@/test-utils';
import config from '@/config';
import { ReleaseNotes } from './ReleaseNotes';
import { useReleaseNotes } from './use-release-notes';

// The hook is the network; the component is the three screens. Mocking the hook
// is what lets the EMPTY screen be exercised at all -- the defect this file
// exists for was a page that could not tell "no releases" from "still loading",
// and a test that only ever fed it releases would have passed on the broken code.
jest.mock('./use-release-notes', () => ({
  useReleaseNotes: jest.fn(),
}));

// The MDX body renderer pulls in nextra's runtime, which jsdom cannot load and the
// empty and loading screens never reach. A stub keeps the list screen renderable.
jest.mock('nextra/mdx-remote', () => ({ MDXRemote: () => null }), { virtual: true });
jest.mock('../../mdx-components', () => ({ useMDXComponents: () => ({}) }));

const mocked = useReleaseNotes as jest.MockedFunction<typeof useReleaseNotes>;

describe('ReleaseNotes', () => {
  it('shows the skeleton while the list is not final', () => {
    mocked.mockReturnValue({ data: [], error: null, isLoading: false, ready: false });
    render(<ReleaseNotes />);
    expect(screen.getByText('Loading releases...')).toBeInTheDocument();
  });

  it('says so when the list is final and empty, instead of loading forever', () => {
    mocked.mockReturnValue({ data: [], error: null, isLoading: false, ready: true });
    render(<ReleaseNotes />);
    expect(screen.queryByText('Loading releases...')).not.toBeInTheDocument();
    // The empty screen has two honest wordings: "not yet" before the first
    // release, "no notes yet" after it. Keyed off the config, like the screen.
    const empty = config.app.released ? /no release notes yet/i : /nothing released yet/i;
    expect(screen.getByText(empty)).toBeInTheDocument();
  });

  it('shows a release whose body would not compile, as plain text', () => {
    mocked.mockReturnValue({
      data: [
        {
          id: 1,
          tag_name: 'v0.3.3',
          displayDate: 'September 18, 2026',
          body: null,
          rawBody: 'quoting { code = "-32600" } verbatim',
        } as any,
      ],
      error: null,
      isLoading: false,
      ready: true,
    });
    render(<ReleaseNotes />);
    expect(screen.getByText(/quoting \{ code = "-32600" \} verbatim/)).toBeInTheDocument();
    expect(screen.queryByText('Loading releases...')).not.toBeInTheDocument();
  });

  it('reports an error rather than a skeleton', () => {
    mocked.mockReturnValue({ data: [], error: 'boom', isLoading: false, ready: false });
    render(<ReleaseNotes />);
    expect(screen.getByText('Failed to load releases')).toBeInTheDocument();
    expect(screen.queryByText('Loading releases...')).not.toBeInTheDocument();
  });
});
