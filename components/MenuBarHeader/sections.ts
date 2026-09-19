/**
 * The home page's sections, in page order. Every id here is an anchor the page
 * renders; `Welcome.test.tsx` checks that, because a link to an anchor that
 * does not exist scrolls nowhere and nothing reports it.
 *
 * The header links to a SUBSET of these (see `MenuBarHeader.tsx`): a menu bar
 * with six items in it stops reading as a menu bar. The list is still the
 * contract for what the page must render, which is why it lives here rather
 * than inside the component that happens to show four of them.
 */
export const productSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'costs-nothing', label: 'Costs nothing' },
  { id: 'roadmap', label: 'What’s next' },
  { id: 'faq', label: 'FAQ' },
] as const;
