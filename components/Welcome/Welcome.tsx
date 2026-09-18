'use client';

import { type CSSProperties, useState } from 'react';
import Link from 'next/link';
import { Scene } from '@gfazioli/mantine-scene';
import { TextAnimate } from '@gfazioli/mantine-text-animate';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBellRinging,
  IconBook2,
  IconChartHistogram,
  IconClockHour4,
  IconCreditCardOff,
  IconGauge,
  IconHistory,
  IconLayoutNavbar,
  IconPalette,
  IconTrash,
} from '@tabler/icons-react';
import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Image,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from '@mantine/core';
import config from '@/config';
import { BuiltForMacSection } from '../BuiltForMacSection/BuiltForMacSection';
import { CostsNothingSection } from '../CostsNothingSection/CostsNothingSection';
import { ProblemSection } from '../ProblemSection/ProblemSection';
import { ProductNav } from '../ProductNav/ProductNav';
import { ReleaseCadence } from '../ReleaseCadence/ReleaseCadence';
import {
  fallbackReleaseCadence,
  type ReleaseCadence as Cadence,
} from '../ReleaseCadence/release-cadence';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import { ShareButtons } from '../ShareButtons/ShareButtons';
import { type GalleryShot, ScrollGallery } from '../ScrollGallery/ScrollGallery';
import { SolutionSection } from '../SolutionSection/SolutionSection';
import { FAQ } from '../FAQ/FAQ';
import classes from './Welcome.module.css';

/**
 * Fullscreen image lightbox: a transparent fullScreen Modal that centres the
 * image at its natural size, capped to the viewport. Clicking anywhere closes
 * it, so the whole backdrop is the dismiss target.
 */
function FullscreenImageModal({
  opened,
  onClose,
  src,
  alt,
}: {
  opened: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      styles={{
        content: { backgroundColor: 'transparent', boxShadow: 'none' },
        body: { height: '100%' },
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.82)' },
      }}
    >
      <UnstyledButton
        onClick={onClose}
        aria-label="Close enlarged screenshot"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          cursor: 'zoom-out',
        }}
      >
        <Image
          src={src}
          alt={alt}
          style={{ maxWidth: '94vw', maxHeight: '92vh', width: 'auto', height: 'auto' }}
        />
      </UnstyledButton>
    </Modal>
  );
}

/** A screenshot that opens full size on click, with a soft alpha-following drop. */
function ZoomableScreenshot({
  src,
  alt,
  maw,
  shadowOpacity = 0.55,
}: {
  src: string;
  alt: string;
  maw?: number;
  shadowOpacity?: number;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened(true)}
        aria-label={`Open enlarged screenshot: ${alt}`}
        style={{ display: 'block', width: '100%', cursor: 'zoom-in' }}
      >
        <Image
          src={src}
          alt={alt}
          display="block"
          mx="auto"
          style={{
            width: '100%',
            maxWidth: maw,
            height: 'auto',
            // `drop-shadow` (not box-shadow) follows the PNG's alpha channel,
            // so the shadow traces the menu's rounded corners rather than the
            // square <img> bounding box.
            filter: `drop-shadow(0 30px 60px rgba(0, 0, 0, ${shadowOpacity}))`,
          }}
        />
      </UnstyledButton>
      <FullscreenImageModal opened={opened} onClose={() => setOpened(false)} src={src} alt={alt} />
    </>
  );
}

/*
 * The strip under the hero: what it is, what it does, what it costs. Three
 * sentences, because that is what a product bar promising "what it is / what
 * it does / features" has to answer before the page asks for a scroll. The
 * third one is the founding constraint and the one measured claim on the
 * page; its own section further down carries the numbers.
 */
const glance = [
  {
    label: 'What it is',
    body: 'A native macOS menu-bar app that watches Codex and Claude Code.',
  },
  {
    label: 'What it does',
    body: 'Shows how much of each agent’s quota is left, and when it comes back. Both windows, both agents, one glance.',
  },
  {
    label: 'What it costs',
    body: 'Nothing. The app is free, and reading a quota spends none of it: no model is asked, no token is used.',
  },
];

/*
 * The three surfaces, in the order a reader meets them, for the scroll-driven
 * gallery under the hero. It replaced a timer-and-dots carousel: the frame is
 * now a function of how far the reader has scrolled, which is what the user
 * asked for and what Apple's product pages do. Three frames, not four — the
 * light-mode menu is the same content as the dark one and made a weak step;
 * it still lives in the docs.
 */
