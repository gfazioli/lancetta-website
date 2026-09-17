import { render, screen } from '@/test-utils';
import { Welcome } from './Welcome';

describe('Welcome component', () => {
  it('renders this site’s hero headline', () => {
    render(<Welcome />);
    // Asserted through the h1's textContent rather than getByText: the second
    // half ("Costs nothing.") is rendered by TextAnimate, which splits it per
    // character, so no single text node holds the whole line. `getByText`
    // matches an element's OWN text, and this headline has none that spans
    // both halves — the sibling site's version of this test only passes there
    // because half its headline sits outside the animated span.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Every agent');
    expect(heading.textContent).toContain('Costs nothing.');
  });
});
