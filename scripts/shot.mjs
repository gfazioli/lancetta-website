#!/usr/bin/env node
/**
 * Screenshots of a URL through Chrome's DevTools protocol. No dependencies:
 * Node 22+ ships a WebSocket client.
 *
 *   node scripts/shot.mjs <url> <out-prefix> [--width 1440] [--height 900]
 *                                            [--at 0,0.25,0.6] [--find "text"]
 *
 * With no `--at` it writes ONE full-page `<prefix>.png`. With `--at` it writes
 * one VIEWPORT capture per fraction of the scrollable height:
 * `<prefix>-at-<fraction>.png`.
 *
 * The `--at` mode is why this exists rather than the sibling site's copy. The
 * home page's hero is a pinned, scroll-driven stage: a full-page capture of it
 * is one tall band containing the LAST frame and nothing else — the four
 * frames are states of the same 100vh box, not four boxes. A capture that can
 * only ever show the end of an animation is a check that measured one frame.
 *
 * Cross-ported from `findergit-website/scripts/shot.mjs`, and the three
 * reasons that file gives for not using `chrome --headless --screenshot` all
 * still hold here:
 *
 * - It captures the WINDOW, not the page. You guess a height, and a page
 *   taller than the guess is silently cut; `sips` then crops from the CENTRE
 *   when its offset is 0, which hands you the same middle band twice. Here the
 *   full-page clip is the document's own height from Page.getLayoutMetrics.
 * - It cannot choose the colour scheme. This site is light-only now, so the
 *   storage key is written to `light` defensively rather than looped over: a
 *   visitor arriving with `dark` left in storage from the old switch is
 *   exactly the state worth being able to photograph.
 * - The Scene backgrounds are `lazy` and paint on intersection. A capture
 *   straight after load shows blank bands; this scrolls the page once so every
 *   observer fires, then goes where it was asked to.
 *
 * Chrome runs with a throwaway profile under /tmp: it never touches the user's
 * own session or storage.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MANTINE_KEY = 'mantine-color-scheme-value';

const [url, prefix, ...rest] = process.argv.slice(2);

function flag(name) {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : undefined;
}

if (!url || !prefix) {
  console.error(
    'usage: node scripts/shot.mjs <url> <out-prefix> [--width 1440] [--height 900] [--at 0,0.5] [--find "text"]'
  );
  process.exit(2);
}

const width = Number(flag('--width') ?? 1440);
const height = Number(flag('--height') ?? 900);
const find = flag('--find');
const at = flag('--at')
  ?.split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value));

const profile = mkdtempSync(join(tmpdir(), 'shot-profile-'));
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    `--user-data-dir=${profile}`,
    '--remote-debugging-port=0',
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);

// Chrome prints the endpoint it picked to stderr; port 0 avoids colliding with
// anything else listening.
const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  chrome.stderr.on('data', (chunk) => {
    buf += chunk;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) {
      resolve(m[1]);
    }
  });
  chrome.on('exit', (code) => reject(new Error(`Chrome exited early (${code})`)));
  setTimeout(() => reject(new Error('Chrome did not announce DevTools within 15s')), 15000);
});

const ws = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = () => reject(new Error(`cannot connect to ${wsUrl}`));
});

let nextId = 1;
const pending = new Map();
const listeners = new Set();
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) {
      reject(new Error(`${msg.error.message} (${msg.error.code})`));
    } else {
      resolve(msg.result);
    }
  } else if (msg.method) {
    for (const fn of listeners) {
      fn(msg);
    }
  }
};

function send(method, params = {}, sessionId) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params, sessionId }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function waitFor(method, sessionId) {
  return new Promise((resolve) => {
    const fn = (msg) => {
      if (msg.method === method && msg.sessionId === sessionId) {
        listeners.delete(fn);
        resolve(msg.params);
      }
    };
    listeners.add(fn);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: 1, mobile: width < 600 },
    sessionId
  );
  await send(
    'Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-color-scheme', value: 'light' }] },
    sessionId
  );

  const origin = new URL(url).origin;
  const probed = waitFor('Page.loadEventFired', sessionId);
  await send('Page.navigate', { url: `${origin}/__shot_probe__` }, sessionId);
  await probed;
  await send(
    'Runtime.evaluate',
    { expression: `localStorage.setItem(${JSON.stringify(MANTINE_KEY)}, "light")` },
    sessionId
  );

  const loaded = waitFor('Page.loadEventFired', sessionId);
  await send('Page.navigate', { url }, sessionId);
  await loaded;
  await sleep(900);

  // Wake every lazy observer, then come back to the top.
  const woken = await send(
    'Runtime.evaluate',
    {
      expression: `(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 700) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 50)); }
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise(r => setTimeout(r, 500));
        return h;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    },
    sessionId
  );

  async function capture(file, clip) {
    const { data } = await send(
      'Page.captureScreenshot',
      { format: 'png', captureBeyondViewport: Boolean(clip), ...(clip ? { clip } : {}) },
      sessionId
    );
    writeFileSync(file, Buffer.from(data, 'base64'));
    return file;
  }

  const scheme = await send(
    'Runtime.evaluate',
    {
      expression: `document.documentElement.getAttribute('data-mantine-color-scheme')`,
      returnByValue: true,
    },
    sessionId
  );

  if (at?.length) {
    for (const fraction of at) {
      // Told where to go as a FRACTION of the scrollable range, and it reports
      // the pixel it landed on: a stage that pins for four viewports makes
      // "25%" meaningless without the number beside it.
      const where = await send(
        'Runtime.evaluate',
        {
          expression: `(async () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const y = Math.round(max * ${fraction});
            // 'instant', because this site sets html { scroll-behavior: smooth }
            // and a smooth scroll is an ANIMATION: the capture then lands
            // wherever it had got to after the wait, which depends on where it
            // started. Two visits to the same fraction came out 78px apart and
            // looked like the page had changed under the reader.
            window.scrollTo({ top: y, behavior: 'instant' });
            await new Promise(r => setTimeout(r, 900));
            return [window.scrollY, max];
          })()`,
          awaitPromise: true,
          returnByValue: true,
        },
        sessionId
      );
      const [y, max] = where.result.value;
      const file = await capture(`${prefix}-at-${fraction}.png`);
      console.log(`${file}  ${width}x${height}  y=${y}/${max}`);
    }
  } else {
    const { contentSize } = await send('Page.getLayoutMetrics', {}, sessionId);
    const full = Math.ceil(contentSize.height);
    const file = await capture(`${prefix}.png`, { x: 0, y: 0, width, height: full, scale: 1 });
    console.log(`${file}  ${width}x${full}`);
  }

  console.log(`  scheme=${scheme.result.value}  document height=${woken.result.value}`);

  // `--find "<text>"`: the document y of the first element whose OWN text
  // contains it, so a band of a capture can be cut where a section actually is
  // instead of where it is guessed to be.
  if (find) {
    const pos = await send(
      'Runtime.evaluate',
      {
        expression: `(() => {
          const needle = ${JSON.stringify(find)};
          for (const el of document.querySelectorAll('h1,h2,h3,p,span,div')) {
            if (el.children.length === 0 && el.textContent.includes(needle)) {
              return Math.round(el.getBoundingClientRect().top + window.scrollY);
            }
          }
          return -1;
        })()`,
        returnByValue: true,
      },
      sessionId
    );
    console.log(`  "${find}" at y=${pos.result.value}`);
  }
} finally {
  ws.close();
  // Wait for Chrome to be gone before removing its profile: killing it and
  // deleting the directory in the same tick raced its shutdown and failed with
  // ENOTEMPTY after every capture had already been written.
  const gone = new Promise((r) => chrome.once('exit', r));
  chrome.kill();
  await gone;
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
