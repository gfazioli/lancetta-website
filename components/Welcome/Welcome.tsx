'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Scene } from '@gfazioli/mantine-scene';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBellRinging,
  IconBook2,
  IconCalendarWeek,
  IconChartHistogram,
  IconChartLine,
  IconChartPie,
  IconClockHour4,
  IconCreditCardOff,
  IconDeviceLaptop,
  IconGauge,
  IconLayoutNavbar,
  IconPalette,
  IconSunrise,
  IconSunset2,
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
    description: 'The 5-hour and 7-day windows, with each reset.',
    color: 'teal',
    href: '/docs/the-menu',
  },
  {
    icon: IconChartLine,
    title: 'Where this pace lands',
    description: 'Where each window ends at the rate you are going.',
    color: 'orange',
    href: '/docs/the-menu#the-pace-line',
  },
  {
    icon: IconChartPie,
    title: 'The window your bar cannot show',
    description: 'A model’s own weekly limit, which can run out first.',
    color: 'grape',
    href: '/docs/how-it-reads#a-window-one-model-keeps-to-itself',
  },
  {
    icon: IconClockHour4,
    title: 'Every reading carries its age',
    description: 'How old each number is, and when a source lags.',
    color: 'blue',
    href: '/docs/how-it-reads',
  },
  {
    icon: IconAlertTriangle,
    title: 'The bucket that refused is named',
    description: 'The window that stopped you, not an average.',
    color: 'red',
    href: '/docs/the-menu#limits',
  },
  {
    icon: IconTrash,
    title: 'Reclaim the memory',
    description: 'Frees what agents leave running — the list first.',
    color: 'indigo',
    href: '/docs/memory',
  },
  {
    icon: IconCreditCardOff,
    title: 'Reading costs nothing',
    description: 'No model is asked, so checking costs no quota.',
    color: 'grape',
    href: '/docs/how-it-reads',
  },
  {
    icon: IconLayoutNavbar,
    title: 'Under the notch',
    description: 'On a MacBook Pro, the reading lives in the notch too.',
    color: 'violet',
    href: '/docs/the-notch',
  },
  {
    icon: IconPalette,
    title: 'Your marks, or none',
    description: 'Each agent’s colour and mark, or neutral symbols.',
    color: 'orange',
    href: '/docs/settings#appearance',
  },
  {
    icon: IconChartHistogram,
    title: 'Where the tokens went',
    description: 'Daily tokens for both agents, over 7, 30 or 90 days.',
    color: 'cyan',
    href: '/docs/the-window',
  },
  {
    icon: IconBellRinging,
    title: 'It speaks first',
    description: 'Only about what the menu bar cannot already show.',
    color: 'pink',
    href: '/docs/alerts',
  },
];

type Horizon = 'today' | 'soon' | 'next';

interface Step {
  icon: typeof IconGauge;
  title: string;
  body: string;
  color: string;
  state: Horizon;
}

/*
 * What ships, and what comes after it — by STATE, not by version. Until
 * 2026-09-23 this was a strip of eight cards, v0.2 through v0.11 and then one
 * "Then": a changelog on the home page, telling a first-time reader about a
 * past they were not part of, with the only forward-looking card last. The
 * versions live on `/docs/roadmap` under *Already shipped*, which the link
 * under the grid points at.
 *
 * `today` is the one job as the headline states it — what you can use, how
 * long it lasts, when it comes back — plus the reaper, each a thing that SHIPS.
 * `soon` and `next` carry the badge AND the future tense, never one without
 * the other, and each is a section of `content/roadmap.mdx` that says what it
 * has to prove before it counts as finished. Add one here and it goes there too.
 */
