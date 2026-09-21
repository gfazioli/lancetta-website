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
- `app/layout.tsx` wraps everything in `MantineProvider` + Nextra's `Layout`.
  **The site is LIGHT-ONLY** (2026-09-19, user: *"elimina il toggle dark/light e
  lascia solo la modalità chiara"*): Mantine is `forceColorScheme="light"`,
  Nextra takes `darkMode={false}` and
  `nextThemes={{ defaultTheme: 'light', forcedTheme: 'light' }}`, and
  `html { color-scheme: light }` in `theme/global.css` is what keeps every
  `light-dark()` still in a module resolving to its light branch. The three
  components that existed to switch and sync schemes — `ColorSchemeControl`,
  `ColorSchemeToggle`, `MantineNextraThemeObserver` — are gone. `forceColorScheme`
  on `ColorSchemeScript` matters as much as the provider: without it a visitor
  who toggled the old switch is left on `dark` out of their own local storage,
  against stylesheets that no longer carry one.
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
and glow takes its colours from them as hexes, and the **greys are the plate's
navy diluted** — `theme.colors.gray` is cut on its hue with the chroma held
low, because a neutral grey beside this icon reads as a different product.
Mantine's own gray-6, which is what `c="dimmed"` resolves to, measures 4.0:1 on
this body and fails AA; the ladder's is 4.55:1. Contrasts are in the comments
beside each ladder, and `theme.black` is the plate's navy at text weight rather
than `#000`.

**There is no `.plateBand` any more.** The two dark slabs (the in-detail band
and the closing CTA) read as holes on a light-only page: the in-detail band's
content became one of the hero's frames, and the CTA is `.auroraBand` — the
same three lights on the page's own white, under the same 2px neon rim. The one
dark object on the site is the menu bar in the header, and it is dark because it
is chrome: it stands in for the macOS menu bar, which is where the product
lives. Nothing else pretends to be.

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
the window's Overview, Usage, Limits and Processes panes, and every Settings
pane: General, Appearance, Notch, Agents, both agent pages, Updates and About.

**The four window panes are ONE SET, shot at ONE window size, in one run.** The
hero shows them in the same box, one per frame, cross-fading in place, so a
capture of a different size is drawn at a different scale -- and the reader sees
the window change size as they scroll. It was reported twice. The three panes
published before 2026-09-19 were 588 points tall and the app will not open below
**628** any more, so they showed a window that can no longer exist; padding them
onto a common canvas fixed the scale and left the windows visibly different
heights, which is the same complaint. There is no fix but to re-shoot the set.
`scripts/shot.mjs --eval` is how to check it: every centred frame's `img` must
report the same `offsetWidth x offsetHeight`.

Two things make that re-shoot safe to run unattended, and both are hatches in
the app repo. `-claudeAccountConnected 0` in the ARGUMENT domain turns the
account route off for that process alone, so no launch reads the keychain and no
macOS dialog lands in front of the user -- the Claude card falls back to the
status-line file, which is the route the published Limits capture already shows.
And `LANCETTA_DEMO_TREES=1` draws an invented process table, because every row of
the Processes pane is a working directory and on a real Mac those are the
developer's own folders. Measured 2026-09-19: four launches, zero
`displaying keychain prompt` lines.

**Re-shooting is also when the page's CLAIMS get checked against the picture.**
That set arrived showing both agents' token series where the copy said the chart
was Codex's alone -- true when it was written, and false since the app learned to
rebuild Claude's from its transcripts. Four carriers said it: the Usage frame in
the hero, the "Where the tokens went" card, `the-window.mdx` and
`how-it-reads.mdx`. A screenshot that contradicts the sentence beside it is the
worst kind of stale copy, because the reader believes the picture. The Settings set
was reshot on 2026-09-18 from the INSTALLED 0.3.1 with
`../Lancetta/scripts/settings-shots.sh`, one launch per pane through the
`LANCETTA_OPEN` hatch, because the dev bundle is ad-hoc signed and would ask for
the keychain item again while the shipped build already holds the grant.

**A capture with a BAKED SHADOW is a smudge on a light page, and the site is
light.** The app's captures are taken against a dark desktop, where a soft
shadow around the object is what makes it sit on something. Measured on the
island capture of 2026-09-19: the band under it rendered `#D1D7EA` against a
`#F0F1FD` page, and it was the first thing the eye went to. Worse, the page's
own `drop-shadow` follows the PNG's alpha, so it was cast from the SHADOW's
silhouette rather than the object's and spread it further.

`scripts/deshadow.swift` strips one: it measures the alpha rather than guessing
(in that file the shadow's peak was 0.400 against the object's 1.000, with 105
pixels of antialiased rim in between out of 200k sampled), drops everything
under the cutoff, rescales the rest so the rim stays smooth, and crops to the
solid bounding box — which is not optional, because `object-fit: contain` fits
the whole canvas and 112px of now-transparent margin on three sides would
shrink the object inside its own box. Checked the same day: the menu carries
2px of margin and the two window captures none, so the island was the only one.
Every artifact now takes its depth from `HeroStage.module.css` and from nowhere
else.

**The island was then replaced with a cleanly-keyed version** (same day, from
the user), whose margins are genuinely transparent — max alpha 0.004 down the
side band — so only the CROP applied: 1780x883 to 1645x721, with margin ZERO.
Any margin at all is a pale hairline between two near-black objects: 3px of it
showed as a gap between the tab and the bar, and the fix is both the tight crop
and a `-5px` inset, so the tab's own antialiased rows are clipped by the
stage's `overflow: hidden` rather than drawn. Measured at the seam afterwards,
row by row: `#0B1328` (bar) straight to `#0A1727` (island), no light row. The
crop is the half that keeps mattering. `object-fit: contain` fits the whole canvas, so
transparent margin is empty box: it shrinks the object and, for the island,
lifts it off the bar it is supposed to be cut out of. The tab must also stay
the image's horizontal centre (measured: 825.0 of 825.0), because the bar's
reading is on the page's centre line and the island hangs from it.

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

**Two tools, and which one to reach for is decided by what you are looking at.**

- `scripts/page.sh` (WKWebView) for a claim about ONE rendered state: it is
  Safari's engine, so it is the truth about how the site looks to a Mac, and
  its `eval` is how a listener's arithmetic gets checked. Its limits are in its
  own header, and two of them rule it out below.
- `scripts/shot.mjs` (Chrome DevTools) for anything that MOVES, and for
  anything down the page. `node scripts/shot.mjs <url> <prefix> --at
  0,0.06,0.12` writes one VIEWPORT capture per fraction of the scrollable
  height and prints the pixel it landed on, which is how a section halfway
  down gets photographed at all. `page.sh` cannot follow a page: a `scroll`
  event is never delivered there and its animation clock never turns, so
  **anything that starts at `opacity: 0` photographs as absent** — including a
  CSS entrance that a real browser completes in half a second. Cross-ported
  from `findergit-website/scripts/shot.mjs`, which is where the three reasons
  not to use `chrome --headless --screenshot` are written down.

  The `--at` mode was written for the pinned hero, which was four states of
  one `100vh` box and photographed as a single tall band containing the last
  frame. The hero is ordinary flow since 2026-09-20 and a full-page capture
  works again — but `--at` is still the right tool for reading one screen at a
  time, and `--eval` at each position is how a geometry claim about this page
  gets a number instead of an opinion.

Both are committed rather than recreated per session, for the reason `page.sh`
gives in its own header: this workspace has already paid twice for a technique
stored as "recreate it".


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

## The one job, and the order that argues for it

The copy is built around **one job**: how much of each agent's quota is left,
and when it comes back (user, 2026-09-17: *"l'app alla fine deve svolgere 'un
solo compito' bene"*). If a new feature is big, it still goes under that job,
not beside it — the page once had two panels, "Half one" and "Half two", and
that layout said the app does two things.

**What changed on 2026-09-20 is which part of that job leads.** This file used
to say the reaper was "a feature card and a footnote, never a second half", and
it is not a footnote any more (user: *"mettendo l'accento subito su cosa
differenzia Lancetta dagli altri concorrenti - quindi suggerimenti e clean dei
processi"*). The reasoning is in Lancetta#24 and it is about the field rather
than about us: **CodexBar** has the quota ceiling and the token flow and keeps
no series; **ccusage** has the flow and guesses the ceiling; **Quotio** routes
around a limit instead of advising on it. Nobody else reaps the process trees,
and nobody else keeps a series to advise from. Those two lead; the surfaces
every monitor has — a menu, an island, a window, a chart — come after.

It is still one job. The trees an agent leaves behind are the same story as its
quota, one level down: both are the cost of running these things all day, and
neither is visible until something tells you.

**The order of `frames` in `HeroStage.tsx` is the argument, so changing it is an
editorial act, not a layout one.** The **advice goes first**, because it is the
deeper moat and, since v0.4, it also ships — the pace line has a screenshot like
any other frame, no `next` flag and no `NEXT` badge. The reaper is second.

Until v0.4 this said the opposite, and the reason it did is worth keeping: the
reaper led *because* the advice had not shipped, and the pace frame was drawn as
a bordered card with the future tense, since a page that dresses a promise
exactly like a shipped feature has to be read carefully to be trusted. That rule
still governs the next unshipped thing to reach this array — today the alerts
(Lancetta PR #36), which are not a frame.

The instruction that used to close this paragraph — *when a release carries the
pace, take `next` off it and revisit the order* — was carried out on 2026-09-21
and this paragraph was not, so for a day it described a badge the component no
longer had and named the wrong frame as leading. **An instruction with its own
trigger in it is finished when the paragraph around it is rewritten, not when
the code is changed**; `rg 'next:' components/HeroStage/HeroStage.tsx` is the
one command that settles which state this file is describing.

### The hero is ordinary flow, and the scroll-jacking is gone

**`components/HeroStage` is the whole top of the page**: a headline block, then
one `<section>` per surface, laid out as a two-column grid that alternates
sides. Adding one is a row in the `frames` array, and its `reading` is read OFF
its own screenshot (see the comment above `heroReading`).

It was a pinned stage from 2026-09-19 to 2026-09-20 — a tall track sized in
`svh`, a viewport-high sticky stage, five absolutely-positioned artifacts
cross-fading in one box, a copy row whose height JavaScript measured and
published, and two reserves tuned to the pixel. **Do not reach for that again
without reading what it cost**, because none of it was a bug in the
implementation:

- **It made the page's whole top depend on JavaScript.** The served markup was
  the pinned desktop variant for every visitor, frozen on frame 0 with the
  other five unreachable, and the stage held its content at `opacity: 0` until
  an effect flipped `data-ready`. Reported from an iPad and an iPhone as "you
  cannot see anything", and reproduced by rendering the served page with its
  script tags stripped: a gradient wash with six dots on it.
- **A stage that fills the viewport exactly reads as the whole page.** Readers
  stopped on the first screen — *"the only problem is to not have at least a
  scroll feedback ... The first time I opened this website I thought it was
  just that, and quit"*. A scroll cue, a progress count and an idle animation
  are all fixes for a problem the technique introduced; in flow, the next
  section simply shows under the fold and none of them is needed.
- **Every frame's geometry was a constant standing in for a measurement.** The
  copy could only be held off the dots by an `svh` reserve on two frames and by
  the container's padding on the other three — two different fixes for what
  looked like one defect, each needing a per-frame sweep across six viewports
  to trust.

`frameIndex` and its test went with it.

The header still follows the page: each section writes
`MenuBarHeader/reading-store.ts` through an **IntersectionObserver** whose
`rootMargin` collapses the root to a band around the viewport's middle line, so
at most one section is intersecting and there is no tie to break. Nothing there
decides what is VISIBLE — if the observer never runs, the page is the page and
the bar keeps the reading it opened on. A module-level store with
`useSyncExternalStore` rather than a context, because Nextra's `Layout` renders
its `navbar` slot as a SIBLING of `children`: no provider in the page can reach
the bar.

One thing that survived the rewrite and is worth keeping: the **figures** under
a frame's body (`28` / `2.68 GB` / `2.24 GB`) come from the measurement table
above and from nowhere else. Nothing read off a screenshot may become one.

## The header is ONE bar, and it is a picture of the menu bar

`components/MenuBarHeader` **replaces Nextra's navbar** — `app/layout.tsx`
passes it into the `navbar` slot, and Nextra renders whatever is in that slot
in place of its own `<Navbar>`. So the default header is gone rather than
hidden, and two things that bar used to carry have to be carried here or they
are simply missing: the **search** (`<Search />` from `nextra/components`) and
the **hamburger** that opens the sidebar on a phone (`setMenu` from
`nextra-theme-docs`, the same store Nextra's own button writes).

It is a macOS menu bar, not a web navbar. **Three grid columns**
(`minmax(0, 1fr) auto minmax(0, 1fr)`), not a flex row, because the middle one
has to be on the bar's centre line whatever the two sides weigh: the mark and
the menus on the left, **Lancetta's own reading in the centre** (rebuilt in
`MenuBarReading`), the search and the one action on the right. Measured at 1440:
the left group is 460px and the right 368, against 498 of column each. The menus
had to move to the LEFT for that — right of a centred item there is 498px, and
menus plus search plus action is 708 — and beside the mark is where macOS puts
an app's menus anyway. They hide below 75em, not `md`: between 768 and ~1100 the
left column is narrower than they need.

Attached to the top edge, narrower than the page, rounded at the two BOTTOM
corners. **The dock it hangs in paints nothing.** It used to carry a short fade
of the page colour so content dissolved past the bar's corners, and the cost was
a visible band with a hard edge across the top of every page: the hero's wash is
cyan on one side and violet on the other, and `--lan-body` laid over it is not
the same colour. A seam everywhere to soften one transition is the wrong trade.

**There is no `<Banner>` any more**: a strip above the bar pushes it off the top
edge, which is the one thing the design depends on. What it announced (the
current version) is in the hero's meta line and on the releases page.

- `--lan-bar-height` is the bar's height, declared once in `app/global.css`,
  and `--nextra-navbar-height` is set FROM it — Nextra lays its sidebar, its
  TOC and every sticky heading out against that property, and the bar those
  offsets are measured from is now ours.
- `productSections` (`MenuBarHeader/sections.ts`) is still the contract with the
  page: `Welcome.test.tsx` renders the home and checks every id exists, because
  a bar link to a missing anchor scrolls nowhere and nothing reports it. The bar
  shows a SUBSET — six menus in a bar this size stop reading as menus — and
  the hrefs are absolute (`/#features`), because this bar is on every page and a
  bare fragment from inside the docs scrolls nowhere.
- The agent marks in the reading (`AgentMark.tsx`) are **stylisations, not the
  vendors' artwork**: the app renders the real vector data, and a website should
  not ship someone else's logo file to decorate a mock-up of its own chrome.

`components/SectionHeading` is left by default — title left, lead right,
bottom-aligned — and `center` for the statement bands. Its `tone="onDark"` has
no caller since the plate bands went; leave it until something needs it again.

## The release-notes page has THREE states, and the middle one was missing

`ReleaseNotes.tsx` shows a skeleton, a list, or an empty state, and the hook
reports `ready` separately from SWR's `isLoading`, because the MDX compile that
fills the list runs after the fetch and the two flags disagree for a moment.
The first version folded "no releases" into "loading", and on a repo with no
releases yet that skeleton never went away: lancetta.app showed *"Loading
releases…"* forever on the day it went live. `ReleaseNotes.test.tsx` drives all
three screens through a mocked hook — a test that only ever fed it releases
would have passed on the broken code.

**A release body is MARKDOWN, and compiling it as MDX cost the page a second
time.** Lancetta 0.3.3 quotes an agent's raw error object in a bullet —
`{ code = "-32600"; message = "Invalid request" }` — and in MDX a brace opens a
JavaScript expression, so the body did not parse: *Could not parse expression
with acorn*. Measured 2026-09-19 with the same compiler the page uses: as `mdx`
that body throws while 0.3.2 and 0.3.1 compile, as `md` all three pass, together
with a body carrying `<br/>`, an autolink and `Array<String>` in prose. Nothing
in a release note is ever meant as JSX, so `mdxOptions: { format: 'md' }` is the
correct reading of the input rather than a workaround. Smartypants still runs,
which is why the rendered text reads `{ code = “-32600” }` with curly quotes —
grep the page for `code =`, not for the straight-quoted original.

**And these bodies are the least trusted input on the site.** They are written
by hand on GitHub AFTER the site is built, so no build, no test and no lint ever
sees them, and until this fix a single one that would not parse rejected the
`Promise.all` in `useReleaseNotes`, left `ready` false for ever, and hid every
OTHER release behind the skeleton. Each body now compiles on its own, a failure
costs only its own formatting (the release is shown as plain text), and
`setReady` sits in a `finally`: the skeleton is not a state this page may end
in. `compileReleaseBodies` takes the compiler as an argument precisely so the
failing branch is testable without asking jsdom to load nextra's compiler.

**The sibling sites carry the un-fixed shape.** Checked the same day:
`findergit-website`, `netfox-website` and `vicenda-website` all compile as MDX
with no `catch`. None of their current release bodies breaks — which is exactly
what an armed mine looks like. The first release note quoting a JSON object, a
shell brace expansion or an HTML tag takes those pages down the same way.

**The token is not the suspect, whatever the symptom suggests.** The page fetches
`/api/github-releases`, and an empty page reads like a missing credential;
`GITHUB_TOKEN` only widens the GitHub rate limit (60/hr per IP to 5000/hr) and
feeds the build-time TOC. Settle it before touching Vercel: `curl` the endpoint
with a browser User-Agent — it answered `200` with three complete releases while
the page was blank.

## Tooling

oxfmt (`.oxfmtrc.json`), oxlint + stylelint, TypeScript 6, **Yarn 4**. Do not
use npm or pnpm.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