const galleryShots: GalleryShot[] = [
  {
    src: '/screenshot-menu-dark.png',
    alt: 'The Lancetta menu: Claude Code and Codex, each with a 5-hour and a 7-day quota window and the time it resets',
    title: 'The menu.',
    caption:
      'Both windows for both agents, the plan each account is on, and when every window resets. The number and the bar say the same thing, so a glance is enough.',
  },
  {
    src: '/screenshot-notch-open.png',
    alt: 'The Lancetta island open under a MacBook Pro notch: a ring per agent carrying its mark and its 5-hour reading, and both windows as bars',
    title: 'The island.',
    caption:
      'On a MacBook Pro the reading also lives under the notch — one bar per agent, exactly as wide as the notch, so the menu bar beside it still works. Point at it and it opens.',
  },
  {
    src: '/screenshot-window-overview.png',
    alt: 'The Lancetta window: the daily token chart for Codex, and both agents’ quota bars underneath',
    title: 'The window.',
    caption:
      '⌘O for the rest: daily tokens over weeks, each agent in detail, and the background processes the agents have left running.',
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
 * it ships — a card that says "will" with no badge reads as a missing feature,
 * and a card with no "will" and a badge reads as a lie.
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
    icon: IconTrash,
    title: 'Reclaim the memory',
    description:
      'Agents leave a background tree behind for every folder they worked in. Lancetta lists the ones serving folders that no longer exist and frees them — showing you the list first, and never touching a live one.',
    color: 'indigo',
    href: '/docs/memory',
  },
  {
    icon: IconChartHistogram,
    title: 'Where the tokens went',
    description:
      'A window with the daily token series over 7, 30 or 90 days, both agents in detail, and the processes still running. It is Codex’s history, and the chart says so — Claude Code publishes none.',
    color: 'cyan',
    href: '/docs/the-window',
  },
  {
    icon: IconBellRinging,
    title: 'Before the wall, not after it',
    description:
      'Two moments worth interrupting for: a window about to refuse you, and a window about to reset with most of it unspent. Lancetta will speak first for both.',
    color: 'pink',
    href: '/docs/roadmap#v030',
    badge: 'Next',
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
    title: 'It speaks first',
    body: 'A window that refused, a threshold crossed, a source gone quiet — and quota about to evaporate unused.',
    state: 'planned',
  },
  {
    version: 'v0.5',
    title: 'Everyone else’s Mac',
    body: 'The discovery UI and the Sources pane. The version where it stops assuming one machine — the signing and the feed it needed arrived early, in v0.2, and the Claude step became one click and a macOS dialog rather than a script.',
    state: 'planned',
  },
  {
    version: 'v0.6',
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
    /*
     * `--lan-subnav-height` is the product bar's height, declared once here
     * and inherited by everything laid out against it: the bar itself, the
     * pinned gallery's stage, and the scroll margin of every anchor the bar
     * links to. The bar is sticky under Nextra's navbar, so two bars sit above
     * the content on this page and only this page.
     */
    <div className={classes.home} style={{ '--lan-subnav-height': '48px' } as CSSProperties}>
      <ProductNav />

      {/* ─── Hero ─── */}
      <Box component="section" id="overview" pos="relative" className={classes.hero}>
        {/*
          The Scene wash is the icon's own light. The plate is azure at its
          top edge and violet at its far corner with a magenta rim beyond it,
          and that is the mesh; the glows sit behind the product, on the
          right, so the light on the page comes from where the screenshots
          are — cyan over the window, magenta under the menu, as on the icon.
        */}
        <Scene lazy>
          <Scene.Mesh
            stops={[
              { color: '#0D7DFA', position: '14% 18%', spread: 55 },
              { color: '#672AFA', position: '82% 72%', spread: 55 },
              { color: '#B117C5', position: '104% 30%', spread: 42 },
            ]}
            opacity={0.2}
          />
          <Scene.Glow color="#13D1FB" size={560} blur={150} opacity={0.32} top="4%" left="60%" />
          <Scene.Glow color="#B117C5" size={440} blur={140} opacity={0.22} top="68%" left="90%" />
          <Scene.Glow color="#0546BF" size={480} blur={140} opacity={0.26} top="58%" left="-10%" />
          <Scene.DotGrid color="gray" opacity={0.14} spacing={32} />
          <Scene.Noise opacity={0.022} />
        </Scene>

        <Container size="lg" w="100%" pos="relative" style={{ zIndex: 1 }}>
          <div className={classes.heroGrid}>
            <div className={classes.heroCopy}>
              {/* The product's name and category, before the claim: what it is. */}
              <div className={classes.heroBrand}>
                <Image src="/icon-512x512.png" alt="" w={40} h={40} className={classes.heroIcon} />
                <Text component="span" fw={600} fz="md">
                  Lancetta
                </Text>
                <Text component="span" fz="md" className={classes.heroTagline}>
                  · Menu-bar quota monitor for coding agents
                </Text>
              </div>

              <Title className={classes.title}>
                <span className={classes.titleLine}>Every agent&apos;s quota.</span>
                <span className={classes.titleLine}>One glance.</span>
                <span className={classes.titleLine}>
                  <TextAnimate
                    animate="in"
                    by="character"
                    inherit
                    variant="gradient"
                    component="span"
                    segmentDelay={0.12}
                    duration={1.5}
                    animation="scale"
                    animateProps={{ scaleAmount: 2 }}
                    gradient={{ from: '#0D7DFA', to: '#672AFA' }}
                  >
                    Costs nothing.
                  </TextAnimate>
                </span>
              </Title>

              <Text c="dimmed" fz={{ base: 'lg', md: 'xl' }} lh={1.5} className={classes.lead}>
                Both windows for both agents, when each one resets, and how old every reading is —
                in your Mac&apos;s menu bar, without spending a token to find out.
              </Text>

              <Group mt="xl" gap="sm">
                {released ? (
                  <Button
                    href="/download"
                    component="a"
                    leftSection={<IconGauge size={20} />}
                    size="lg"
                    radius="xl"
                    px={28}
                  >
                    Download for macOS
                  </Button>
                ) : (
                  <Button
                    href="/docs"
                    component="a"
                    leftSection={<IconBook2 size={20} />}
                    size="lg"
                    radius="xl"
                    px={28}
                  >
                    See what it does
                  </Button>
                )}
                <Button
                  href="/docs/roadmap"
                  component="a"
                  rightSection={<IconArrowRight size={18} />}
                  variant="subtle"
                  size="lg"
                >
                  {released ? 'See the roadmap' : 'Follow the build'}
                </Button>
              </Group>

              <Stack gap="sm" align="flex-start" mt="md">
                <Text c="dimmed" size="sm">
                  {/*
                    One interpolated template literal rather than JSX text. In a
                    text chunk spanning more than one source line, the space
                    between an interpolation and a following HTML entity is
                    dropped — both sibling sites shipped "v0.28.0· macOS 15+"
                    that way for months. An explicit {' '} does not survive
                    oxfmt, which removes it and rejoins the lines; a string is
                    out of reach of both the formatter and the JSX rules.
                  */}
                  {released
                    ? `Free · v${config.app.version} · macOS ${config.app.minMacOS}+ · Universal · Signed & notarized`
                    : `Free · v${config.app.version} in progress · macOS ${config.app.minMacOS}+ · No account, no server, no telemetry`}
                </Text>
                {released && <ReleaseCadence cadence={cadence} />}
              </Stack>
            </div>

            {/*
              The product, photographed: the menu in front, because the menu
              IS the app, and the window behind it, because there is one when
              you want more. The island gets its own frame in the gallery
              below; three objects here would be a collage, not a product.
            */}
            <div className={classes.cluster}>
              <Image
                src="/screenshot-window-overview.png"
                alt="The Lancetta window behind the menu: the daily token chart for Codex, and both agents’ quota bars underneath"
                className={classes.clusterWindow}
              />
              <Image
                src="/screenshot-menu-dark.png"
                alt="The Lancetta menu: Claude Code and Codex, each with a 5-hour and a 7-day quota window and the time it resets"
                className={classes.clusterMenu}
                fetchPriority="high"
              />
            </div>
          </div>

          <dl className={classes.glance}>
            {glance.map((item) => (
              <div key={item.label} className={classes.glanceItem}>
                <dt className={classes.glanceLabel}>{item.label}</dt>
                <dd className={classes.glanceBody}>{item.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Box>

      {/* ─── Where you read it: pinned, and driven by the scroll ─── */}
      <ScrollGallery
        id="where"
        shots={galleryShots}
        eyebrow="Where you read it"
        title="One reading. Three places."
      />

      {/* ─── The Problem ─── */}
      <ProblemSection />

      {/* ─── One job ─── */}
      <SolutionSection />

      {/* ─── Features ─── */}
      <Box id="features" py={80} className={classes.sectionBand}>
        <Container size="lg">
          <SectionHeading
            eyebrow="What is in it"
            title="An instrument, not a dashboard"
            lead="It has one job: tell you where you stand, honestly, without being asked and without costing anything to ask."
          />

          {/*
            Three across, not four: there are nine cards, and 9 in a 4-column
            grid is two full rows and a single orphan. 3x3 is exact.
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
                  { '--card-color': `var(--mantine-color-${feature.color}-5)` } as CSSProperties
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

      {/* ─── The founding constraint ─── */}
      <CostsNothingSection />

      {/* ─── Built for macOS ─── */}
      <BuiltForMacSection />

      {/* ─── In detail: the reading, and its age ─── */}
      <Box py={96} className={classes.plateBand}>
        <Container size="lg">
          {/*
            The Limits pane rather than the menu a third time: it is the one
            surface that puts "seen 1s ago" and "live" side by side, which is
            what this band is about.
          */}
          <SectionHeading
            tone="onDark"
            eyebrow="In detail"
            title="Live, or seen a moment ago"
            lead="Two agents, four windows, the reset time for each — and beside every reading, when it was last true."
            mb={64}
          />

          <Grid gap={{ base: 40, md: 56 }} align="center">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <ZoomableScreenshot
                src="/screenshot-window-limits.png"
                alt="The Limits pane of the Lancetta window: Claude Code seen a second ago and Codex live, each with its 5-hour and 7-day bar and the time it resets"
                shadowOpacity={0.7}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap="md">
                <ThemeIcon size={44} radius="md" variant="light" color="violet">
                  <IconHistory size={24} />
                </ThemeIcon>
                <Title order={3} fz={{ base: 24, sm: 30 }} fw={800} lh={1.15} c="white">
                  The reading, and how old it is
                </Title>
                <Text c="gray.4" size="md" lh={1.65}>
                  Both agents answer an account read — Codex over its own local interface, Claude with the sign-in Claude Code keeps on your Mac — so both refresh on demand once connected. Every reading carries the time it was taken, and the window says how long ago that was.
                </Text>
                <Button
                  component={Link}
                  href="/docs/how-it-reads"
                  variant="subtle"
                  color="gray"
                  size="compact-md"
                  rightSection={<IconArrowRight size={16} />}
                  w="fit-content"
                  px={0}
                  c="white"
                >
                  How it reads each agent
                </Button>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* ─── Roadmap ─── */}
      <Container id="roadmap" size="lg" py={80}>
        <SectionHeading
          eyebrow="Where it is going"
          title="Four versions, in order"
          lead="Nothing here is a promise with a date on it. It is the order the work is being done in, and what each step has to do before it counts as done."
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
                  <Text fw={900} fz={20} style={{ color: 'var(--lan-accent)' }}>
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

      {/* ─── Get Started CTA ─── */}
      <Box pos="relative" py={80} className={classes.plateBand}>
        <Scene lazy>
          <Scene.StarField count={{ base: 60, md: 120 }} twinkle opacity={0.7} />
          <Scene.ShootingStar count={2} minInterval={5} maxInterval={12} opacity={0.5} />
          <Scene.Glow color="#672AFA" size={500} blur={170} opacity={0.24} top="30%" left="50%" />
          <Scene.Glow color="#13D1FB" size={360} blur={150} opacity={0.14} top="80%" left="8%" />
        </Scene>
        <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
          <Stack align="center" gap="lg">
            <Text
              size="sm"
              fw={700}
              tt="uppercase"
              style={{ letterSpacing: 3, color: 'var(--mantine-color-lancetta-4)' }}
            >
              {released ? 'Get started' : 'Not yet'}
            </Text>
            <Title order={2} ta="center" fz={{ base: 36, sm: 48 }} fw={900} c="white">
              Know where you stand.
            </Title>
            <Text c="dimmed" ta="center" size="lg" maw={520}>
              {released
                ? 'Put both agents in your menu bar and stop reading a number you have to squint at a terminal for.'
                : 'The first build is not out yet. The roadmap says what is in it, and the releases page is where it will appear.'}
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
              {released ? 'Download for macOS' : 'Read the roadmap'}
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

      {/* ─── FAQ ─── */}
      <Container id="faq" size="lg" py={64}>
        <SectionHeading align="center" eyebrow="FAQ" title="Frequently asked questions" mb={24} />
        <Box w="100%" maw={700} mx="auto">
          <FAQ />
        </Box>
      </Container>
    </div>
  );
}
