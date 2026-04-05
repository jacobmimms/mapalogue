import { NeighborhoodProperties, VibeDimension } from "./types";
import type { Feature, Polygon } from "geojson";

/** Cosine similarity between two vibe vectors */
export function vibeDistance(
  a: Record<VibeDimension, number>,
  b: Record<VibeDimension, number>
): number {
  const keys = Object.keys(a) as VibeDimension[];
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const k of keys) {
    dot += a[k] * b[k];
    magA += a[k] * a[k];
    magB += b[k] * b[k];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** Find the best matching neighborhoods in the target city, sorted by similarity */
export function findMatches(
  source: Feature<Polygon, NeighborhoodProperties>,
  targetFeatures: Feature<Polygon, NeighborhoodProperties>[]
): { feature: Feature<Polygon, NeighborhoodProperties>; similarity: number }[] {
  return targetFeatures
    .map((f) => ({
      feature: f,
      similarity: vibeDistance(source.properties.vibes, f.properties.vibes),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}
