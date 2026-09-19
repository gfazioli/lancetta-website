'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Scene } from '@gfazioli/mantine-scene';
import { TextAnimate } from '@gfazioli/mantine-text-animate';
import { IconArrowRight, IconBook2, IconGauge } from '@tabler/icons-react';
import { Button, Container, Group, Image, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery, useReducedMotion } from '@mantine/hooks';
import config from '@/config';
import { type MenuBarReadingState, setMenuBarReading } from '../MenuBarHeader/reading-store';
import { ReleaseCadence } from '../ReleaseCadence/ReleaseCadence';
import {
  fallbackReleaseCadence,
  type ReleaseCadence as Cadence,
} from '../ReleaseCadence/release-cadence';
import { frameIndex } from './frame-index';
import classes from './HeroStage.module.css';

/*
 * The hero is the product, demonstrated.
 *
 * The header above it is a macOS menu bar; this is what hangs off it. The
 * section is a tall TRACK with a viewport-high STAGE stuck under the bar:
 * scrolling into the track pins the stage, scrolling on advances the frame,
 * past the last frame the page resumes. Nothing intercepts the wheel — the
 * frame is a pure function of how far through the track the stage has
 * travelled, which is why it behaves identically with a trackpad, a mouse, the
 * keyboard and VoiceOver's scrolling. It is the same mechanism the gallery
 * further down the page used, lifted into the hero and given the bar to hang
 * from.
 *
 * Each frame also writes the header's status item (`setMenuBarReading`), so
 * the thing at the top of the page is doing what the page is describing: the
 * first frame holds the menu open under it, the rest close it and move the
 * reading on.
 *
 * Two audiences do not get the pinned version, and both get the same frames as
 * a plain stack: a phone, where a scroll-driven stage on a short viewport is
 * mostly a way to hide the copy, and a reader who has asked for reduced motion,
 * who has asked for exactly this not to happen.
 */

interface Frame {
  src: string;
  alt: string;
  /** Where the artifact sits on the stage — see `HeroStage.module.css`. */
  anchor: 'menu' | 'notch' | 'centre';
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
  reading: MenuBarReadingState;
}

/*
 * The window's three panes are ONE session, so they quote one reading. The
 * Limits pane is the only one that draws a reset time, so it supplies both
 * agents' for all three: the Overview pane's Quota Used card shows Claude's
 * 20% and crops Codex's row, and the Usage pane carries no quota at all.
 */
const windowSession: MenuBarReadingState = {
  cells: [
    { agent: 'claude', percent: 16, resets: '25m' },
    { agent: 'codex', percent: 28, resets: '53m' },
  ],
  open: false,
};

/**
 * The frames after the hero's own. Frame 0 is the headline and lives in the
 * markup below, because it carries the page's `h1` and the two buttons — it
 * is not data, it is the page.
 */
