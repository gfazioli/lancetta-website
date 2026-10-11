import { Image } from '@mantine/core';

/**
 * The navbar mark. Vector rather than a raster: it is drawn at 36px in the
 * navbar and larger in Storybook, and a raster picks one of those to be sharp
 * at. `brand-mark.svg` is the gradient app icon redrawn from measurements off
 * the master (`../Lancetta/scripts/icons.swift`), each colour carrying the
 * point it was sampled at.
 *
 * Not `favicon.svg`: that one is the FLAT variant, which exists because the
 * gradient icon does not survive 16px. At 36px it does, so the navbar gets the
 * real thing.
 *
 * Decorative, so `alt=""`: in the bar and in the footer the name is written
 * beside it, and an alt repeating it reads "Lancetta Lancetta" to a screen
 * reader (Lighthouse's image-redundant-alt, 2026-10-11).
 */
export function Logo({ size = 36 }: { size?: number }) {
  return <Image src="/brand-mark.svg" alt="" w={size} h={size} />;
}
