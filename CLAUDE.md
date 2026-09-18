# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

The **marketing, documentation and download website** for **Lancetta**, a native
macOS menu-bar monitor for coding agents.

**This is NOT a macOS application.** It is a Next.js project deployed on Vercel.

- **Live URL**: https://lancetta.app *(live; `/download` redirects to the newest DMG)*
- **App repository** (private, Swift): https://github.com/gfazioli/Lancetta
- **Website repository** (this): https://github.com/gfazioli/lancetta-website

Bootstrapped from `findergit-website` at its head, verbatim for everything that
is template — the same lineage `netfox-website` and `vicenda-website` share. A
fix that lands in one is a candidate for the other three.

## The thing to get right before anything else

**Nothing on this site may describe as shipped something the app does not do.**

The app SHIPPED on 2026-09-18: `config.app.released` is `true`, and every field
under `config.app` — version, releaseDate, minMacOS — is now written by
`../Lancetta/scripts/release.sh` off the BUILT binary. **Do not hand-edit them.**
A hand-kept copy of a value the pipeline owns is the copy that drifts, and
netfox.app shipped exactly that.

The flip took more than the flag: `released` gates only the hero CTA and badge,
the release strip, the closing CTA and the JSON-LD's `downloadUrl` /
`dateModified`. Everything else was PROSE, and it was spread across files nobody
re-reads — an FAQ answer ("Not yet — v0.1 is still being built") which also
lives mirrored in `StructuredData.tsx`, a roadmap entry in two places (the MDX
page and the homepage strip mirror each other), a badge naming a version, the
`download` tab withheld from `app/_meta.tsx`, and a callout on Getting Started.
So when the app's state changes: **grep for the claim, not for the key.**

The same rule inside the page: a feature card carries a `Next` badge **and** the
future tense for anything the build does not do. A badge without the future
tense and a future tense without the badge are the same defect in opposite
directions, so change them together.

Today exactly one card is `Next`: the notifications (v0.3). **The process reaper
and the window are not** — both are built, and the site was two versions behind
the app on 2026-09-17 until this was swept. That is the failure mode to watch
for here: the app moves and nothing on this site fails when it does. The gate is
reading `../Lancetta/CLAUDE.md` and `git log` in the app repo before believing
any page, not running `yarn test`.

**It went stale again the same afternoon, an hour after that sweep**, which is
the part worth internalising: the app grew a bundle, a login item, a Dock-icon
setting and a working Sparkle updater while the docs describing it were being
written. Three claims that had just been *verified* went false — including
`privacy.mdx`'s "no update ping in v0.1", the one claim on this site where being
wrong matters most. So the check is not a milestone, it is what you do every
time you touch a page.

## The appcast is a contract with the app, and nothing enforces it

`public/appcast.xml` is the feed the shipped app polls. Read out of the built
bundle's `Info.plist` on 2026-09-17: `SUFeedURL` is
`https://lancetta.app/appcast.xml` and `SUPublicEDKey` is
`XA74hqgQzZxonNOoQ8CnS8h71nDQf83Y1LAKxBEjUlI=` (the private half lives in the
Keychain under the account `Lancetta`).

So **that path is load-bearing**: renaming the file, moving it out of `public/`,
or letting a rewrite intercept it breaks updates for every copy already
installed, and nothing here would fail. The file is deliberately an empty
channel rather than absent — a 404 and an empty feed are different failures and
only one of them is the one we want. `release.sh` prepends an `<item>` per
release.

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
| `2.24 GB` reclaimed, and the `Reclaim 12 orphaned` menu line | the same census, arithmetic on the two rows above |
| `11` descendants holding `392 MB` in one tree | the 2026-09-17 walk of a real tree, against the three-process shape its own docs give |
| `46` buckets across `163` days, summing to the lifetime total exactly | the usage-history read, same day |
| one day, eight hours | the oldest orphan in the census |

Numbers that are **not** claims and must not become them: anything read off a
screenshot. The captures are of one developer's machine, so its token totals,
plan names and percentages are illustration. Prose quotes the table above.

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

