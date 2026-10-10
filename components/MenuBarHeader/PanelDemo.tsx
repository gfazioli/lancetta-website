'use client';

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import Link from 'next/link';
import {
  IconAlertOctagonFilled,
  IconArrowUpRight,
  IconBoltFilled,
  IconChartBar,
  IconChevronDown,
  IconChevronUp,
  IconLayoutGrid,
  IconLoader2,
  IconPin,
  IconPinFilled,
  IconPower,
  IconSettings,
  IconTools,
} from '@tabler/icons-react';
import { ScrollNumber } from '../Motion/ScrollNumber';
import { springFor } from '../Motion/springs';
import { ClaudeMark, CodexMark, ResetMark } from './AgentMark';
import {
  agentHeadline,
  agentTint,
  refreshLabel,
  toneColor,
  type PanelAgent,
  type PanelRow,
  type PanelState,
  type Suggestion,
} from './panel-demo';
import classes from './PanelDemo.module.css';

/** Long enough to read "Refreshing…", short enough not to feel like a network. */
const REFRESH_MS = 900;

/** The spring a pressed card lands back on: the entrance's, `--lan-panel-land`. */
const LAND = springFor('--lan-panel-land');

/**
 * A refresh PRESSES the cards, as `CardEntrance.press` does in the app: a quick
 * dip, the landing spring back, and the light round the rim again -- the
 * figures stay where they are, because in the app 0% is a reading and a card
 * rolling back through zero would show an account as spent. At the app's pace:
 * 77 ms down (`pressHold`), 35 ms between cards (`pressing`).
 *
 * Web Animations rather than CSS, because a CSS animation cannot be started
 * again without starting the entrance again. An engine that cannot run a
 * `linear()` easing throws, and that card does not press; one that cannot
 * animate a registered property presses without the light.
 */
