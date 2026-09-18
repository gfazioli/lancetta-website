import type { MetadataRoute } from 'next';
import config from '@/config';

/**
 * Web app manifest. Adds the mobile/PWA install signal that was missing and
 * puts the previously-orphaned `android-chrome-*` icons to use. `theme_color`
 * matches the app's brand blue; `background_color` matches the site's default
 * dark scheme.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lancetta — Menu-Bar Quota Monitor for Coding Agents',
    short_name: 'Lancetta',
    description: config.metadata.description,
    start_url: '/',
    display: 'standalone',
    theme_color: '#824bfc',
    background_color: '#070e24',
    // `any` only: the android-chrome icons have no maskable safe-zone
    // padding, so declaring them `maskable` would crop the corners on
    // shaped Android launchers. A dedicated padded asset can add maskable
    // later if Android PWA install ever matters (this is a macOS app site).
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
