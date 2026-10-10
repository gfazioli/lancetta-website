/*
 * The FAQ, as plain text: what the page renders and what its FAQPage JSON-LD
 * quotes come from this one list, so the two cannot drift. Every answer is a
 * claim someone can check, so each one has to be true of the build that is
 * actually shipping: do not describe a feature in the present tense until it
 * ships, and check the app's own CLAUDE.md and git log, not this comment.
 *
 * A plain module rather than part of `FAQ.tsx`, which is a client component:
 * `FaqJsonLd` renders on the server (`content/faq.mdx`), where an import from
 * a client module arrives as a reference, not as this array. The three
 * answers the page draws with links are in `FAQ.tsx` (`richAnswers`), and a
 * test holds their text to the plain text here.
 */
export interface FaqEntry {
  value: string;
  question: string;
  answer: string;
}

export const faqEntries: FaqEntry[] = [
  {
    value: 'what',
    question: 'What is Lancetta?',
    answer:
      'Lancetta is a native macOS menu-bar app that tells you when and how to use your coding agents. It reads the quota of Codex and Claude Code without spending any, keeps every reading, and scans the files the agents load at every start; from those it suggests what to do next: go all in while a window has room it would lose, lower the effort or hand routine work to a lighter model before an agent stops, move to the other agent while it has room, trim a setup every session pays for.',
  },
  {
    value: 'name',
    question: 'Why “Lancetta”?',
    answer:
      'A lancetta is the hand of an instrument — the needle that says where you are. It names what the app does rather than which tools it happens to watch, which is why it survives a third and a fourth agent.',
  },
  {
    value: 'tokens',
    question: 'Does Lancetta spend tokens to read my quota?',
    answer:
      'No, and that is the constraint the whole app is built around. Codex answers an account question directly — measured over twelve reads, the lifetime token counter did not move by one. Claude’s numbers come from one account read, made with the sign-in Claude Code keeps on your Mac — the same request Claude Code’s own /usage makes, with no model in the loop. Asking a model how much quota is left would cost tokens on every poll, and it is the one route Lancetta will never take.',
  },
  {
    value: 'agents',
    question: 'Which agents does it support?',
    answer:
      'For quota and suggestions, Codex and Claude Code today. A new agent needs code that can read its quota without spending any, which is the whole constraint — so agents arrive with the app rather than being added by hand in Settings. Maintenance reads more: the instruction files of Claude Code, Codex, Cursor, GitHub Copilot and Gemini.',
  },
  {
    value: 'not-found',
    question: 'Lancetta says it can’t find Codex, but Codex is installed. Why?',
    answer:
      'An app opened from the Finder inherits almost no PATH, so Lancetta looks for Codex itself: in the places installers use, and then by asking your shell. A Codex installed somewhere else looks exactly like one that is not installed — so Settings › Sources lists every place Lancetta looked and what was there, and lets you choose the codex binary yourself. A binary you choose is the only one Lancetta runs.',
  },
  {
    value: 'different',
    question: 'How is it different from the other quota monitors?',
    answer:
      'A monitor shows you the percentage; Lancetta tells you what to do with it. Advice about a quota needs three things: the ceiling (what your real limit is), the flow (what you have spent), and the series (how that percentage moved over time). The good tools in this space have the first two. The series is the one nobody keeps — a monitor that reads your transcripts has no way to learn the ceiling at all and infers it from your own highest previous block, and one that covers dozens of providers cannot store a series per provider per window and stay maintainable. Lancetta watches two agents instead of dozens and keeps the series for both, which is the only reason it can say where this pace lands, and what to do about it, against the percentage your account actually reports rather than an inferred one. It is also the part that cannot be added later: history only accumulates forward.',
  },
  {
    value: 'suggestions',
    question: 'Where do its suggestions come from?',
    answer:
      'From the readings Lancetta keeps, never from a model. Each one is worked out on your Mac from the percentage your account reports, the rate it has been moving at, when the window resets, whether you hold a free reset, and the effort set in the agent’s own settings, and each names what it rests on so you can check it. When nothing needs changing, it says that too. Suggestions sit at the top of the panel and of the window; the ones that cannot wait (an agent about to stop, a window about to reset with room left, a free reset about to lapse) also arrive once as a notification, which Settings › Notifications › Suggestions turns off.',
  },
  {
    value: 'refresh',
    question: 'Can I refresh Claude on demand, like Codex?',
    answer:
      'Yes, once it is connected: one click in the menu, and Lancetta reads the sign-in Claude Code keeps the way Claude Code does, with normally no dialog to answer. From then on Claude answers an account read the way Codex does, on the same interval and on Refresh now. Through the status-line file instead, the numbers arrive when a session renders one, and the card shows how old they are rather than pretending to be live.',
  },
  {
    value: 'stale',
    question: 'What happens when a reading goes stale?',
    answer:
      'It says so. Every reading carries the time it was taken, and an unknown is drawn as an unknown — never as 0%. A status line rendering an unknown as zero, and a three-hour-old number as current, is the defect this app exists because of.',
  },
  {
    value: 'model-limit',
    question: 'Claude says I am out, but Lancetta shows two thirds left. Which is right?',
    answer:
      'Both, and that gap is what Lancetta 0.6 exists to close. Some plans give one model a weekly limit of its own, counted separately from the window every monitor reads — so the model you actually want can be spent while the general window is comfortable. The account sends that limit as a row of its own, and Lancetta now draws it under the name your account gives it, with a sentence when its week is spent, when it is back, and when it is heading for empty before it resets. It needs the account route: the status-line file carries the two general windows and nothing else.',
  },
  {
    value: 'interrupt',
    question: 'Will it interrupt me?',
    answer:
      'Only about what the menu bar cannot already show. The percentage is on your bar, so Lancetta never announces it; it speaks first when a suggestion cannot wait — an agent that will stop within the hour, a window about to reset with room left, a free reset about to lapse — when a window will run out before it resets, when an agent has nothing left, when it is ready again, when a reading has stopped moving while looking live, and when Codex grants you a free reset. A banner about an agent carries the first steps of its suggestion. Each once, at the moment it changes, and never on launch, with two exceptions: a free reset granted while Lancetta was closed, which is news rather than a state, and a suggestion that cannot wait, said once at the first reading. macOS is asked for permission the first time there is actually something to say. Alerts and suggestions are separate switches, each agent has its own, and a sound is reserved for the two moments you are not looking at a screen.',
  },
  {
    value: 'surfaces',
    question: 'Is Lancetta only in the menu bar?',
    answer:
      'Mostly, and that is the point. There is also a window — ⌘O from the menu — with the same suggestions first, the daily token chart, both agents in detail, the background processes the agents have left running, and Maintenance, which checks the files they read at every start. A Dock icon appears while that window is open and goes again when you close it, because a window needs its app to be a normal one; at rest Lancetta keeps nothing in the Dock, and closing the window quits nothing. On a MacBook Pro the reading also sits under the notch.',
  },
  {
    value: 'memory',
    question: 'What about the processes the agents leave behind?',
    answer:
      'Coding agents leave a background process tree behind for every folder they worked in, and nothing ever reaps them: close the folder before the session ends and nothing is ever told to stop. Measured once on one Mac: 28 processes holding 2.68 GB, 12 of them serving folders that had already been deleted. Lancetta lists them and reclaims that memory on your say-so — and it always shows you what it is about to stop before it stops it.',
  },
  {
    value: 'maintenance',
    question: 'What does the Maintenance pane do?',
    answer:
      'It lists the files your coding agents read before every session (CLAUDE.md, AGENTS.md, rules, skills, commands, settings and memory) in each repository Claude Code has worked in and the folders above it, and measures what loads at each start against Claude Code’s own warning thresholds. Twenty checks say what is wrong, each with why it matters. Five kinds of finding have a fix that needs no choosing, such as importing AGENTS.md into CLAUDE.md or keeping a personal file out of git: each is shown in full before it is applied, and applied whole or not at all. The rest opens in Claude Code, in plan mode, with the prompt already written. Files no agent uses can go to the Trash.',
  },
  {
    value: 'privacy',
    question: 'Does anything leave my Mac?',
    answer:
      'Not what you do with the agents. Lancetta reads what is already on your machine and draws it in your menu bar. There is no account, no server of ours and no telemetry; the only requests are the usage reads the agents themselves make (to Anthropic and OpenAI, with your own sign-in), the update check you turn on, and a sponsor picture in About. Maintenance reads the agents’ instruction files where they are, and the suggestions read the effort set in Claude Code’s and Codex’s own settings; neither leaves the Mac, unless you hand a finding to Claude Code, which then works as it always does. The privacy page lists each one.',
  },
  {
    value: 'macos',
    question: 'What macOS version do I need?',
    answer:
      'macOS 15 (Sequoia) or later. The notch panel needs a Mac that has a notch; on any other Mac the island never appears, and the menu-bar item works the same everywhere.',
  },
  {
    value: 'languages',
    question: 'Which languages does Lancetta speak?',
    answer:
      'English, Italian, French, German, Spanish, Portuguese and Dutch. Lancetta follows your Mac’s language — there is no switch in the app; to use another one, reorder your preferred languages in System Settings › General › Language & Region. The report you copy for an issue and the command line’s output stay in English, so whoever reads them can.',
  },
  {
    value: 'marks',
    question: 'Are those the real Codex and Claude logos?',
    answer:
      'They are the vendors’ own marks, drawn from vector data so they stay sharp at any size, and used nominatively — to name the products Lancetta reads. Lancetta is not affiliated with, or endorsed by, OpenAI or Anthropic, and one switch in Settings replaces the whole menu with neutral system symbols.',
  },
  {
    value: 'price',
    question: 'What does it cost?',
    answer: 'Lancetta is free. If you find it useful, consider sponsoring the project.',
  },
  {
    value: 'community',
    question: 'Is there a Lancetta community?',
    answer:
      'Yes, on Discord, where Lancetta and its sibling apps live: get help, suggest features, vote on what comes next and talk directly with the maker.',
  },
  {
    value: 'when',
    question: 'Where do I download it?',
    answer:
      'The download button takes you straight to the latest DMG. It is signed with an Apple Developer ID and notarized by Apple, so it opens without the detour Gatekeeper puts unsigned apps through, and it updates itself from then on. What’s next says what has shipped and what is being built, and every build is on the releases page.',
  },
];

export const faqQuestions = faqEntries.map((entry) => entry.question);
