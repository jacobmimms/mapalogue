import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { getCityDataDir, VibeDimension } from "./config.js";
import YAML from "yaml";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";

interface NeighborhoodProperties {
  name: string;
  city: string;
  description: string;
  dominantVibe: VibeDimension;
  vibes: Record<VibeDimension, number>;
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

export function assemble(
  cityKey: string,
  force: boolean = false
): FeatureCollection<Polygon | MultiPolygon, NeighborhoodProperties> {
  const dataDir = getCityDataDir(cityKey);
  const outPath = join(dataDir, "city.json");
  const descriptionsPath = join(dataDir, "descriptions.yaml");
  const boundaryPath = join(dataDir, "boundaries.geojson");
  const scoresPath = join(dataDir, "vibe-scores.json");

  if (existsSync(outPath) && !force) {
    console.log(`  city.json already exists at ${outPath}, skipping`);
    return JSON.parse(readFileSync(outPath, "utf-8"));
  }

  const boundaries: FeatureCollection<Polygon | MultiPolygon> = JSON.parse(
    readFileSync(boundaryPath, "utf-8")
  );
  const scores: VibeScores = JSON.parse(readFileSync(scoresPath, "utf-8"));

  // Load or create descriptions
  let descriptions: Record<string, string> = {};
  if (existsSync(descriptionsPath)) {
    descriptions = YAML.parse(readFileSync(descriptionsPath, "utf-8")) || {};
    console.log(`  Loaded ${Object.keys(descriptions).length} descriptions from ${descriptionsPath}`);
  }

  // Generate placeholder descriptions for neighborhoods without one
  const missingDescriptions: string[] = [];
  for (const feature of boundaries.features) {
    const name = (feature.properties as { name: string }).name;
    if (!descriptions[name] && scores.neighborhoods[name]) {
      const vibeData = scores.neighborhoods[name];
      const topVibes = (Object.keys(vibeData.vibes) as VibeDimension[])
        .filter((v) => vibeData.vibes[v] >= 0.5)
        .sort((a, b) => vibeData.vibes[b] - vibeData.vibes[a])
        .slice(0, 3);

      const vibeStr = topVibes.length > 0
        ? topVibes.join(", ") + " neighborhood"
        : "neighborhood";

      descriptions[name] = `${name} is a ${vibeStr} in ${cityKey}.`;
      missingDescriptions.push(name);
    }
  }

  // Write descriptions file (don't overwrite existing unless forced)
  if (missingDescriptions.length > 0 || !existsSync(descriptionsPath)) {
    writeFileSync(
      descriptionsPath,
      "# Auto-generated descriptions. Edit freely — pipeline won't overwrite existing entries.\n" +
        YAML.stringify(descriptions)
    );
    if (missingDescriptions.length > 0) {
      console.log(
        `  Generated placeholder descriptions for: ${missingDescriptions.join(", ")}`
      );
      console.log(
        `  Edit ${descriptionsPath} to improve them, then re-run the pipeline.`
      );
    }
  }

  // Assemble the final FeatureCollection
  const result: FeatureCollection<Polygon | MultiPolygon, NeighborhoodProperties> = {
    type: "FeatureCollection",
    features: [],
  };

  for (const feature of boundaries.features) {
    const name = (feature.properties as { name: string }).name;
    const scoreData = scores.neighborhoods[name];

    if (!scoreData) {
      console.log(`  Warning: no scores for ${name}, skipping`);
      continue;
    }

    result.features.push({
      type: "Feature",
      properties: {
        name,
        city: cityKey,
        description: descriptions[name] || `A neighborhood in ${cityKey}.`,
        dominantVibe: scoreData.dominantVibe,
        vibes: scoreData.vibes,
      },
      geometry: feature.geometry,
    });
  }

  console.log(`  Assembled ${result.features.length} neighborhoods into city.json`);

  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`  Wrote ${outPath}`);

  return result;
}
