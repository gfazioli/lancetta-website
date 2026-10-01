import { MASCOT } from '@/components/MenuBarHeader/panel-hint';

/** Cells across and down: the grid in `panel-hint.ts`. */
export const WIDTH = 17;
export const HEIGHT = 13;

interface MascotProps {
  walking?: boolean;
  pointing?: boolean;
  /** Pixels per cell for the `width`/`height` attributes: 3 under the bar. */
  cell?: number;
  className?: string;
  /** The two leg frames, which the host's stylesheet alternates while it walks. */
  stepA?: string;
  stepB?: string;
}

/**
 * The character, in square cells (see `panel-hint.ts` for the grid and why it
 * is ours). It walks LEFT, so its pupils sit in the left half of each eye, and
 * the arm that points is the left one: a diagonal up from the shoulder, tipped
 * like a clock hand.
 *
 * No stylesheet of its own. It is drawn in two places -- under the bar
 * (`PanelHint`, on every page) and in the corner and on the Support card
 * (`ScrollGuide`, the home page only) -- and each host passes the classes that
 * walk it. netfox.app measured what a module of its own costs here: a CSS
 * module reached from every page split the site's shared stylesheet in two,
 * one more render-blocking request on every page.
 */
export function Mascot({
  walking = false,
  pointing = false,
  cell = 3,
  className,
  stepA,
  stepB,
}: MascotProps) {
  // Looking where it walks; looking up once it points.
  const pupilY = pointing ? 2 : 3;
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH * cell}
      height={HEIGHT * cell}
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
      className={className}
    >
      <g fill={MASCOT.plate}>
        <rect x={4} y={0} width={10} height={11} />
        <rect x={3} y={1} width={12} height={9} />
        <rect x={2} y={6} width={1} height={1} />
        <rect x={15} y={6} width={1} height={1} />
        {/*
          The pointing arm is a STAIRCASE, each step sharing an edge with the
          last: a diagonal of single cells touches only at corners, and at
          three pixels a cell that reads as a row of dots, not as an arm.
        */}
        {pointing && (
          <>
            <rect x={2} y={5} width={1} height={1} />
            <rect x={1} y={4} width={1} height={2} />
            <rect x={0} y={4} width={1} height={1} />
          </>
        )}
        {walking ? (
          <>
            <g className={stepA}>
              <Legs down={[5]} up={[11]} />
            </g>
            <g className={stepB}>
              <Legs down={[11]} up={[5]} />
            </g>
          </>
        ) : (
          <Legs down={[5, 11]} up={[]} />
        )}
      </g>
      {pointing && <rect x={0} y={3} width={1} height={1} fill={MASCOT.violet} />}
      <g fill={MASCOT.eye}>
        <rect x={5} y={2} width={2} height={2} />
        <rect x={11} y={2} width={2} height={2} />
      </g>
      <g fill={MASCOT.ink}>
        <rect x={5} y={pupilY} width={1} height={1} />
        <rect x={11} y={pupilY} width={1} height={1} />
      </g>
      <rect x={5} y={7} width={2} height={3} fill={MASCOT.orange} />
      <rect x={8} y={5} width={2} height={5} fill={MASCOT.teal} />
      <rect x={11} y={6} width={2} height={4} fill={MASCOT.violet} />
    </svg>
  );
}

/** A leg on the ground is two cells tall; a lifted one is one, off the ground. */
function Legs({ down, up }: { down: number[]; up: number[] }) {
  return (
    <>
      {down.map((x) => (
        <rect key={`d${x}`} x={x} y={11} width={2} height={2} />
      ))}
      {up.map((x) => (
        <rect key={`u${x}`} x={x} y={11} width={2} height={1} />
      ))}
    </>
  );
}
