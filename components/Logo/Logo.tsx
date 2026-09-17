import { Image } from '@mantine/core';

/**
 * The navbar mark. Vector rather than the 128px raster it used to load: it is
 * drawn at 36px in the navbar and larger in Storybook, and a raster picks one
 * of those to be sharp at. `brand-mark.svg` is the gradient app icon redrawn
 * from measurements off the 1254px master — see its own comment.
 *
 * Not `favicon.svg`: that one is the FLAT variant, which exists because the
 * gradient icon does not survive 16px. At 36px it does, so the navbar gets the
 * real thing.
 */
export function Logo({ size = 36 }: { size?: number }) {
  return <Image src="/brand-mark.svg" alt="Lancetta" w={size} h={size} />;
}
