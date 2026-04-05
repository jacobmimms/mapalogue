import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { queryOverpass } from "./overpass.js";
import { getCityDataDir, POI_QUERIES, POI_TAG_LOOKUP } from "./config.js";
import * as turf from "@turf/turf";
import type { FeatureCollection, Polygon, MultiPolygon, Position } from "geojson";

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

/** Convert a GeoJSON polygon to Overpass poly: filter string (lat lon pairs) */
function polygonToOverpassPoly(coords: Position[]): string {
  // Overpass wants "lat lon" pairs space-separated
  return coords.map(([lng, lat]) => `${lat} ${lng}`).join(" ");
}

/** Get the outer ring coordinates, handling both Polygon and MultiPolygon */
function getOuterRing(
  geometry: Polygon | MultiPolygon
): Position[] {
  if (geometry.type === "Polygon") {
    return geometry.coordinates[0];
  }
  // For MultiPolygon, use the largest ring
  let largest: Position[] = [];
  let maxLen = 0;
  for (const poly of geometry.coordinates) {
    if (poly[0].length > maxLen) {
      maxLen = poly[0].length;
      largest = poly[0];
    }
  }
  return largest;
}

export async function fetchPois(
  cityKey: string,
  force: boolean = false
): Promise<PoiCounts> {
  const dataDir = getCityDataDir(cityKey);
  const outPath = join(dataDir, "poi-counts.json");
  const boundaryPath = join(dataDir, "boundaries.geojson");

  if (existsSync(outPath) && !force) {
    console.log(`  POI counts already exist at ${outPath}, skipping`);
    return JSON.parse(readFileSync(outPath, "utf-8"));
  }

  const boundaries: FeatureCollection<Polygon | MultiPolygon> = JSON.parse(
    readFileSync(boundaryPath, "utf-8")
  );

  // Build the amenity/tourism/shop regex patterns
  const amenityRegex = POI_QUERIES.amenity.join("|");
  const tourismRegex = POI_QUERIES.tourism.join("|");
  const shopRegex = POI_QUERIES.shop.join("|");

  // Load partial progress if it exists
  let result: PoiCounts;
  if (existsSync(outPath) && !force) {
    result = JSON.parse(readFileSync(outPath, "utf-8"));
    console.log(`  Resuming from partial progress (${Object.keys(result.neighborhoods).length} neighborhoods done)`);
  } else {
    result = {
      fetchedAt: new Date().toISOString(),
      neighborhoods: {},
    };
  }

  for (const feature of boundaries.features) {
    const name = (feature.properties as { name: string }).name;
    const areaKm2 = (feature.properties as { areaKm2: number }).areaKm2;

    // Simplify for Overpass query (reduce coordinate count)
    const simplified = turf.simplify(feature, {
      tolerance: 0.001,
      highQuality: false,
    });
    const outerRing = getOuterRing(
      simplified.geometry as Polygon | MultiPolygon
    );
    const polyStr = polygonToOverpassPoly(outerRing);

    // Skip if already fetched
    if (result.neighborhoods[name]) {
      console.log(`  Skipping ${name} (already fetched)`);
      continue;
    }

    console.log(`  Querying POIs for ${name}...`);

    const query = `
[out:json][timeout:60];
(
  nwr["amenity"~"${amenityRegex}"](poly:"${polyStr}");
  nwr["tourism"~"${tourismRegex}"](poly:"${polyStr}");
  nwr["shop"~"${shopRegex}"](poly:"${polyStr}");
);
out tags;
`;

    const raw = (await queryOverpass(query)) as {
      elements: Array<{ tags?: Record<string, string> }>;
    };

    // Count POIs by category
    const counts: Record<string, number> = {};
    for (const el of raw.elements) {
      if (!el.tags) continue;

      // Check each tag key (amenity, tourism, shop)
      for (const tagKey of ["amenity", "tourism", "shop"]) {
        const tagValue = el.tags[tagKey];
        if (tagValue && POI_TAG_LOOKUP[tagValue]) {
          counts[tagValue] = (counts[tagValue] || 0) + 1;
        }
      }
    }

    const totalPois = Object.values(counts).reduce((s, c) => s + c, 0);

    if (totalPois === 0 && areaKm2 > 0.5) {
      console.log(`    ⚠ 0 POIs for ${name} (${areaKm2} km²) — server may have returned empty data`);
      console.log(`      Polygon has ${outerRing.length} coords, query length: ${query.length} chars`);
    } else {
      console.log(`    ${totalPois} POIs found across ${Object.keys(counts).length} categories`);
    }

    result.neighborhoods[name] = { areaKm2, counts };

    // Save after each neighborhood to preserve progress
    writeFileSync(outPath, JSON.stringify(result, null, 2));
  }

  // Final write with updated timestamp
  result.fetchedAt = new Date().toISOString();
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`  Wrote ${outPath}`);

  return result;
}
