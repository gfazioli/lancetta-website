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
    width: 716,
    height: 280,
    alt: 'A Lancetta card for Claude: the five-hour window at 3% with the line “3% in 31m · at this pace 29% by reset” under it, the weekly window at 6% with “6% in 4 days · at this pace 9% by reset”, and its separate Fable limit at 0%',
    eyebrow: 'What nothing else can say',
    title: 'The number you can already see is not the useful one.',
    body: 'The percentage is on your menu bar all day, so you already know when it is getting low. What you cannot see is how long you can keep going like this. Lancetta says it under the bar — “at this rate you run out in 2h00m”, in amber — whenever it would happen before the window resets.',
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
    body: 'Today the projection is this window\u2019s own rate, carried forward. It does not know that you start at nine, or that you never touch it at the weekend. Next, it will reason from the readings it already keeps \u2014 an average across your own days \u2014 to say when to start, and when you will probably stop.',
    href: '/docs/roadmap',
    linkLabel: 'What is planned, and what it has to prove',
  },
  {
    src: '/screenshot-window-processes.png',
    width: 2080,
    height: 1440,
    alt: 'The Processes pane: four Codex trees with the directory each one was started for, what it is holding and how many children it has, three of them marked as orphans, and a Reclaim button over the total',
    eyebrow: 'What nothing else reaps',
    title: 'Nobody ever closes them.',
    body: 'Every folder an agent works in leaves a background tree behind, and one whose folder is gone is never shut down — not by the agent, not by the terminal, not by macOS. Lancetta is the only one of these monitors that finds them, and it shows you the list before it closes anything.',
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
    height: 441,
    alt: 'The Lancetta island open under a MacBook Pro notch: a ring per agent carrying its mark and its 5-hour reading, and both windows as bars',
    eyebrow: 'Under the notch',
    title: 'The island.',
    body: 'On a MacBook Pro the reading also lives under the notch — one bar per agent, exactly as wide as the notch, so the menu bar beside it still works. Point at it and it opens.',
    href: '/docs/the-notch',
    linkLabel: 'How the island works',
  },
  {
    /*
     * ONE frame for the window since 2026-09-25, where there were three — this
     * one, "The history." (the Usage pane) and "Live, or seen a moment ago."
     * (Limits) — to shorten the page; the feature row below names both, and
     * the docs carry their pictures. The four panes were re-shot as ONE set on
     * 2026-09-27, all 2080x1440 (the window's default 1040x720), so a pane
     * switcher would no longer change the window's size; one frame stays for
     * the page's length, not for the pictures.
     */
    src: '/screenshot-window-overview.png',
    width: 2080,
    height: 1440,
    alt: 'The Lancetta window: the daily token series for both agents side by side, and underneath, each agent’s 5-hour and 7-day windows on one row',
    eyebrow: 'When a glance is not enough',
    title: 'The window.',
    body: 'Command-O for the rest: daily tokens for both agents over 7, 30 or 90 days, every window in detail with when each reading was last true, the week that just ended, and the processes the agents have left running.',
    href: '/docs/the-window',
    linkLabel: 'What the window holds',
  },
];

const HERO_SHOT = {
  src: '/screenshot-menu-dark.png',
  width: 760,
  height: 714,
  alt: 'The Lancetta panel: how fresh the numbers are across the top, then Claude Code and Codex, each window with its bar and the time it resets. Claude’s lines say where each window ends at the current rate; Codex, spent for the week, shows the free reset it holds, with a Use… button',
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
