import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme';
import { FAQ, faqItems, richAnswers } from './FAQ';
import { faqEntries } from './faq-items';

/**
 * The defect lived on the SERVER, so this renders there. Mantine 9 keeps a
 * closed panel in a React <Activity>, which the server renders as nothing: the
 * page Google fetched carried every question and no answer. A jsdom `render`
 * cannot see it -- on the client a hidden Activity still mounts its children.
 * No `env="test"` either, because that switches Mantine's Collapse to a
 * different branch than the one the site runs.
 */
describe('FAQ server render', () => {
  it('carries every answer in the HTML, not only the questions', () => {
    const html = renderToString(
      <MantineProvider theme={theme}>
        <FAQ />
      </MantineProvider>
    );
    const plain = faqItems.filter((i) => typeof i.answer === 'string');
    expect(plain.length).toBeGreaterThan(5);
    for (const { answer } of plain) {
      // The opening words: no quote or ampersand, which renderToString escapes.
      const opening = (answer as string).split(/['"&]/)[0].slice(0, 40);
      expect(html).toContain(opening);
    }
  });
});

describe('FAQ answers drawn with links', () => {
  // The JSON-LD quotes the plain text in faq-items.ts; the page draws these
  // three with links. Their words have to be the same, or the rich result
  // quotes an answer the page no longer gives.
  const text = (html: string) =>
    html
      // MantineProvider injects its CSS variables as a <style> block.
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

  it.each(Object.keys(richAnswers))('%s says what its plain text says', (value) => {
    const entry = faqEntries.find((e) => e.value === value);
    const html = renderToString(
      <MantineProvider theme={theme}>{richAnswers[value]}</MantineProvider>
    );
    expect(text(html)).toBe(entry?.answer);
  });
});