**The masters came from the Brand folder of the user's Drive**
(`…/Il mio Drive/Brand/Lancetta/logo.png` and `logo-flat.png`, 2026-09-18;
user: *"il logo che ti avevo dato è sbagliato"*) and now live in
`../Lancetta/Brand/`, where `../Lancetta/scripts/icons.sh` generates every icon
in `public/` from them (the favicon section below has the details). The window
screenshots still carry the previous icon in their sidebar until they are
re-shot.

Read the icon top-down. The first probe read the bitmap bottom-up and had
every bar upside down, which is why `theme.ts` names where on the icon each
value came from. What the icon actually is: azure along the top edge, a
near-black navy core behind the bars, deep violet at the bottom-right, and a
rim that runs cyan (top-left) through violet to magenta (bottom-right). Those
six are the page tokens (`--lan-plate`, `--lan-plate-wash`, `--lan-plate-edge`,
`--lan-azure`, `--lan-cyan`, `--lan-violet`, `--lan-magenta`), every Scene mesh
and glow takes its colours from them as hexes, the two plate bands (in-detail
and the closing CTA) share `.plateBand` with its 2px neon rim, and the **dark
scheme's greys are the plate's navy** — `theme.colors.dark` is cut on its hue
with the chroma held low, because a neutral grey beside this icon reads as a
different product. Contrasts are in the comments beside each ladder.

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
`../Lancetta/Brand/app-icon-flat-1024.png`.

**Every icon in `public/` is GENERATED — do not edit one by hand.**
`../Lancetta/scripts/icons.sh` writes all of them from the two masters in
`../Lancetta/Brand/`, then compresses them with ImageOptim's own `oxipng` and
`zopflipng` (real CLI binaries inside the app bundle's framework, so nothing has
to drive a GUI). It covers `icon-*.png`, `apple-touch-icon.png`,
`favicon-16x16.png`, `favicon-32x32.png` and `favicon.ico`; the two SVGs are
hand-written but their geometry and fills are MEASURED off the masters with
`../Lancetta/scripts/icons.swift`, and each colour carries the point it was
sampled at.

**The artwork changed on 2026-09-18 and is now FULL BLEED** — the squircle
touches all four edges, only the corners are transparent. The previous masters
carried a ~10% margin, which this file used to describe as the app-icon
convention to be dropped for the tab. Measured instead of assumed: Netfox's and
FinderGit's shipped icons are also full bleed (256 of 256 px at every alpha
threshold), so the whole family is, and the macOS icon needs no inset either.

If you change any of it, look at it: `icons.swift zoom <png> <factor> <plate>`
magnifies the shipped PNG with NEAREST NEIGHBOUR onto a tab-coloured plate. A
favicon judged from the 1024px master is judged from a picture nobody will ever
see.

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
`../Lancetta/scripts/app.sh` — `shot` for the menu, `window <title>` for the
window and Settings, and a hover on the notch for the island.

Published today: the menu in both appearances, the island collapsed and open,
the window's Overview, Usage and Limits panes, and every Settings pane: General,
Appearance, Notch, Agents, both agent pages, Updates and About. The Settings set
was reshot on 2026-09-18 from the INSTALLED 0.3.1 with
`../Lancetta/scripts/settings-shots.sh`, one launch per pane through the
`LANCETTA_OPEN` hatch, because the dev bundle is ad-hoc signed and would ask for
the keychain item again while the shipped build already holds the grant.

**Two surfaces may not be published, and both for the same reason.** The
**Processes pane** lists each tree by the directory it was started for, and an
**agent's page in Settings** carries the absolute path that agent is read from.
On a developer's Mac both contain the home directory, and therefore the user's
name, and often the names of their employer's repositories. Check what is in the
frame before publishing, every time — a proper pipeline with fixture values is
still to come. Both agent pages went out on 2026-09-18 after that read: Codex's
line names `/opt/homebrew/bin/codex` and nothing under the home directory, and
Claude's names no path at all on the account route. On a Mac where `codex` lives
under `~`, the Codex page is not publishable.

