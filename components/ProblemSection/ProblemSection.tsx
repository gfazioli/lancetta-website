'use client';

import type { CSSProperties } from 'react';
import { IconClockExclamation, IconSwitch3, IconWand } from '@tabler/icons-react';
import { Box, Container, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import classes from './ProblemSection.module.css';

/*
 * The three defects that started the project, on one afternoon. Each one
 * rendered as a plausible number, which is the whole point: none of them
 * looked like a failure, and two of them were comfortable.
 *
 * Every figure quoted here is from that session's own measurements — the
 * 0% against a real 59%, the three-hour-old reading, the 9% fallback. Do
 * not round them and do not add any that were not measured.
 */
const problems = [
  {
    icon: IconClockExclamation,
    title: 'Stale',
    description: 'It read a file that only moves when you run the tool ',
    highlight: 'on that machine',
    rest: '. The last good reading was three hours old, and nothing said so.',
    color: 'blue',
  },
  {
    icon: IconSwitch3,
    title: 'Substituted',
    description: 'The newest reading was a refused turn, which records ',
    highlight: 'no limits at all',
    rest: '. So the search fell back to an older, comfortable 9%.',
    color: 'teal',
  },
  {
    icon: IconWand,
    title: 'Invented',
    description: 'A reset time already in the past was drawn as 0%, on the assumption that a ',
    highlight: 'rolled-over window is an empty one',
    rest: '. It is not.',
    color: 'grape',
  },
];

/** What was on screen, and what was actually true, at the same moment. */
const readings = [
  { label: 'On the status line', value: '0%', tone: 'wrong' as const },
  { label: 'What the tool itself said', value: '59% left', tone: 'right' as const },
  { label: 'Age of the reading', value: '3 hours', tone: 'wrong' as const },
];

export function ProblemSection() {
  return (
    <Box py={80} className={`lan-feather ${classes.sectionBand}`}>
      <Container size="lg">
        <SectionHeading
          eyebrow="The problem"
          title="The number was wrong. It looked right."
          lead="A quota readout is the one kind of number nobody double-checks — you glance at it and carry on. Three separate defects stacked up in one afternoon, and every one of them produced a figure you would have believed."
        />

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {problems.map((item) => (
            <Paper
              key={item.title}
              p="lg"
              className={classes.problemCard}
              style={{ '--card-color': `var(--mantine-color-${item.color}-5)` } as CSSProperties}
            >
              <Stack gap={10} align="flex-start">
                <ThemeIcon
                  size={48}
                  radius="md"
                  color={item.color}
                  variant="light"
                  className={classes.problemIcon}
                >
                  <item.icon size={26} />
                </ThemeIcon>
                <Text fw={700} fz={18}>
                  {item.title}
                </Text>
                <Text c="dimmed" fz={14} lh={1.55}>
                  {item.description}
                  {/* red-9: Mantine's red text in a light scheme is red-6, 3.3:1
                      on the card; this is 5.5:1. */}
                  <Text component="span" c="red.9" fw={600} fz={14} td="underline">
                    {item.highlight}
                  </Text>
                  {item.rest}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>

        <Group justify="center" gap={0} mt={48} wrap="wrap">
          {readings.map((r) => (
            <Stack key={r.label} gap={2} align="center" px={32} py={12}>
              <Text
                fz={{ base: 28, sm: 34 }}
                fw={900}
                lh={1}
                style={{
                  color: r.tone === 'wrong' ? 'var(--lan-alarm)' : 'var(--lan-codex)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {r.value}
              </Text>
              <Text c="dimmed" fz="sm" ta="center">
                {r.label}
              </Text>
            </Stack>
          ))}
        </Group>

        <Text c="dimmed" fz="sm" ta="center" maw={600} mx="auto" mt="lg">
          All three were fixed in the status line that afternoon. But a shell script is visible to
          one terminal — and the numbers belong somewhere that is on screen whatever window is in
          front.
        </Text>
      </Container>
    </Box>
  );
}