const frames: Frame[] = [
  {
    src: '/screenshot-notch-open.png',
    alt: 'The Lancetta island open under a MacBook Pro notch: a ring per agent carrying its mark and its 5-hour reading, and both windows as bars',
    anchor: 'notch',
    eyebrow: 'Under the notch',
    title: 'The island.',
    body: 'On a MacBook Pro the reading also lives under the notch — one bar per agent, exactly as wide as the notch, so the menu bar beside it still works. Point at it and it opens.',
    href: '/docs/the-notch',
    linkLabel: 'How the island works',
    reading: {
      cells: [
        { agent: 'claude', percent: 12, resets: '1h55m' },
        { agent: 'codex', percent: 28, resets: '2h23m' },
      ],
      open: false,
    },
  },
  {
    src: '/screenshot-window-overview.png',
    alt: 'The Lancetta window: the daily token series for both agents side by side, and both agents’ quota bars underneath',
    anchor: 'centre',
    eyebrow: 'When a glance is not enough',
    title: 'The window.',
    body: 'Command-O for the rest: daily tokens over weeks, each agent in detail, and the background processes the agents have left running.',
    href: '/docs/the-window',
    linkLabel: 'What the window holds',
    reading: windowSession,
  },
  {
    src: '/screenshot-window-usage.png',
    alt: 'The Usage pane: thirty days of tokens for both agents side by side, with the lifetime total, the best day and the streaks underneath',
    anchor: 'centre',
    eyebrow: 'Where the tokens went',
    title: 'The history.',
    body: 'The same chart over 7, 30 or 90 days, with the lifetime total and the streaks under it. Codex publishes its own history; Claude’s is rebuilt from the transcripts on your Mac.',
    href: '/docs/the-window#usage',
    linkLabel: 'What the chart can and cannot say',
    reading: windowSession,
  },
  {
    src: '/screenshot-window-limits.png',
    alt: 'The Limits pane of the Lancetta window: Claude Code seen a second ago and Codex live, each with its 5-hour and 7-day bar and the time it resets',
    anchor: 'centre',
    eyebrow: 'In detail',
    title: 'Live, or seen a moment ago.',
    body: 'Two agents, four windows, the reset time for each — and beside every reading, when it was last true. A number with no timestamp is a number you cannot trust.',
    href: '/docs/how-it-reads',
    linkLabel: 'How it reads each agent',
    reading: windowSession,
  },
  {
    src: '/screenshot-window-processes.png',
    alt: 'The Processes pane: four Codex trees with the directory each one was started for, what it is holding and how many children it has, three of them marked as orphans, and a Reclaim button over the total',
    anchor: 'centre',
    eyebrow: 'What they leave behind',
    title: 'Nobody ever closes them.',
    body: 'Every folder an agent works in leaves a background tree, and one whose folder is gone will never be shut down by anything. Lancetta lists them, and shows you that list before it closes a single one.',
    href: '/docs/memory',
    linkLabel: 'What accumulates, and why nothing reaps it',
    reading: windowSession,
  },
];

/*
 * Every frame's reading is READ OFF the screenshot it sits beside, for BOTH
 * agents, because the bar shows them in turn: the menu holds Claude at 20%
 * with 1h44m and Codex at 5% with 3h23m, the island Claude at 12% with 1h55m
 * and Codex at 28% with 2h23m, and the window's three panes the one session
 * above. The bar is meant to be the same app as the picture under it — a
 * percentage in the bar that the screenshot beside it contradicts is a small
 * lie the eye catches, and it now has four seconds to catch it in.
 *
 * They are ILLUSTRATION, not claims: these are one developer's numbers on one
 * afternoon. Every figure the prose states comes from the measurement table in
 * CLAUDE.md instead.
 */
const heroReading: MenuBarReadingState = {
  cells: [
    { agent: 'claude', percent: 20, resets: '1h44m' },
    { agent: 'codex', percent: 5, resets: '3h23m' },
  ],
  open: true,
};

/** Every frame's reading, hero first, indexed the way `active` is. */
const readings: MenuBarReadingState[] = [heroReading, ...frames.map((frame) => frame.reading)];

/**
 * A copy block's content height: the span of its CHILDREN, not its own height.
 * Three of the five blocks are `position: absolute; inset: 0`, so their height
 * IS the box they are being measured to fit — `scrollHeight` answered 435px
 * for every frame, which is the number this exists to replace.
 *
 * `offsetTop`/`offsetHeight`, not `getBoundingClientRect()`: the rect is the
 * TRANSFORMED box, and a block that is not the active one carries a
 * `translateY`. A translate happens to cancel out of a span, but the hero
 * already paid for trusting that once — the artifact's `scale(0.97)` shaved
 * 3% off the row on every visit — so this measures the layout directly. The
 * children are positioned against the block itself, which is the offsetParent
 * either way round (`absolute`, or `relative` for the one left in flow).
 */
function copyHeight(block: HTMLElement): number {
  const kids = block.children;
  if (!kids.length) {
    return 0;
  }
  const first = kids[0] as HTMLElement;
  const last = kids[kids.length - 1] as HTMLElement;
  return last.offsetTop + last.offsetHeight - first.offsetTop;
}

const HERO_SHOT = {
  src: '/screenshot-menu-dark.png',
  alt: 'The Lancetta menu: Claude Code and Codex, each with a 5-hour and a 7-day quota window and the time it resets',
};

