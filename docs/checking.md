# Checking the site

Read before judging a page by a picture, filming motion, measuring performance, or changing the social preview.

## The repository's own metadata, which git does not carry

The GitHub **social preview** has no API and no `gh` field: it is uploaded by hand from `.github/social-preview.jpg` (Settings → General → Social preview), so check what is set rather than assume: `curl -sL -A 'Mozilla/5.0' https://github.com/gfazioli/lancetta-website | grep -oE '<meta property="og:image" content="[^"]*"'`. It and `app/opengraph-image.jpg` come from `scripts/social-card.png` via `swift scripts/social.swift .`: edit the master, never the outputs.

## Seeing the page

`scripts/page.sh` (WKWebView: one state, `eval`) or `scripts/shot.mjs` (Chrome: anything that moves or sits down the page); their headers carry the traps. In WKWebView the `TextAnimate` line of the headline, and anything starting at `opacity: 0`, photographs blank or partly blank: read the DOM (`h1.textContent`, `getAnimations()`) before believing a picture, and never "fix" the page for the instrument.

## Motion

`components/Motion` carries its own design. **Never hide served content until a script runs**: an item is armed only once a mounted script finds it off screen, so a failed chunk costs the motion, never the content. To film it: `node scripts/shot.mjs <url> <prefix> --no-wake --rate 0.25 --frames 10 --every 350`.

## Performance and SEO

Lighthouse mobile on local production builds with `LH_CHROME_FLAGS=--disable-features=RenderBlockingFonts`; past results are in `.claude/reference/baselines.md`. Unpinned, the first paint is bimodal on one build (about 2.0 or 3.7 s, in clusters): compare early passes with early passes.
