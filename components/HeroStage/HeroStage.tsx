'use client';

import Link from 'next/link';
import { Scene } from '@gfazioli/mantine-scene';
import { TextAnimate } from '@gfazioli/mantine-text-animate';
import { IconArrowRight, IconBook2, IconGauge } from '@tabler/icons-react';
import { Button, Container, Group, Image, Stack, Text, Title } from '@mantine/core';
import config from '@/config';
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
 * The ADVICE goes first since v0.4, and that is the revisit this comment used
 * to ask for. It was second, behind the reaper, for one reason that was not
 * editorial: the advice did not ship, so the page's first claim below the fold
 * would have been a promise rather than a number. The pace line ships in v0.4,
 * so the deeper moat leads and the frame has a screenshot like any other.
 * (The alerts shipped in v0.5 and have a page of their own; a notification is
 * not a frame here because a banner has no screenshot worth a hero.)
 */
const frames: Frame[] = [
  {
    src: '/screenshot-pace.png',
    alt: 'A Lancetta card: the five-hour window at 4% with the line “4% in 1h30m · at this pace 13% by reset” under it, and the weekly window at 55% with “55% in 2 days · at this pace full by Wednesday afternoon” in amber',
    eyebrow: 'What nothing else can say',
    title: 'The number you can already see is not the useful one.',
    body: 'The percentage is on your menu bar all day, so you already know when it is getting low. What you cannot see is whether this pace empties the window before it resets. Lancetta says it under the bar it is about, in the same place every time, amber only when the window would run out early — because a line that appears only in trouble is one nobody has learnt to read by the time it matters. It can say it because it keeps a series of its own readings; the field keeps the ceiling and the flow and no history at all.',
    figures: [
      { value: '7 days', label: 'the window that actually hurts' },
      { value: '1,890', label: 'readings that settled the rule' },
    ],
    href: '/docs/the-menu#the-pace-line',
    linkLabel: 'How the pace line reads',
  },
  {
    /*
     * NO SCREENSHOT, ON PURPOSE. This is the only unshipped section on the
     * page, and the rule it follows is the one the pace frame followed before
     * v0.4: the badge on the eyebrow AND the future tense in the body, never
     * one without the other. A promise dressed exactly like a shipped feature
     * makes the whole page something a reader has to check.
     *
     * It is SECOND rather than last because the order of this array is the
     * argument: the pace line above it is the first step of this same idea,
     * and this is where that idea goes. What ships today is named inside the
     * body so the two cannot be confused.
     */
    eyebrow: 'Next',
    next: true,
    title: 'The rhythm it has not learnt yet.',
    body: 'Today the projection is this window\u2019s own rate \u2014 what you have spent since it opened, carried forward. It does not know that you start at nine, that Thursday is your long day, or that you never touch it at the weekend. The readings are already being kept. What comes next is reasoning from them: an average across your own days, so the app can say when to start, what a normal afternoon costs you, and when you will probably stop \u2014 advice from your history rather than from the last two hours.',
    href: '/docs/roadmap',
    linkLabel: 'What is planned, and what it has to prove',
  },
  {
    src: '/screenshot-window-processes.png',
    alt: 'The Processes pane: four Codex trees with the directory each one was started for, what it is holding and how many children it has, three of them marked as orphans, and a Reclaim button over the total',
    eyebrow: 'What nothing else reaps',
    title: 'Nobody ever closes them.',
    body: 'Every folder an agent works in leaves a background tree behind, and one whose folder is gone will never be shut down by anything — not by the agent, not by the terminal you closed, not by macOS. Lancetta is the only one of these monitors that finds them, and it shows you the list before it closes a single thing on it.',
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
    alt: 'The Lancetta island open under a MacBook Pro notch: a ring per agent carrying its mark and its 5-hour reading, and both windows as bars',
    eyebrow: 'Under the notch',
    title: 'The island.',
    body: 'On a MacBook Pro the reading also lives under the notch — one bar per agent, exactly as wide as the notch, so the menu bar beside it still works. Point at it and it opens.',
    href: '/docs/the-notch',
    linkLabel: 'How the island works',
  },
  {
    src: '/screenshot-window-overview.png',
    alt: 'The Lancetta window: the daily token series for both agents side by side, and both agents’ quota bars underneath',
    eyebrow: 'When a glance is not enough',
    title: 'The window.',
    body: 'Command-O for the rest: daily tokens over weeks, each agent in detail, and the background processes the agents have left running.',
    href: '/docs/the-window',
    linkLabel: 'What the window holds',
  },
  {
    src: '/screenshot-window-usage.png',
    alt: 'The Usage pane: thirty days of tokens for both agents side by side, with the lifetime total, the best day and the streaks underneath',
    eyebrow: 'Where the tokens went',
    title: 'The history.',
    body: 'The same chart over 7, 30 or 90 days, with the lifetime total and the streaks under it. Codex publishes its own history; Claude’s is rebuilt from the transcripts on your Mac.',
    href: '/docs/the-window#usage',
    linkLabel: 'What the chart can and cannot say',
  },
  {
    src: '/screenshot-window-limits.png',
    alt: 'The Limits pane of the Lancetta window: Claude Code seen a second ago and Codex live, each with its 5-hour and 7-day bar and the time it resets',
    eyebrow: 'In detail',
    title: 'Live, or seen a moment ago.',
    body: 'Two agents, four windows, the reset time for each — and beside every reading, when it was last true. A number with no timestamp is a number you cannot trust.',
    href: '/docs/how-it-reads',
    linkLabel: 'How it reads each agent',
  },
];

