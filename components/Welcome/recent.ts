/**
 * Whether something introduced in `since` still deserves a "new" marker when
 * the app is at `current`.
 *
 * Ported from findergit-website, where it takes the NEW badges off its feature
 * cards: a hardcoded sticker never comes off, and one that never comes off
 * stops meaning anything. Here it decays the Discord call to action's "Just
 * opened" (`config.community.discordSince`). The marker shows only while the
 * running version is within `window` minor releases of `since`, and
 * `config.app.version` is written by the app's release.sh on every release,
 * which is what makes it decay on its own.
 *
 * A different major is never "recent" (0.17 to 1.0 makes the minor distance
 * meaningless), and a `since` ahead of `current` is not either, a later patch
 * of the same minor included (0.3.1 against 0.3.0).
 */
export function isRecent(since: string, current: string, window = 2): boolean {
  const a = parse(since);
  const b = parse(current);
  if (!a || !b) return false;
  if (a.major !== b.major) return false;
  const distance = b.minor - a.minor;
  if (distance === 0) return a.patch <= b.patch;
  return distance > 0 && distance <= window;
}

function parse(version: string): { major: number; minor: number; patch: number } | null {
  const m = /^(\d+)\.(\d+)(?:\.(\d+))?$/.exec(version.trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3] ?? 0) };
}
