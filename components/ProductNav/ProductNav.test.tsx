import { render, screen } from '@/test-utils';
import { ProductNav, productSections } from './ProductNav';

describe('ProductNav', () => {
  it('links every section of the page, with the first one current before any scrolling', () => {
    render(<ProductNav />);
    const links = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('#'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      productSections.map((section) => `#${section.id}`)
    );
    // jsdom has no layout, so every section measures at the top and the spy
    // settles on the last one it can find — none, since nothing else is
    // rendered here. The initial state has to be the first section.
    expect(links[0]).toHaveAttribute('aria-current', 'location');
    expect(links[1]).not.toHaveAttribute('aria-current');
  });

  it('carries the one action, which is the docs while nothing is released', () => {
    render(<ProductNav />);
    expect(screen.getByRole('link', { name: 'Read the docs' })).toHaveAttribute('href', '/docs');
  });
});