function pressCards(panel: HTMLElement | null) {
  if (!panel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  panel.querySelectorAll<HTMLElement>('[data-panel-card]').forEach((card, i) => {
    const back = LAND.ms;
    const down = 77;
    const delay = 35 * (i + 1);
    try {
      card.animate(
        [
          { transform: 'none', easing: 'ease-out' },
          { transform: 'scale(0.98, 0.95)', offset: down / (down + back), easing: LAND.easing },
          { transform: 'none' },
        ],
        { duration: down + back, delay }
      );
      card.animate({ '--glint': [0, 1] } as PropertyIndexedKeyframes, {
        duration: 630,
        easing: 'ease-out',
        delay: delay + down,
        pseudoElement: '::after',
      });
    } catch {
      // No press on this engine; the refresh itself still happens.
    }
  });
}

interface PanelDemoProps {
  id: string;
  state: PanelState;
  pinned: boolean;
  onPin: (pinned: boolean) => void;
  onClose: () => void;
  panelRef?: Ref<HTMLDivElement>;
}

/** A card of the deck, an agent's or a pane's, in the one shape the deck draws (`DeckTile`). */
interface Face {
  key: string;
  name: string;
  tint: string;
  href: string;
  value: string;
  /** The line under the figure; `reset`, when there is one, follows it behind the reset mark. */
  footnote: string;
  reset?: string;
  glyph: ReactNode;
  /** What the card opens on: an agent's windows, or a pane's few lines. */
  agent?: PanelAgent;
  detail?: string[];
}

/** Agents first, then the panes, as `PanelDeck.tiles` orders them. */
function deckFaces(state: PanelState): Face[] {
  return [
    ...state.agents.map((agent) => {
      const Mark = agent.agent === 'codex' ? CodexMark : ClaudeMark;
      const headline = agentHeadline(agent);
      return {
        key: agent.agent,
        name: agent.name,
        tint: agentTint[agent.agent],
        href: '/docs/the-window',
        value: headline.value,
        footnote: headline.window,
        reset: headline.reset,
        glyph: <Mark size={15} />,
        agent,
      };
    }),
    ...state.panes.map((pane) => ({
      key: pane.pane,
      name: pane.title,
      tint: pane.tint,
      href: pane.href,
      value: pane.value,
      footnote: pane.footnote,
      glyph:
        pane.pane === 'usage' ? (
          <IconChartBar size={14} stroke={2.4} />
        ) : (
          <IconTools size={14} stroke={2.4} />
        ),
      detail: pane.detail,
    })),
  ];
}

/**
 * The app's status panel, drawn in the page. See `panel-demo.ts` for where each
 * part comes from and why the numbers are the hero's.
 *
 * What it does is what the app does, where the page can do it: the suggestions
 * open one at a time, a card of the deck opens its details in place, the stamp
 * ticks every second and turns amber when the numbers go stale, clicking it
 * refreshes WITHOUT closing the panel, and the pin keeps it open when you click
 * elsewhere (Escape still closes it, as in the app). What the page cannot do —
 * open Settings, open the window, open Maintenance — goes to the page that
 * explains it.
 */
export function PanelDemo({ id, state, pinned, onPin, onClose, panelRef }: PanelDemoProps) {
  const [base, setBase] = useState(() => ({ at: Date.now(), age: state.updatedAgo }));
  const [refreshing, setRefreshing] = useState(false);
  // The accordion's open suggestion (`GuidanceList.expanded`): the first one.
  const [suggestion, setSuggestion] = useState(state.suggestions[0]?.id);
  // The deck's open card (`PanelDeck.openRaw`): closed until one is chosen.
  const [opened, setOpened] = useState<string | null>(null);
  const pending = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(pending.current), []);

  const refresh = () => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    pressCards(document.getElementById(id));
    pending.current = window.setTimeout(() => {
      setBase({ at: Date.now(), age: 0 });
      setRefreshing(false);
    }, REFRESH_MS);
  };

  const suggestions = state.suggestions.slice(0, 3);
  // The panel's content is a constant: built once, not at every render.
  const faces = useMemo(() => deckFaces(state), [state]);
  // Two columns, as `PanelDeck` lays them: a card's details open under its row.
  const rows: Face[][] = [];
  for (let i = 0; i < faces.length; i += 2) {
    rows.push(faces.slice(i, i + 2));
  }

  return (
    <div
      id={id}
      ref={panelRef}
      role="dialog"
      aria-label="Lancetta’s panel, with invented numbers"
      tabIndex={-1}
      className={classes.panel}
    >
      {/* `--place` is where each piece starts in the entrance: the header, the
          suggestions, each card in turn, then the commands, as `MenuPanelView`
          orders them. */}
      <div className={classes.toolbar} style={{ '--place': 0 } as CSSProperties}>
        <RefreshStamp base={base} refreshing={refreshing} onRefresh={refresh} />
        <span className={classes.spacer} />
        <Link
          href="/docs/settings"
          className={classes.headerIcon}
          title="Settings…  ⌘,"
          aria-label="Settings"
          onClick={onClose}
        >
          <IconSettings size={13} stroke={1.8} />
        </Link>
        <button
          type="button"
          className={classes.headerIcon}
          data-on={pinned}
          aria-pressed={pinned}
          aria-label={pinned ? 'Unpin the panel' : 'Pin the panel'}
          title={
            pinned
              ? 'Unpin — the panel closes when you click elsewhere'
              : 'Pin — keep the panel open and in front'
          }
          onClick={() => onPin(!pinned)}
        >
          {pinned ? <IconPinFilled size={13} /> : <IconPin size={13} stroke={1.8} />}
        </button>
      </div>

      <div className={classes.suggestions} style={{ '--place': 1 } as CSSProperties}>
        {suggestions.map((item) => (
          <SuggestionCard
            key={item.id}
            item={item}
            expanded={suggestion === item.id}
            collapsible={suggestions.length > 1}
            onExpand={() => setSuggestion(item.id)}
            onClose={onClose}
          />
        ))}
      </div>

      <div className={classes.deck}>
        {rows.map((row, r) => {
          const openAt = row.findIndex((face) => face.key === opened);
          return (
            <Fragment key={r}>
              {row.map((face, c) => (
                <DeckCard
                  key={face.key}
                  face={face}
                  place={2 + r * 2 + c}
                  open={c === openAt}
                  onToggle={() => setOpened(opened === face.key ? null : face.key)}
                  onClose={onClose}
                />
              ))}
              {openAt >= 0 && (
                <DeckDetail face={row[openAt]} side={openAt === 0 ? 'left' : 'right'} />
              )}
            </Fragment>
          );
        })}
      </div>

      <div className={classes.commands} style={{ '--place': 2 + faces.length } as CSSProperties}>
        <Link href="/docs/the-window" className={classes.command} onClick={onClose}>
          <IconLayoutGrid size={12} stroke={1.8} className={classes.commandIcon} />
          <span className={classes.commandTitle}>Open Lancetta…</span>
          <span className={classes.commandKey}>⌘O</span>
        </Link>
        <button
          type="button"
          className={classes.iconCommand}
          title="Quit Lancetta  ⌘Q"
          aria-label="Close the panel"
          onClick={onClose}
        >
          <IconPower size={13} stroke={1.8} />
        </button>
      </div>
    </div>
  );
}

