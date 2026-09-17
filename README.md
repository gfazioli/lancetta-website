# lancetta-website

The marketing, documentation and download site for **Lancetta** — a native macOS
menu-bar monitor for coding agents.

> **This is not the app.** It is a Next.js site deployed on Vercel. The app
> itself is a separate, private repository.

- **Live**: https://lancetta.app *(not deployed yet)*
- **App repo** (private, Swift): https://github.com/gfazioli/Lancetta
- **This repo**: https://github.com/gfazioli/lancetta-website

## What Lancetta is

Two panels that happen to share a window:

- **Quota** — the 5-hour and 7-day windows for Codex and Claude Code, with the
  bucket that refused named rather than averaged away, and every reading
  carrying its own age.
- **Memory** — the background agent process trees nothing ever reaps. *(v0.2.)*

Reading a quota costs **no tokens**, and that is the constraint the whole app is
built around. Measured: twelve account reads left the lifetime token counter
unchanged at 318,009,023, against a positive control showing the same counter
move by 29,188,602 across a day of real use.

## Stack

Next.js 16 + Nextra 4 (MDX docs), Mantine 9, Yarn 4. Bootstrapped from
`findergit-website`, which is the same template `netfox-website` and
`vicenda-website` run.

```sh
yarn install
yarn dev          # dev server
yarn build        # production build + pagefind index
yarn test         # typegen, format check, lint, typecheck, jest
```

If `yarn <cmd>` answers `command not found: next` / `oxfmt`, the Yarn PATH shim
is not wired on this machine — run the binary directly
(`./node_modules/.bin/next dev`). `yarn test` and `yarn jest` route through the
npm-run shim and work regardless.

## Before the first release

`config.app.released` is `false`, and several things key off it: the hero CTA,
the release strip, the Download tab, and the `downloadUrl`/`dateModified` in the
JSON-LD. Flip it in the same commit that publishes the first build, and restore
the `download` entry in `app/_meta.tsx` and the footer highlight with it.

## Structure

| | |
|---|---|
| `app/` | App Router — homepage, docs route, API routes, sitemap, manifest |
| `components/` | Homepage sections, navbar, footer, release notes, structured data |
| `content/` | The MDX docs, served under `/docs` |
| `config/index.ts` | Everything site-specific: metadata, GitHub repo, app version |
| `theme.ts` | The palette, derived from the app icon |
| `theme/global.css` | Design tokens, including the two agent tints |

## Brand

The palette is the app icon's, sampled rather than picked — see the comments in
`theme.ts`. The short version: the brand accent is the icon's **third** bar,
because the other two hues already mean *which agent* inside the app (teal is
Codex, orange is Claude Code) and a site accent borrowed from one of them would
disagree with every screenshot on the page.

## Licence

MIT — see [LICENSE](./LICENSE).
