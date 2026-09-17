#!/bin/bash
# See this site, rather than grep it.
#
# Grepping the served HTML proves the markup and is structurally blind to
# opacity, z-index, transforms and font size — which is how a hero headline once
# shipped invisible on the sibling site with `curl` reporting it present. So a
# layout claim about this site is a picture, and this is what takes it.
#
# It is committed rather than recreated per session on purpose. The workspace has
# already paid twice for a technique stored as "recreate it, ~15 lines": the next
# session did not recreate it, it wrote something more dangerous instead. What is
# actually worth keeping is not the fifty lines of WebKit, it is the four traps
# below, each of which cost a wrong conclusion:
#
#   1. A `next start` OUTLIVES its build. One left from an earlier build keeps the
#      port, the new one fails to bind, and `curl` answers 200 from the stale
#      server — a string removed from the page is still on it. `serve` kills the
#      port first and prints the pid that ends up serving.
#   2. A persistent WKWebView data store outlives the build too, one layer down: a
#      run against a rebuilt site read a JS chunk from cache and reported the OLD
#      navbar logo while `curl` on the same server showed the new one. Both tools
#      use `.nonPersistent()`.
#   3. `takeSnapshot` on a detached web view answers `WKErrorDomain Code=1 "An
#      unknown error occurred"`, which reads like a page fault and is a view
#      hierarchy one. The view lives in a real (offscreen, non-activating) window.
#   4. `mantine-text-animate` NEVER advances here. Its characters are revealed on
#      an in-view trigger that does not fire, so the hero's gradient line
#      photographs blank — or, worse, partially: on 2026-09-17 it came out as
#      `osts nothing.`, one missing letter, which reads exactly like a truncation
#      bug. It is the instrument. `eval` the h1's textContent before believing any
#      picture of that headline; see CLAUDE.md.
#
#   scripts/page.sh serve [port]        build nothing, just serve .next on a port
#   scripts/page.sh shot  <path> <out.png> [w] [h] [scrollY] [light]
#   scripts/page.sh eval  <path> <js>   run JS in the page and print the result
#   scripts/page.sh stop  [port]
#
# `<path>` is a site path (`/`, `/docs/the-window`), not a URL.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT_DEFAULT=3111

build_tool() {
    local name="$1"
    local src="$ROOT/scripts/$name.swift" bin="$ROOT/scripts/.bin/$name"
    mkdir -p "$ROOT/scripts/.bin"
    if [ ! -x "$bin" ] || [ "$src" -nt "$bin" ]; then swiftc -O -o "$bin" "$src"; fi
    echo "$bin"
}

serving_pid() { lsof -ti "tcp:${1:-$PORT_DEFAULT}" || true; }

serve() {
    local port="${1:-$PORT_DEFAULT}"
    local old; old=$(serving_pid "$port")
    [ -n "$old" ] && { echo "  killing $old, which already held :$port"; kill $old; sleep 1; }
    ( cd "$ROOT" && nohup ./node_modules/.bin/next start -p "$port" >/tmp/lancetta-page-$port.log 2>&1 & )
    local n=0 pid=""
    while [ -z "$pid" ] && [ "$n" -lt 30 ]; do sleep 0.5; pid=$(serving_pid "$port"); n=$((n + 1)); done
    [ -n "$pid" ] || { echo "nothing came up on :$port — see /tmp/lancetta-page-$port.log"; exit 1; }
    # Which process answers is the assertion, not that something did.
    echo "  pid $pid serves :$port — HTTP $(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$port/")"
}

case "${1:-}" in
    serve) serve "${2:-}" ;;
    stop)
        p=$(serving_pid "${2:-}")
        [ -n "$p" ] && { kill $p; echo "  stopped $p"; } || echo "  nothing on that port"
        ;;
    shot)
        path="${2:?usage: page.sh shot <path> <out.png> [w] [h] [scrollY] [light]}"
        out="${3:?}"
        [ -n "$(serving_pid)" ] || serve
        "$(build_tool pageshot)" "http://localhost:$PORT_DEFAULT$path" "$out" \
            "${4:-1440}" "${5:-1000}" "${6:-0}" "${7:-dark}"
        ;;
    eval)
        path="${2:?usage: page.sh eval <path> <js>}"
        js="${3:?}"
        [ -n "$(serving_pid)" ] || serve
        "$(build_tool pageeval)" "http://localhost:$PORT_DEFAULT$path" "$js"
        ;;
    *) sed -n '2,40p' "$0"; exit 2 ;;
esac
