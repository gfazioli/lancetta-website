import config from '@/config';

/**
 * JSON-LD structured data (schema.org). Rendered server-side so the markup is
 * in the initial HTML where crawlers read it. Three schemas:
 *
 * - `WebsiteJsonLd` (site-wide, in the root layout): the WebSite + publisher
 *   Organization entity.
 * - `SoftwareApplicationJsonLd` (homepage): the app itself.
 * - `FaqJsonLd` (FAQ page): the Q&A, eligible for FAQ rich snippets.
 *
 * No `aggregateRating` is emitted — there are no real ratings to cite, and
 * fabricating one violates Google's guidelines. No `datePublished` either,
 * until there is a release to date.
 */

const SITE = config.metadata.metadataBase.toString().replace(/\/$/, '');

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is static, author-controlled JSON — no user input is
      // interpolated, so serializing it directly is safe.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${SITE}/#website`,
            url: `${SITE}/`,
            name: 'Lancetta',
            description: config.metadata.description,
            publisher: { '@id': `${SITE}/#organization` },
            inLanguage: 'en',
          },
          {
            '@type': 'Organization',
            '@id': `${SITE}/#organization`,
            name: 'Lancetta',
            url: `${SITE}/`,
            logo: { '@type': 'ImageObject', url: `${SITE}/icon-512x512.png` },
          },
        ],
      }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Lancetta',
        description: config.metadata.description,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: `macOS ${config.app.minMacOS}+`,
        url: `${SITE}/`,
        softwareVersion: config.app.version,
        image: `${SITE}/opengraph-image.jpg`,
        screenshot: `${SITE}/screenshot-menu-dark.png`,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@id': `${SITE}/#organization` },
        // Only emitted once there is a build to point at. A downloadUrl that
        // 404s, or a dateModified with no release behind it, is a claim to a
        // crawler exactly as much as it is to a reader.
        ...(config.app.released
          ? {
              downloadUrl: config.app.downloadUrl,
              dateModified: config.app.releaseDate,
              releaseNotes: `${SITE}/docs/release-notes`,
            }
          : {}),
      }}
    />
  );
}

/**
 * Plain-text mirror of the visible answers in `components/FAQ/FAQ.tsx`.
 * Google requires the schema text to match what is on the page.
 *
 * The mirror is what drifts: on the sibling site an inherited FAQ schema
 * outlived the answers it quoted. `StructuredData.test.ts` asserts the
 * question lists are identical, so an added, removed or renamed question
 * fails the suite. It cannot see an edited ANSWER — that one is still on you.
 */
