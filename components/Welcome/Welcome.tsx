'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Scene } from '@gfazioli/mantine-scene';
import {
  IconAlertTriangle,
  IconBellRinging,
  IconBook2,
  IconChartHistogram,
  IconChartLine,
  IconChartPie,
  IconClockHour4,
  IconCreditCardOff,
  IconGauge,
  IconLayoutNavbar,
  IconPalette,
  IconTrash,
} from '@tabler/icons-react';
import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import config from '@/config';
import { BuiltForMacSection } from '../BuiltForMacSection/BuiltForMacSection';
import { CostsNothingSection } from '../CostsNothingSection/CostsNothingSection';
import { FAQ } from '../FAQ/FAQ';
import { HeroStage } from '../HeroStage/HeroStage';
import { ProblemSection } from '../ProblemSection/ProblemSection';
import {
  fallbackReleaseCadence,
  type ReleaseCadence as Cadence,
} from '../ReleaseCadence/release-cadence';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import { ShareButtons } from '../ShareButtons/ShareButtons';
import { SolutionSection } from '../SolutionSection/SolutionSection';
import classes from './Welcome.module.css';

/*
 * The strip under the hero: what it is, what it does, what it costs. Three
 * sentences, because that is what a page promising "what it is / what it does
 * / features" has to answer as soon as the hero releases its pin. The third
 * one is the founding constraint and the one measured claim on the page; its
 * own section further down carries the numbers.
 */
const glance = [
  {
    label: 'What it is',
    body: 'A native macOS menu-bar app that watches Codex and Claude Code.',
  },
  {
    label: 'What it does',
    body: 'Shows how much of each agent’s quota is left, when it comes back, and how old that number is — plus the background processes they left running.',
  },
  {
    label: 'What it costs',
    body: 'Nothing. The app is free, and reading a quota spends none of it: no model is asked, no token is used.',
  },
];

interface Feature {
  icon: typeof IconGauge;
  title: string;
  description: string;
  color: string;
  href: string;
  badge?: string;
}

/*
 * `badge: 'Next'` means the feature is NOT in the build being described. Keep
 * the description in the future tense to match, and remove both together when
 * it ships — a card that says "will" with no badge reads as a missing
 * feature, and a card with no "will" and a badge reads as a lie.
 *
 * THE ORDER IS LOAD-BEARING, and mirrors the hero's three lines. First the
 * promise (the quota), then the claims no competitor can make: where this pace
 * lands, that every reading carries its age, and the orphaned trees nobody
 * else reaps. The pace card joined them in v0.4, ahead of the age, because
 * the hero leads on it too — the order in the two places is one decision.
 * Reclaim
 * sat SEVENTH until 2026-09-20, behind the notch and the mark switcher, while
 * the grid opened on "both windows, both agents" — which is exactly what the
 * free, open-source, 74-provider alternative also does. A reader who knows that
 * alternative has to reach card seven before meeting a reason to prefer this
 * one. Do not sort these by feel.
 */
const features: Feature[] = [
  {
    icon: IconGauge,
    title: 'Both windows, both agents',
    description:
      'The 5-hour and the 7-day window for Codex and Claude Code, drawn as bars, with the time each one resets beside it.',
    color: 'teal',
    href: '/docs/the-menu',
  },
  {
    icon: IconChartLine,
    title: 'Where this pace lands',
    description:
      'Under each bar, one line saying where that window ends at the rate you are going — amber only when it would run out before it resets. It can say it because it keeps a series of its own readings; the field keeps the ceiling and the flow and no history at all.',
    color: 'orange',
    href: '/docs/the-menu#the-pace-line',
  },
  {
    icon: IconChartPie,
    title: 'The window your bar cannot show',
    description:
      'Some plans give one model a weekly limit of its own, counted separately — it can run out while the percentage on your menu bar still reads two thirds. Lancetta draws that window too, under the name your account gives it, and says so before it ends rather than after.',
    color: 'grape',
    href: '/docs/how-it-reads#a-window-one-model-keeps-to-itself',
  },
  {
    icon: IconClockHour4,
    title: 'Every reading carries its age',
    description:
      'A number with no timestamp is a number you cannot trust. Lancetta says when each one was taken, and a source that has fallen behind says so rather than going quiet.',
    color: 'blue',
    href: '/docs/how-it-reads',
  },
  {
    icon: IconAlertTriangle,
    title: 'The bucket that refused is named',
    description:
      'When a limit is hit, the window that hit it is the one you see — not an average across all of them that lands somewhere comfortable and tells you nothing.',
    color: 'red',
    href: '/docs/the-menu#limits',
  },
  {
    icon: IconTrash,
    title: 'Reclaim the memory',
    description:
      'Agents leave a background tree behind for every folder they worked in, and nothing ever reaps the ones whose folder is gone: 28 processes holding 2.68 GB on one Mac, 12 of 14 trees unreachable. Lancetta finds them and frees them — showing you the list first, and never touching a live one.',
    color: 'indigo',
    href: '/docs/memory',
  },
  {
    icon: IconCreditCardOff,
    title: 'Reading costs nothing',
    description:
      'No model is asked anything. Both agents are read from numbers they already keep, which is why the poll can be frequent without ever eating into the window it is showing you.',
    color: 'grape',
    href: '/docs/how-it-reads',
  },
  {
    icon: IconLayoutNavbar,
    title: 'Under the notch',
    description:
      'On a MacBook Pro the reading also lives in the notch — exactly as wide as the notch when collapsed, so the items either side stay clickable. Point at it and it opens.',
    color: 'violet',
    href: '/docs/the-notch',
  },
  {
    icon: IconPalette,
    title: 'Your marks, or none',
    description:
      'Each agent carries its own colour and the vendor’s own mark, drawn from vector data so they stay sharp at any size. One switch replaces the lot with neutral system symbols.',
    color: 'orange',
    href: '/docs/settings#appearance',
  },
  {
    icon: IconChartHistogram,
    title: 'Where the tokens went',
    description:
      'A window with the daily token series over 7, 30 or 90 days, both agents in detail, and the processes still running. Codex publishes its own history; Claude’s is rebuilt from the transcripts on your Mac, and the chart says which is which.',
    color: 'cyan',
    href: '/docs/the-window',
  },
  {
    icon: IconBellRinging,
    title: 'It speaks first',
    description:
      'About what the menu bar cannot show: a window heading for empty before it resets, with the reset named beside it; an agent with nothing left; one that is ready again; a reading that stopped moving. Once, when it changes — never the number already on your bar.',
    color: 'pink',
    href: '/docs/alerts',
  },
];

