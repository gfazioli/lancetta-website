# Screenshots

Read before adding or replacing a capture.

`public/screenshot-*.png` are captures of the real build; re-shooting any set (window set, panel, crops, Settings), with its hatches, traps and per-frame checks, is the workspace's `lancetta-screenshots` skill.

On a docs page a capture is drawn at its size in points, half its pixels (`DocsImage`). A page whose first picture is its largest paint writes it as `<LeadImage src={imported} />`, never as a Markdown image, which is always lazy (`DocsImage.tsx` says why, and the two traps on the way).

- **Two surfaces may not be published, for the same reason**: the **Processes pane** lists each tree by the directory it was started for, and an **agent's page in Settings** carries the absolute path that agent is read from; on a developer's Mac both contain the home directory, hence the user's name and often their employer's repositories. Check what is in the frame before publishing, every time. On a Mac where `codex` lives under `~`, the Codex page is not publishable.
- The **Maintenance pane** is a third such surface (it lists the repositories Claude Code has worked in): shoot it only on the app's fixture home (`LANCETTA_DEMO_HOME`, built by the app's `scripts/demo-home.sh`), and the suggestions only on its capture cast (`LANCETTA_DEMO_AGENT=showcase`), whose numbers `components/MenuBarHeader/panel-demo.ts` and `reading.ts` repeat.
- **Every capture takes `APP_LANG=en_GB`** (`settings-shots.sh` pins it itself): the app follows the Mac's language and nothing in a PNG says it is the wrong one.
- What the site says about languages comes from `../Lancetta/scripts/i18n/i18n.py langs` plus English; a language added to the app is a grep for `Dutch` here. The FAQ, its JSON-LD and Troubleshooting say the copied report is English only because of the app's `L10n.evidence` gate: if it goes, so do those sentences.
