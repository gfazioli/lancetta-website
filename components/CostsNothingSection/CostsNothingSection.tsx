'use client';

import { IconArrowRight, IconCoinOff } from '@tabler/icons-react';
import { Box, Container, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Reveal, revealItem } from '../Motion/Reveal';
import { ScrollNumber } from '../Motion/ScrollNumber';
import classes from './CostsNothingSection.module.css';

/*
 * THE FOUNDING CONSTRAINT, and the one claim on this site that had to be
 * measured rather than argued.
 *
 * A monitor that spends quota in order to display quota is self-defeating,
 * and the failure would be invisible: a few hundred tokens per poll, every
 * forty-five seconds, is a real bite out of a five-hour window and nothing
 * in any UI would say so.
 *
 * The numbers below are from the 2026-09-17 measurement and must not be
 * changed without repeating it: twelve account reads on one connection left
 * the lifetime token counter on 318,009,023, and the positive control — the
 * same counter moving +29,188,602 across a day of ordinary use — is what
 * makes that zero mean something. A counter that CANNOT move is
 * indistinguishable from one that did not.
 */
const rows = [
  { label: 'Lifetime tokens, before', value: '318,009,023' },
  { label: 'Lifetime tokens, after twelve reads', value: '318,009,023' },
  { label: 'Difference', value: '0', accent: true },
];

export function CostsNothingSection() {
  // The coin pops in once the heading around it has started to lift.
  const pop = revealItem('pop', 120);
  return (
    <Box id="costs-nothing" pos="relative" py={88} className={`lan-feather ${classes.band}`}>
      <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
        <Reveal variant="rise">
          <Stack align="center" gap="md" mb={40}>
            <ThemeIcon
              size={60}
              radius="xl"
              variant="light"
              color="violet"
              className={`${classes.icon} ${pop.className}`}
              data-reveal={pop['data-reveal']}
              style={pop.style}
            >
              <IconCoinOff size={30} />
            </ThemeIcon>
            <Text
              size="sm"
              fw={700}
              tt="uppercase"
              style={{ letterSpacing: 3, color: 'var(--lan-accent)' }}
            >
              The founding constraint
            </Text>
            <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} maw={760}>
              Looking at your quota does not spend any of it
            </Title>
            <Text c="dimmed" ta="center" size="lg" maw={680}>
              Asking a model how much quota is left is a turn, and it would cost tokens on every
              poll. It is the easiest thing to build and the one route Lancetta will never take.
              Both agents are read from numbers they already keep.
            </Text>
          </Stack>
        </Reveal>

        {/* The measurement lands as a card; its figures roll as it does. */}
        <Reveal radius="var(--mantine-radius-lg)" style={{ maxWidth: 640, marginInline: 'auto' }}>
          <Paper p={{ base: 'lg', sm: 'xl' }} radius="lg" className={classes.card}>
            <Stack gap="xs">
              {rows.map((row, i) => (
                <Group key={row.label} justify="space-between" wrap="nowrap" gap="lg">
                  <Text fz="sm" c="dimmed">
                    {row.label}
                  </Text>
                  <Text
                    fz={row.accent ? 22 : 16}
                    fw={row.accent ? 900 : 600}
                    style={{
                      fontVariantNumeric: 'tabular-nums',
                      color: row.accent ? 'var(--lan-codex)' : undefined,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <ScrollNumber value={row.value} delay={300 + i * 150} />
                  </Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Reveal>

        <Group justify="center" gap="xs" mt="lg" wrap="nowrap">
          <IconArrowRight size={16} style={{ color: 'var(--lan-stale)', flexShrink: 0 }} />
          <Text c="dimmed" fz="sm" ta="center" maw={620}>
            And the instrument works, which is the half that makes the zero mean something: the same
            counter moved by <ScrollNumber value="29,188,602" /> across a day of ordinary use.
          </Text>
        </Group>
      </Container>
    </Box>
  );
}