export function HeroStage({ cadence = fallbackReleaseCadence() }: { cadence?: Cadence }) {
  const reduced = useReducedMotion();
  const narrow = useMediaQuery('(max-width: 62em)');
  const pinned = !reduced && !narrow;
  const released = config.app.released;

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  // Point (a): the first frame FADES IN rather than being there already. One
  // frame late on purpose — a value that is already final never animates.
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!pinned) {
      // Unpinned, the stage is a stack and nothing drives the bar: leave the
      // header showing the reading the page opens on.
      setMenuBarReading(heroReading);
      return undefined;
    }
    const measure = () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) {
        return;
      }
      const t = track.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      // How far the stuck stage has slid down inside the track: 0 at the top,
      // `travel` when the track's bottom edge catches up with it. Measured
      // between the two boxes rather than against the viewport, so the bar the
      // stage sticks under never enters the arithmetic.
      const travel = t.height - s.height;
      if (travel <= 0) {
        return;
      }
      setActive(frameIndex((s.top - t.top) / travel, readings.length));
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [pinned]);

  /*
   * The stage gives the copy exactly the room the ACTIVE block needs, and the
   * rest to the product. Measured from the DOM rather than declared, because
   * the blocks differ by a factor of two and every one of those heights is a
   * function of the viewport width, the font and the reader's own text size.
   */
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || !pinned) {
      return undefined;
    }
    const apply = () => {
      /*
       * The artifact row, for the two frames that hang from the bar. It is the
       * image's CONTENT height, not its box's: `object-fit: contain` letterboxes
       * whenever `max-width` bites, and the box would then reserve room for
       * emptiness. The centred frames publish nothing and keep their `1fr`.
       */
      const art = inner.querySelector<HTMLImageElement>('[data-art-active="true"] img');
      if (art?.naturalHeight) {
        /*
         * `offsetWidth`/`offsetHeight`, not `getBoundingClientRect()`. The rect
         * is the TRANSFORMED box, and the artifact arrives on a 620ms
         * `scale(0.97)`: measured mid-animation the row came out 3% short (482
         * against 497) every time the reader came back to the top, so the copy
         * crept upwards on each visit. The offset pair is the layout size and
         * ignores transforms.
         */
        const content = Math.min(
          art.offsetHeight,
          art.offsetWidth * (art.naturalHeight / art.naturalWidth)
        );
        inner.style.setProperty('--art-h', `${Math.ceil(content)}px`);
      } else {
        inner.style.removeProperty('--art-h');
      }

      const item = inner.querySelector<HTMLElement>('[data-copy-active="true"]');
      if (!item) {
        return;
      }
      /*
       * The three CENTRED frames share one copy row, and it is the tallest of
       * them.
       *
       * A centred artifact has no height of its own: it fills the row, and the
       * row is whatever the copy leaves. So one copy block a line taller than
       * its neighbour drew a visibly smaller window — and those three frames
       * are three panes of ONE window, side by side in the reader's memory,
       * which is exactly where a few per cent of scale reads as a mistake.
       * Reserving the tallest for all three makes the artifact row identical by
       * construction, and stops the copy itself shuffling as they cross-fade.
       *
       * The two frames that hang from the bar keep their own height: they are
       * sized by `--art-h` above, not by what is left over.
       */
      const blocks =
        item.dataset.copyAnchor === 'centre'
          ? Array.from(inner.querySelectorAll<HTMLElement>('[data-copy-anchor="centre"]'))
          : [item];
      inner.style.setProperty('--copy-h', `${Math.ceil(Math.max(...blocks.map(copyHeight)))}px`);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [active, pinned]);

  // The header's status item follows the frame. Separate from the measurement
  // so it runs once per CHANGE of frame rather than once per scroll event.
  useEffect(() => {
    setMenuBarReading(readings[active] ?? heroReading);
  }, [active]);

  const headline = (
    <>
      <Title className={classes.title}>
        <span className={classes.titleLine}>Every agent’s quota.</span>
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

      <Text c="dimmed" fz={{ base: 'md', md: 'lg' }} lh={1.5} className={classes.lead}>
        Both windows for both agents, when each one resets, and how old every reading is — in your
        Mac’s menu bar, without spending a token to find out.
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
            One interpolated template literal rather than JSX text. In a text
            chunk spanning more than one source line, the space between an
            interpolation and a following HTML entity is dropped — both
            sibling sites shipped "v0.28.0- macOS 15+" that way for months. An
            explicit space expression does not survive oxfmt, which removes it
            and rejoins the lines; a string is out of reach of both.
          */}
          {released
            ? `Free · v${config.app.version} · macOS ${config.app.minMacOS}+ · Universal · Signed & notarized`
            : `Free · v${config.app.version} in progress · macOS ${config.app.minMacOS}+ · No account, no server, no telemetry`}
        </Text>
        {released && <ReleaseCadence cadence={cadence} />}
      </Stack>
    </>
  );

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

  /*
   * The stacked fallback. Same frames, same order, captions under each — a
   * phone has no room for a stage and a reader who asked for no motion asked
   * for no stage.
   */
  if (!pinned) {
    return (
      <section
        id="overview"
        className={`lan-feather ${classes.heroPlain}`}
        aria-label="Lancetta, at a glance"
      >
        {wash}
        <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
          <div className={classes.plainCopy}>{headline}</div>
          <Image
            src={HERO_SHOT.src}
            alt={HERO_SHOT.alt}
            className={classes.plainShot}
            fetchPriority="high"
          />
          <Stack gap={56} mt={56}>
            {frames.map((frame) => (
              <Stack key={frame.src} gap="md">
                <Image src={frame.src} alt={frame.alt} className={classes.plainShot} />
                <Stack gap={6}>
                  <Text className={classes.eyebrow}>{frame.eyebrow}</Text>
                  <Text fw={800} fz={24}>
                    {frame.title}
                  </Text>
                  <Text c="dimmed" lh={1.6}>
                    {frame.body}
                  </Text>
                  <Link href={frame.href} className={classes.frameLink}>
                    {frame.linkLabel}
                  </Link>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Container>
      </section>
    );
  }

  return (
    <section
      id="overview"
      className={`lan-feather ${classes.hero}`}
      aria-label="Lancetta, at a glance"
    >
      {wash}
      <div
        ref={trackRef}
        className={classes.track}
        style={{ '--frames': readings.length } as React.CSSProperties}
        data-active={active}
      >
        <div ref={stageRef} className={classes.stage} data-ready={ready}>
          <Container ref={innerRef} size="lg" className={classes.inner}>
            <div className={classes.artifacts}>
              <div
                className={classes.artifact}
                data-anchor="menu"
                data-active={active === 0}
                data-art-active={active === 0}
              >
                <Image
                  src={HERO_SHOT.src}
                  alt={HERO_SHOT.alt}
                  className={classes.shot}
                  fetchPriority="high"
                />
              </div>
              {frames.map((frame, i) => (
                <div
                  key={frame.src}
                  className={classes.artifact}
                  data-anchor={frame.anchor}
                  data-active={active === i + 1}
                  data-art-active={active === i + 1 && frame.anchor !== 'centre'}
                  aria-hidden={active !== i + 1}
                >
                  <Image src={frame.src} alt={frame.alt} className={classes.shot} />
                </div>
              ))}
            </div>

            <div className={classes.copy}>
              <div
                className={classes.copyItem}
                data-active={active === 0}
                data-copy-active={active === 0}
                data-copy-anchor="menu"
              >
                {headline}
              </div>
              {frames.map((frame, i) => (
                <div
                  key={frame.src}
                  className={classes.copyItem}
                  data-active={active === i + 1}
                  data-copy-active={active === i + 1}
                  data-copy-anchor={frame.anchor}
                  aria-hidden={active !== i + 1}
                >
                  <Text className={classes.eyebrow}>{frame.eyebrow}</Text>
                  <Text fw={800} fz={{ base: 26, md: 34 }} lh={1.15} mt={6}>
                    {frame.title}
                  </Text>
                  <Text c="dimmed" fz="lg" lh={1.6} mt={10} maw={620} mx="auto">
                    {frame.body}
                  </Text>
                  <Link href={frame.href} className={classes.frameLink}>
                    {frame.linkLabel}
                  </Link>
                </div>
              ))}
            </div>

            {/*
              At the bottom of the STAGE, not under the copy. The two frames
              that hang from the bar are content-sized, so their slack falls to
              the bottom of the viewport, and an indicator pinned there gives
              that air a job instead of leaving it as a hole.
            */}
            <div className={classes.dots} aria-hidden>
              {[HERO_SHOT.src, ...frames.map((frame) => frame.src)].map((src, i) => (
                <span key={src} className={classes.dot} data-active={i === active} />
              ))}
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
