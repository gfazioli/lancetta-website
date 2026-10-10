import { faqQuestions } from '@/components/FAQ/FAQ';
import { faqSchemaQuestions } from './StructuredData';

/*
 * A FAQ rich result quotes text Google expects to find on the page. Both the
 * page and this schema read `components/FAQ/faq-items.ts`; this stays to catch
 * a second list creeping back in on either side. The answers drawn with links
 * are held to their plain text in FAQ.test.tsx.
 */
describe('FAQ structured data', () => {
  it('quotes exactly the questions the page renders, in the same order', () => {
    expect(faqSchemaQuestions).toEqual(faqQuestions);
  });

  it('has something to compare — an empty list would pass the test above', () => {
    expect(faqQuestions.length).toBeGreaterThan(5);
  });
});
