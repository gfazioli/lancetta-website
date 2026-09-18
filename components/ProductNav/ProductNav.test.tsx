import { render, screen } from '@/test-utils';
import config from '@/config';
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

  it('carries the one action: the download once released, the docs before that', () => {
    render(<ProductNav />);
    // Keyed off the config rather than hardcoded, so the day `released` flips
    // this test says what the bar says, instead of failing on a true page.
    const [name, href] = config.app.released
      ? ['Download', '/download']
      : ['Read the docs', '/docs'];
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
  });
});
