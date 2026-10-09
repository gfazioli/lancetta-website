# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

Marketing, docs and download site for **Lancetta**, a native macOS menu-bar monitor for coding agents. Next.js on Vercel, **not a macOS app**; the app repo `gfazioli/Lancetta` is private. Live at https://lancetta.app (`/download` redirects to the newest DMG).

## The thing to get right before anything else

**Nothing on this site may describe as shipped something the app does not do.** The app moves and nothing here fails when it does: before believing or editing any page, read `../Lancetta/CLAUDE.md` and the app's `git log`, and grep for the claim, not the config key (claims live in prose: the FAQ and its JSON-LD mirror, the roadmap and the homepage strip, docs callouts).

An unshipped thing carries the `Next` badge **and** the future tense, never one without the other; change them together. `rg 'next:' components/HeroStage/HeroStage.tsx` says which hero section is unshipped today.

`config.app.*` is written by `../Lancetta/scripts/release.sh` off the built binary: never hand-edit it.

## The appcast is a contract with the app, and nothing enforces it

`public/appcast.xml` is the Sparkle feed every installed copy polls (`SUFeedURL` `https://lancetta.app/appcast.xml`; the EdDSA private key is the Keychain account `Lancetta`). **Never rename it, move it out of `public/`, or let a rewrite intercept it**: updates break for every install and nothing here fails. `release.sh` prepends an `<item>` per release.

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

## Architecture

**The site is LIGHT-ONLY**, forced in `app/layout.tsx` (Mantine, Nextra, `ColorSchemeScript`) and `theme/global.css` (`color-scheme: light`): never add a dark branch or a scheme toggle.

## The palette, and the one rule about it

Colours are **sampled from the app icon**, not picked (`theme.ts` names where each came from; masters in `../Lancetta/Brand/`). Greys are the plate's navy (`theme.colors.gray`), never Mantine's neutral, whose gray-6 fails AA on this body. Teal = Codex and orange = Claude Code (`--lan-codex`, `--lan-claude`): semantic only, **never a decorative accent**; that is `--lan-accent`. The only dark object on the page is the menu-bar header.

## One superfamily, two cuts

Source Serif 4 (display) + Source Sans 3 (body), via `next/font` in `app/layout.tsx`, which says why. A pairing is judged rendered live on this page (a throwaway dev-only switcher, `?type=<key>`), never from specimens. Headings stay at 400: move the theme's value, never a `fw` on one `<Title>`. The theme misses three surfaces: `HeroStage.module.css` `.title` and `.frameTitle`, and the docs headings (`main[data-pagefind-body]` in `app/global.css`). Check hero type changes at 390px.

## Icons

**Every icon in `public/` is GENERATED** by `../Lancetta/scripts/icons.sh` from `../Lancetta/Brand/`: never edit one by hand. Judge a favicon magnified, `swift ../Lancetta/scripts/icons.swift zoom <png> <factor> <RRGGBB> <out.png>`, never from the 1024px master.

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
- **A version number is not evidence to a visitor who never used the app** (it is not launched): prefer the measurement, or drop the qualifier. The one exception is the `### v0.N` headings under *Already shipped* on the roadmap. Never reference revisions of the page itself ("this entry used to..."); "arrived early" against the plan is fine.

## Screenshots

`public/screenshot-*.png` are captures of the real build. How to re-shoot each set (window set, panel, crops, Settings), with its hatches and traps, is the workspace's `lancetta-screenshots` skill. Every time: the four window panes are ONE set at ONE window size; a re-shoot is when the copy beside each picture is checked against it; every frame's traffic lights are active and no figure is mid-roll.

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

**Every capture takes `APP_LANG=en_GB`** (`settings-shots.sh` pins it itself): the app follows the Mac's language and nothing in a PNG says it is the wrong one. What the site says about languages comes from `../Lancetta/scripts/i18n/i18n.py langs` plus English; a language added to the app is a grep for `Dutch` here. The FAQ, its JSON-LD and Troubleshooting say the copied report is English only because of the app's `L10n.evidence` gate: if it goes, so do those sentences.

## The repository's own metadata, which git does not carry

The GitHub **social preview** has no API and no `gh` field: it is uploaded by hand from `.github/social-preview.jpg` (Settings → General → Social preview), so check what is set rather than assume: `curl -sL -A 'Mozilla/5.0' https://github.com/gfazioli/lancetta-website | grep -oE '<meta property="og:image" content="[^"]*"'`. It and `app/opengraph-image.jpg` come from `scripts/social-card.png` via `swift scripts/social.swift .`: edit the master, never the outputs.

## Seeing the page

`scripts/page.sh` (WKWebView: one state, `eval`) or `scripts/shot.mjs` (Chrome: anything that moves or sits down the page); their headers carry the traps. In WKWebView the `TextAnimate` line of the headline, and anything starting at `opacity: 0`, photographs blank or partly blank: read the DOM (`h1.textContent`, `getAnimations()`) before believing a picture, and never "fix" the page for the instrument.

## The one job, and the order that argues for it

The copy is built around **one job: what you can still use, how long it lasts, and when it comes back.** A new feature goes under it, never beside it. Showing no money is a claim, not an omission. The `h1` names only shipped things; when-to-start and anything learnt from an average across days are said only as `Next` + future tense + a roadmap entry. The order of `frames` in `HeroStage.tsx` is the argument (its comment says why): changing it is an editorial act.

### The hero is ordinary flow

Never bring back the pinned, scroll-driven stage, nor a header reading that follows the scroll (`HeroStage.tsx` and `MenuBarHeader/reading.ts` say what each cost). Measure the page's length before adding to it: `document.documentElement.scrollHeight` through `scripts/page.sh eval` at 1440 and 390 (10,018 and 13,967 after the last cut).

### The character

**The home page must never import `PanelHint.tsx`**: it costs every page one more render-blocking stylesheet. After changing what the home page imports, count `<link rel="stylesheet">` on `/` and on a docs page. The character is ours on purpose: never a vendor's mascot.

## Motion

`components/Motion` carries its own design. **Never hide served content until a script runs**: an item is armed only once a mounted script finds it off screen, so a failed chunk costs the motion, never the content. To film it: `node scripts/shot.mjs <url> <prefix> --no-wake --rate 0.25 --frames 10 --every 350`.

## Performance and SEO: the baseline

What the four sites share is in the workspace's `.claude/rules/websites.md`. This site, Lighthouse mobile on local production builds (2026-09-30): home perf 96-97, LCP 2.1-2.2 s, 662 KiB, fonts 78 KiB; JS 352 KiB per page. First paint is bimodal on one build (about 2.0 or 3.7 s, in clusters): compare early passes with early passes.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