/**
 * `RefreshStamp`: the age of the numbers, and Refresh now when clicked. Its
 * own component because it is the one thing that ticks, once a second
 * (`TimelineView(.periodic(from: .now, by: 1))` in the app): the rest of the
 * panel does not re-render with it.
 */
function RefreshStamp({
  base,
  refreshing,
  onRefresh,
}: {
  base: { at: number; age: number };
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);
  const stamp = refreshLabel(base.age + (Math.max(now, base.at) - base.at) / 1000, refreshing);
  return (
    <button
      type="button"
      className={classes.stamp}
      data-stale={stamp.stale}
      onClick={onRefresh}
      title="Refresh now  ⌘R"
    >
      <span className={classes.stampIcon} aria-hidden>
        {refreshing ? <IconLoader2 size={11} className={classes.spin} /> : <ResetMark size={10} />}
      </span>
      {stamp.text}
    </button>
  );
}

/** The chevron a card or a suggestion shows: up while it is open. */
function Chevron({ open }: { open: boolean }) {
  const Icon = open ? IconChevronUp : IconChevronDown;
  return <Icon size={11} stroke={2.4} className={classes.chevron} aria-hidden />;
}

/** `Guidance.Item.symbol`, in the tabler set. */
function SuggestionGlyph({ item }: { item: Suggestion }) {
  switch (item.kind) {
    case 'stop':
      return <IconAlertOctagonFilled size={13} />;
    case 'room':
      return <IconBoltFilled size={13} />;
    case 'maintenance':
      return <IconTools size={13} stroke={2.2} />;
  }
}

