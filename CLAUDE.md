# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

The **marketing, documentation and download website** for **Lancetta**, a native
macOS menu-bar monitor for coding agents.

**This is NOT a macOS application.** It is a Next.js project deployed on Vercel.

- **Live URL**: https://lancetta.app *(not deployed yet)*
- **App repository** (private, Swift): https://github.com/gfazioli/Lancetta
- **Website repository** (this): https://github.com/gfazioli/lancetta-website

Bootstrapped from `findergit-website` at its head, verbatim for everything that
is template — the same lineage `netfox-website` and `vicenda-website` share. A
fix that lands in one is a candidate for the other three.

## The thing to get right before anything else

**Nothing on this site may describe as shipped something the app does not do.**
`config.app.released` is `false` and `config.app.version` is `0.1.0`, which is
*in progress*, not released. Several surfaces key off `released`: the hero CTA
and badge, the release strip, the closing CTA, and whether the JSON-LD carries a
`downloadUrl` and a `dateModified`. There is no `download` entry in
`app/_meta.tsx` and no Download link in the footer, because a Download tab that
lands on an empty Releases page is a promise the site cannot keep.

Flip all of it in **one** commit when the first build ships.

The same rule inside the page: the feature cards and the two solution panels
carry a `Next` badge and the future tense for anything past v0.1 — the process
reaper (v0.2) and the notifications (v0.3). A badge without the future tense and
a future tense without the badge are the same defect in opposite directions, so
change them together.

## Claims, and where each one comes from

Every number on this site was measured, and the measurements live in
`../agent-monitor-app-draft.md` in the workspace root (and, condensed, in
`../Lancetta/CLAUDE.md`). Do not round them, do not restate them from memory,
and do not add a figure that is not in one of those two files.

The ones currently in use:

| Claim | Where it came from |
|---|---|
| `318,009,023` before and after twelve account reads | the 2026-09-17 cost measurement |
| `+29,188,602` across a day of real use | the positive control for that same measurement |
| `0%` shown against a real `59%` left | the founding defect |
| a reading `3 hours` old | same |
| a `9%` fallback after a refused turn | same |
| `28` processes, `2.68 GB`, `12` of `14` orphaned | the process census |
| `28 → 4`, `2680 → 436 MB` | the same census, after reaping |

## Commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Next.js dev server |
| `yarn build` | Production build (Next.js + pagefind index) |
| `yarn test` | typegen, oxfmt, lint, typecheck, jest |
| `yarn jest` | Jest only |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn lint` | oxlint + stylelint |
| `yarn format:write` | oxfmt over TS/TSX/CSS |

> If `yarn <cmd>` fails with `command not found: oxfmt` / `next`, the Yarn PATH
> shim is not wired on this machine — run the binary directly
> (`./node_modules/.bin/next build`). `yarn test` / `yarn jest` route through
> the npm-run shim and work regardless.

## Architecture

- **App Router** (`app/`) with Nextra integration; `contentDirBasePath: '/docs'`,
  so every MDX file in `content/` is served under `/docs`.
- `content/_meta.tsx` controls the sidebar order and labels.
- `app/layout.tsx` wraps everything in `MantineProvider` + Nextra's `Layout`;
  dark-mode sync is `MantineNextraThemeObserver`.
- Everything site-specific lives in `config/index.ts`. Components read it rather
  than hardcoding — a value typed into a component is a value that drifts.

### CSS import order in `app/layout.tsx`

1. `@mantine/core/styles.css`
2. the Mantine extension styles (marquee, text-animate, scene)
3. the global styles

## The palette, and the one rule about it

`theme.ts` carries the reasoning; the short version is that the colours are
**sampled from the app icon, not picked**, and the brand accent is deliberately
the icon's *third* bar.

Inside the app, teal means **Codex** and orange means **Claude Code**
(`CodexSource.tintHex`, `ClaudeSource.tintHex`). Those two hues are semantic on
this site too — `--lan-codex` and `--lan-claude` in `theme/global.css`, with a
darkened cut for light mode because the app's own values read 2.3:1 and 2.7:1 on
white. **Do not use either one as a decorative accent.** That is what
`--lan-accent` is for.

## Content guidelines

- All website content is in **English**.
- The app is described as: *a native macOS menu-bar monitor for coding agents*.
- Naming **Codex** and **Claude Code** is the product definition, not an
  infrastructure leak — they are what the app watches. What does not belong in
  user-facing copy is the *mechanism*: process names, wire protocols, method
  names, file paths. Those go in `content/how-it-reads.mdx`, in the plainest
  terms that stay true, and nowhere on the homepage.
- The trademark position is fixed and appears in `content/settings.mdx` and the
  FAQ: the agent marks are the vendors' own artwork, used nominatively, and
  Lancetta is not affiliated with or endorsed by OpenAI or Anthropic.

## Screenshots

`public/screenshot-*.png` are captures of the real build, taken with
`../Lancetta/scripts/app.sh shot`.

**Check what is in the frame before publishing one.** The Settings window shows
the absolute path each agent is read from — which on a developer's Mac contains
their home directory and therefore their name. That is why only the menu and the
notch panel are published today. A proper screenshot pipeline with fixture
values belongs with v0.4, alongside the rest of *Distribution*.

## Testing

`components/StructuredData/StructuredData.test.ts` pairs the FAQ schema against
the questions the page actually renders — a hand-kept mirror is exactly what
drifts, and on the sibling site an inherited FAQ schema outlived its answers
with nothing failing. It compares questions, not answers: two answers carry JSX
links, so there is no single string to compare, and a test that pretended
otherwise would be a check that can only pass.

`components/Welcome/Welcome.test.tsx` asserts the headline through the `h1`'s
`textContent`, not `getByText`. The second half is rendered by `TextAnimate`,
which splits it per character, and `getByText` matches an element's own text —
the sibling site's version only passes because half of its headline sits outside
the animated span.

## Tooling

oxfmt (`.oxfmtrc.json`), oxlint + stylelint, TypeScript 6, **Yarn 4**. Do not
use npm or pnpm.
