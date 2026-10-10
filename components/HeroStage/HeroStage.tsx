'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { Scene } from '@gfazioli/mantine-scene';
import { TextAnimate } from '@gfazioli/mantine-text-animate';
import { IconArrowRight, IconBook2, IconGauge } from '@tabler/icons-react';
import { Button, Container, Group, Image, Stack, Text, Title } from '@mantine/core';
import config from '@/config';
import { Reveal, revealItem, revealScope } from '../Motion/Reveal';
import { ScrollNumber } from '../Motion/ScrollNumber';
import { useReveal } from '../Motion/useReveal';
import { ReleaseCadence } from '../ReleaseCadence/ReleaseCadence';
import {
  fallbackReleaseCadence,
  type ReleaseCadence as Cadence,
} from '../ReleaseCadence/release-cadence';
import classes from './HeroStage.module.css';

/*
 * The top of the page: the headline, and then one section per surface, in
 * ordinary scrolling flow.
 *
 * It was a PINNED STAGE until 2026-09-20 — a tall track with a viewport-high
 * stage stuck under the bar, the frame a pure function of how far the stage
 * had travelled. It is gone, and the two reasons are worth keeping because
 * they are what a scroll-driven hero costs rather than opinions about the
 * technique:
 *
 * - it made the page's entire top depend on JavaScript. The served markup was
 *   a track six screens tall frozen on frame 0, with the other five
 *   unreachable, and the stage held its content at `opacity: 0` until an
 *   effect said otherwise. Reported from an iPad and an iPhone as "you cannot
 *   see anything", and reproduced by rendering the served page with its script
 *   tags removed: a gradient wash and six dots.
 * - a stage that fills the viewport exactly reads as the whole page. Readers
 *   stopped on the first screen: "the only problem is to not have at least a
 *   scroll feedback ... The first time I opened this website I thought it was
 *   just that, and quit". Every fix for that is a fix for a problem the
 *   technique introduced.
 *
 * One thing that looked like it survived did not, and it is worth recording as
 * a failure rather than as a simplification. The header's status item used to
 * show the reading of whichever surface was in front of you — an
 * IntersectionObserver rather than scroll arithmetic, but still the page
 * driving the bar. It went on 2026-09-22: three readings passed on one pass
 * down here, and a number moving in a header while the reader is somewhere
 * else is legible as a malfunction long before it is legible as a
 * demonstration. The bar holds one reading and rotates on its own timer.
 */

interface Frame {
  /** Absent for a `next` section: a promise does not get a screenshot. */
  src?: string;
  alt?: string;
  /** The file's own pixel size, so the picture holds its place while it loads. */
  width?: number;
  height?: number;
  eyebrow: string;
  title: string;
  body: string;
  /** Measured evidence under the body. Two or three short rows, never prose. */
  figures?: { value: string; label: string }[];
  href: string;
  linkLabel: string;
  /** Shipping later, and the section says so on its face. */
  next?: boolean;
}

/** The window's panes are one set at one size: the 1200x800-point window, at 2x. */
const WINDOW_SHOT = { width: 2400, height: 1600 };

/**
 * THE ORDER IS THE ARGUMENT, and it changed on 2026-09-20 (user: *"mettendo
 * l'accento subito su cosa differenzia Lancetta dagli altri concorrenti -
 * quindi suggerimenti e clean dei processi"*).
 *
 * What the field has, measured and recorded in Lancetta#24: CodexBar has the
 * quota ceiling and the token flow and keeps no series; ccusage has the flow
 * and guesses the ceiling; Quotio routes around a limit rather than advising
 * on it. Nobody else reaps the process trees, and nobody else keeps a series
 * to advise from. So those two lead, and the surfaces that every monitor has
 * — a menu, an island, a window, a chart — come after them.
 *
 * Since 0.50.0 the frames are the decisions themselves (see the comment in
 * the array): each one's picture is that suggestion's own card, cropped from
 * the panel of the app's capture cast, and Maintenance shows the fixture
 * home's pane. A notification is not a frame: a banner has no screenshot
 * worth a hero, and the alerts have a page of their own.
 */