const FAQ_ENTRIES: { question: string; answer: string }[] = [
  {
    question: 'What is Lancetta?',
    answer:
      'Lancetta is a native macOS menu-bar app for coding agents. It reads Codex and Claude Code, draws the 5-hour and the 7-day window for each with when it resets, and tells you what to do with what is left: slow down before an agent stops, switch while the other has room, spend a window before it resets unused — without you opening a terminal to ask.',
  },
  {
    question: 'Why “Lancetta”?',
    answer:
      'A lancetta is the hand of an instrument — the needle that says where you are. It names what the app does rather than which tools it happens to watch, which is why it survives a third and a fourth agent.',
  },
  {
    question: 'Does Lancetta spend tokens to read my quota?',
    answer:
      'No, and that is the constraint the whole app is built around. Codex answers an account question directly — measured over twelve reads, the lifetime token counter did not move by one. Claude’s numbers come from one account read, made with the sign-in Claude Code keeps on your Mac — the same request Claude Code’s own /usage makes, with no model in the loop. Asking a model how much quota is left would cost tokens on every poll, and it is the one route Lancetta will never take.',
  },
  {
    question: 'Which agents does it support?',
    answer:
      'Codex and Claude Code today. A new agent needs code that can read its quota without spending any, which is the whole constraint — so agents arrive with the app rather than being added by hand in Settings.',
  },
  {
    question: 'Lancetta says it can’t find Codex, but Codex is installed. Why?',
    answer:
      'An app opened from the Finder inherits almost no PATH, so Lancetta looks for Codex itself: in the places installers use, and then by asking your shell. A Codex installed somewhere else looks exactly like one that is not installed — so Settings › Sources lists every place Lancetta looked and what was there, and lets you choose the codex binary yourself. A binary you choose is the only one Lancetta runs.',
  },
  {
    question: 'How is it different from the other quota monitors?',
    answer:
      'Advice about a quota needs three things: the ceiling (what your real limit is), the flow (what you have spent), and the series (how that percentage moved over time). The good tools in this space have the first two. The series is the one nobody keeps — a monitor that reads your transcripts has no way to learn the ceiling at all and infers it from your own highest previous block, and one that covers dozens of providers cannot store a series per provider per window and stay maintainable. Lancetta watches two agents instead of dozens and keeps the series for both, which is the only reason it can say where this pace lands, and what to do about it, against the percentage your account actually reports rather than an inferred one. It is also the part that cannot be added later: history only accumulates forward.',
  },
  {
    question: 'Where do its suggestions come from?',
    answer:
      'From the readings Lancetta keeps, never from a model. Each one is worked out on your Mac from the percentage your account reports, the rate it has been moving at, when the window resets, whether you hold a free reset, and the effort set in the agent’s own settings, and each names what it rests on so you can check it. When nothing needs changing, it says that too. Suggestions sit at the top of the panel and of the window; the ones that cannot wait (an agent about to stop, a window about to reset with room left, a free reset about to lapse) also arrive once as a notification, which Settings › Notifications › Suggestions turns off.',
  },
  {
    question: 'Can I refresh Claude on demand, like Codex?',
    answer:
      'Yes, once it is connected: one click in the menu, and Lancetta reads the sign-in Claude Code keeps the way Claude Code does, with normally no dialog to answer. From then on Claude answers an account read the way Codex does, on the same interval and on Refresh now. Through the status-line file instead, the numbers arrive when a session renders one, and the card shows how old they are rather than pretending to be live.',
  },
  {
    question: 'What happens when a reading goes stale?',
    answer:
      'It says so. Every reading carries the time it was taken, and an unknown is drawn as an unknown — never as 0%. A status line rendering an unknown as zero, and a three-hour-old number as current, is the defect this app exists because of.',
  },
  {
    question: 'Claude says I am out, but Lancetta shows two thirds left. Which is right?',
    answer:
      'Both, and that gap is what Lancetta 0.6 exists to close. Some plans give one model a weekly limit of its own, counted separately from the window every monitor reads — so the model you actually want can be spent while the general window is comfortable. The account sends that limit as a row of its own, and Lancetta now draws it under the name your account gives it, with a sentence when its week is spent, when it is back, and when it is heading for empty before it resets. It needs the account route: the status-line file carries the two general windows and nothing else.',
  },
  {
    question: 'Will it interrupt me?',
    answer:
      'Only about what the menu bar cannot already show. The percentage is on your bar, so Lancetta never announces it; it speaks first when a window will run out before it resets — naming the reset beside the moment it runs out — when an agent has nothing left, when it is ready again, when a reading has stopped moving while looking live, and when Codex grants you a free reset. Each once, at the moment it changes, and never on launch — except for a free reset granted while Lancetta was closed, which is news rather than a state. macOS is asked for permission the first time there is actually something to say. Alerts and suggestions are separate switches, each agent has its own, and a sound is reserved for the two moments you are not looking at a screen.',
  },
  {
    question: 'Is Lancetta only in the menu bar?',
    answer:
      'Mostly, and that is the point. There is also a window — ⌘O from the menu — with the same suggestions first, the daily token chart, both agents in detail, the background processes the agents have left running, and Maintenance, which checks the files they read at every start. A Dock icon appears while that window is open and goes again when you close it, because a window needs its app to be a normal one; at rest Lancetta keeps nothing in the Dock, and closing the window quits nothing. On a MacBook Pro the reading also sits under the notch.',
  },
  {
    question: 'What about the processes the agents leave behind?',
    answer:
      'Coding agents leave a background process tree behind for every folder they worked in, and nothing ever reaps them: close the folder before the session ends and nothing is ever told to stop. Measured once on one Mac: 28 processes holding 2.68 GB, 12 of them serving folders that had already been deleted. Lancetta lists them and reclaims that memory on your say-so — and it always shows you what it is about to stop before it stops it.',
  },
  {
    question: 'What does the Maintenance pane do?',
    answer:
      'It lists the files your coding agents read before every session (CLAUDE.md, AGENTS.md, rules, skills, commands, settings and memory) in each repository Claude Code has worked in and the folders above it, and measures what loads at each start against Claude Code’s own warning thresholds. Twenty checks say what is wrong, each with why it matters. Five kinds of finding have a fix that needs no choosing, such as importing AGENTS.md into CLAUDE.md or keeping a personal file out of git: each is shown in full before it is applied, and applied whole or not at all. The rest opens in Claude Code, in plan mode, with the prompt already written. Files no agent uses can go to the Trash.',
  },
  {
    question: 'Does anything leave my Mac?',
    answer:
      'Not what you do with the agents. Lancetta reads what is already on your machine and draws it in your menu bar. There is no account, no server of ours and no telemetry; the only requests are the usage reads the agents themselves make (to Anthropic and OpenAI, with your own sign-in), the update check you turn on, and a sponsor picture in About. Maintenance reads the agents’ instruction files where they are, and the suggestions read the effort set in Claude Code’s and Codex’s own settings; neither leaves the Mac, unless you hand a finding to Claude Code, which then works as it always does. The privacy page lists each one.',
  },
  {
    question: 'What macOS version do I need?',
    answer:
      'macOS 15 (Sequoia) or later. The notch panel needs a Mac that has a notch; on any other Mac the island never appears, and the menu-bar item works the same everywhere.',
  },
  {
    question: 'Which languages does Lancetta speak?',
    answer:
      'English, Italian, French, German, Spanish, Portuguese and Dutch. Lancetta follows your Mac’s language — there is no switch in the app; to use another one, reorder your preferred languages in System Settings › General › Language & Region. The report you copy for an issue and the command line’s output stay in English, so whoever reads them can.',
  },
  {
    question: 'Are those the real Codex and Claude logos?',
    answer:
      'They are the vendors’ own marks, drawn from vector data so they stay sharp at any size, and used nominatively — to name the products Lancetta reads. Lancetta is not affiliated with, or endorsed by, OpenAI or Anthropic, and one switch in Settings replaces the whole menu with neutral system symbols.',
  },
  {
    question: 'What does it cost?',
    answer: 'Lancetta is free. If you find it useful, consider sponsoring the project.',
  },
  {
    question: 'Is there a Lancetta community?',
    answer:
      'Yes, on Discord, where Lancetta and its sibling apps live: get help, suggest features, vote on what comes next and talk directly with the maker.',
  },
  {
    question: 'Where do I download it?',
    answer:
      'The download button takes you straight to the latest DMG. It is signed with an Apple Developer ID and notarized by Apple, so it opens without the detour Gatekeeper puts unsigned apps through, and it updates itself from then on. What’s next says what has shipped and what is being built, and every build is on the releases page.',
  },
];

/** Exported for the drift test that pairs this mirror with the page itself. */
export const faqSchemaQuestions = FAQ_ENTRIES.map((e) => e.question);

export function FaqJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_ENTRIES.map((entry) => ({
          '@type': 'Question',
          name: entry.question,
          acceptedAnswer: { '@type': 'Answer', text: entry.answer },
        })),
      }}
    />
  );
}
