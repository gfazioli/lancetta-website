import '@mantine/core/styles.css';
// !! The order of these imports is important !!
import '@gfazioli/mantine-marquee/styles.css';
import '@gfazioli/mantine-text-animate/styles.css';
import '../theme/global.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { theme } from '../theme';

export const parameters = {
  layout: 'fullscreen',
  options: {
    showPanel: false,
    // @ts-expect-error - storybook throws build error for (a: any, b: any)
    storySort: (a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }),
  },
  backgrounds: { disable: true },
};

/*
 * No scheme switcher. The site is light-only, and a Storybook that can render
 * a dark variant of a component the site cannot show is a place to approve a
 * design nobody will ever see — it had one, and the `dark` ladder it drew
 * from no longer exists in `theme.ts`.
 *
 * `theme/global.css` is imported here and not in the app alone, because the
 * `--lan-*` tokens every component reads live in it: without it a story
 * renders with an empty accent and a transparent surface.
 */
export const decorators = [
  (renderStory: any) => (
    <MantineProvider theme={theme} forceColorScheme="light">
      <ColorSchemeScript forceColorScheme="light" />
      {renderStory()}
    </MantineProvider>
  ),
];
