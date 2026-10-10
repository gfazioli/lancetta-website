import { faqEntries } from '@/components/FAQ/faq-items';
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
 * The FAQ's own plain text (`components/FAQ/faq-items.ts`): Google requires the
 * schema to match what is on the page, and quoting the list the page renders
 * is what keeps it so. It used to be a hand-kept mirror here, the thing that
 * drifts: on the sibling site an inherited FAQ schema outlived its answers.
 */
export const faqSchemaQuestions = faqEntries.map((e) => e.question);

export function FaqJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqEntries.map((entry) => ({
          '@type': 'Question',
          name: entry.question,
          acceptedAnswer: { '@type': 'Answer', text: entry.answer },
        })),
      }}
    />
  );
}
