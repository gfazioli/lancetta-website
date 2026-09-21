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
 *
 * ONE JOB IS NOT ONE ANSWER, and this section was a version behind until
 * 2026-09-21. It stated the job as "how much is left and when it comes back"
 * — written for v0.3, and still there after v0.4 shipped the pace line. The
 * hero leads on that line and it is the second feature card; only the page's
 * own thesis had missed it, which is the worst of the three places to be
 * stale in, because it is what a reader takes the page to be claiming. The
 * argument this section exists to make is quota-versus-reaper, and it is
 * untouched by the third clause.
 */
export function SolutionSection() {
  return (
    <Box pos="relative" py={88} className="lan-feather" style={{ overflow: 'hidden' }}>
      {/* The plate's light: azure from the top-left, magenta from the bottom-right. */}
      <Scene lazy>
        <Scene.Mesh
          stops={[
            { color: '#0546BF', position: '18% 22%', spread: 58 },
            { color: '#B117C5', position: '84% 74%', spread: 50 },
            { color: '#672AFA', position: '50% 50%', spread: 72 },
          ]}
          opacity={0.14}
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
            Lancetta tells you how much of each agent&apos;s quota is left, when it comes back, and
            whether the rate you are going at gets you there. That is the whole job. Everything else
            in it exists to make those answers trustworthy: both windows for both agents, the plan
            read from the account rather than typed in, the bucket that refused named instead of
            averaged away, and every reading carrying its own age.
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
