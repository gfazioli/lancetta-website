'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, Container } from '@mantine/core';
import config from '@/config';
import { Logo } from '../Logo/Logo';
import classes from './ProductNav.module.css';

/**
 * The home page's sections, in page order. Every id here is an anchor the page
 * renders; `Welcome.test.tsx` checks that, because a link to an anchor that
 * does not exist scrolls nowhere and nothing reports it.
 */
export const productSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'where', label: 'Where you read it' },
  { id: 'features', label: 'Features' },
  { id: 'costs-nothing', label: 'Costs nothing' },
  { id: 'roadmap', label: 'What’s next' },
  { id: 'faq', label: 'FAQ' },
] as const;

/*
 * The product bar, the way Apple's product pages carry one under the global
 * navigation: the product's name, the sections of this one page, and the one
 * action. It is sticky under Nextra's navbar, which is why the home page sets
 * `--lan-subnav-height` on its wrapper: the pinned gallery and every anchor's
 * scroll margin have to know that two bars, not one, sit above the content.
 *
 * The highlighted link follows the scroll. It is measured on the scroll event
 * against the bar's own bottom edge, so the navbar's height never enters the
 * arithmetic, and it is measured synchronously for the same reason the gallery
 * is: a frame deferred to requestAnimationFrame is a frame a headless render
 * never delivers.
 */
export function ProductNav() {
  const barRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>(productSections[0].id);

  useEffect(() => {
    /*
     * Where Nextra's navbar actually sticks. Its banner is sticky below 48rem
     * and static above it, and the navbar's `top` follows: 0 on a desktop,
     * the banner's height on a phone. The bar, the pinned gallery and every
     * anchor's scroll margin are laid out against that edge, so it is read
     * off the navbar's computed style and published as a custom property,
     * rather than mirrored as a breakpoint that would drift the day Nextra
     * moves its own. Measured 2026-09-18: without it the bar sat at 64px on
     * a phone, straight across the navbar stuck at 60px.
     */
    const root = document.documentElement;
    const navbar = document.querySelector<HTMLElement>('.nextra-navbar');
    const offset = () => {
      const top = navbar ? parseFloat(getComputedStyle(navbar).top) || 0 : 0;
      const value = `${top}px`;
      // Only on change: setting the property re-serialises the style attribute,
      // which the observer below would report, which would set it again.
      if (root.style.getPropertyValue('--lan-navbar-offset') !== value) {
        root.style.setProperty('--lan-navbar-offset', value);
      }
    };
    // Nextra measures its banner with a ResizeObserver and writes the height
    // to the root's style AFTER this effect has run, and the navbar's `top`
    // on a phone is that very property — so the first read here sees 0 and
    // the real value arrives a moment later (measured: "0px" against a navbar
    // stuck at 60px). Watching the root's style attribute catches that write,
    // and the one that follows the banner being dismissed.
    const observer = new MutationObserver(offset);
    observer.observe(root, { attributes: true, attributeFilter: ['style'] });
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
    const resize = () => {
      offset();
      spy();
    };
    offset();
    spy();
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', spy);
      window.removeEventListener('resize', resize);
      root.style.removeProperty('--lan-navbar-offset');
    };
  }, []);

  const released = config.app.released;

  return (
    <nav ref={barRef} aria-label="Lancetta" className={classes.bar}>
      <Container size="lg" className={classes.inner}>
        <Link href="/#overview" className={classes.brand}>
          <Logo size={22} />
          <span className={classes.name}>Lancetta</span>
          <span className={classes.tagline}>Menu-bar quota monitor</span>
        </Link>

        <ul className={classes.links}>
          {productSections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={classes.link}
                aria-current={active === section.id ? 'location' : undefined}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>

        <Button
          component="a"
          href={released ? '/download' : '/docs'}
          size="compact-sm"
          radius="xl"
          px={14}
          className={classes.cta}
        >
          {released ? 'Download' : 'Read the docs'}
        </Button>
      </Container>
    </nav>
  );
}