/** The versions, and what each one is for. Mirrors `content/roadmap.mdx`. */
const roadmap = [
  {
    version: 'v0.2',
    title: 'The quota, and the memory back',
    body: 'Both agents, both windows, the notch island, the window with the daily token chart, the reclaim that lists what it will stop before stopping it, open at login and the updater. Signed, notarized and downloadable: the memory half planned for later landed here too, which is why the first release is v0.2.',
    state: 'shipped',
  },
  {
    version: 'v0.3',
    title: 'Claude from the account',
    body: 'One click and one macOS dialog instead of a line in a status-line script: Lancetta asks your Claude account, with the sign-in Claude Code keeps, so Claude refreshes on demand like Codex. What’s New under Help, and the icon in the format macOS 26 introduced.',
    state: 'shipped',
  },
  {
    version: 'v0.4',
    title: 'The pace, and the panel',
    body: 'Under each bar, where that window ends at the rate you are going — amber only when it would run out early, and silent about the weekly one until your Mac has watched it turn over. And the menu became a panel in the app’s own navy: 318 points where a menu needed 466, with the four windowing commands as buttons along the bottom.',
    state: 'shipped',
  },
  {
    version: 'v0.5',
    title: 'It speaks first',
    body: 'A window that will run out before it resets, an agent with nothing left, one that is ready again, a reading gone quiet — said once, when it changes, with a sound only for the two moments you are not looking. And two fixes from two Macs: Refresh now never raises the keychain dialog, and a card still on the status-line file offers the account.',
    state: 'shipped',
  },
  {
    version: 'v0.6',
    title: 'The window one model keeps to itself',
    body: 'Some plans limit one model separately, and every monitor was reading past it — including this one. The account sends a row per meter; Lancetta now draws the ones that belong to a single model, under the name it is given, and says when that week is spent, when it is back and when it is heading for empty ahead of its reset.',
    state: 'shipped',
  },
  {
    version: 'Then',
    title: 'Everyone else’s Mac',
    body: 'The discovery UI and the Sources pane. The version where it stops assuming one machine — the signing and the feed it needed arrived early, and the Claude step became one click and a macOS dialog rather than a script.',
    state: 'planned',
  },
  {
    version: 'Later',
    title: 'Reset credits',
    body: 'Redeeming a Codex reset credit from the menu, with every safety rule an irreversible action needs.',
    state: 'planned',
  },
];

/**
 * `cadence` is fetched on the server in `app/page.tsx` so the release count
 * and date ship inside the initial HTML. It defaults to the config-derived
 * fallback, which keeps the strip rendering in Storybook and in tests.
 */
