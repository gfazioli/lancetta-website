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
    // All three lines are asserted, not just the first, and each revision of
    // this list has been a change of POSITION rather than of wording:
    //
    //   until 2026-09-20  "Every agent's quota. One glance. Costs nothing."
    //                     every word equally true of the free alternative
    //   until 2026-09-22  "Every agent's quota. Every number, dated. Every
    //                     stray process." — an inventory: three things the app
    //                     HOLDS, with the reader doing the reasoning
    //   now               three things the app ANSWERS
    //
    // So this is not a copy test, it is the guard on the thesis. Each line has
    // to name something that SHIPS: "what you can use" is a model's own weekly
    // window (v0.6), "how long it lasts" the pace line (v0.4), "when it comes
    // back" the reset on every bar and the alert when a window reopens (v0.5).
    // If a line ever describes when to START, or anything learnt from an
    // average across days, it has outrun the app and this test is what says so.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('What you can use.');
    expect(heading.textContent).toContain('How long it lasts.');
    expect(heading.textContent).toContain('When it comes back.');
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
