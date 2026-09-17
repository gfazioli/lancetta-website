'use client';

import { Scene } from '@gfazioli/mantine-scene';
import { IconArrowRight } from '@tabler/icons-react';
import { Anchor, Box, Container, Group, Stack, Text, Title } from '@mantine/core';
import classes from './SolutionSection.module.css';

/*
 * THE ONE JOB, STATED ONCE.
 *
 * This section used to be two panels — "Half one" and "Half two", quota beside
 * memory — and the layout said the app does two things. It does one: tell you
 * how much of each agent's quota is left and when it comes back. The reaper is
 * real and keeps its feature card further down; it is a footnote to the job,
 * and this is where the page says so rather than letting a grid imply the
 * opposite. Keep it short: the features have their own section, and a second
 * list here would be the same four points twice.
 */
export function SolutionSection() {
  return (
    <Box pos="relative" py={88} style={{ overflow: 'hidden' }}>
      <Scene lazy>
        <Scene.Mesh
          stops={[
            { color: 'violet', position: '18% 22%', spread: 58 },
            { color: 'teal', position: '82% 72%', spread: 55 },
            { color: 'indigo', position: '50% 50%', spread: 72 },
          ]}
          opacity={0.16}
        />
        <Scene.Noise opacity={0.018} />
      </Scene>

      <Container size="md" pos="relative" style={{ zIndex: 1 }}>
        <Stack align="center" gap="md">
          <Text
            size="sm"
            fw={700}
            tt="uppercase"
            style={{ letterSpacing: 3, color: 'var(--lan-accent)' }}
          >
            The app
          </Text>
          <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900}>
            One job, done properly
          </Title>
          <Text c="dimmed" ta="center" size="lg" maw={700} lh={1.6}>
            Lancetta tells you how much of each agent&apos;s quota is left, and when it comes back.
            That is the whole job. Everything else in it exists to make that one number trustworthy:
            both windows for both agents, the plan read from the account rather than typed in, the
            bucket that refused named instead of averaged away, and every reading carrying its own
            age.
          </Text>

          <Stack align="center" gap={6} mt="lg" className={classes.footnote}>
            <Text c="dimmed" ta="center" size="md" maw={640} lh={1.6}>
              Agents also leave background processes running long after they are done. Lancetta
              lists those and closes the orphans on your say-so — a footnote to the job, not a
              second one.
            </Text>
            <Anchor href="/docs/memory" size="sm" fw={600}>
              <Group gap={4} wrap="nowrap">
                How that works
                <IconArrowRight size={14} />
              </Group>
            </Anchor>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