**`APP_LANG=en_GB` is not optional.** The app ships no localised strings and
still renders dates and numbers through the system locale, so captured on an
Italian Mac the usage chart's axis reads `ven sab dom` and the token total reads
`107.226.026`. Nothing about the resulting PNG says it is in the wrong language.

Two capture traps, both paid for on 2026-09-17 and both fixed in the app repo's
scripts rather than here: the menu lookup answered with the **notch island**
when the menu failed to open (it took the largest window above layer 0, and the
island grew past the menu), and `app.sh` drove the app **by process name**, which
AppleScript resolves to the first match — so with a worktree's build running
beside the checkout's, the click went to the other copy and the capture
photographed whatever this one had on screen.

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
2026-09-17 was a mockup of a product Lancetta is not: "842,320 tokens" over a
weekly bar chart with "OpenAI" as a provider rather than Codex, and an axis
reading Mon Tue Wed Thu Fri Fri Sat Sun — eight bars for seven days. It is the
image every link to this repo previews as, so it is marketing copy and the same
rule applies to it as to the homepage.

Its other fault has since half-corrected itself, which is worth recording
because it is the direction nobody checks: it drew a **windowed app with a
sidebar**, and at the time the app had no window at all. It does now. The
mockup was not right, it was early — and "wrong about the product" and "ahead of
the product" look identical in a picture.

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

  **It does not always photograph as a blank gap, and the partial form is far
  more convincing.** On 2026-09-17 the third line came out as `osts nothing.` —
  one missing character, which reads like a truncation bug rather than like an
  animation that did not run. The check is the same and takes one command:
  `document.querySelector("h1").textContent` returned the whole
  `"Every agent's quota. One glance. Costs nothing."`, and every span in the
  animated half measured `opacity: 0` — *including the thirteen that were
  visible in the PNG*. When the render and the computed style disagree like
  that, the render is the thing that is lying. Read the DOM before believing a
  screenshot of this headline, whatever shape the damage takes.

And the trap that wasted a round here: **a process outlives its bundle.** A
`next start` left running from an earlier build kept port 3111, the new one
failed to bind, and `curl` answered 200 from the stale server — so a removed
string was still on the page. Kill the port, restart, and confirm which build
answers before believing anything it says.

Three more, all measured on 2026-09-18 and all the instrument's:

- **Its animation clock does not turn.** A CSS animation reads `playState:
  running` with `currentTime: 0` for ever, so anything that starts at opacity 0
  photographs as absent — the hero's two screenshots did, while the DOM had
  them laid out to the pixel. The animation was then removed for the page's own
  sake (the product is the LCP), not to please the tool; do not remove an
  animation because a shot is blank, read `getAnimations()` first.
- **A smooth scroll never arrives, and a `scroll` event is never delivered.**
  `html { scroll-behavior: smooth }` makes `scrollTo(0, y)` an animation, which
  leaves `scrollY` at 0; and the event a browser fires from its rendering loop
  does not come either, so the pinned gallery sat on frame 0 at scrollY 3000
  and the product bar on "Overview" while a replica of the bar's arithmetic,
  run in the page, picked the right section. `page.sh eval <path> <js>
  [scrollY] [w] [h]` therefore scrolls with `behavior: 'instant'` and
  dispatches the event by hand: what it verifies is the listeners' arithmetic
  and the DOM they leave, which is the half that is ours.
- **`page.sh serve` "hung" twice while the server was up.** `nohup` detaches
  stdin only when stdin is a terminal; from an agent's shell it is a pipe, and
  `next start` held it open. The `</dev/null` in `serve` is that fix.

## The one job, and the gallery that shows it

