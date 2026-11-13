import { Kbd } from '@mantine/core';
import { Callout } from 'nextra/components';
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import { DocsImage } from '@/components/DocsImage/DocsImage';
import { Tutorial } from '@/components/Tutorial/Tutorial';

const docsComponents = getDocsMDXComponents();

export const useMDXComponents = (components?: any): any => ({
  ...docsComponents,
  Kbd,
  Callout,
  Tutorial,
  img: DocsImage,
  ...components,
});
