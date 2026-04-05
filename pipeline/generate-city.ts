#!/usr/bin/env tsx

import { mkdirSync, existsSync } from "fs";
import { loadCityConfig, getCityDataDir } from "./lib/config.js";
import { fetchBoundaries } from "./lib/fetch-boundaries.js";
import { fetchPois } from "./lib/fetch-pois.js";
import { scoreVibes } from "./lib/score-vibes.js";
import { assemble } from "./lib/assemble.js";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const cityKey = args.find((a) => !a.startsWith("--"));

  if (!cityKey) {
    console.error("Usage: npx tsx generate-city.ts <city-key> [--force]");
    console.error("Example: npx tsx generate-city.ts stockholm");
    process.exit(1);
  }

  console.log(`\n🏙  Generating data for ${cityKey}${force ? " (force refresh)" : ""}\n`);

  // Load config
  const config = loadCityConfig(cityKey);
  console.log(`City: ${config.name} (${config.country})`);
  console.log(`OSM relation: ${config.osmRelationId}, admin level: ${config.adminLevel}`);
  console.log(`Filter: ${config.filterRadiusKm}km radius from center\n`);

  // Ensure data directory exists
  const dataDir = getCityDataDir(cityKey);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  // Stage 1: Fetch boundaries
  console.log("=== Stage 1: Fetching neighborhood boundaries ===");
  await fetchBoundaries(cityKey, config, force);
  console.log("");

  // Stage 2: Fetch POIs
  console.log("=== Stage 2: Fetching POI counts ===");
  await fetchPois(cityKey, force);
  console.log("");

  // Stage 3: Score vibes
  console.log("=== Stage 3: Scoring vibes ===");
  scoreVibes(cityKey, force);
  console.log("");

  // Stage 4: Assemble
  console.log("=== Stage 4: Assembling city.json ===");
  assemble(cityKey, force);
  console.log("");

  console.log(`✅ Done! Output files in ${dataDir}/`);
  console.log(`   - boundaries.geojson  (neighborhood polygons)`);
  console.log(`   - poi-counts.json     (raw POI data)`);
  console.log(`   - vibe-scores.json    (normalized vibe scores)`);
  console.log(`   - descriptions.yaml   (editable descriptions)`);
  console.log(`   - city.json           (final output for frontend)`);
}

main().catch((err) => {
  console.error("\n❌ Pipeline failed:", err.message);
  process.exit(1);
});