The copy is built around **one job**: how much of each agent's quota is left,
and when it comes back. The reaper is a feature card and a footnote, never a
"second half" — the page used to have two panels, "Half one" and "Half two",
and that layout said the app does two things (user, 2026-09-17: *"l'app alla
fine deve svolgere 'un solo compito' bene"*). If a new feature is big, it still
goes under that job, not beside it.

`components/ScrollGallery` is the pinned, scroll-driven gallery under the hero,
in the shape Apple's product pages use: a tall track, a viewport-high stage
stuck under the navbar, and the frame a pure function of how far the stage has
travelled through the track (`frameIndex`, tested). **Nothing intercepts the
wheel** — that is what makes it work the same with a trackpad, a mouse, the
keyboard and VoiceOver. Phones and `prefers-reduced-motion` get the same frames
as a plain stack. The frame is measured between the stage's box and the track's
box, never against the viewport, so the navbar's height never enters the
arithmetic; the CSS sticks the stage under `--nextra-navbar-height` with a 4rem
fallback.

Three frames, not four: the light-mode menu is the dark one's content again and
made a weak step. It stays in the docs.

## The header is two bars, and the home page starts at the left

The global navigation (`app/_meta.tsx`) is about the product, in the order a
visitor asks: Features (an anchor on the home page), How it works (the one docs
page that explains the reading), Docs, Roadmap, then Support and About. Under
it, on the home page only, `components/ProductNav` is the product bar Apple's
pages carry: the name, the sections of this page, the one action. Its
`productSections` list is the contract with the page — `Welcome.test.tsx`
renders the home and checks every id exists, because a bar link to a missing
anchor scrolls nowhere and nothing reports it.

Three custom properties hold the two bars and the page together, and each one
exists because a number typed twice drifted once:

- `--lan-subnav-height` — the product bar's height, set inline on the `.home`
  wrapper in `Welcome.tsx`.
- `--lan-navbar-offset` — where Nextra's navbar sticks, published on the root by
  `ProductNav.tsx` from the navbar's computed `top`. **Nextra's banner is sticky
  below 48rem and static above it**, so the navbar sticks at 0 on a desktop and
  at the banner's height on a phone. And Nextra measures that height with a
  ResizeObserver that writes `--nextra-banner-height` to the root's style
  *after* the effect that first reads it, which is why the read is repeated from
  a MutationObserver on the root's style attribute; without it the bar measured
  `0px` and sat at 64px, straight across a navbar stuck at 60px.
- `--lan-nav-top` and `--lan-bars` — the sums, computed once on `.home` in
  `Welcome.module.css`. The pinned gallery's `--gallery-top`, the hero's height
  and every anchor's `scroll-margin-top` read `--lan-bars`; anywhere else the
  gallery falls back to the navbar alone.

The hero is copy on the left and the product on the right, and the product is
two objects in a fixed relation: the **menu in front**, because the menu is the
app, and the **Overview window behind**, because there is one when you want
more. The island has its own frame in the gallery; three objects would be a
collage. Two decisions that look like taste and are not: there is **no entrance
animation** on those images (they are the LCP, and anything that starts at
opacity 0 is invisible wherever animation time does not advance), and the
cluster's bleed stops **24px inside the viewport** — an object clipped by 8%
reads as a mistake, and the window's right edge carries its numbers. The
headline is sized in `cqw` off its own column so "Every agent's quota." stays
one line at every width.

`components/SectionHeading` is left by default — title left, lead right,
bottom-aligned — and `center` for the statement bands. The "In detail" band
shows the Limits pane, not the menu a third time: it is the one surface with
"seen 1s ago" and "live" side by side, which is what the band is about.

## The release-notes page has THREE states, and the middle one was missing

`ReleaseNotes.tsx` shows a skeleton, a list, or an empty state, and the hook
reports `ready` separately from SWR's `isLoading`, because the MDX compile that
fills the list runs after the fetch and the two flags disagree for a moment.
The first version folded "no releases" into "loading", and on a repo with no
releases yet that skeleton never went away: lancetta.app showed *"Loading
releases…"* forever on the day it went live. `ReleaseNotes.test.tsx` drives all
three screens through a mocked hook — a test that only ever fed it releases
would have passed on the broken code.

## Tooling

oxfmt (`.oxfmtrc.json`), oxlint + stylelint, TypeScript 6, **Yarn 4**. Do not
use npm or pnpm.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
