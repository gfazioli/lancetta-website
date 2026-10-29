# lancetta-website

Marketing, docs and download site for **Lancetta**, live at https://lancetta.app (`/download` redirects to the newest DMG).

## The thing to get right before anything else

**Nothing on this site may describe as shipped something the app does not do.** The app moves and nothing here fails when it does: before believing or editing any page, read `../Lancetta/AGENTS.md` and the app's `git log`, and grep for the claim, not the config key (claims live in prose: the FAQ and its JSON-LD mirror, the roadmap and the homepage strip, docs callouts).

An unshipped thing carries the `Next` badge **and** the future tense, never one without the other; change them together. `rg 'next:' components/HeroStage/HeroStage.tsx` says which hero section is unshipped today.

`config.app.*` is written by `../Lancetta/scripts/release.sh` off the built binary: never hand-edit it.

## The appcast is a contract with the app, and nothing enforces it

`public/appcast.xml` is the Sparkle feed every installed copy polls (`SUFeedURL` `https://lancetta.app/appcast.xml`; the EdDSA private key is the Keychain account `Lancetta`); `release.sh` prepends an `<item>` per release. **Never rename it, move it out of `public/`, or let a rewrite intercept it**: updates break for every install and nothing here fails.

## Figures

Every number on this site was measured, and the measurements live in `../agent-monitor-app-draft.md` in the workspace root (and, condensed, in `../Lancetta/AGENTS.md`). Do not round them, do not restate them from memory, and do not add a figure that is not in one of those two files. The figures in use and the measurement behind each: `.claude/reference/claims.md`, read before touching a number.

Anything read off a screenshot is **not** a claim and must not become one: the captures are of one developer's machine, so their token totals, plan names and percentages are illustration.

## Never broken

- **The site is light-only**: never add a dark branch or a scheme toggle.
- **Generated files are regenerated, never edited**: `theme/mantine.css`, every icon in
  `public/`, `app/opengraph-image.jpg` and the social preview.
- **Never publish the Processes pane, an agent's page in Settings, or the Maintenance
  pane off the app's fixture home**: each can carry the home directory, the user's name
  and their employer's repositories.
- **The home page never imports `PanelHint.tsx`, and a component on it brings no
  `.module.css` of its own**: each costs every page a render-blocking stylesheet.
- **Never hide served content until a script runs.**

## Read before you change

| Working on | Read first |
| :- | :- |
| Any copy: a page, the FAQ, the roadmap, the hero | `docs/content.md` |
| Styles, fonts, the palette, an icon | `docs/architecture.md` |
| A screenshot | `docs/screenshots.md` |
| Checking a page, filming motion, performance, the social preview | `docs/checking.md` |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
