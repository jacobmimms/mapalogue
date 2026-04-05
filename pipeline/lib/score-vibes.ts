import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { getCityDataDir, VIBE_WEIGHTS, VibeDimension } from "./config.js";

interface PoiCounts {
  fetchedAt: string;
  neighborhoods: Record<
    string,
    {
      areaKm2: number;
      counts: Record<string, number>;
    }
  >;
}

interface VibeScores {
  algorithm: string;
  neighborhoods: Record<
    string,
    {
      vibes: Record<VibeDimension, number>;
      dominantVibe: VibeDimension;
    }
  >;
}

const VIBE_DIMENSIONS = Object.keys(VIBE_WEIGHTS) as VibeDimension[];

export function scoreVibes(
  cityKey: string,
  force: boolean = false
): VibeScores {
  const dataDir = getCityDataDir(cityKey);
  const outPath = join(dataDir, "vibe-scores.json");
  const poiPath = join(dataDir, "poi-counts.json");

  if (existsSync(outPath) && !force) {
    console.log(`  Vibe scores already exist at ${outPath}, skipping`);
    return JSON.parse(readFileSync(outPath, "utf-8"));
  }

  const poiData: PoiCounts = JSON.parse(readFileSync(poiPath, "utf-8"));

  // Step 1: Compute raw weighted scores per neighborhood per vibe
  const rawScores: Record<string, Record<VibeDimension, number>> = {};

  for (const [name, data] of Object.entries(poiData.neighborhoods)) {
    const { areaKm2, counts } = data;
    if (areaKm2 === 0) continue;

    // Compute density per POI category
    const density: Record<string, number> = {};
    for (const [cat, count] of Object.entries(counts)) {
      density[cat] = count / areaKm2;
    }

    // Compute weighted score per vibe dimension
    const scores: Record<string, number> = {};
    for (const vibe of VIBE_DIMENSIONS) {
      const weights = VIBE_WEIGHTS[vibe];
      let score = 0;
      for (const [cat, weight] of Object.entries(weights)) {
        score += (density[cat] || 0) * weight;
      }
      scores[vibe] = Math.max(0, score); // clamp negatives to 0
    }
    rawScores[name] = scores as Record<VibeDimension, number>;
  }

  // Step 2: Min-max normalize within the city per dimension
  const neighborhoods = Object.keys(rawScores);
  if (neighborhoods.length === 0) {
    throw new Error("No neighborhoods to score");
  }

  // Find min/max per dimension
  const mins: Record<VibeDimension, number> = {} as Record<VibeDimension, number>;
  const maxs: Record<VibeDimension, number> = {} as Record<VibeDimension, number>;

  for (const vibe of VIBE_DIMENSIONS) {
    const values = neighborhoods.map((n) => rawScores[n][vibe]);
    mins[vibe] = Math.min(...values);
    maxs[vibe] = Math.max(...values);
  }

  // Normalize
  const result: VibeScores = {
    algorithm: "poi-density-v1",
    neighborhoods: {},
  };

  for (const name of neighborhoods) {
    const vibes: Record<string, number> = {};
    for (const vibe of VIBE_DIMENSIONS) {
      const range = maxs[vibe] - mins[vibe];
      if (range === 0) {
        vibes[vibe] = 0; // no variance = everyone gets 0
      } else {
        vibes[vibe] =
          Math.round(((rawScores[name][vibe] - mins[vibe]) / range) * 100) /
          100;
      }
    }

    // Dominant vibe = highest score
    const dominantVibe = VIBE_DIMENSIONS.reduce((a, b) =>
      (vibes[a] || 0) >= (vibes[b] || 0) ? a : b
    );

    result.neighborhoods[name] = {
      vibes: vibes as Record<VibeDimension, number>,
      dominantVibe,
    };

    const topVibes = VIBE_DIMENSIONS.filter((v) => vibes[v] >= 0.6)
      .sort((a, b) => vibes[b] - vibes[a])
      .map((v) => `${v}:${vibes[v]}`);

    console.log(
      `  ${name}: dominant=${dominantVibe} | ${topVibes.join(", ") || "(no strong vibes)"}`
    );
  }

  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`  Wrote ${outPath}`);

  return result;
}