const today: Step[] = [
  {
    icon: IconGauge,
    title: 'What you can use',
    body: 'Both windows for both agents, the week one model keeps to itself, and a free reset when Codex grants one — with the day it lapses.',
    color: 'blue',
    state: 'today',
  },
  {
    icon: IconChartLine,
    title: 'How long it lasts',
    body: 'A line under each bar saying where that window ends at the rate you are going — amber only when it would run out before it resets.',
    color: 'violet',
    state: 'today',
  },
  {
    icon: IconBellRinging,
    title: 'When it comes back',
    body: 'The reset beside every bar, and a notification when a window that stopped you is ready again.',
    color: 'cyan',
    state: 'today',
  },
  {
    icon: IconTrash,
    title: 'What they leave behind',
    body: 'The background processes agents never clean up, listed before anything is stopped — and never a live one.',
    color: 'indigo',
    state: 'today',
  },
];

const ahead: Step[] = [
  {
    icon: IconCalendarWeek,
    title: 'Last week',
    body: 'It will look back at the week that just ended: when each weekly window ran out, and how often the five-hour one stopped you.',
    color: 'grape',
    state: 'soon',
  },
  {
    icon: IconDeviceLaptop,
    title: 'Everyone else’s Mac',
    body: 'It will stop assuming the machine it was built on: where it found each agent, where it looked, and a way to point it at one by hand.',
    color: 'pink',
    state: 'soon',
  },
  {
    icon: IconSunrise,
    title: 'When to start',
    body: 'Once you tell it which hours are yours, it will reason from an average across your own days, not the last two hours — and say when to start.',
    color: 'gray',
    state: 'next',
  },
  {
    icon: IconSunset2,
    title: 'When you will probably stop',
    body: 'Before you have spent anything, it will say roughly how far into the day the five-hour window will carry you — or nothing, until it is right often enough.',
    color: 'gray',
    state: 'next',
  },
];

const horizonLabel: Record<Horizon, string> = { today: 'Today', soon: 'Soon', next: 'Next' };

function StepCard({ step }: { step: Step }) {
  return (
    <Paper p="lg" radius="lg" className={classes.roadmapCard} data-state={step.state}>
      <Stack gap={10}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <ThemeIcon size={40} radius="md" color={step.color} variant="light">
            <step.icon size={22} />
          </ThemeIcon>
          <Badge size="xs" radius="sm" className={classes.horizonBadge} data-state={step.state}>
            {horizonLabel[step.state]}
          </Badge>
        </Group>
        <Text fw={700} fz={17}>
          {step.title}
        </Text>
        <Text c="dimmed" fz="sm" lh={1.55}>
          {step.body}
        </Text>
      </Stack>
    </Paper>
  );
}

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
            lead="It has one job: tell you what you can still do, honestly, without being asked and without costing anything to ask."
          />

          {/*
            Three across, eleven cards: 3 + 3 + 3 + 2. Count them before
            deciding anything about the last row — this comment asserted nine
            cards and a `Next` teaser for days after neither was true.

            ONE LINE per description, the title carrying the claim and the
            card linking to the page that explains it (2026-09-25; they ran
            22 to 53 words and this block was 1372px of a 12052px page at
            1440). The budget at three columns is about 314px, roughly fifty
            characters, and a card that wraps stretches its whole row, so one
            long line undoes the other two. Measure a new or edited line at
            1440 and at 390 rather than counting characters.
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
          lead="What ships today, and what comes after it. Nothing ahead carries a date — the order changes as the work teaches you things, and the roadmap says what each step has to prove before it counts as finished."
        />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {today.map((step) => (
            <StepCard key={step.title} step={step} />
          ))}
        </SimpleGrid>

        <p className={classes.horizon}>Ahead</p>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {ahead.map((step) => (
            <StepCard key={step.title} step={step} />
          ))}
        </SimpleGrid>

        <Group justify="center" mt={36}>
          <Button
            component={Link}
            href="/docs/roadmap"
            variant="subtle"
            radius="xl"
            rightSection={<IconArrowRight size={16} />}
          >
            The whole roadmap, and every version so far
          </Button>
        </Group>
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
            <Title order={2} ta="center" fz={{ base: 36, sm: 48 }}>
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
