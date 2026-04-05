#!/usr/bin/env tsx

import { mkdirSync, existsSync } from "fs";
import { loadCityConfig, getCityDataDir } from "./lib/config.js";
import { fetchBoundaries } from "./lib/fetch-boundaries.js";
import { fetchPois } from "./lib/fetch-pois.js";
import { scoreVibes } from "./lib/score-vibes.js";
import { assemble } from "./lib/assemble.js";
import { printServerStats } from "./lib/overpass.js";

function elapsed(start: number): string {
  const s = ((Date.now() - start) / 1000).toFixed(1);
  return `${s}s`;
}

async function main() {
  const pipelineStart = Date.now();
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const cityKey = args.find((a) => !a.startsWith("--"));

  if (!cityKey) {
    console.error("Usage: npx tsx generate-city.ts <city-key> [--force]");
    console.error("Example: npx tsx generate-city.ts stockholm");
    process.exit(1);
  }

  console.log(`\n🏙  Generating data for ${cityKey}${force ? " (force refresh)" : ""}`);
  console.log(`   Started at ${new Date().toLocaleTimeString()}\n`);

  // Load config
  const config = loadCityConfig(cityKey);
  console.log(`City: ${config.name} (${config.country})`);
  console.log(`OSM relation: ${config.osmRelationId}`);
  console.log(`Boundary strategy: ${config.boundaryStrategy}${config.adminLevel ? ` (admin_level=${config.adminLevel})` : ""}`);
  console.log(`Filter: ${config.filterRadiusKm}km radius from [${config.center}]`);
  console.log(`Exclude: ${config.exclude.length > 0 ? config.exclude.join(", ") : "(none)"}`);
  console.log(`Include: ${config.include.length > 0 ? config.include.join(", ") : "(none)"}\n`);

  // Ensure data directory exists
  const dataDir = getCityDataDir(cityKey);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
    console.log(`Created ${dataDir}/\n`);
  }

  // Stage 1: Fetch boundaries
  let stageStart = Date.now();
  console.log("━━━ Stage 1/4: Fetching neighborhood boundaries ━━━");
  const boundaries = await fetchBoundaries(cityKey, config, force);
  console.log(`  ⏱  Stage 1 completed in ${elapsed(stageStart)} — ${boundaries.features.length} neighborhoods\n`);

  // Stage 2: Fetch POIs
  stageStart = Date.now();
  console.log("━━━ Stage 2/4: Fetching POI counts ━━━");
  console.log(`  ${boundaries.features.length} neighborhoods to query...`);
  const pois = await fetchPois(cityKey, force);
  const totalPois = Object.values(pois.neighborhoods).reduce(
    (sum, n) => sum + Object.values(n.counts).reduce((s, c) => s + c, 0),
    0
  );
  console.log(`  ⏱  Stage 2 completed in ${elapsed(stageStart)} — ${totalPois} total POIs across ${Object.keys(pois.neighborhoods).length} neighborhoods\n`);

  // Stage 3: Score vibes
  stageStart = Date.now();
  console.log("━━━ Stage 3/4: Scoring vibes ━━━");
  const scores = scoreVibes(cityKey, force);
  console.log(`  ⏱  Stage 3 completed in ${elapsed(stageStart)} — ${Object.keys(scores.neighborhoods).length} neighborhoods scored\n`);

  // Stage 4: Assemble
  stageStart = Date.now();
  console.log("━━━ Stage 4/4: Assembling city.json ━━━");
  const city = assemble(cityKey, force);
  console.log(`  ⏱  Stage 4 completed in ${elapsed(stageStart)} — ${city.features.length} neighborhoods in final output\n`);

  // Summary
  printServerStats();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ ${config.name} complete in ${elapsed(pipelineStart)}`);
  console.log(`   ${city.features.length} neighborhoods, ${totalPois} POIs`);
  console.log("");
  console.log(`   Output files in ${dataDir}/`);
  console.log(`   ├── boundaries.geojson  (${boundaries.features.length} polygons)`);
  console.log(`   ├── poi-counts.json     (${totalPois} POIs)`);
  console.log(`   ├── vibe-scores.json    (${Object.keys(scores.neighborhoods).length} scored)`);
  console.log(`   ├── descriptions.yaml   (edit these!)`);
  console.log(`   └── city.json           (frontend-ready)`);
}

main().catch((err) => {
  console.error(`\n❌ Pipeline failed at ${new Date().toLocaleTimeString()}`);
  console.error(`   ${err.message}`);
  if (err.stack) {
    console.error(`\n   Stack trace:`);
    console.error(
      err.stack
        .split("\n")
        .slice(1, 5)
        .map((l: string) => `   ${l.trim()}`)
        .join("\n")
    );
  }
  process.exit(1);
});
