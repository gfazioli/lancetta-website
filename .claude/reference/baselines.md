# Measured baselines

Past measurements of this site, newest first. The rules that use them are in `CLAUDE.md` (*The hero is ordinary flow*, *Performance and SEO*).

## Page length

`document.documentElement.scrollHeight` at 1440 and 390, in Chrome (`scripts/shot.mjs --eval`): 14,482 and 20,356 on 2026-10-23 (-78 and +174 against main measured that day, 14,560 and 20,182), with a third card ahead (the widget), a Storage sentence under Processes and two FAQ entries fewer; 14,559 and 20,181 on 2026-10-19, with the newsletter band at the top of the footer (+229 and +249, on every page); 14,331 and 19,932 earlier that day, after the Maintenance frame's body said what loads at each start (+29, one line); 14,302 and 19,903 earlier that day, with the Product Hunt badge under the hero (+70); 14,232 and 19,833 on 2026-10-18, with the projection frame (Limits' charts); 13,728 and 19,103 on 2026-10-17 with the 0.61.0 shots (the panel 1694 px tall, from 1406); 13,394 and 18,961 earlier that day, with the Sessions frame and the nine-card strip; 10,018 and 13,967 at the last cut.

## Lighthouse

This site, Lighthouse mobile on local production builds with `LH_CHROME_FLAGS=--disable-features=RenderBlockingFonts` (2026-10-11, Mantine CSS extracted from styles.css, AVIF): home perf 96-97, FCP 1.87-1.89 s, LCP 2.14-2.15 s, 676 KiB, fonts 78 KiB; /docs/the-menu perf 98, FCP 1.78-1.87 s, LCP 2.08-2.14 s; CSS 3 sheets, 265 KB raw; JS 363 KiB per page.

## Mantine CSS

Before the extraction to `theme/mantine.css`, the full `@mantine/core/styles.css` was 277 KB of render-blocking CSS of which a page used 11-13%.
