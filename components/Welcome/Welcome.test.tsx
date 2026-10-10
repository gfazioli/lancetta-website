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
    //   until 2026-10-10  "What you can use. How long it lasts. When it comes
    //                     back." — three things the app ANSWERS
    //   now               the DECISIONS, and that the app makes them with
    //                     you (user, 2026-10-10: Lancetta is not there to show
    //                     consumption and the time to a reset, but how and
    //                     when to use the agents)
    //
    // So this is not a copy test, it is the guard on the thesis. Each line has
    // to name something that SHIPS: pushing on is the "room" suggestion,
    // slowing down "stop" and "week", switching agents the step that names the
    // other agent while it has room (all in 0.50.0, `Guidance.swift`).
    // If a line ever describes when to START, or anything learnt from an
    // average across days, it has outrun the app and this test is what says so.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Push on, slow down,');
    expect(heading.textContent).toContain('or switch agents.');
    expect(heading.textContent).toContain('Lancetta tells you when.');
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
