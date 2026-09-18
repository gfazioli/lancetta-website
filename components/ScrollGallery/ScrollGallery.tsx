'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Container, Image, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useMediaQuery, useReducedMotion } from '@mantine/hooks';
import classes from './ScrollGallery.module.css';

export interface GalleryShot {
  src: string;
  alt: string;
  title: string;
  caption: string;
}

/**
 * Which frame a scroll progress in [0, 1] lands on, for `count` frames. The one
 * piece of arithmetic in here, kept pure so a test can pin the boundaries: the
 * last frame owns progress 1.0 rather than falling off the end.
 */
export function frameIndex(progress: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(count - 1, Math.floor(p * count));
}

/*
 * A scroll-driven gallery, the way Apple's product pages do it.
 *
 * The section is a tall TRACK with a viewport-high STAGE stuck to the top of it.
 * Scrolling into the track pins the stage; scrolling on advances the frame; past
 * the last frame the track ends and the page resumes. Nothing intercepts the
 * wheel: the frame is a pure function of how far through the track the stage
 * has travelled, which is why this behaves identically with a trackpad, a mouse
 * wheel, the keyboard, and VoiceOver's scrolling.
 *
 * Two audiences do not get the pinned version. A phone has no room for a caption
 * column beside a screenshot, and a scroll-driven stage on a short viewport is
 * mostly a way to hide the captions; and a reader who has asked for reduced
 * motion has asked for exactly this not to happen. Both get the same frames as a
 * plain stack, captions under each.
 */
export function ScrollGallery({
  shots,
  eyebrow,
  title,
  id,
}: {
  shots: GalleryShot[];
  eyebrow: string;
  title: string;
  /** The anchor the product bar links to. */
  id?: string;
}) {
  const reduced = useReducedMotion();
  const narrow = useMediaQuery('(max-width: 48em)');
  const pinned = !reduced && !narrow;

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!pinned) {
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
      // between the two boxes rather than against the viewport, so the navbar
      // the stage sticks under never enters the arithmetic.
      const travel = t.height - s.height;
      if (travel <= 0) {
        return;
      }
      setActive(frameIndex((s.top - t.top) / travel, shots.length));
    };
    // Measured ON the scroll event, not one animation frame later. Two rect
    // reads are cheap after a scroll (layout is already settled), the state
    // setter is a no-op when the frame has not changed, and deferring to
    // requestAnimationFrame bought one frame of latency plus a dependency on
    // frames actually being delivered -- which a headless WebKit view does not
    // guarantee, so the site's own snapshot tool could never see a frame change.
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [pinned, shots.length]);

  // The dots still work as buttons: a click scrolls the page to the middle of
  // that frame's stretch of track, so the same gesture that used to switch the
  // old carousel now moves the reader to where that frame lives.
  const jumpTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) {
        return;
      }
      const t = track.getBoundingClientRect();
      const travel = t.height - stage.getBoundingClientRect().height;
      const top = window.scrollY + t.top + (travel * (index + 0.5)) / shots.length;
      window.scrollTo({ top, behavior: 'smooth' });
    },
    [shots.length]
  );

  const header = (
    <Stack align="center" gap="xs" mb={pinned ? 8 : 32}>
      <Text
        size="sm"
        fw={700}
        tt="uppercase"
        style={{ letterSpacing: 3, color: 'var(--lan-accent)' }}
      >
        {eyebrow}
      </Text>
      <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900}>
        {title}
      </Title>
    </Stack>
  );

  if (!pinned) {
    return (
      <Box component="section" id={id} py={64} aria-label={title}>
        <Container size="lg">
          {header}
          <Stack gap={56}>
            {shots.map((shot, i) => (
              <Stack key={shot.src} gap="md">
                <Image src={shot.src} alt={shot.alt} className={classes.stackedImage} />
                <Stack gap={4}>
                  <Text fw={700} fz={18}>
                    <span className={classes.step}>{i + 1}</span> {shot.title}
                  </Text>
                  <Text c="dimmed" lh={1.6}>
                    {shot.caption}
                  </Text>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box component="section" id={id} aria-label={title} pt={64}>
      <Container size="lg">{header}</Container>
      <div
        ref={trackRef}
        className={classes.track}
        style={{ '--frames': shots.length } as React.CSSProperties}
        data-active={active}
      >
        <div ref={stageRef} className={classes.stage}>
          <Container size="lg" w="100%">
            <div className={classes.grid}>
              <div className={classes.captions}>
                {shots.map((shot, i) => (
                  <div
                    key={shot.src}
                    className={classes.caption}
                    data-active={i === active}
                    aria-hidden={i !== active}
                  >
                    <Text size="sm" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 2 }}>
                      {i + 1} of {shots.length}
                    </Text>
                    <Text fw={800} fz={{ base: 24, md: 30 }} lh={1.15} mt={6}>
                      {shot.title}
                    </Text>
                    <Text c="dimmed" fz="lg" lh={1.6} mt={12}>
                      {shot.caption}
                    </Text>
                  </div>
                ))}
                <div className={classes.dots} role="tablist" aria-label="Screenshots">
                  {shots.map((shot, i) => (
                    <UnstyledButton
                      key={shot.src}
                      role="tab"
                      aria-selected={i === active}
                      aria-label={`Show screenshot ${i + 1} of ${shots.length}: ${shot.title}`}
                      className={classes.dot}
                      data-active={i === active}
                      onClick={() => jumpTo(i)}
                    />
                  ))}
                </div>
              </div>

              <div className={classes.frames}>
                {shots.map((shot, i) => (
                  <div
                    key={shot.src}
                    className={classes.frame}
                    data-active={i === active}
                    aria-hidden={i !== active}
                  >
                    <Image src={shot.src} alt={shot.alt} className={classes.frameImage} />
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </div>
      </div>
    </Box>
  );
}
