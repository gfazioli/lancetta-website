import { render, screen, within } from '@/test-utils';
import config from '@/config';
import { MantineFooter } from './MantineFooter';

/**
 * The publisher line is a legal requirement, not decoration: the VAT number on
 * every page (art. 35 DPR 633/72) and the legal notice reachable from every
 * page (art. 7 D.Lgs. 70/2003). It is read from `config.legal`, so this pins
 * the text the reader actually gets, whitespace included -- a space lost
 * between JSX chunks would join the owner to the VAT number.
 */
describe('MantineFooter publisher line', () => {
  it('names the brand, the owner and the VAT number', () => {
    render(<MantineFooter year={2026} />);
    const line = screen.getByText(/P\.IVA/).closest('p');
    expect(line?.textContent).toBe(
      `© 2026 ${config.legal.brand} — ${config.legal.owner}·P.IVA ${config.legal.vatNumber}·Legal·Privacy`
    );
  });

  it('links to the legal notice and the privacy policy', () => {
    render(<MantineFooter year={2026} />);
    // Scoped to the line: a footer column may carry a Privacy link of its own.
    const line = screen.getByText(/P\.IVA/).closest('p') as HTMLElement;
    expect(within(line).getByRole('link', { name: 'Legal' })).toHaveAttribute(
      'href',
      '/docs/legal'
    );
    expect(within(line).getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/docs/privacy'
    );
  });
});

/**
 * The icon row links Lancetta's own YouTube channel, never the author's
 * personal one: the URL is pinned here, not read back from `config`.
 */
describe('MantineFooter social links', () => {
  it("lists the icon row in order, with Lancetta's own YouTube channel", () => {
    render(<MantineFooter year={2026} />);
    // The icon row, found through its first icon: the text above it links to
    // Discord too.
    const icons = screen.getByRole('link', { name: 'GitHub' }).parentElement as HTMLElement;
    expect(
      within(icons)
        .getAllByRole('link')
        .map((link) => link.getAttribute('aria-label'))
    ).toEqual(['GitHub', 'X', 'Discord', 'YouTube', 'Newsletter']);
    expect(within(icons).getByRole('link', { name: 'YouTube' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@Lancetta-app'
    );
  });
});

/**
 * The newsletter band leads the footer on every page, as on findergit.app. An
 * h2, so a page with no h2 of its own (Legal, the FAQ) goes h1, h2 rather than
 * skipping a level, and the subscribe link is the publication itself.
 */
describe('MantineFooter newsletter band', () => {
  it('is an h2 with the Substack publication behind it', () => {
    render(<MantineFooter year={2026} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Get release updates' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Subscribe for updates' })).toHaveAttribute(
      'href',
      config.community.newsletter
    );
  });
});
