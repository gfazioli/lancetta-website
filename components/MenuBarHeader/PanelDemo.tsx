'use client';

import { Fragment, useEffect, useRef, useState, type CSSProperties, type Ref } from 'react';
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
  IconRotate,
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
  type PaneTile,
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

/** A card of the deck: an agent's, or a pane's. */
type Tile = { kind: 'agent'; agent: PanelAgent } | { kind: 'pane'; pane: PaneTile };

const tileKey = (tile: Tile) => (tile.kind === 'agent' ? tile.agent.agent : tile.pane.pane);

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
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  // The accordion's open suggestion (`GuidanceList.expanded`): the first one.
  const [suggestion, setSuggestion] = useState(state.suggestions[0]?.id);
  // The deck's open card (`PanelDeck.openRaw`): closed until one is chosen.
  const [opened, setOpened] = useState<string | null>(null);
  const pending = useRef<number | undefined>(undefined);

  // `TimelineView(.periodic(from: .now, by: 1))` in the app.
  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(pending.current);
    };
  }, []);

  const stamp = refreshLabel(base.age + (now - base.at) / 1000, refreshing);

  const refresh = () => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    pressCards(document.getElementById(id));
    pending.current = window.setTimeout(() => {
      const at = Date.now();
      setBase({ at, age: 0 });
      setNow(at);
      setRefreshing(false);
    }, REFRESH_MS);
  };

  const suggestions = state.suggestions.slice(0, 3);
  const tiles: Tile[] = [
    ...state.agents.map((agent) => ({ kind: 'agent' as const, agent })),
    ...state.panes.map((pane) => ({ kind: 'pane' as const, pane })),
  ];
  // Two columns, as `PanelDeck` lays them: a card's details open under its row.
  const rows: Tile[][] = [];
  for (let i = 0; i < tiles.length; i += 2) {
    rows.push(tiles.slice(i, i + 2));
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
        <button
          type="button"
          className={classes.stamp}
          data-stale={stamp.stale}
          onClick={refresh}
          title="Refresh now  ⌘R"
        >
          <span className={classes.stampIcon} aria-hidden>
            {refreshing ? (
              <IconLoader2 size={11} className={classes.spin} />
            ) : (
              <ResetMark size={10} />
            )}
          </span>
          {stamp.text}
        </button>
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
          const open = row.find((tile) => tileKey(tile) === opened);
          return (
            <Fragment key={r}>
              {row.map((tile, c) => (
                <DeckCard
                  key={tileKey(tile)}
                  tile={tile}
                  place={2 + r * 2 + c}
                  open={open === tile}
                  side={c === 0 ? 'left' : 'right'}
                  onToggle={() => setOpened(opened === tileKey(tile) ? null : tileKey(tile))}
                  onClose={onClose}
                />
              ))}
              {open && <DeckDetail tile={open} side={row[0] === open ? 'left' : 'right'} />}
            </Fragment>
          );
        })}
      </div>

      <div className={classes.commands} style={{ '--place': 2 + tiles.length } as CSSProperties}>
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
      data-expanded={expanded}
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
        {collapsible &&
          (expanded ? (
            <IconChevronUp size={11} stroke={2.4} className={classes.chevron} aria-hidden />
          ) : (
            <IconChevronDown size={11} stroke={2.4} className={classes.chevron} aria-hidden />
          ))}
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
  tile,
  place,
  open,
  side,
  onToggle,
  onClose,
}: {
  tile: Tile;
  place: number;
  open: boolean;
  side: 'left' | 'right';
  onToggle: () => void;
  onClose: () => void;
}) {
  const face =
    tile.kind === 'agent'
      ? {
          name: tile.agent.name,
          tint: agentTint[tile.agent.agent],
          href: '/docs/the-window',
          ...agentHeadline(tile.agent),
        }
      : {
          name: tile.pane.title,
          tint: tile.pane.tint,
          href: tile.pane.href,
          value: tile.pane.value,
          footnote: tile.pane.footnote,
        };
  return (
    <div
      className={classes.tile}
      data-panel-card
      data-open={open}
      data-side={side}
      style={{ '--tint': face.tint, '--place': place } as CSSProperties}
    >
      <button
        type="button"
        className={classes.tileFace}
        aria-expanded={open}
        aria-label={`${face.name}: ${face.value}, ${face.footnote}`}
        onClick={onToggle}
      >
        <span className={classes.tileHead}>
          <span className={classes.tileGlyph} aria-hidden>
            <TileGlyph tile={tile} />
          </span>
          <span className={classes.tileName}>{face.name}</span>
          <span className={classes.spacer} />
          <span className={classes.tileArrowRoom} />
          {open ? (
            <IconChevronUp size={11} stroke={2.4} className={classes.chevron} aria-hidden />
          ) : (
            <IconChevronDown size={11} stroke={2.4} className={classes.chevron} aria-hidden />
          )}
        </span>
        <span className={classes.tileValue}>
          <ScrollNumber value={face.value} on="mount" />
        </span>
        <span className={classes.tileFootnote}>{face.footnote}</span>
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

function TileGlyph({ tile }: { tile: Tile }) {
  if (tile.kind === 'agent') {
    const Mark = tile.agent.agent === 'codex' ? CodexMark : ClaudeMark;
    return <Mark size={15} />;
  }
  return tile.pane.pane === 'usage' ? (
    <IconChartBar size={14} stroke={2.4} />
  ) : (
    <IconTools size={14} stroke={2.4} />
  );
}

/** An open card's details, under its row and joined to it (`CardDeck`'s detail). */
function DeckDetail({ tile, side }: { tile: Tile; side: 'left' | 'right' }) {
  const tint = tile.kind === 'agent' ? agentTint[tile.agent.agent] : tile.pane.tint;
  return (
    <div className={classes.detail} data-side={side} style={{ '--tint': tint } as CSSProperties}>
      {tile.kind === 'agent' ? (
        <AgentDetail agent={tile.agent} />
      ) : (
        tile.pane.detail.map((line) => (
          <p key={line} className={classes.detailLine}>
            {line}
          </p>
        ))
      )}
    </div>
  );
}

/** `ReadingCard`'s body: the plan, one row per window, then a free reset. */
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

      {agent.exhausted && (
        <div className={classes.exhausted}>
          <IconAlertOctagonFilled size={12} aria-hidden />
          {agent.exhausted}
        </div>
      )}

      {agent.credit && (
        <div className={classes.credit} title={agent.credit.detail}>
          <span className={classes.creditIcon} aria-hidden>
            <IconRotate size={8} stroke={3} />
          </span>
          <span className={classes.creditLabel}>{agent.credit.label}</span>
        </div>
      )}
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
