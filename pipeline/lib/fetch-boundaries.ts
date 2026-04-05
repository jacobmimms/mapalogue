import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { queryOverpass } from "./overpass.js";
import { CityConfig, getCityDataDir } from "./config.js";
import * as turf from "@turf/turf";
import type {
  FeatureCollection,
  Feature,
  Polygon,
  MultiPolygon,
  Point,
} from "geojson";

import osmtogeojson from "osmtogeojson";

export interface BoundaryProperties {
  osmId: number;
  name: string;
  adminLevel: number;
  areaKm2: number;
}

export async function fetchBoundaries(
  cityKey: string,
  config: CityConfig,
  force: boolean = false
): Promise<FeatureCollection<Polygon | MultiPolygon, BoundaryProperties>> {
  const outPath = join(getCityDataDir(cityKey), "boundaries.geojson");

  if (existsSync(outPath) && !force) {
    console.log(
      `  Boundaries already exist at ${outPath}, skipping (use --force to refetch)`
    );
    return JSON.parse(readFileSync(outPath, "utf-8"));
  }

  let result: FeatureCollection<Polygon | MultiPolygon, BoundaryProperties>;

  if (config.boundaryStrategy === "voronoi") {
    result = await fetchVoronoiBoundaries(cityKey, config);
  } else {
    result = await fetchAdminBoundaries(cityKey, config);
  }

  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`  Wrote ${outPath}`);

  return result;
}

/**
 * Strategy: "admin"
 * Query OSM for administrative boundary relations at a specific admin_level.
 * Works well for cities like Barcelona that have fine-grained admin boundaries.
 */
async function fetchAdminBoundaries(
  _cityKey: string,
  config: CityConfig
): Promise<FeatureCollection<Polygon | MultiPolygon, BoundaryProperties>> {
  const adminLevel = config.adminLevel || 10;
  console.log(
    `  [admin] Querying admin_level=${adminLevel} within relation ${config.osmRelationId}...`
  );

  const areaId = 3600000000 + config.osmRelationId;

  const query = `
[out:json][timeout:90];
area(id:${areaId})->.city;
(
  rel(area.city)["admin_level"="${adminLevel}"]["boundary"="administrative"];
);
out body;
>;
out skel qt;
`;

  const rawData = await queryOverpass(query);
  const geojson = osmtogeojson(rawData) as FeatureCollection;

  console.log(`  Got ${geojson.features.length} raw features from OSM`);

  return filterAndProcess(geojson, config);
}

/**
 * Strategy: "voronoi"
 * 1. Query OSM for place=suburb and place=neighbourhood nodes within the city
 * 2. Get the city boundary polygon
 * 3. Generate Voronoi tessellation from the named points, clipped to city boundary
 *
 * This gives non-overlapping polygons for cities where admin boundaries
 * don't match the neighborhoods people actually know.
 */
