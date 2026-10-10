'use client';

import { IconArrowRight } from '@tabler/icons-react';
import { Anchor, Box, Container, Group, Stack, Text, Title } from '@mantine/core';
import classes from './SolutionSection.module.css';

/*
 * THE ONE JOB, STATED ONCE.
 *
 * This section used to be two panels — "Half one" and "Half two", quota beside
 * memory — and the layout said the app does two things. It does one. The reaper
 * is real and keeps its feature card further down; it is a footnote to the job,
 * and this is where the page says so rather than letting a grid imply the
 * opposite. Keep it short: the features have their own section, and a second
 * list here would be the same four points twice.
 *
 * WHAT THE JOB IS was re-stated on 2026-09-22, and the change is the point of
 * the whole page rather than a rewording. It used to be "how much of each
 * agent's quota is left, when it comes back, and whether the rate gets you
 * there" — an INVENTORY, three facts read off an account. It is now the three
 * ANSWERS those facts are for: what you can still use, how long it lasts, when
 * it comes back. Same measurements, and the difference is who does the last
 * step of the reasoning.
 *
 * That is also the field's dividing line (user, 2026-09-22): everything else
 * of this kind reports consumption and spend. This app deliberately shows no
 * money at all, so "no price" is not an omission to apologise for — it is the
 * claim, and it belongs in the paragraph.
 *
 * TWO THINGS MAY NOT BE WRITTEN HERE until they ship, and both are tempting
 * because they are the natural end of this argument: telling you WHEN TO
 * START, and anything learnt from an average across days. `Pace` does take the
 * history, but it uses it to decide whether the spending is still going on
 * (the `.idle` case) — the projection itself is the current window's own rate.
 * An app that "learns how you work" is the next feature, not this page.
 *
 * ONE JOB IS NOT ONE ANSWER, and this section was a version behind until
 * 2026-09-21: it stated the job as of v0.3, after v0.4 had shipped the pace
 * line. Only the page's own thesis had missed it, which is the worst of the
 * three places to be stale, because it is what a reader takes the page to be
 * claiming.
 */
export function SolutionSection() {
  return (
    <Box pos="relative" py={88} className="lan-feather" style={{ overflow: 'hidden' }}>
      <Container size="md" pos="relative" style={{ zIndex: 1 }}>
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
            each suggestion is what it rests on (&ldquo;5 hours: 62% used, 18% an hour over the last
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
              <Anchor href="/docs/maintenance" size="sm" fw={600}>
                <Group gap={4} wrap="nowrap">
                  What Maintenance checks
                  <IconArrowRight size={14} />
                </Group>
              </Anchor>
              <Anchor href="/docs/memory" size="sm" fw={600}>
                <Group gap={4} wrap="nowrap">
                  What the processes hold
                  <IconArrowRight size={14} />
                </Group>
              </Anchor>
            </Group>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
