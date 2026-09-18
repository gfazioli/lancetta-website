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
        image: `${SITE}/opengraph-image.png`,
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
      'Lancetta is a native macOS menu-bar app that shows how much quota your coding agents have left. It reads Codex and Claude Code, draws the 5-hour and the 7-day window for each, and tells you when each one resets — without you opening a terminal to ask.',
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
    question: 'Can I refresh Claude on demand, like Codex?',
    answer:
      'Yes, once it is connected: one click in the menu, and macOS asks once whether Lancetta may read the sign-in Claude Code keeps. From then on Claude answers an account read the way Codex does, on the same interval and on Refresh now. Through the status-line file instead, the numbers arrive when a session renders one, and the card shows how old they are rather than pretending to be live.',
  },
  {
    question: 'What happens when a reading goes stale?',
    answer:
      'It says so. Every reading carries the time it was taken, and an unknown is drawn as an unknown — never as 0%. A status line rendering an unknown as zero, and a three-hour-old number as current, is the defect this app exists because of.',
  },
  {
    question: 'Is Lancetta only in the menu bar?',
    answer:
      'Mostly, and that is the point. There is also a window — ⌘O from the menu — with the daily token chart, both agents in detail, and the background processes the agents have left running. A Dock icon appears while that window is open and goes again when you close it, because a window needs its app to be a normal one; at rest Lancetta keeps nothing in the Dock, and closing the window quits nothing. On a MacBook Pro the reading also sits under the notch.',
  },
  {
    question: 'What about the processes the agents leave behind?',
    answer:
      'Coding agents leave a background process tree behind for every folder they worked in, and nothing ever reaps them: close the folder before the session ends and nothing is ever told to stop. Measured once on one Mac: 28 processes holding 2.68 GB, 12 of them serving folders that had already been deleted. Lancetta lists them and reclaims that memory on your say-so — and it always shows you what it is about to stop before it stops it.',
  },
  {
    question: 'Does anything leave my Mac?',
    answer:
      'No. Lancetta reads what is already on your machine and draws it in your menu bar. There is no account, no server and no telemetry — nothing is sent anywhere.',
  },
  {
    question: 'What macOS version do I need?',
    answer:
      'macOS 15 (Sequoia) or later. The notch panel needs a Mac that has a notch; on any other Mac that pane is hidden entirely, and the menu-bar item works the same everywhere.',
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
    question: 'Where do I download it?',
    answer:
      'The download button takes you straight to the latest DMG. It is signed with an Apple Developer ID and notarized by Apple, so it opens without the detour Gatekeeper puts unsigned apps through, and it updates itself from then on. The roadmap says what is in each version, and every build is on the releases page.',
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
