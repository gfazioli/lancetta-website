'use client';

import type { CSSProperties } from 'react';
import { FeatureMarquee, featureMarqueeItem } from './FeatureMarquee';
import Link from 'next/link';
import {
  IconAdjustments,
  IconArrowRight,
  IconBellRinging,
  IconBook2,
  IconCalendarWeek,
  IconChartHistogram,
  IconChartPie,
  IconChecklist,
  IconClockHour4,
  IconCreditCardOff,
  IconDeviceLaptop,
  IconGauge,
  IconHandStop,
  IconLayoutNavbar,
  IconListCheck,
  IconRocket,
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
import { DiscordCallToAction } from '../Discord/DiscordCallToAction';
import { FAQ } from '../FAQ/FAQ';
import { Reveal } from '../Motion/Reveal';
import { HeroStage } from '../HeroStage/HeroStage';
import { ProblemSection } from '../ProblemSection/ProblemSection';
import {
  fallbackReleaseCadence,
  type ReleaseCadence as Cadence,
} from '../ReleaseCadence/release-cadence';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import { ShareButtons } from '../ShareButtons/ShareButtons';
import { SectionRule } from '../SectionRule/SectionRule';
import { SolutionSection } from '../SolutionSection/SolutionSection';
import { ScrollGuide } from '../Mascot/ScrollGuide';
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
    body: 'A native macOS menu-bar app that tells you when and how to use Codex and Claude Code.',
  },
  {
    label: 'What it does',
    body: 'Reads each agent’s quota and keeps every reading, scans the files they load at every start, and turns both into suggestions: when to push on, when to slow down, what to switch to, what to trim.',
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
 * THE ORDER IS LOAD-BEARING, and mirrors the hero: the decisions lead (push
 * on, slow down, the week, what to switch to, the setup), as the hero's frames
 * do, and the data they rest on comes after them, never before (user,
 * 2026-10-10: the app is not there to show consumption). The lesson behind it
 * is older: until 2026-09-20 the grid opened on "both windows, both agents",
 * which is exactly what the free, 74-provider alternative also does, and a
 * reader who knew it met a reason to prefer this one only at card seven. Do
 * not sort these by feel.
 */
const features: Feature[] = [
  {
    icon: IconRocket,
    title: 'Spend what would go unused',
    description: 'A window about to reset with room: start the long task.',
    color: 'teal',
    href: '/docs/suggestions#when-to-push-on',
  },
  {
    icon: IconHandStop,
    title: 'Slow down before it stops',
    description: 'When this pace runs a window out, and what helps.',
    color: 'orange',
    href: '/docs/suggestions#when-to-slow-down',
  },
  {
    icon: IconCalendarWeek,
    title: 'The week, not just the hour',
    description: 'A weekly window that runs out days early, seen in time.',
    color: 'grape',
    href: '/docs/suggestions#the-week',
  },
  {
    icon: IconAdjustments,
    title: 'Which model, which effort',
    description: 'A lighter model, a lower effort, or the other agent.',
    color: 'blue',
    href: '/docs/suggestions#what-helps',
  },
  {
    icon: IconChecklist,
    title: 'Your agents’ setup, checked',
    description: 'What they load at every start, its cost, and what to fix.',
    color: 'lime',
    href: '/docs/maintenance',
  },
  {
    icon: IconListCheck,
    title: 'Every suggestion shows its working',
    description: 'The readings it rests on, right under it.',
    color: 'violet',
    href: '/docs/suggestions#what-it-rests-on',
  },
  {
    icon: IconBellRinging,
    title: 'It speaks once',
    description: 'A notification only for what cannot wait.',
    color: 'pink',
    href: '/docs/alerts',
  },
  {
    icon: IconTrash,
    title: 'Reclaim the memory',
    description: 'Frees what agents leave running — the list first.',
    color: 'indigo',
    href: '/docs/memory',
  },
  {
    icon: IconGauge,
    title: 'Both windows, both agents',
    description: 'The 5-hour and 7-day windows it reasons from.',
    color: 'cyan',
    href: '/docs/the-menu',
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
    icon: IconCreditCardOff,
    title: 'Reading costs nothing',
    description: 'No model is asked, so checking costs no quota.',
    color: 'grape',
    href: '/docs/how-it-reads',
  },
  {
    icon: IconLayoutNavbar,
    title: 'Under the notch',
    description: 'On a MacBook Pro, the advice lives in the notch too.',
    color: 'violet',
    href: '/docs/the-notch',
  },
  {
    icon: IconChartHistogram,
    title: 'Where the tokens went',
    description: 'Daily tokens for both agents, over 7, 30 or 90 days.',
    color: 'cyan',
    href: '/docs/the-window',
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
 * `today` opens with the decisions the app makes with you — when to push on,
 * when to slow down, what to switch to, how the agents are set up — then what
 * they leave behind and what it all rests on, each a thing that SHIPS.
 * `soon` and `next` carry the badge AND the future tense, never one without
 * the other, and each is a section of `content/roadmap.mdx` that says what it
 * has to prove before it counts as finished. Add one here and it goes there too.
 */
const today: Step[] = [
  {
    icon: IconRocket,
    title: 'When to push on',
    body: 'A window about to reset with most of it unused: spend it, and raise the effort if the task deserves it.',
    color: 'teal',
    state: 'today',
  },
  {
    icon: IconHandStop,
    title: 'When to slow down',
    body: 'Before an agent stops, in the 5-hour window or in the week: when it would, and what helps.',
    color: 'orange',
    state: 'today',
  },
  {
    icon: IconAdjustments,
    title: 'What to switch to',
    body: 'A lower effort, a lighter model, the free reset you hold, or the other agent while it has room.',
    color: 'blue',
    state: 'today',
  },
  {
    icon: IconChecklist,
    title: 'How they are set up',
    body: 'The files agents load at every start, measured and checked, with fixes you see before they are applied.',
    color: 'lime',
    state: 'today',
  },
  {
    icon: IconTrash,
    title: 'What they leave behind',
    body: 'The background processes agents never clean up, listed before anything is stopped — and never a live one.',
    color: 'indigo',
    state: 'today',
  },
  {
    icon: IconGauge,
    title: 'What it all rests on',
    body: 'Both windows for both agents, a model’s own week, every reading dated, and the week that just ended.',
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
    icon: IconDeviceLaptop,
    title: 'Everyone else’s Mac',
    body: 'Where it found each agent, every place it looked, and a way to point it at the Codex you want.',
    color: 'pink',
    state: 'today',
  },
];

const ahead: Step[] = [
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
    <Paper p="lg" radius="lg" h="100%" className={classes.roadmapCard} data-state={step.state}>
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
    <div className={`lan-home ${classes.home}`}>
      {/*
        The hero is the product demonstrated: a pinned stage hanging off the
        menu bar in the header, one frame per surface, the copy at the bottom.
        See HeroStage.tsx — it also drives the reading in the bar, so the
        thing at the top of the page does what the page is describing.
      */}
      <HeroStage cadence={cadence} />

      <Container size="lg">
        <dl className={classes.glance}>
          {glance.map((item, i) => (
            // The item IS the wrapper: a <dl> may hold a <div> around its <dt>
            // and <dd>, not a <div> around that <div>.
            <Reveal key={item.label} variant="rise" delay={i * 100} className={classes.glanceItem}>
              <dt className={classes.glanceLabel}>{item.label}</dt>
              <dd className={classes.glanceBody}>{item.body}</dd>
            </Reveal>
          ))}
        </dl>
      </Container>

      {/* The Problem */}
      <SectionRule />
      <ProblemSection />

      {/* How it decides */}
      <SectionRule />
      <SolutionSection />

      {/* Features */}
      <SectionRule />
      <Box id="features" py={80}>
        <Container size="lg">
          <SectionHeading
            eyebrow="What is in it"
            title="A guide, not a gauge"
            lead="It has one job: tell you what to do with your agents next, and show you why, without costing anything to ask."
          />
        </Container>

        {/*
          ONE ROW, full width, scrolling (2026-09-25). This block was a grid of
          eleven cards, 1372px of a 12052px page at 1440, whose descriptions
          ran 22 to 53 words. Each is now one line — the title carries the
          claim and the card links to the page that explains it — and the row
          is a marquee that stops under the pointer; FeatureMarquee says what
          it had to add for the keyboard, screen readers and reduced motion.

          A description is ONE line in a 360px card: about 320px of text, and
          the widest today measures 310. Measure a new or edited one rather
          than counting characters.
        */}
        {/* The row lifts in as one: its cards already move, sideways, for ever. */}
        <Reveal variant="rise">
          <FeatureMarquee>
            {features.map((feature) => (
              <Paper
                key={feature.title}
                component={Link}
                href={feature.href}
                p="lg"
                className={`${classes.featureCard} ${classes.cardLink} ${featureMarqueeItem}`}
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
          </FeatureMarquee>
        </Reveal>
      </Box>

      {/* The founding constraint */}
      <SectionRule />
      <CostsNothingSection />

      {/* Built for macOS */}
      <SectionRule />
      <BuiltForMacSection />

      {/* What’s next */}
      <SectionRule />
      <Container id="roadmap" size="lg" py={80}>
        <SectionHeading
          eyebrow="Where it is going"
          title="What’s next"
          lead="What ships today, and what comes after it. Nothing ahead carries a date — the order changes as the work teaches you things, and the roadmap says what each step has to prove before it counts as finished."
        />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {today.map((step, i) => (
            // Wrapped: StepCard passes nothing through, and the wrapper takes
            // the card's radius for the light on its rim.
            <Reveal key={step.title} delay={i * 120} radius="var(--mantine-radius-lg)">
              <StepCard step={step} />
            </Reveal>
          ))}
        </SimpleGrid>

        <Reveal variant="rise">
          <p className={classes.horizon}>Ahead</p>
        </Reveal>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {ahead.map((step, i) => (
            <Reveal key={step.title} delay={i * 120} radius="var(--mantine-radius-lg)">
              <StepCard step={step} />
            </Reveal>
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
      <SectionRule />
      <Box py={88} className={classes.auroraBand}>
        <Container size="lg">
          <Reveal variant="rise">
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
                Know when to push on.
              </Title>
              <Text c="dimmed" ta="center" size="lg" maw={520}>
                {released
                  ? 'Put both agents in your menu bar, and let their own readings tell you when to push on, slow down or switch.'
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
          </Reveal>
        </Container>
      </Box>

      {/* FAQ */}
      <SectionRule />
      <Container id="faq" size="lg" py={72}>
        <SectionHeading align="center" eyebrow="FAQ" title="Frequently asked questions" mb={24} />
        <Reveal variant="rise">
          <Box w="100%" maw={700} mx="auto">
            <FAQ />
          </Box>
        </Reveal>
      </Container>

      {/* Community: the Discord server, for what the FAQ did not answer */}
      <DiscordCallToAction />

      {/* The character, past the hero: in the corner, then on the Support card. */}
      <ScrollGuide />
    </div>
  );
}
