/**
 * The Lancetta Tutorials on the app's YouTube channel, by their number.
 *
 * A docs page shows one with `<Tutorial n={1} />`, in the section that covers
 * what the film does. A film is listed here on the day it goes out, with its
 * page: before `published` it is private, and an embed of it says "Video
 * unavailable". `Tutorial.test.tsx` refuses a page that embeds one whose time
 * has not come, and a page that names a film not listed here fails the build.
 *
 * The series follows the docs' own order, from Getting Started, and a film
 * says its number aloud: the numbers need not be the order the films come out
 * in, so the list may have gaps.
 *
 * `title` is the film's title on YouTube without the "| Lancetta Tutorial NN"
 * suffix; `seconds` is the length of the delivered mp4 to a tenth, which
 * YouTube rounds two ways: its player shows 63.4 s as 1:04, its data says 63
 * (checked on a Netfox tutorial, 2026-11-11). So the caption rounds up, as the
 * player the reader is about to start does, and the VideoObject down; the
 * poster is the film's opening card, 1280x720, in `public/tutorials/`.
 */
export interface TutorialFilm {
  n: number;
  /** The YouTube video id. */
  id: string;
  title: string;
  /** What the film shows, for the VideoObject's description. */
  summary: string;
  seconds: number;
  /** When the film went (or goes) public, with its offset. */
  published: string;
}

/**
 * Where the series is: the Lancetta Tutorials playlist, in the films' own order.
 * This channel's playlist ids are short (13 characters, not the usual 34): the id is whole.
 */
export const TUTORIALS_PLAYLIST = 'https://www.youtube.com/playlist?list=PLHv8DVcB0vls';

export const TUTORIALS: TutorialFilm[] = [
  {
    n: 1,
    id: '8kRewaOwGLM',
    title: 'Install Lancetta and connect your agents',
    summary:
      'Lancetta lives in your menu bar and tells you when and how to use your coding agents. In this tutorial, install it from the disk image, let it find Codex and Claude Code, connect Claude Code with one click, and take a first look at the panel.',
    seconds: 70.8,
    published: '2026-11-13T17:55:00+01:00',
  },
  {
    n: 2,
    id: 'KUTP3krjJi4',
    title: 'Act on a suggestion',
    summary:
      'A percentage tells you what is gone; a suggestion tells you what to do next. In this tutorial, read a Lancetta suggestion (what is happening, what to do, what it rests on), what its colour asks of you, and what to do when it says push on, or slow down, or switch agent.',
    seconds: 87.2,
    published: '2026-11-13T18:10:00+01:00',
  },
  {
    n: 3,
    id: 'LWlc2akiO7o',
    title: 'Read your quota from the menu bar',
    summary:
      "Lancetta lives in your menu bar and shows, for each coding agent, a mark, a lamp, how much of the window is spent and when it resets. In this tutorial, read the lamp, open the panel and an agent's card, and read the pace line: how long you can keep going.",
    seconds: 97.6,
    published: '2026-11-13T18:20:00+01:00',
  },
];

/** The film numbered `n`; a number with no film is a typo in a page, or a film not out yet, and fails the build. */
export function tutorial(n: number): TutorialFilm {
  const film = TUTORIALS.find((t) => t.n === n);
  if (!film) {
    throw new Error(`No Lancetta tutorial numbered ${n}`);
  }
  return film;
}

/** `01`, as the films and their posters are numbered. */
export const twoDigits = (n: number) => String(n).padStart(2, '0');

/** `1:04` for 63.4 s, as YouTube's player writes a length: rounded up. */
export const clock = (seconds: number) => {
  const whole = Math.ceil(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

/** `PT1M3S` for 63.4 s, as schema.org wants a length and YouTube's data gives it: rounded down. */
export const isoDuration = (seconds: number) => {
  const whole = Math.floor(seconds);
  return `PT${Math.floor(whole / 60)}M${whole % 60}S`;
};