const frames: Frame[] = [
  /*
   * ONE FRAME PER DECISION since 0.50.0 (user, 2026-10-10: Lancetta is not
   * there to show consumption and the time to a reset; its point is to say
   * how and when to use the agents). The quota, the pace and the reset are
   * what a suggestion RESTS ON, so they appear inside these frames as its
   * basis, never as the frame's subject. The quotes are the app's own
   * sentences (`Guidance.swift`), with example values.
   */
  {
    src: '/screenshot-suggestion-room.png',
    width: 716,
    height: 257,
    alt: 'A Lancetta suggestion in green: Codex has room, 88% of this 5-hour window is unused and it resets in 39m; spend it, start the long task now, and Lancetta keeps watching the pace; under it, what it rests on: 12% of the 5 hours used, 20% of the week',
    eyebrow: 'When to push on',
    title: 'Quota about to go unused. Spend it.',
    body: 'A window that resets with most of it unused is quota gone for good, and nothing on your menu bar says so. Lancetta does: “Codex has room: 88% of this 5-hour window is unused, and it resets in 39m.” Then what to do with it: start the long task now, and raise the effort when it is set low. It keeps watching the pace, and warns you in time.',
    href: '/docs/suggestions#when-to-push-on',
    linkLabel: 'When it says to push on',
  },
  {
    src: '/screenshot-suggestion-stop.png',
    width: 716,
    height: 386,
    alt: 'A Lancetta suggestion in red: at this pace Claude stops in 51m, then waits 1h18m for its reset; lower the effort, give routine work to a lighter model, there is no free reset to fall back on, move the next tasks to Codex, which has 88% of its 5-hour window and 80% of its week left; under it, what it rests on: 82% of the 5 hours used, 21% an hour over the last hour, from 14 readings',
    eyebrow: 'When to slow down',
    title: 'Before it stops, not after.',
    body: '“At this pace Claude stops in 51m, then waits 1h18m for its reset.” Lancetta says it while there is still time to act, with what helps: a lower effort, a lighter model for routine work, a free reset if you hold one, the other agent while it has room. The week is where it matters most — a weekly window run out on a Tuesday costs days, and only a series of readings sees it coming.',
    figures: [
      { value: '7 days', label: 'the window that actually hurts' },
      { value: '1,890', label: 'readings that settled the rule' },
    ],
    href: '/docs/suggestions#when-to-slow-down',
    linkLabel: 'When it says to slow down',
  },
  {
    /*
     * NO SCREENSHOT, ON PURPOSE: the one unshipped section on the page carries
     * the badge AND the future tense, never one without the other. It follows
     * the two decisions above because it is where they go next.
     */
    eyebrow: 'Next',
    next: true,
    title: 'When to start.',
    body: 'Today a suggestion reasons from this window’s own rate, carried forward. It does not yet know that you start at nine, or that you never touch it at the weekend. Next, it will reason from an average across your own days, to say when to start, and when you will probably stop.',
    href: '/docs/roadmap',
    linkLabel: 'What is planned, and what it has to prove',
  },
  {
    src: '/screenshot-window-maintenance.png',
    ...WINDOW_SHOT,
    alt: 'The Maintenance pane: 4 warnings and 5 suggestions across 18 files in 4 places, the heaviest start (design-system) at 6,983 of the 120,000 characters where Claude Code warns, and the Instructions card open on the files that need fixing: an over-long CLAUDE.md, an AGENTS.md that Claude Code skips, a CLAUDE.local.md committed to git',
    eyebrow: 'How they are set up',
    title: 'The tokens every session pays for.',
    body: 'Before an agent does anything, it reads its instruction files — CLAUDE.md, AGENTS.md, rules, skills, memory — and every session pays for them again. Lancetta scans them in each repository Claude Code has worked in and the folders above it, measures what loads at each start against Claude Code’s own warning thresholds, and says what to fix: 20 checks, each with why it matters. A fix that needs no choosing is shown in full before it is applied; the rest opens in Claude Code, in plan mode, with the prompt already written.',
    figures: [{ value: '20', label: 'checks, each with its reason' }],
    href: '/docs/maintenance',
    linkLabel: 'What Maintenance checks',
  },
  {
    src: '/screenshot-window-processes.png',
    ...WINDOW_SHOT,
    alt: 'The Processes pane: 4 Codex trees holding 1.45 GB, 3 of them orphaned holding 1.05 GB, and the list open under them: each tree with the directory it was started for, what it holds, its children and its pid, the three orphans marked with a warning',
    eyebrow: 'What they leave behind',
    title: 'Nobody ever closes them.',
    body: 'Every folder an agent works in leaves a background tree behind, and one whose folder is gone is never shut down — not by the agent, not by the terminal, not by macOS. Lancetta finds them, suggests reclaiming what they hold, and shows you the list before it closes anything.',
    figures: [
      { value: '28', label: 'trees on one Mac' },
      { value: '2.68 GB', label: 'held between them' },
      { value: '2.24 GB', label: 'back after reaping' },
    ],
    href: '/docs/memory',
    linkLabel: 'What accumulates, and why nothing reaps it',
  },
  {
    src: '/screenshot-notch-open.png',
    width: 804,
    height: 569,
    alt: 'The Lancetta island open under a MacBook Pro notch: a ring per agent carrying its mark and its 5-hour reading, each window as a bar, and at the end the panel’s first suggestion: at this pace Claude stops in 51m, then waits 1h18m for its reset, lower the effort',
    eyebrow: 'Under the notch',
    title: 'The advice, at a glance.',
    body: 'On a MacBook Pro Lancetta also lives under the notch — one bar per agent, exactly as wide as the notch, so the menu bar beside it still works. A bar turns red when its agent has stopped, or will within the hour. Point at it and it opens on the same suggestion as the panel.',
    href: '/docs/the-notch',
    linkLabel: 'How the island works',
  },
  {
    src: '/screenshot-window-overview.png',
    ...WINDOW_SHOT,
    alt: 'The Lancetta window on its Overview: four suggestions first (Claude stops in 51m at this pace, Codex has room, Maintenance found 4 warnings, 3 orphaned Codex trees hold 1.05 GB), then the cards for Usage, Limits, Processes and Maintenance, with Usage open on the week’s tokens',
    eyebrow: 'When you want the reasons',
    title: 'The window.',
    body: 'Command-O: the suggestions first, then everything they rest on — daily tokens for both agents over 7, 30 or 90 days, every window in detail with when each reading was last true, the week that just ended, the processes the agents left running, and Maintenance.',
    href: '/docs/the-window',
    linkLabel: 'What the window holds',
  },
];

