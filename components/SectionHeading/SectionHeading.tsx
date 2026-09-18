import type { ReactNode } from 'react';
import { Stack, Text, Title } from '@mantine/core';
import classes from './SectionHeading.module.css';

/*
 * One heading for every band of the home page, in two alignments.
 *
 * `left` is the default and the one the grid sections use: the eyebrow and
 * the title on the left, the lead on the right, both sitting on the same
 * baseline — the shape Apple's and Stripe's feature sections take, and the
 * one that gives a page of centred bands somewhere for the eye to start a
 * line. `center` is for the statement bands, where the copy is the whole
 * section and a split would leave the title talking to an empty column.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'default',
  mb = 48,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  /** `onDark` for the bands that sit on the plate, where dimmed text vanishes. */
  tone?: 'default' | 'onDark';
  mb?: number;
}) {
  const eyebrowColor = tone === 'onDark' ? 'var(--mantine-color-lancetta-4)' : 'var(--lan-accent)';
  const titleColor = tone === 'onDark' ? 'white' : undefined;
  const leadColor = tone === 'onDark' ? 'gray.4' : 'dimmed';

  const eyebrowNode = (
    <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3, color: eyebrowColor }}>
      {eyebrow}
    </Text>
  );

  if (align === 'center') {
    return (
      <Stack align="center" gap="md" mb={mb}>
        {eyebrowNode}
        <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900} c={titleColor}>
          {title}
        </Title>
        {lead && (
          <Text c={leadColor} ta="center" size="lg" maw={620} lh={1.6}>
            {lead}
          </Text>
        )}
      </Stack>
    );
  }

  return (
    <div className={classes.split} style={{ marginBottom: mb }}>
      <div>
        {eyebrowNode}
        <Title
          order={2}
          fz={{ base: 32, sm: 42 }}
          fw={900}
          lh={1.08}
          mt={10}
          c={titleColor}
          className={classes.title}
        >
          {title}
        </Title>
      </div>
      {lead && (
        <Text c={leadColor} size="lg" lh={1.6} className={classes.lead}>
          {lead}
        </Text>
      )}
    </div>
  );
}