export function Welcome({ cadence = fallbackReleaseCadence() }: { cadence?: Cadence }) {
  const released = config.app.released;

  return (
    <div className={classes.home}>
      {/*
        The hero is the product demonstrated: a pinned stage hanging off the
        menu bar in the header, one frame per surface, the copy at the bottom.
        See HeroStage.tsx — it also drives the reading in the bar, so the
        thing at the top of the page does what the page is describing.
      */}
      <HeroStage cadence={cadence} />

      <Container size="lg">
        <dl className={classes.glance}>
          {glance.map((item) => (
            <div key={item.label} className={classes.glanceItem}>
              <dt className={classes.glanceLabel}>{item.label}</dt>
              <dd className={classes.glanceBody}>{item.body}</dd>
            </div>
          ))}
        </dl>
      </Container>

      {/* The Problem */}
      <ProblemSection />

      {/* One job */}
      <SolutionSection />

      {/* Features */}
      <Box id="features" py={80} className={`lan-feather ${classes.sectionBand}`}>
        <Container size="lg">
          <SectionHeading
            eyebrow="What is in it"
            title="An instrument, not a dashboard"
            lead="It has one job: tell you where you stand, honestly, without being asked and without costing anything to ask."
          />

          {/*
            Three across, not four. It was chosen when there were nine cards
            and 3x3 was exact; the pace card made it TEN in v0.4, so the grid
            is now 3 + 3 + 3 + 1 and the last row carries one card alone.
            That is tolerable only because the orphan is the `Next`-badged
            roadmap teaser, which is a different kind of card from the nine
            above it and reads as a closing note rather than as a gap. Add an
            eleventh shipped feature and this stops being true: either add a
            twelfth or the orphan becomes a real one. Count them before
            deciding — the comment here asserted nine for a day after there
            were ten.
          */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {features.map((feature) => (
              <Paper
                key={feature.title}
                component={Link}
                href={feature.href}
                p="lg"
                className={`${classes.featureCard} ${classes.cardLink}`}
                style={
                  { '--card-color': `var(--mantine-color-${feature.color}-6)` } as CSSProperties
                }
              >
                {feature.badge && (
                  <Badge className={classes.newBadge} variant="filled" size="sm" radius="sm">
                    {feature.badge}
                  </Badge>
                )}
                <Stack gap={10} align="flex-start">
                  <ThemeIcon
                    size={48}
                    radius="md"
                    color={feature.color}
                    variant="light"
                    className={classes.featureIcon}
                  >
                    <feature.icon size={26} />
                  </ThemeIcon>
                  <Text fw={700} fz={18}>
                    {feature.title}
                  </Text>
                  <Text c="dimmed" size="sm" lh={1.55}>
                    {feature.description}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* The founding constraint */}
      <CostsNothingSection />

      {/* Built for macOS */}
      <BuiltForMacSection />

      {/* What’s next */}
      <Container id="roadmap" size="lg" py={80}>
        <SectionHeading
          eyebrow="Where it is going"
          title="What’s next"
          lead="No dates, and no version numbers on work that has not started — the order changes as the work teaches you things. What each step has to prove before it counts as finished is the part worth publishing."
        />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {roadmap.map((step) => (
            <Paper
              key={step.version}
              p="lg"
              radius="lg"
              className={classes.roadmapCard}
              data-state={step.state}
            >
              <Stack gap={8}>
                <Group gap="xs">
                  <Text fw={900} fz={20} style={{ color: 'var(--lan-accent-ink)' }}>
                    {step.version}
                  </Text>
                  {step.state === 'shipped' && (
                    <Badge size="xs" variant="light" color="teal" radius="sm">
                      Shipped
                    </Badge>
                  )}
                  {step.state === 'building' && (
                    <Badge size="xs" variant="light" color="grape" radius="sm">
                      Now
                    </Badge>
                  )}
                </Group>
                <Text fw={700} fz={16}>
                  {step.title}
                </Text>
                <Text c="dimmed" fz="sm" lh={1.55}>
                  {step.body}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>

      {/* Get Started CTA */}
      <Box pos="relative" py={88} className={`lan-feather ${classes.auroraBand}`}>
        <Scene lazy>
          <Scene.Glow color="#824BFC" size={520} blur={170} opacity={0.16} top="26%" left="50%" />
          <Scene.Glow color="#13D1FB" size={380} blur={150} opacity={0.12} top="74%" left="10%" />
          <Scene.Glow color="#B117C5" size={360} blur={150} opacity={0.1} top="40%" left="88%" />
        </Scene>
        <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
          <Stack align="center" gap="lg">
            <Text
              size="sm"
              fw={700}
              tt="uppercase"
              style={{ letterSpacing: 3, color: 'var(--lan-accent-ink)' }}
            >
              {released ? 'Get started' : 'Not yet'}
            </Text>
            <Title order={2} ta="center" fz={{ base: 36, sm: 48 }} fw={900}>
              Know where you stand.
            </Title>
            <Text c="dimmed" ta="center" size="lg" maw={520}>
              {released
                ? 'Put both agents in your menu bar and stop reading a number you have to squint at a terminal for.'
                : 'The first build is not out yet. What’s next says what is in it, and the releases page is where it will appear.'}
            </Text>

            <Button
              href={released ? '/download' : '/docs/roadmap'}
              component="a"
              leftSection={released ? <IconGauge size={20} /> : <IconBook2 size={20} />}
              size="xl"
              radius="xl"
              px={48}
              mt="md"
            >
              {released ? 'Download for macOS' : 'Read what’s next'}
            </Button>
            <Text c="dimmed" size="sm">
              {`Free · macOS ${config.app.minMacOS} Sequoia or later`}
            </Text>
            {/* Sharing belongs at the end of the pitch, not at the top of it. */}
            <Group justify="center" mt="sm">
              <ShareButtons />
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* FAQ */}
      <Container id="faq" size="lg" py={72}>
        <SectionHeading align="center" eyebrow="FAQ" title="Frequently asked questions" mb={24} />
        <Box w="100%" maw={700} mx="auto">
          <FAQ />
        </Box>
      </Container>
    </div>
  );
}
