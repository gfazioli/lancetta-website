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

### The favicon is a different drawing, and that is deliberate

The gradient app icon does not survive 16px. Measured rather than judged: its
bars cover 27% of the tile and its plate another 25%, so three bars share 66
pixels, and the gradients and rim glow smear what is left. Rendered magnified on
a light and a dark tab plate, it is mud.

`public/favicon.svg` is therefore the icon's **flat** variant — no gradient, no
glow, so each bar stays one solid colour down to 2px — redrawn as vector from
`../Lancetta/Brand/app-icon-flat-1024.png` and **full bleed**, because the
master's ~10% transparent margin is an app-icon convention and dead area in a
tab. That alone took the bars from 21% of the tile to 35%.

`favicon-16x16.png`, `favicon-32x32.png` and `favicon.ico` are rendered from
that SVG, so all four routes draw the same mark. `apple-touch-icon.png` and
everything from 64px up stay the gradient icon, which reads at those sizes and
is the app's own face.

If you change any of it, look at it: `scripts/` has no favicon tool, so it is a
throwaway that magnifies the shipped PNGs with NEAREST-NEIGHBOUR onto both tab
plates. A favicon judged from the 1024px master is judged from a picture nobody
will ever see.

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

## The repository's own metadata, which git does not carry

Description, homepage and topics are set (`gh repo edit`, readable back with
`gh repo view --json description,homepageUrl,repositoryTopics`). The **social
preview** is not: there is no field for it in the repo object and no `gh`
command, so it is a drag-and-drop in Settings → General → Social preview and
nothing in this repo can assert what is currently there.

`/.github/social-preview.png` is the image that belongs there, 1280×640, built
from the real mark and a real capture of the menu.

**Check what is actually set before assuming.** The one found on this repo on
2026-09-17 was a mockup of a product Lancetta is not: a windowed app with a
sidebar (it has no window and no Dock icon), "842,320 tokens" over a weekly bar
chart (the app shows percentages and reset times, and daily usage is v0.5),
"OpenAI" as a provider rather than Codex — and an axis reading Mon Tue Wed Thu
Fri Fri Sat Sun, eight bars for seven days. It is the image every link to this
repo previews as, so it is marketing copy and the same rule applies to it as to
the homepage.

    curl -sL -A 'Mozilla/5.0' https://github.com/gfazioli/lancetta-website \
      | grep -oE '<meta property="og:image" content="[^"]*"' | head -1

## Seeing the page, and the one thing a headless render cannot show

Grepping the served HTML proves the markup and is structurally blind to
opacity, z-index, transforms and font size — which is how a hero headline once
shipped invisible on the sibling site with `curl` reporting it present. So a
layout claim about this site is a picture, taken from a `WKWebView` snapshot of
`next start` on a spare port.

Two things that cost time here and will cost it again:

- **`takeSnapshot` on a detached web view answers `WKErrorDomain Code=1 "An
  unknown error occurred"`**, which reads like a page fault and is a
  view-hierarchy one. The view has to be in a real `NSWindow`.
- **`mantine-text-animate` never advances in a headless render.** Its characters
  start at `opacity: 0` and are revealed on an in-view trigger that does not
  fire there, so the gradient half of the hero headline photographs as a blank
  gap. **This is the instrument, not the page** — settled with a positive
  control: findergit.app, live and correct, measures `opacity: 0` on every one
  of its headline spans through the same tool. Do not "fix" the headline. If a
  picture of it is needed, force those spans visible before the snapshot and say
  that the shot is staged for that one element.

And the trap that wasted a round here: **a process outlives its bundle.** A
`next start` left running from an earlier build kept port 3111, the new one
failed to bind, and `curl` answered 200 from the stale server — so a removed
string was still on the page. Kill the port, restart, and confirm which build
answers before believing anything it says.

## Tooling

oxfmt (`.oxfmtrc.json`), oxlint + stylelint, TypeScript 6, **Yarn 4**. Do not
use npm or pnpm.
