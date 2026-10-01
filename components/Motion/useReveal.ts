'use client';

import { useEffect, useRef, useState } from 'react';

interface RevealOptions {
  /** Share of the element that has to be on screen. */
  threshold?: number;
  /** Shrinks the viewport's bottom edge, so a reveal starts where the eye already is. */
  rootMargin?: string;
  /**
   * `'scroll'` (the default) reveals on the way into view. `'mount'` arms at
   * once and reveals two frames later, wherever the element is: for something
   * only the client ever mounts, like the copy of the panel, which opens on a
   * click and whose lower rows a short screen cannot scroll to without closing
   * it. Never for markup the server sends: that would paint the starting pose.
   */
  on?: 'scroll' | 'mount';
}

type RevealState = 'rest' | 'armed' | 'revealed';

/**
 * Three states, and nothing is hidden in the first. At REST the element is
 * where the layout put it: that is the served HTML, and it is what stays when
 * the scripts never run -- a blocked chunk, a runtime error on an old iPad --
 * so a failure costs the motion and never the content. Once mounted, an element
 * that is entirely off screen is ARMED, parked in its starting pose where
 * nobody sees it park, and REVEALED the first time it comes into view. What is
 * on screen when the page mounts is never armed: it plays its entrance from
 * the first paint by CSS alone (Motion.module.css), so it moves where the
 * reader is already looking, without waiting for this.
 *
 * One-shot: scrolling back up never replays a section. Where there is no
 * IntersectionObserver (jsdom, very old browsers) nothing is ever armed.
 *
 * `threshold` is 0 by default: the bottom margin already starts a reveal a
 * little inside the viewport, and any share above 0 is a height some scope can
 * never reach -- at 0.15, one taller than about six viewports stays hidden for
 * good, which the FAQ is at 500% zoom.
 */
export function useReveal<T extends Element>({
  threshold = 0,
  rootMargin = '0px 0px -8% 0px',
  on = 'scroll',
}: RevealOptions = {}) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>(on === 'mount' ? 'armed' : 'rest');

  useEffect(() => {
    const el = ref.current;
    if (!el || state === 'revealed') {
      return;
    }
    if (on === 'mount') {
      // The first frame paints the starting pose and the second leaves it: a
      // transition needs a "before" that was actually rendered.
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setState('revealed'));
      });
      return () => cancelAnimationFrame(frame);
    }
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    if (state === 'rest') {
      const { top, bottom } = el.getBoundingClientRect();
      if (bottom <= 0 || top >= window.innerHeight) {
        setState('armed');
      }
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState('revealed');
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [state, on, threshold, rootMargin]);

  return { ref, armed: state !== 'rest', revealed: state === 'revealed' };
}
