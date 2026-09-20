import { render, screen } from '@/test-utils';
import { productSections } from '../MenuBarHeader/sections';
import { Welcome } from './Welcome';

describe('Welcome component', () => {
  it('renders this site’s hero headline', () => {
    render(<Welcome />);
    // Asserted through the h1's textContent rather than getByText: the third
    // line is rendered by TextAnimate, which splits it per character, so no
    // single text node holds the whole line. `getByText` matches an element's
    // OWN text, and this headline has none that spans all three lines — the
    // sibling site's version of this test only passes there because half its
    // headline sits outside the animated span.
    //
    // All three lines are asserted, not just the first, because the first is
    // the only one a competitor could also claim. The headline said "Every
    // agent's quota. One glance. Costs nothing." until 2026-09-20, and every
    // word of that was equally true of the free, open-source alternative. If
    // this ever goes back to a generic promise, this test is what says so.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Every agent');
    expect(heading.textContent).toContain('Every number, dated.');
    expect(heading.textContent).toContain('Every stray process.');
  });

  it('answers what it is, what it does and what it costs before the first scroll', () => {
    render(<Welcome />);
    for (const label of ['What it is', 'What it does', 'What it costs']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders an anchor for every section the menu bar can link to', () => {
    // A bar link to an id nobody renders scrolls nowhere, and nothing reports
    // it: the list and the page are kept honest against each other here. The
    // header shows a subset; this asserts the whole contract, so an id can be
    // promoted into the bar without first discovering it does not exist.
    const { container } = render(<Welcome />);
    for (const section of productSections) {
      expect(container.querySelector(`#${section.id}`)).not.toBeNull();
    }
  });
});
