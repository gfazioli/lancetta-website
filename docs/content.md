# Content

Read before changing any copy: a page, the FAQ, the roadmap, the hero.

## Content guidelines

- All website content is in **English**.
- The app is described as: *a native macOS menu-bar app that tells you when and how to use your coding agents*. Not a monitor: what it reads is the basis, never the subject.
- Naming **Codex** and **Claude Code** is the product definition, not an infrastructure leak. What does not belong in user-facing copy is the *mechanism* (process names, wire protocols, method names, file paths): that goes in `content/how-it-reads.mdx`, in the plainest terms that stay true, and nowhere on the homepage.
- The trademark position is fixed and appears in `content/settings.mdx` and the FAQ: the agent marks are the vendors' own artwork, used nominatively, and Lancetta is not affiliated with or endorsed by OpenAI or Anthropic.
- **A version number is not evidence to a visitor who never used the app** (it is not launched): prefer the measurement, or drop the qualifier. The one exception is the `### v0.N` headings under *Already shipped* on the roadmap. Never reference revisions of the page itself ("this entry used to..."); "arrived early" against the plan is fine.

## The one job, and the order that argues for it

**Lancetta guides; it does not show consumption.** The copy is built around the decisions it makes with you (when to push on, when to slow down, what to switch to, how the agents are set up), with the Claude Code sessions waiting on you beside them (not a suggestion: `Guidance` has no session item), and the quota, the pace and the reset appear only as what a suggestion rests on. A new feature goes under that, never beside it. Showing no money is a claim, not an omission. The `h1` names only shipped things; when-to-start and anything learnt from an average across days are said only as `Next` + future tense + a roadmap entry. The order of `frames` in `HeroStage.tsx` is the argument (its comment says why): changing it is an editorial act.

- **The hero is ordinary flow**: never bring back the pinned, scroll-driven stage, nor a header reading that follows the scroll (`HeroStage.tsx` and `MenuBarHeader/reading.ts` say what each cost). Measure the page's length before adding to it: `document.documentElement.scrollHeight` at 1440 and 390, in Chrome (`scripts/shot.mjs --eval`), against main measured the same day; past lengths are in `.claude/reference/baselines.md`.
- **The home page must never import `PanelHint.tsx`**: it costs every page one more render-blocking stylesheet. **A new or ported component on the home page brings no `.module.css` of its own** for the same reason: style it through its host's module, as `Mascot` does. After changing what the home page imports, count `<link rel="stylesheet">` on `/` and on a docs page.
- The character is ours on purpose: never a vendor's mascot.
