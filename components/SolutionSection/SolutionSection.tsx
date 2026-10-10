'use client';

import { IconArrowRight } from '@tabler/icons-react';
import { Anchor, Box, Container, Group, Stack, Text, Title } from '@mantine/core';
import classes from './SolutionSection.module.css';

/*
 * HOW IT DECIDES, stated once (0.50.0). The page's claim is that Lancetta
 * guides (user, 2026-10-10), and a guide is believed only if it shows its
 * working: so this section says what a suggestion is made from, quotes the
 * basis line the app prints under one, and says that "nothing to change" is
 * advice too. The example line is the capture cast's, the same afternoon as
 * the hero and the panel.
 *
 * What may NOT be written here until it ships: telling you WHEN TO START, and
 * anything learnt from an average across days. Today a suggestion reasons
 * from the current window's own rate; the series decides whether spending is
 * still going on, not the projection.
 *
 * The footnote is what the agents leave behind (Maintenance, the processes):
 * part of the guidance, but not the quota decisions this section is about.
 */
const leftBehind = [
  { href: '/docs/maintenance', label: 'What Maintenance checks' },
  { href: '/docs/memory', label: 'What the processes hold' },
];

export function SolutionSection() {
  return (
    <Box py={88}>
      <Container size="md">
        <Stack align="center" gap="md">
          <Text
            size="sm"
            fw={700}
            tt="uppercase"
            style={{ letterSpacing: 3, color: 'var(--lan-accent)' }}
          >
            How it decides
          </Text>
          <Title order={2} ta="center" fz={{ base: 32, sm: 42 }}>
            Every suggestion shows its working
          </Title>
          <Text c="dimmed" ta="center" size="lg" maw={700} lh={1.6}>
            Lancetta does not ask a model what to do, and it does not guess. It works each
            suggestion out on your Mac from what it has measured: the percentage each account
            reports, how fast it has been moving, when the window resets, the free resets you hold,
            the effort set in each agent, and what your instruction files load at every start. Under
            each suggestion is what it rests on (&ldquo;5 hours: 82% used, 21% an hour over the last
            1h00m, from 14 readings&rdquo;) so you can check it before you act. When nothing needs
            changing it says so, and that is advice too: go ahead, use it.
          </Text>

          <Stack align="center" gap={6} mt="lg" className={classes.footnote}>
            <Text c="dimmed" ta="center" size="md" maw={640} lh={1.6}>
              Agents also leave things behind: instruction files that grow with every session, and
              background processes that outlive the work. Maintenance checks the first; the
              Processes pane closes the orphans of the second, on your say-so.
            </Text>
            <Group gap="lg" justify="center">
              {leftBehind.map((link) => (
                <Anchor key={link.href} href={link.href} size="sm" fw={600}>
                  <Group gap={4} wrap="nowrap">
                    {link.label}
                    <IconArrowRight size={14} />
                  </Group>
                </Anchor>
              ))}
            </Group>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
