'use client';

import { useEffect, useRef, useState, type CSSProperties, type Ref } from 'react';
import Link from 'next/link';
import {
  IconAlertOctagonFilled,
  IconLayoutGrid,
  IconLoader2,
  IconPin,
  IconPinFilled,
  IconPower,
  IconRotate,
  IconSettings,
} from '@tabler/icons-react';
import { ClaudeMark, CodexMark, ResetMark } from './AgentMark';
import {
  agentTint,
  refreshLabel,
  type PanelAgent,
  type PanelRow,
  type PanelState,
} from './panel-demo';
import classes from './PanelDemo.module.css';

/** Long enough to read "Refreshing…", short enough not to feel like a network. */
const REFRESH_MS = 900;

interface PanelDemoProps {
  id: string;
  state: PanelState;
  pinned: boolean;
  onPin: (pinned: boolean) => void;
  onClose: () => void;
  panelRef?: Ref<HTMLDivElement>;
}

/**
 * The app's status panel, drawn in the page. See `panel-demo.ts` for where each
 * part comes from and why the numbers are the hero's.
 *
 * What it does is what the app does, where the page can do it: the stamp ticks
 * every second and turns amber when the numbers go stale, clicking it refreshes
 * WITHOUT closing the panel, and the pin keeps it open when you click elsewhere
 * (Escape still closes it, as in the app). What the page cannot do — open
 * Settings, open the window, spend a reset — goes to the page that explains it.
 */
export function PanelDemo({ id, state, pinned, onPin, onClose, panelRef }: PanelDemoProps) {
  const [base, setBase] = useState(() => ({ at: Date.now(), age: state.updatedAgo }));
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
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
    pending.current = window.setTimeout(() => {
      const at = Date.now();
      setBase({ at, age: 0 });
      setNow(at);
      setRefreshing(false);
    }, REFRESH_MS);
  };

  return (
    <div
      id={id}
      ref={panelRef}
      role="dialog"
      aria-label="Lancetta’s panel, with invented numbers"
      tabIndex={-1}
      className={classes.panel}
    >
      <div className={classes.toolbar}>
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

      {state.agents.map((agent) => (
        <AgentCard key={agent.agent} agent={agent} onClose={onClose} />
      ))}

      <div className={classes.commands}>
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

/** `ReadingCard`: the mark, the plan, one row per window, then what refused and what can undo it. */
function AgentCard({ agent, onClose }: { agent: PanelAgent; onClose: () => void }) {
  const Mark = agent.agent === 'codex' ? CodexMark : ClaudeMark;
  return (
    <div className={classes.card} style={{ '--tint': agentTint[agent.agent] } as CSSProperties}>
      <div className={classes.cardHead}>
        <span className={classes.glyph} aria-hidden>
          <Mark size={17} />
        </span>
        <span className={classes.name}>{agent.name}</span>
        {agent.plan && <span className={classes.chip}>{agent.plan}</span>}
      </div>

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
          {agent.credit.resettable && (
            <Link
              href="/docs/the-menu#a-free-reset"
              className={classes.use}
              title="Asks first, and says what it would spend"
              onClick={onClose}
            >
              Use…
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/** `MeterRow` and its `PaceCaption`: number, window, glass bar, reset. */
function Meter({ row }: { row: PanelRow }) {
  const fill = row.percent === null ? null : Math.min(100, Math.max(0, row.percent));
  return (
    <>
      <span className={classes.percent}>{row.percent === null ? '—' : `${row.percent}%`}</span>
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
        {row.reset}
      </span>
      {row.pace && (
        <span className={classes.pace} data-urgent={row.pace.urgent ?? false}>
          {row.pace.text}
        </span>
      )}
    </>
  );
}
