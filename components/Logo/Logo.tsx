import { Image } from '@mantine/core';

/**
 * The navbar mark is the app icon itself, from the 128px render of the master:
 * drawn at 36px it is 72 device pixels on a Retina display, well inside that.
 *
 * It used to be an SVG redrawn from the previous master. The current icon's
 * identity is its neon rim and the light on its bars, which a flat-gradient
 * vector loses, so the raster is the honest choice at this size. `favicon.svg`
 * remains the FLAT variant, which exists because no version of the gradient
 * icon survives 16px.
 */
export function Logo({ size = 36 }: { size?: number }) {
  return <Image src="/icon-128x128.png" alt="Lancetta" w={size} h={size} />;
}