async function fetchVoronoiBoundaries(
  _cityKey: string,
  config: CityConfig
): Promise<FeatureCollection<Polygon | MultiPolygon, BoundaryProperties>> {
  const areaId = 3600000000 + config.osmRelationId;

  // Step 1: Get neighborhood/suburb named points
  console.log(
    `  [voronoi] Querying place=suburb|neighbourhood nodes within relation ${config.osmRelationId}...`
  );

  const pointsQuery = `
[out:json][timeout:60];
area(id:${areaId})->.city;
(
  node(area.city)["place"~"suburb|neighbourhood"];
);
out body;
`;

  const pointsRaw = (await queryOverpass(pointsQuery)) as {
    elements: Array<{
      id: number;
      lat: number;
      lon: number;
      tags?: Record<string, string>;
    }>;
  };

  console.log(
    `  Found ${pointsRaw.elements.length} named places in OSM`
  );

  // Step 2: Get city boundary for clipping
  console.log(`  Fetching city boundary for clipping...`);

  const boundaryQuery = `
[out:json][timeout:60];
rel(${config.osmRelationId});
out body;
>;
out skel qt;
`;

  const boundaryRaw = await queryOverpass(boundaryQuery);
  const boundaryGeojson = osmtogeojson(boundaryRaw) as FeatureCollection;

  // Find the city polygon
  let cityPolygon: Feature<Polygon | MultiPolygon> | null = null;
  for (const f of boundaryGeojson.features) {
    if (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") {
      cityPolygon = f as Feature<Polygon | MultiPolygon>;
      break;
    }
  }

  // Step 3: Filter points by distance from center and exclude/include lists
  const cityCenter = turf.point(config.center);
  const filteredPoints: Array<{
    id: number;
    name: string;
    point: Feature<Point>;
  }> = [];

  for (const el of pointsRaw.elements) {
    const name = el.tags?.["name:en"] || el.tags?.name;
    if (!name) continue;

    if (config.exclude.includes(name)) {
      console.log(`  Excluding ${name} (in exclude list)`);
      continue;
    }

    const pt = turf.point([el.lon, el.lat]);
    const distKm = turf.distance(cityCenter, pt, { units: "kilometers" });

    const isIncluded = config.include.includes(name);
    if (!isIncluded && distKm > config.filterRadiusKm) {
      continue; // silently skip far-away points
    }

    filteredPoints.push({ id: el.id, name, point: pt });
  }

  console.log(
    `  ${filteredPoints.length} neighborhoods within ${config.filterRadiusKm}km radius`
  );

  if (filteredPoints.length < 3) {
    throw new Error(
      `Only ${filteredPoints.length} neighborhoods found — need at least 3 for Voronoi. ` +
        `Try increasing filterRadiusKm or check OSM data for this city.`
    );
  }

  // Step 4: Build Voronoi tessellation
  const pointsCollection = turf.featureCollection(
    filteredPoints.map((p) => p.point)
  );

  // Bbox for voronoi — use city bounds or a generous buffer around center
  let bbox: [number, number, number, number];
  if (cityPolygon) {
    const b = turf.bbox(cityPolygon);
    bbox = [b[0], b[1], b[2], b[3]];
  } else {
    const buffer = turf.buffer(cityCenter, config.filterRadiusKm, {
      units: "kilometers",
    });
    const b = turf.bbox(buffer!);
    bbox = [b[0], b[1], b[2], b[3]];
  }

  const voronoi = turf.voronoi(pointsCollection, { bbox });

  if (!voronoi || voronoi.features.length === 0) {
    throw new Error("Voronoi tessellation produced no polygons");
  }

  // Step 5: Clip to city boundary and assemble result
  const result: FeatureCollection<Polygon | MultiPolygon, BoundaryProperties> =
    {
      type: "FeatureCollection",
      features: [],
    };

  for (let i = 0; i < voronoi.features.length; i++) {
    const voronoiCell = voronoi.features[i];
    if (!voronoiCell || !voronoiCell.geometry) continue;

    const { id, name } = filteredPoints[i];

    // Clip to city boundary if available
    let clipped: Feature<Polygon | MultiPolygon> | null = voronoiCell as Feature<Polygon>;
    if (cityPolygon) {
      try {
        clipped = turf.intersect(
          turf.featureCollection([voronoiCell as Feature<Polygon>, cityPolygon as Feature<Polygon>])
        ) as Feature<Polygon | MultiPolygon> | null;
      } catch {
        // intersect can fail on complex geometries, fall back to unclipped
        clipped = voronoiCell as Feature<Polygon>;
      }
    }

    if (!clipped || !clipped.geometry) continue;

    // Simplify
    const simplified = turf.simplify(clipped, {
      tolerance: 0.0005,
      highQuality: true,
    });

    const areaM2 = turf.area(simplified);
    const areaKm2 = areaM2 / 1_000_000;

    // Skip very tiny slivers
    if (areaKm2 < 0.05) continue;

    result.features.push({
      type: "Feature",
      properties: {
        osmId: id,
        name,
        adminLevel: 0, // voronoi-generated, not admin boundary
        areaKm2: Math.round(areaKm2 * 100) / 100,
      },
      geometry: simplified.geometry as Polygon | MultiPolygon,
    });

    const centroid = turf.centroid(simplified);
    const distKm = turf.distance(cityCenter, centroid, {
      units: "kilometers",
    });
    console.log(
      `  ✓ ${name} — ${areaKm2.toFixed(2)} km², ${distKm.toFixed(1)} km from center`
    );
  }

  console.log(
    `  Kept ${result.features.length} neighborhoods after Voronoi + clipping`
  );

  return result;
}

/**
 * Shared post-processing for admin boundary features
 */
function filterAndProcess(
  geojson: FeatureCollection,
  config: CityConfig
): FeatureCollection<Polygon | MultiPolygon, BoundaryProperties> {
  const cityCenter = turf.point(config.center);
  const processed: FeatureCollection<
    Polygon | MultiPolygon,
    BoundaryProperties
  > = {
    type: "FeatureCollection",
    features: [],
  };

  for (const feature of geojson.features) {
    if (
      feature.geometry.type !== "Polygon" &&
      feature.geometry.type !== "MultiPolygon"
    ) {
      continue;
    }

    const props = feature.properties || {};
    const name = props["name:en"] || props.name;
    if (!name) continue;

    if (config.exclude.includes(name)) {
      console.log(`  Excluding ${name} (in exclude list)`);
      continue;
    }

    const areaM2 = turf.area(feature);
    const areaKm2 = areaM2 / 1_000_000;

    const isIncluded = config.include.includes(name);
    if (!isIncluded) {
      if (areaKm2 < 0.1) {
        console.log(
          `  Skipping ${name} (too small: ${areaKm2.toFixed(2)} km²)`
        );
        continue;
      }
      if (areaKm2 > 35) {
        console.log(
          `  Skipping ${name} (too large: ${areaKm2.toFixed(2)} km²)`
        );
        continue;
      }
    }

    const centroid = turf.centroid(feature);
    const distKm = turf.distance(cityCenter, centroid, {
      units: "kilometers",
    });
    if (!isIncluded && distKm > config.filterRadiusKm) {
      console.log(
        `  Skipping ${name} (too far: ${distKm.toFixed(1)} km from center)`
      );
      continue;
    }

    const simplified = turf.simplify(feature, {
      tolerance: 0.0005,
      highQuality: true,
    });

    const osmId = parseInt(props.id?.split("/")[1] || "0", 10);

    processed.features.push({
      type: "Feature",
      properties: {
        osmId,
        name,
        adminLevel: config.adminLevel || 0,
        areaKm2: Math.round(areaKm2 * 100) / 100,
      },
      geometry: simplified.geometry as Polygon | MultiPolygon,
    });

    console.log(
      `  ✓ ${name} — ${areaKm2.toFixed(2)} km², ${distKm.toFixed(1)} km from center`
    );
  }

  console.log(
    `  Kept ${processed.features.length} neighborhoods after filtering`
  );

  return processed;
}
