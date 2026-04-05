// Multiple public Overpass API endpoints — rotates on failure
// See: https://wiki.openstreetmap.org/wiki/Overpass_API
// Usage policy: <10,000 queries/day, <1GB/day is considered safe
const OVERPASS_URLS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  // Note: overpass.maprva.org excluded — regional server, returns empty for non-US data
];

const USER_AGENT = "Mapalogue/0.1 (neighborhood-vibe-comparison; https://github.com/jacobmimms/mapalogue)";
const MIN_DELAY_MS = 3000; // minimum 3s between requests to any single server
const COOLDOWN_MS = 30_000; // 30s cooldown for a server that returned an error
const REQUEST_TIMEOUT_MS = 90_000; // 90s max per request

let urlIndex = 0;
let queryCount = 0;

function host(url: string): string {
  return new URL(url).hostname;
}

// Track per-server state so we don't hammer one that just failed
const serverState: Record<
  string,
  { lastRequest: number; cooldownUntil: number; errors: number; successes: number }
> = {};

for (const url of OVERPASS_URLS) {
  serverState[url] = { lastRequest: 0, cooldownUntil: 0, errors: 0, successes: 0 };
}

/** Pick the next server that isn't in cooldown */
function pickAvailableServer(): string {
  const now = Date.now();
  for (let i = 0; i < OVERPASS_URLS.length; i++) {
    const candidate = OVERPASS_URLS[(urlIndex + i) % OVERPASS_URLS.length];
    if (serverState[candidate].cooldownUntil < now) {
      urlIndex = (urlIndex + i) % OVERPASS_URLS.length;
      return candidate;
    }
  }
  // All servers in cooldown — find the one with the shortest remaining wait
  let bestUrl = OVERPASS_URLS[urlIndex % OVERPASS_URLS.length];
  let bestWait = Infinity;
  for (const url of OVERPASS_URLS) {
    const wait = serverState[url].cooldownUntil - now;
    if (wait < bestWait) {
      bestWait = wait;
      bestUrl = url;
    }
  }
  urlIndex = OVERPASS_URLS.indexOf(bestUrl);
  return bestUrl;
}

function markServerError(url: string, reason: string): void {
  serverState[url].cooldownUntil = Date.now() + COOLDOWN_MS;
  serverState[url].errors++;
  console.log(`  ✗ ${host(url)} — ${reason} (cooldown ${COOLDOWN_MS / 1000}s, ${serverState[url].errors} total errors)`);
}

function markServerSuccess(url: string, durationMs: number, responseSize: number): void {
  serverState[url].successes++;
  const sizeKb = (responseSize / 1024).toFixed(1);
  console.log(`  ✓ ${host(url)} — ${durationMs}ms, ${sizeKb}KB response (${serverState[url].successes} total ok)`);
}

async function waitForServer(url: string): Promise<void> {
  const state = serverState[url];
  const now = Date.now();

  // Wait for cooldown if needed
  if (state.cooldownUntil > now) {
    const wait = state.cooldownUntil - now;
    console.log(`  ⏳ Waiting ${Math.ceil(wait / 1000)}s for ${host(url)} cooldown...`);
    await new Promise((r) => setTimeout(r, wait));
  }

  // Respect minimum delay between requests to the same server
  const elapsed = Date.now() - state.lastRequest;
  if (elapsed < MIN_DELAY_MS) {
    const wait = MIN_DELAY_MS - elapsed;
    console.log(`  ⏳ Throttle ${Math.ceil(wait / 1000)}s before next request to ${host(url)}`);
    await new Promise((r) => setTimeout(r, wait));
  }

  state.lastRequest = Date.now();
}

export function printServerStats(): void {
  console.log("\n  Server stats:");
  for (const url of OVERPASS_URLS) {
    const s = serverState[url];
    const status = s.cooldownUntil > Date.now() ? "COOLDOWN" : "ok";
    console.log(`    ${host(url).padEnd(30)} ${s.successes} ok, ${s.errors} errors [${status}]`);
  }
  console.log(`  Total queries: ${queryCount}\n`);
}

export async function queryOverpass(
  query: string,
  retries = OVERPASS_URLS.length
): Promise<unknown> {
  queryCount++;
  const url = pickAvailableServer();
  await waitForServer(url);

  const queryPreview = query.trim().split("\n").slice(0, 2).join(" ").slice(0, 80);
  console.log(`  [Q${queryCount}] → ${host(url)} (${retries} retries left)`);
  console.log(`       ${queryPreview}...`);

  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const durationMs = Date.now() - start;

    if (res.status === 429) {
      markServerError(url, `429 rate limited after ${durationMs}ms`);
      if (retries > 0) {
        return queryOverpass(query, retries - 1);
      }
      throw new Error("All Overpass servers rate limited");
    }

    if (res.status === 504 || res.status === 503) {
      markServerError(url, `${res.status} server error after ${durationMs}ms`);
      if (retries > 0) {
        return queryOverpass(query, retries - 1);
      }
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Overpass error ${res.status}: ${text.slice(0, 500)}`);
    }

    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      markServerSuccess(url, durationMs, text.length);
      return parsed;
    } catch {
      markServerError(url, `non-JSON response after ${durationMs}ms (${text.length} bytes)`);
      if (retries > 0) {
        return queryOverpass(query, retries - 1);
      }
      throw new Error(`Overpass returned non-JSON: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    const durationMs = Date.now() - start;
    if (
      retries > 0 &&
      err instanceof Error &&
      !err.message.startsWith("Overpass error") &&
      !err.message.startsWith("All Overpass")
    ) {
      markServerError(url, `${err.message.slice(0, 60)} after ${durationMs}ms`);
      return queryOverpass(query, retries - 1);
    }
    throw err;
  }
}