const HERO_SHOT = {
  src: '/screenshot-menu-dark.png',
  width: 760,
  height: 1478,
  alt: 'The Lancetta panel: three suggestions first, the most urgent open: at this pace Claude stops in 51m, then waits 1h18m for its reset, with what helps (lower the effort, a lighter model for routine work, no free reset to fall back on, move the next tasks to Codex) and what it rests on; then Codex has room, and Maintenance found 4 warnings. Under them the window in brief: Claude’s card open on its 5-hour, 7-day and Fable bars, Codex at 20%, Usage and Maintenance',
};

export function HeroStage({ cadence = fallbackReleaseCadence() }: { cadence?: Cadence }) {
  const released = config.app.released;
  /*
   * NOTHING HERE DRIVES THE HEADER any more, and the absence is the point.
   *
   * An IntersectionObserver used to hand the header's status item whichever
   * section was crossing the middle of the viewport, so the bar always quoted
   * the picture beneath it. Faithful in intent and wrong on screen: three
   * readings went past on one pass down this page, and a number changing in a
   * header while the reader is somewhere else entirely looks like a defect
   * rather than a demonstration (user, 2026-09-22). The bar holds ONE reading
   * now and only its turn moves, on its own timer — `MenuBarReading.tsx`. The
   * frames' own observers (`FrameSection`) play each part's entrance once, and
   * nothing they see leaves the frame.
   */

  // The icon's light across the hero, and the dial over it (see `.dial`).
  const wash = (
    <>
      <Scene lazy>
        <Scene.Mesh
          stops={[
            { color: '#13D1FB', position: '10% 6%', spread: 48 },
            { color: '#824BFC', position: '86% 26%', spread: 52 },
            { color: '#B117C5', position: '64% 92%', spread: 40 },
          ]}
          opacity={0.13}
        />
        <Scene.Glow color="#13D1FB" size={560} blur={160} opacity={0.14} top="2%" left="12%" />
        <Scene.Glow color="#824BFC" size={520} blur={160} opacity={0.16} top="8%" left="78%" />
        <Scene.Glow color="#B117C5" size={420} blur={150} opacity={0.1} top="76%" left="58%" />
        <Scene.DotGrid color="gray" opacity={0.1} spacing={32} />
      </Scene>
      <div className={classes.dialBox} aria-hidden="true">
        <div className={classes.dial}>
          <span className={classes.dialArc} />
          <span className={classes.dialLit} data-ticks="minor" />
          <span className={classes.dialLit} data-ticks="major" />
          <span className={classes.dialHand} />
        </div>
      </div>
    </>
  );

  return (
    <section
      id="overview"
      className={`lan-feather ${classes.hero}`}
      aria-label="Lancetta, at a glance"
    >
      {wash}

      <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
        <div className={classes.opening}>
          {/*
            20 characters is the length known to fit one line at 390px: the
            first two lines are 19 and 17. The third is 24 and wraps there onto
            two, by word (see `by` below), which was judged at 390 and kept.
            Lengthen a line and look at 390 before believing it.

            Each line names a DECISION THE APP MAKES WITH YOU TODAY (0.50.0):
            pushing on is the "room" suggestion, slowing down "stop" and
            "week", switching agents the step that names the other agent while
            it has room. What must not creep in until it ships: when to START,
            and anything learnt from an average across days. Today a
            suggestion reasons from the current window's own rate.
          */}
          <Title className={classes.title}>
            <span className={classes.titleLine}>Push on, slow down,</span>
            <span className={classes.titleLine}>or switch agents.</span>
            <span className={classes.titleLine}>
              <TextAnimate
                animate="in"
                // By WORD, not by character: TextAnimate makes one element per
                // segment, so per-character splitting lets the browser break a
                // line anywhere, and a headline that wraps then breaks INSIDE
                // a word ("And what they left runnin / g." at 390px).
                by="word"
                inherit
                variant="gradient"
                component="span"
                segmentDelay={0.2}
                duration={1.5}
                animation="scale"
                animateProps={{ scaleAmount: 2 }}
                gradient={{ from: '#0D7DFA', to: '#672AFA' }}
              >
                Lancetta tells you when.
              </TextAnimate>
            </span>
          </Title>

          <Text c="dimmed" fz={{ base: 'md', md: 'lg' }} lh={1.5} className={classes.lead}>
            A percentage leaves the decision to you. Lancetta makes it with you: from every reading
            of Codex and Claude Code, and a scan of what your agents load at every start, it says
            when to go all in, when to lower the effort or hand work to a lighter model, when to
            move to the other agent, and what to trim. Each suggestion says what it rests on.
          </Text>

          {/* Marked for the character: under the bar while this row is in
              view (`PanelHint`), in the corner once it is scrolled past
              (`ScrollGuide`). */}
          <Group mt="lg" gap="sm" className={classes.actions} data-guide-anchor="">
            {released ? (
              <Button
                href="/download"
                component="a"
                leftSection={<IconGauge size={20} />}
                size="md"
                radius="xl"
                px={26}
              >
                Download for macOS
              </Button>
            ) : (
              <Button
                href="/docs"
                component="a"
                leftSection={<IconBook2 size={20} />}
                size="md"
                radius="xl"
                px={26}
              >
                See what it does
              </Button>
            )}
            <Button
              href="/docs/roadmap"
              component="a"
              rightSection={<IconArrowRight size={18} />}
              variant="subtle"
              size="md"
            >
              {released ? 'What’s next' : 'Follow the build'}
            </Button>
          </Group>

          <Stack gap={6} mt="md" className={classes.meta}>
            <Text c="dimmed" size="sm">
              {/*
                One interpolated template literal rather than JSX text. In a
                text chunk spanning more than one source line, the space
                between an interpolation and a following HTML entity is
                dropped — both sibling sites shipped "v0.28.0- macOS 15+" that
                way for months. An explicit space expression does not survive
                oxfmt; a string is out of reach of both.
              */}
              {released
                ? `Free · v${config.app.version} · macOS ${config.app.minMacOS}+ · Universal · Signed & notarized`
                : `Free · v${config.app.version} in progress · macOS ${config.app.minMacOS}+ · No account, no server, no telemetry`}
            </Text>
            {released && <ReleaseCadence cadence={cadence} />}
          </Stack>
        </div>

        {/*
          The page's largest paint, so it goes through next/image: WebP at the
          size it is drawn (560px, or the column on a phone) instead of the
          95 KB PNG, eager and high priority. `priority` is deprecated in
          Next 16 in favour of exactly these two.
        */}
        <Image
          component={NextImage}
          src={HERO_SHOT.src}
          alt={HERO_SHOT.alt}
          width={HERO_SHOT.width}
          height={HERO_SHOT.height}
          sizes="(max-width: 36em) 100vw, 560px"
          className={classes.openingShot}
          loading="eager"
          fetchPriority="high"
        />

        <div className={classes.frames}>
          {frames.map((frame, i) => (
            <FrameSection key={frame.title} frame={frame} side={i % 2 === 0 ? 'left' : 'right'} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * One frame, revealed on the way into view as netfox.app's tour is (user,
 * 2026-09-28: *"anima anche le immagini e i copytext, come fatto sul sito web
 * di netfox, non solo i numeri"*): the picture comes in from the side it sits
 * on, the copy rises, and the figures pop in, their numbers rolling up from
 * zero.
 *
 * Each of the three watches for itself, where netfox.app's frame watches for
 * all of them. Measured by scrolling at 750px/s: when a reveal fired by the
 * frame went off, its copy was 136px below the fold of a 390x844 phone (one
 * column there, the copy under the picture) and its figures 424px below; at
 * 1440x900 the figures were 241px below. They moved before they were on
 * screen, unless the reader scrolled fast enough to meet them.
 *
 * So side by side the order is not fixed: the taller of the picture and the
 * copy has its top higher and starts first. Scrolling at 200px/s, a copy
 * started anywhere from 110 ms before its picture to 606 ms after it. Each
 * part moves where the reader is looking, which is the point; the copy's 140
 * ms only orders the two when they cross the line together.
 *
 * The frame with no picture is a card, and lands whole as the page's cards do:
 * its copy rises with it rather than watching for itself, which let an empty
 * bordered card land a quarter of a second before its text.
 *
 * `side` does two jobs, where the picture sits (the stylesheet orders the grid
 * on `data-side`) and where it comes in from, so in two columns the two cannot
 * disagree. In one column every picture is centred, and they keep alternating.
 * It counts every frame, the card included, as the grid's `:nth-child` did, so
 * the layout is the one the page already had.
 */
function FrameSection({ frame, side }: { frame: Frame; side: 'left' | 'right' }) {
  const reveal = useReveal<HTMLElement>();
  const card = frame.src ? undefined : { ...revealScope(reveal), item: revealItem('morph') };
  const rise = revealItem('rise', 140);
  const copy = (
    <>
      <Text className={classes.eyebrow} data-next={frame.next}>
        {frame.eyebrow}
      </Text>
      <Text className={classes.frameTitle} fz={{ base: 26, md: 34 }} lh={1.15} mt={8}>
        {frame.title}
      </Text>
      <Text c="dimmed" fz="lg" lh={1.6} mt={12}>
        {frame.body}
      </Text>

      {frame.figures && <Figures figures={frame.figures} />}

      <Link href={frame.href} className={classes.frameLink}>
        {frame.linkLabel}
      </Link>
    </>
  );

  return (
    <section
      ref={card ? reveal.ref : undefined}
      className={[classes.frame, card?.className, card?.item.className].filter(Boolean).join(' ')}
      data-armed={card?.['data-armed']}
      data-revealed={card?.['data-revealed']}
      data-reveal={card?.item['data-reveal']}
      style={card?.item.style}
      data-side={side}
      data-textonly={!frame.src}
      aria-label={frame.title}
    >
      {/*
        Every frame is below the fold. As plain <img>s React preloaded all four
        at the top of the document, so their 595 KB of PNG (the 249 KB window
        among them) competed with the hero for bandwidth: on Lighthouse's phone
        the hero's own 95 KB took 4.3 s to arrive (2026-09-29). Lazy, and WebP
        at the drawn size; the dimensions hold the place, so arriving late
        moves nothing.
      */}
      {frame.src && (
        <Reveal variant={side} className={classes.frameShot}>
          <Image
            component={NextImage}
            src={frame.src}
            alt={frame.alt ?? ''}
            width={frame.width}
            height={frame.height}
            sizes="(max-width: 62em) 100vw, 548px"
            loading="lazy"
            className={classes.shot}
          />
        </Reveal>
      )}

      {card ? (
        <div
          className={`${classes.frameCopy} ${rise.className}`}
          data-reveal={rise['data-reveal']}
          style={rise.style}
        >
          {copy}
        </div>
      ) : (
        <Reveal variant="rise" delay={140} className={classes.frameCopy}>
          {copy}
        </Reveal>
      )}
    </section>
  );
}

/**
 * A frame's figures, popping in one after another as the row comes into view.
 * Each number rolls a beat after its figure starts to grow; it waits for its
 * own way into view too (`ScrollNumber`), which comes a few pixels later.
 */
function Figures({ figures }: { figures: NonNullable<Frame['figures']> }) {
  const reveal = useReveal<HTMLDivElement>();
  const scope = revealScope(reveal);

  return (
    <div
      ref={reveal.ref}
      className={`${classes.figures} ${scope.className}`}
      data-armed={scope['data-armed']}
      data-revealed={scope['data-revealed']}
    >
      {figures.map((figure, k) => {
        const pop = revealItem('pop', k * 140);
        return (
          <div
            key={figure.label}
            className={`${classes.figure} ${pop.className}`}
            data-reveal={pop['data-reveal']}
            style={pop.style}
          >
            <span className={classes.figureValue}>
              <ScrollNumber value={figure.value} delay={140 + k * 140} />
            </span>
            <span className={classes.figureLabel}>{figure.label}</span>
          </div>
        );
      })}
    </div>
  );
}
