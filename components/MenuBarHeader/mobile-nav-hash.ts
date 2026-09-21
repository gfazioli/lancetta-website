/**
 * Does this click need the mobile navigation closed by hand?
 *
 * Nextra closes its mobile nav on a ROUTE CHANGE, and a hash on the page you
 * are already on is not one. So on the home page every entry in `app/_meta.tsx`
 * that points at an anchor — `features` (`/#features`) and `sponsor`
 * (`#sponsors`) — scrolls the page correctly and then leaves the panel sitting
 * over it, which from the reader's side is a tap that did nothing.
 *
 * Measured on lancetta.app 2026-09-21 at 390x844, by driving a real click
 * through the DevTools protocol: `scrollY` went 0 to 7269 with `#features` at
 * 7375, `location.hash` became `#features` — and `<html>` still carried
 * `x:max-md:overflow-hidden` with `aside.nextra-mobile-nav` still 358x32 on
 * screen. The navigation was never the broken half.
 *
 * The predicate is deliberately narrow: SAME origin, SAME pathname, and a hash.
 * A different pathname is Nextra's own case and it handles it; anything that is
 * not an anchor inside the mobile nav is somebody else's click. In particular
 * the expandable entries ("Docs", "Support") must keep working, and closing the
 * panel when one of them is tapped would make the menu unusable — which is why
 * this asks what the link DOES rather than merely where it sits.
 */
export function isSamePageHashInMobileNav(
  target: EventTarget | null,
  currentHref: string
): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  const anchor = target.closest('a[href]');
  if (!anchor || !anchor.closest('.nextra-mobile-nav')) {
    return false;
  }
  const href = anchor.getAttribute('href');
  if (!href) {
    return false;
  }
  try {
    const here = new URL(currentHref);
    const there = new URL(href, currentHref);
    return there.origin === here.origin && there.pathname === here.pathname && there.hash !== '';
  } catch {
    // A malformed href is not a same-page hash, and an exception here would
    // take the whole document click listener with it.
    return false;
  }
}
