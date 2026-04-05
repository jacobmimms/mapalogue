// Use the Kumi endpoint as fallback when the main one is overloaded
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
let urlIndex = 0;
const DELAY_MS = 2000; // delay between requests to be nice to the API

let lastRequest = 0;

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequest;
  if (elapsed < DELAY_MS) {
    await new Promise((r) => setTimeout(r, DELAY_MS - elapsed));
  }
  lastRequest = Date.now();
}

export async function queryOverpass(
  query: string,
  retries = 2
): Promise<unknown> {
  await throttle();

  const url = OVERPASS_URLS[urlIndex % OVERPASS_URLS.length];

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (res.status === 429) {
      console.log("  Rate limited, waiting 30s...");
      await new Promise((r) => setTimeout(r, 30000));
      return queryOverpass(query, retries);
    }

    if (res.status === 504 || res.status === 503) {
      if (retries > 0) {
        urlIndex++; // try the other server
        console.log(
          `  Server error ${res.status}, switching to ${OVERPASS_URLS[urlIndex % OVERPASS_URLS.length]} and retrying...`
        );
        await new Promise((r) => setTimeout(r, 5000));
        return queryOverpass(query, retries - 1);
      }
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Overpass error ${res.status}: ${text.slice(0, 500)}`);
    }

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      // Sometimes Overpass returns HTML error pages with 200 status
      if (retries > 0) {
        urlIndex++;
        console.log(
          `  Got non-JSON response, switching server and retrying...`
        );
        await new Promise((r) => setTimeout(r, 5000));
        return queryOverpass(query, retries - 1);
      }
      throw new Error(`Overpass returned non-JSON: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    if (
      retries > 0 &&
      err instanceof Error &&
      !err.message.startsWith("Overpass error")
    ) {
      urlIndex++;
      console.log(
        `  Connection error, switching to ${OVERPASS_URLS[urlIndex % OVERPASS_URLS.length]} and retrying...`
      );
      await new Promise((r) => setTimeout(r, 5000));
      return queryOverpass(query, retries - 1);
    }
    throw err;
  }
}
