'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { setMenu } from 'nextra-theme-docs';
import { Search } from 'nextra/components';
import { IconMenu2 } from '@tabler/icons-react';
import config from '@/config';
import { Logo } from '../Logo/Logo';
import { MenuBarReading } from './MenuBarReading';
import { isSamePageHashInMobileNav } from './mobile-nav-hash';
import { panelDemo } from './panel-demo';
import { PanelDemo } from './PanelDemo';
import { PanelHint } from './PanelHint';
import { productSections } from './sections';
import classes from './MenuBarHeader.module.css';

/**
 * The site's one bar, and it is a picture of where the product lives.
 *
 * A macOS menu bar, not a web navbar: the mark and the name on the left, the
 * menus beside them, the status items on the right — and the rightmost of
 * those is Lancetta's own, rebuilt (see `MenuBarReading`). It is attached to
 * the top edge, narrower than the page, and rounded at the two bottom corners,
 * so it reads as an object the page hangs from rather than a strip of chrome.
 *
 * It REPLACES Nextra's navbar (`app/layout.tsx` passes this into the `navbar`
 * slot), which means two things Nextra's own bar used to carry have to be
 * carried here or they are simply gone: the search, and the hamburger that
 * opens the sidebar on a phone. `setMenu` is the same store Nextra's own
 * button writes, so the sidebar it opens is Nextra's.
 */

/**
 * What the bar shows. A subset of `productSections` plus the docs: six menus
 * in a bar this size stop reading as menus and start reading as a toolbar.
 * The hrefs are absolute (`/#features`, not `#features`) because this bar is
 * on every page, and a bare fragment from inside the docs scrolls nowhere.
 */
const menus = [
  { id: 'overview', href: '/#overview', label: 'Overview' },
  { id: 'features', href: '/#features', label: 'Features' },
  { id: null, href: '/docs', label: 'Docs' },
  { id: 'roadmap', href: '/#roadmap', label: 'What’s next' },
  { id: 'faq', href: '/#faq', label: 'FAQ' },
] as const;

export function MenuBarHeader() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const barRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const readingRef = useRef<HTMLButtonElement>(null);

  // The bar's entrance is a CSS animation now (`bar-arrive` in the stylesheet),
  // not a `data-ready` flag flipped from here. It used to be an effect, which
  // made the bar's RESTING state invisible: a reader whose script never lands
  // got no header at all. See the comment on `.bar`.

  /*
   * Close Nextra's mobile navigation when one of ITS entries points at an
   * anchor on the page already open.
   *
   * Nextra closes that panel on a route change, and a hash is not one — so on
   * the home page, tapping "Features" scrolled the page correctly and left the
   * panel over it, which is a tap that did nothing as far as the reader is
   * concerned. Reported 2026-09-21 and measured at 390x844 before this
   * existed: `scrollY` 0 to 7269 with the anchor at 7375, `location.hash`
   * `#features`, and `<html>` still carrying `x:max-md:overflow-hidden`.
   *
   * On `document` rather than on the panel: the panel is Nextra's, rendered
   * outside this component, and it comes and goes. `setMenu` is the same store
   * the burger writes, so nothing here duplicates its state.
   */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isSamePageHashInMobileNav(event.target, window.location.href)) {
        setMenu(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /*
   * Which section the reader is in, measured against the bar's own bottom
   * edge, so the bar's height never enters the arithmetic. Measured ON the
   * scroll event rather than a frame later, for the reason the hero's stage
   * gives: a frame deferred to requestAnimationFrame is a frame a headless
   * render never delivers, and the site's own snapshot tool is headless.
   */
  useEffect(() => {
    if (!onHome) {
      setActive(null);
      return undefined;
    }
    const spy = () => {
      const bar = barRef.current;
      if (!bar) {
        return;
      }
      const edge = bar.getBoundingClientRect().bottom + 8;
      let current: string = productSections[0].id;
      for (const section of productSections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= edge) {
          current = section.id;
        }
      }
      setActive(current);
    };
    spy();
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
    return () => {
      window.removeEventListener('scroll', spy);
      window.removeEventListener('resize', spy);
    };
  }, [onHome]);

  /*
   * The panel closes the way the app's does: a click anywhere else unless it is
   * pinned, Escape always, and — the page's own two cases — a change of page,
   * and the page SCROLLING, pinned or not (user, 2026-09-23: *"quando l'utente
   * scrolla la pagina, la finestrella si dovrebbe chiudere comunque"*). A
   * menu-bar panel is not part of the page, and one that stays put while the
   * page slides under it reads as stuck. The 24px is for trackpad jitter, not
   * for scrolling. The click on the reading itself is left to its `onClick`,
   * or it would close here and reopen there.
   */
  useEffect(() => {
    if (!panelOpen) {
      return undefined;
    }
    panelRef.current?.focus({ preventScroll: true });
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || readingRef.current?.contains(target)) {
        return;
      }
      if (!pinned) {
        setPanelOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanelOpen(false);
        readingRef.current?.focus({ preventScroll: true });
      }
    };
    const openedAt = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAt) > 24) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [panelOpen, pinned]);

  useEffect(() => {
    setPanelOpen(false);
  }, [pathname]);

  const released = config.app.released;

  return (
    <div className={classes.dock}>
      <header ref={barRef} className={`lan-menubar ${classes.bar}`} aria-label="Lancetta">
        <div className={classes.left}>
          <Link href="/" className={classes.brand} aria-label="Lancetta, home">
            <Logo size={20} />
            <span className={classes.brandName}>Lancetta</span>
          </Link>

          <nav className={classes.menus} aria-label="Sections">
            {menus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className={classes.menu}
                aria-current={menu.id && active === menu.id ? 'location' : undefined}
              >
                {menu.label}
              </Link>
            ))}
          </nav>
        </div>

        {/*
          THE CENTRE COLUMN, and the position is load-bearing rather than
          taste: the hero's first frame is this menu dropping open under the
          bar, so it hangs from the bar's centre line. It is also where the
          notch sits on the Mac this app was drawn for — which is what the
          second frame is about.
        */}
        <MenuBarReading
          open={panelOpen}
          onToggle={() => setPanelOpen((open) => !open)}
          controls="lancetta-panel-demo"
          buttonRef={readingRef}
        />

        <div className={classes.status}>
          <div className={classes.search}>
            <Search />
          </div>
          <Link href={released ? '/download' : '/docs'} className={classes.cta}>
            {released ? 'Download' : 'Read the docs'}
          </Link>
          {/*
            Nextra's own hamburger lived in the navbar this component replaced.
            `setMenu` is the store it wrote, so the sidebar that opens is
            Nextra's own — nothing here duplicates it.
          */}
          <button
            type="button"
            className={classes.burger}
            aria-label="Menu"
            onClick={() => setMenu((previous) => !previous)}
          >
            <IconMenu2 size={18} />
          </button>
        </div>
      </header>

      <PanelHint enabled={onHome} open={panelOpen} onOpen={() => setPanelOpen(true)} />

      {panelOpen && (
        <div className={classes.panelSlot}>
          <PanelDemo
            id="lancetta-panel-demo"
            state={panelDemo}
            pinned={pinned}
            onPin={setPinned}
            onClose={() => setPanelOpen(false)}
            panelRef={panelRef}
          />
          <p className={classes.panelNote}>
            Invented numbers. The buttons open the page that explains them.
          </p>
        </div>
      )}
    </div>
  );
}
