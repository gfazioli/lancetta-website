/*
 * The two marks the app draws beside a reading, at menu-bar size.
 *
 * Stylisations, not the vendors' artwork: a twelve-ray star for Claude and a
 * six-lobe knot for Codex, each drawn to read at 13px the way the app's own
 * marks do. The app renders the real vector data; this page only needs the
 * SHAPE to be recognisable beside a percentage, and a site should not ship
 * someone else's logo file to decorate a mock-up of its own chrome.
 */

export function ClaudeMark({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M 12.0 0.6 L 12.62 9.68 L 17.7 2.13 L 13.7 10.3 L 21.87 6.3 L 14.32 11.38 L 23.4 12.0 L 14.32 12.62 L 21.87 17.7 L 13.7 13.7 L 17.7 21.87 L 12.62 14.32 L 12.0 23.4 L 11.38 14.32 L 6.3 21.87 L 10.3 13.7 L 2.13 17.7 L 9.68 12.62 L 0.6 12.0 L 9.68 11.38 L 2.13 6.3 L 10.3 10.3 L 6.3 2.13 L 11.38 9.68 Z"
        fill="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.1"
        stroke="currentColor"
      />
    </svg>
  );
}

export function CodexMark({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M12 2.6c2.1 0 3.9 1.2 4.8 2.9 1.9-.2 3.8.7 4.8 2.5 1 1.8.8 3.9-.3 5.5.9 1.7.9 3.8-.2 5.5-1 1.8-2.9 2.7-4.8 2.6-1 1.6-2.8 2.7-4.8 2.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2.6c-2.1 0-3.9 1.2-4.8 2.9-1.9-.2-3.8.7-4.8 2.5-1 1.8-.8 3.9.3 5.5-.9 1.7-.9 3.8.2 5.5 1 1.8 2.9 2.7 4.8 2.6 1 1.6 2.8 2.7 4.8 2.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/** The refresh arrow the app puts before a reset time. */
export function ResetMark({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