/** `GuidanceCard`: what is happening, what to do, and what it rests on. */
function SuggestionCard({
  item,
  expanded,
  collapsible,
  onExpand,
  onClose,
}: {
  item: Suggestion;
  expanded: boolean;
  collapsible: boolean;
  onExpand: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className={classes.suggestion}
      data-panel-card
      style={{ '--tint': toneColor[item.tone] } as CSSProperties}
    >
      <button
        type="button"
        className={classes.suggestionHead}
        aria-expanded={expanded}
        disabled={!collapsible || expanded}
        onClick={onExpand}
      >
        <span className={classes.suggestionGlyph} aria-hidden>
          <SuggestionGlyph item={item} />
        </span>
        <span className={classes.suggestionTitle}>{item.title}</span>
        {collapsible && <Chevron open={expanded} />}
      </button>
      {expanded && (
        <>
          <ul className={classes.steps}>
            {item.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          <div className={classes.basis}>
            <span>{item.basis}</span>
            {item.action && (
              <Link href={item.action.href} className={classes.action} onClick={onClose}>
                {item.action.label}
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** `DeckTile` at the panel's size: the glyph and the name, the figure, a line under it. */
function DeckCard({
  face,
  place,
  open,
  onToggle,
  onClose,
}: {
  face: Face;
  place: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className={classes.tile}
      data-panel-card
      data-open={open}
      style={{ '--tint': face.tint, '--place': place } as CSSProperties}
    >
      <button
        type="button"
        className={classes.tileFace}
        aria-expanded={open}
        aria-label={`${face.name}: ${face.value}, ${face.footnote}${face.reset ? ` ${face.reset}` : ''}`}
        onClick={onToggle}
      >
        <span className={classes.tileHead}>
          <span className={classes.tileGlyph} aria-hidden>
            {face.glyph}
          </span>
          <span className={classes.tileName}>{face.name}</span>
          <span className={classes.spacer} />
          <span className={classes.tileArrowRoom} />
          <Chevron open={open} />
        </span>
        <span className={classes.tileValue}>
          <ScrollNumber value={face.value} on="mount" />
        </span>
        <span className={classes.tileFootnote}>
          {face.reset ? `${face.footnote} · ` : face.footnote}
          {face.reset && (
            <span className={classes.footReset}>
              <ResetMark size={9} />
              {face.reset}
            </span>
          )}
        </span>
      </button>
      <Link
        href={face.href}
        className={classes.tileGo}
        title={`Open ${face.name}`}
        aria-label={`Open ${face.name}`}
        onClick={onClose}
      >
        <IconArrowUpRight size={10} stroke={2.6} />
      </Link>
    </div>
  );
}

/** An open card's details, under its row and joined to it (`CardDeck`'s detail). */
function DeckDetail({ face, side }: { face: Face; side: 'left' | 'right' }) {
  return (
    <div
      className={classes.detail}
      data-side={side}
      style={{ '--tint': face.tint } as CSSProperties}
    >
      {face.agent ? (
        <AgentDetail agent={face.agent} />
      ) : (
        face.detail?.map((line) => (
          <p key={line} className={classes.detailLine}>
            {line}
          </p>
        ))
      )}
    </div>
  );
}

/** `ReadingCard`'s body: the plan, then one row per window. */
function AgentDetail({ agent }: { agent: PanelAgent }) {
  return (
    <>
      {agent.plan && <span className={classes.chip}>{agent.plan}</span>}

      {/*
        One grid for every row of the card, so the label column is as wide as
        the widest label and every bar starts at the same x — the app measures
        its label column for exactly that (`PanelMetrics.labelColumn`).
      */}
      <div className={classes.meters}>
        {agent.rows.map((row) => (
          <Meter key={row.label} row={row} />
        ))}
      </div>
    </>
  );
}

/** `MeterRow` and its `PaceCaption`: number, window, glass bar, reset. */
function Meter({ row }: { row: PanelRow }) {
  const fill = row.percent === null ? null : Math.min(100, Math.max(0, row.percent));
  return (
    <>
      {/* The figures roll up out of zeros as their card lands (`RollingNumberText`). */}
      <span className={classes.percent}>
        {row.percent === null ? '—' : <ScrollNumber value={`${row.percent}%`} on="mount" />}
      </span>
      <span className={classes.window}>{row.label}</span>
      <span
        className={classes.track}
        data-unknown={fill === null}
        style={{ '--p': fill ?? 0 } as CSSProperties}
      >
        {fill !== null && fill > 0 && <span className={classes.fill} />}
      </span>
      <span className={classes.reset}>
        {row.reset && <ResetMark size={9} />}
        {row.reset && <ScrollNumber value={row.reset} on="mount" />}
      </span>
      {row.pace && (
        <span className={classes.pace} data-urgent={row.pace.urgent ?? false}>
          {row.pace.text}
        </span>
      )}
    </>
  );
}