const HERO_SHOT = {
  src: '/screenshot-menu-dark.png',
  alt: 'The Lancetta panel: Claude Code and Codex, each with a 5-hour and a 7-day quota window, the time each one resets, and the line saying where the window ends at the current rate',
};

export function HeroStage({ cadence = fallbackReleaseCadence() }: { cadence?: Cadence }) {
  const released = config.app.released;
  /*
   * NOTHING HERE WATCHES THE SCROLL any more, and the absence is the point.
   *
   * An IntersectionObserver used to hand the header's status item whichever
   * section was crossing the middle of the viewport, so the bar always quoted
   * the picture beneath it. Faithful in intent and wrong on screen: three
   * readings went past on one pass down this page, and a number changing in a
   * header while the reader is somewhere else entirely looks like a defect
   * rather than a demonstration (user, 2026-09-22). The bar holds ONE reading
   * now and only its turn moves, on its own timer — `MenuBarReading.tsx`.
   */

  const wash = (
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
            THE THREE LINES MUST NOT WRAP AT 390px, and that is a hard
            constraint rather than a preference: 20 characters is the length
            known to fit, and these are 17, 18 and 19. Lengthen one and
            re-shoot at 390 before believing it — the display face is a serif
            now, which sets wider than the grotesque this budget was measured
            against.

            Each line is a QUESTION THE APP ANSWERS TODAY, and that is what
            makes it a headline rather than a promise. "What you can use" is
            the model's own weekly window, drawn since v0.6 and in the island
            since v0.7; "how long it lasts" is the pace line, v0.4; "when it
            comes back" is the reset on every bar plus the alert that fires
            when a window you were blocked on has reopened, v0.5. What is NOT
            here, and must not creep in until it ships: when to START, and
            anything learnt from an average across days. The projection is the
            current window's own rate.
          */}
          <Title className={classes.title}>
            <span className={classes.titleLine}>What you can use.</span>
            <span className={classes.titleLine}>How long it lasts.</span>
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
                When it comes back.
              </TextAnimate>
            </span>
          </Title>

          <Text c="dimmed" fz={{ base: 'md', md: 'lg' }} lh={1.5} className={classes.lead}>
            For Codex and Claude Code. A percentage tells you what is gone; Lancetta reads the
            account’s own windows and says what they leave you — which model still has room, whether
            this pace runs the window out before it resets, and when you are back. No prices, no
            budget to type in.
          </Text>

          <Group mt="lg" gap="sm" className={classes.actions}>
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

        <Image
          src={HERO_SHOT.src}
          alt={HERO_SHOT.alt}
          className={classes.openingShot}
          fetchPriority="high"
        />

        <div className={classes.frames}>
          {frames.map((frame) => (
            <section
              key={frame.title}
              className={classes.frame}
              data-textonly={!frame.src}
              aria-label={frame.title}
            >
              {frame.src && (
                <div className={classes.frameShot}>
                  <Image src={frame.src} alt={frame.alt} className={classes.shot} />
                </div>
              )}

              <div className={classes.frameCopy}>
                <Text className={classes.eyebrow} data-next={frame.next}>
                  {frame.eyebrow}
                </Text>
                <Text className={classes.frameTitle} fz={{ base: 26, md: 34 }} lh={1.15} mt={8}>
                  {frame.title}
                </Text>
                <Text c="dimmed" fz="lg" lh={1.6} mt={12}>
                  {frame.body}
                </Text>

                {frame.figures && (
                  <div className={classes.figures}>
                    {frame.figures.map((figure) => (
                      <div key={figure.label} className={classes.figure}>
                        <span className={classes.figureValue}>{figure.value}</span>
                        <span className={classes.figureLabel}>{figure.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Link href={frame.href} className={classes.frameLink}>
                  {frame.linkLabel}
                </Link>
              </div>
            </section>
          ))}
        </div>
      </Container>
    </section>
  );
}
