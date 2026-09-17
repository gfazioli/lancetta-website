import { faqQuestions } from '@/components/FAQ/FAQ';
import { faqSchemaQuestions } from './StructuredData';

/*
 * A FAQ rich result quotes text Google expects to find on the page. The
 * schema here is a hand-kept mirror of `FAQ.tsx`, and a mirror is exactly the
 * thing that drifts — the sibling site shipped an inherited FAQ schema that
 * outlived the answers it quoted, and nothing failed.
 *
 * This catches the drift that is mechanical: a question added, removed or
 * reworded on one side only. It deliberately does NOT try to compare answers —
 * two of them carry JSX links, so there is no single string to compare against,
 * and a test that pretended otherwise would be the "check that can only pass"
 * this workspace already has a rule about.
 */
describe('FAQ structured data', () => {
  it('quotes exactly the questions the page renders, in the same order', () => {
    expect(faqSchemaQuestions).toEqual(faqQuestions);
  });

  it('has something to compare — an empty list would pass the test above', () => {
    expect(faqQuestions.length).toBeGreaterThan(5);
  });
});
