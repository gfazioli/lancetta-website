import { render, screen } from '@/test-utils';
import { productSections } from '../ProductNav/ProductNav';
import { Welcome } from './Welcome';

describe('Welcome component', () => {
  it('renders this site’s hero headline', () => {
    render(<Welcome />);
    // Asserted through the h1's textContent rather than getByText: the third
    // line ("Costs nothing.") is rendered by TextAnimate, which splits it per
    // character, so no single text node holds the whole line. `getByText`
    // matches an element's OWN text, and this headline has none that spans
    // all three lines — the sibling site's version of this test only passes
    // there because half its headline sits outside the animated span.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Every agent');
    expect(heading.textContent).toContain('Costs nothing.');
  });

  it('answers what it is, what it does and what it costs before the first scroll', () => {
    render(<Welcome />);
    for (const label of ['What it is', 'What it does', 'What it costs']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders an anchor for every section the product bar links to', () => {
    // A bar link to an id nobody renders scrolls nowhere, and nothing reports
    // it: the list and the page are kept honest against each other here.
    const { container } = render(<Welcome />);
    for (const section of productSections) {
      expect(container.querySelector(`#${section.id}`)).not.toBeNull();
    }
  });
});
