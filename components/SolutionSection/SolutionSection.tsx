'use client';

import type { CSSProperties } from 'react';
import { Scene } from '@gfazioli/mantine-scene';
import { IconGauge, IconTrash, IconCheck, IconClock } from '@tabler/icons-react';
import {
  Badge,
  Box,
  Container,
  Divider,
  Group,
  List,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import classes from './SolutionSection.module.css';

/*
 * TWO PANELS, AND ONLY ONE OF THEM SHIPS TODAY.
 *
 * Quota is v0.1.0. Memory is v0.2.0 and is drawn here with a "Next" badge and
 * the future tense, because the site may not describe as shipped something the
 * app does not do yet. If you are editing this file after the reaper lands,
 * change `shipped` and the tense together — a badge left behind is the same
 * lie the other way round.
 */
const panels = [
  {
    key: 'quota',
    icon: IconGauge,
    eyebrow: 'Panel one',
    title: 'What they are spending',
    lead: 'Both windows for both agents, in the menu bar, refreshed on a schedule you set.',
    color: 'var(--lan-codex)',
    shipped: true,
    points: [
      'The 5-hour and the 7-day window, side by side, with the time each one resets.',
      'The plan the account is on, read from the account itself rather than typed into a setting.',
      'The bucket that refused is named — not averaged away into a comfortable total.',
      'Every reading carries its own age, so a frozen number gives itself away.',
    ],
  },
  {
    key: 'memory',
    icon: IconTrash,
    eyebrow: 'Panel two',
    title: 'What they left running',
    lead: 'Agent processes outlive the sessions that started them, and nothing ever reaps them.',
    color: 'var(--lan-accent)',
    shipped: false,
    points: [
      'One background tree per working directory, and it exits only when asked.',
      'Close the directory before the session ends and nothing is ever asked.',
      'Measured once on one Mac: 28 processes holding 2.68 GB — 12 of them serving folders that had already been deleted.',
      'Lancetta will show you the list before it stops anything on it.',
    ],
  },
];

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

      <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
        <Stack align="center" gap="md" mb={48}>
          <Text
            size="sm"
            fw={700}
            tt="uppercase"
            style={{ letterSpacing: 3, color: 'var(--lan-accent)' }}
          >
            The app
          </Text>
          <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900}>
            Two panels that share a window
          </Title>
          <Text c="dimmed" ta="center" size="lg" maw={660}>
            A coding agent costs you two things you cannot see: quota, and memory. Lancetta is the
            needle for both.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {panels.map((panel) => (
            <Paper
              key={panel.key}
              p={{ base: 'lg', sm: 'xl' }}
              className={classes.panel}
              style={{ '--panel-color': panel.color } as CSSProperties}
            >
              <Stack gap="md">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <ThemeIcon
                    size={52}
                    radius="md"
                    variant="light"
                    color="gray"
                    className={classes.panelIcon}
                    style={{ color: panel.color }}
                  >
                    <panel.icon size={28} />
                  </ThemeIcon>
                  <Badge
                    size="sm"
                    radius="sm"
                    variant="light"
                    color={panel.shipped ? 'teal' : 'grape'}
                    leftSection={panel.shipped ? <IconCheck size={12} /> : <IconClock size={12} />}
                  >
                    {panel.shipped ? 'In v0.1' : 'Next, in v0.2'}
                  </Badge>
                </Group>

                <Stack gap={4}>
                  <Text fz={12} fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 2 }}>
                    {panel.eyebrow}
                  </Text>
                  <Title order={3} fz={{ base: 24, sm: 28 }} fw={800} lh={1.2}>
                    {panel.title}
                  </Title>
                </Stack>

                <Text c="dimmed" lh={1.6}>
                  {panel.lead}
                </Text>

                <Divider />

                <List
                  spacing="sm"
                  size="sm"
                  center={false}
                  icon={
                    <Box
                      w={6}
                      h={6}
                      mt={7}
                      style={{ borderRadius: 999, backgroundColor: panel.color }}
                    />
                  }
                >
                  {panel.points.map((point) => (
                    <List.Item key={point}>
                      <Text c="dimmed" fz="sm" lh={1.6}>
                        {point}
                      </Text>
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
