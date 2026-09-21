import { isSamePageHashInMobileNav } from './mobile-nav-hash';

/**
 * The cases are the entries of `app/_meta.tsx` as they behave on the home page,
 * plus the two that must NOT close the panel. A predicate that only ever
 * answered true would close the menu on the expandable entries and make it
 * unusable, so both verdicts are driven here rather than only the one the fix
 * is about.
 */
function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body;
}

const HOME = 'https://lancetta.app/';

describe('isSamePageHashInMobileNav', () => {
  it('closes the panel for a hash on the page you are already on', () => {
    // `features` in app/_meta.tsx. This is the reported defect: the scroll
    // happened, the panel stayed.
    const body = mount(
      '<aside class="nextra-mobile-nav"><a href="/#features">Features</a></aside>'
    );
    expect(isSamePageHashInMobileNav(body.querySelector('a'), HOME)).toBe(true);
  });

  it('closes it for a bare fragment too', () => {
    // `sponsor` inside the Support menu is written `#sponsors`, with no path.
    const body = mount('<aside class="nextra-mobile-nav"><a href="#sponsors">Sponsor</a></aside>');
    expect(isSamePageHashInMobileNav(body.querySelector('a'), HOME)).toBe(true);
  });

  it('resolves a click on something INSIDE the link', () => {
    // Two of these entries render an icon and a label inside a Group, so the
    // event target is never the anchor itself.
    const body = mount(
      '<aside class="nextra-mobile-nav"><a href="#sponsors"><span><svg></svg>Sponsor</span></a></aside>'
    );
    expect(isSamePageHashInMobileNav(body.querySelector('svg'), HOME)).toBe(true);
  });

  it('leaves a real route change to Nextra', () => {
    // `/docs/roadmap` changes the pathname, which is the case Nextra already
    // closes on. Closing it here as well would be harmless but untrue, and the
    // predicate is the documentation.
    const body = mount(
      '<aside class="nextra-mobile-nav"><a href="/docs/roadmap">What’s next</a></aside>'
    );
    expect(isSamePageHashInMobileNav(body.querySelector('a'), HOME)).toBe(false);
  });

  it('does not close on an entry that only expands', () => {
    // "Docs" and "Support" carry a chevron and open a submenu. Closing the
    // panel on those would make the menu impossible to use, which is the
    // failure the narrow predicate exists to avoid.
    const body = mount(
      '<aside class="nextra-mobile-nav"><button type="button">Support</button></aside>'
    );
    expect(isSamePageHashInMobileNav(body.querySelector('button'), HOME)).toBe(false);
  });

  it('ignores an external link', () => {
    const body = mount(
      '<aside class="nextra-mobile-nav"><a href="https://gfazioli.github.io/#x">About</a></aside>'
    );
    expect(isSamePageHashInMobileNav(body.querySelector('a'), HOME)).toBe(false);
  });

  it('ignores the same link outside the mobile nav', () => {
    // The header renders its own "Features" at every width and hides it with
    // CSS below 75em. It is in the DOM during the whole of this, and the first
    // version of the probe that found this defect clicked THAT one and
    // reported a clean scroll — a check that measured the wrong element.
    const body = mount('<header><a href="/#features">Features</a></header>');
    expect(isSamePageHashInMobileNav(body.querySelector('a'), HOME)).toBe(false);
  });

  it('ignores a link with no hash at all', () => {
    const body = mount('<aside class="nextra-mobile-nav"><a href="/">Home</a></aside>');
    expect(isSamePageHashInMobileNav(body.querySelector('a'), HOME)).toBe(false);
  });

  it('survives a malformed href instead of taking the listener down', () => {
    const body = mount('<aside class="nextra-mobile-nav"><a href="http://">broken</a></aside>');
    expect(isSamePageHashInMobileNav(body.querySelector('a'), HOME)).toBe(false);
  });
});
