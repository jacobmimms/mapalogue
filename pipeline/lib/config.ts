import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "data");

export interface CityConfig {
  name: string;
  country: string;
  center: [number, number];
  zoom: number;
  osmRelationId: number;
  /** Strategy for finding neighborhood boundaries */
  boundaryStrategy: "admin" | "voronoi";
  /** For admin strategy: which OSM admin_level to query */
  adminLevel?: number;
  filterRadiusKm: number;
  minAreaKm2?: number;
  maxAreaKm2?: number;
  exclude: string[];
  include: string[];
}

export function loadCityConfig(cityKey: string): CityConfig {
  const cities = JSON.parse(
    readFileSync(join(DATA_DIR, "cities.json"), "utf-8")
  );
  const config = cities[cityKey];
  if (!config) {
    throw new Error(
      `City "${cityKey}" not found in cities.json. Available: ${Object.keys(cities).join(", ")}`
    );
  }
  return config;
}

export function getCityDataDir(cityKey: string): string {
  return join(DATA_DIR, cityKey);
}

export function getDataDir(): string {
  return DATA_DIR;
}

// POI categories we query from Overpass, grouped by OSM key
export const POI_QUERIES = {
  amenity: [
    "bar",
    "nightclub",
    "pub",
    "restaurant",
    "cafe",
    "fast_food",
    "theatre",
    "cinema",
    "bank",
    "bureau_de_change",
    "university",
    "library",
    "language_school",
    "marketplace",
    "social_facility",
  ],
  tourism: [
    "museum",
    "hotel",
    "hostel",
    "guest_house",
    "attraction",
    "information",
    "gallery",
  ],
  shop: ["art", "jewelry", "luxury", "boutique"],
} as const;

// Flatten to a lookup: "bar" -> "amenity", "museum" -> "tourism", etc.
export const POI_TAG_LOOKUP: Record<string, string> = {};
for (const [key, values] of Object.entries(POI_QUERIES)) {
  for (const v of values) {
    POI_TAG_LOOKUP[v] = key;
  }
}

export type VibeDimension =
  | "artsy"
  | "nightlife"
  | "upscale"
  | "touristy"
  | "working_class"
  | "financial"
  | "foodie"
  | "student";

// POI category -> vibe dimension weights
// Positive = contributes to vibe, negative = detracts
export const VIBE_WEIGHTS: Record<VibeDimension, Record<string, number>> = {
  artsy: {
    art: 3.0,
    gallery: 2.5,
    theatre: 2.5,
    museum: 2.0,
    cinema: 1.0,
    boutique: 0.5,
  },
  nightlife: {
    nightclub: 3.0,
    bar: 2.0,
    pub: 1.5,
  },
  upscale: {
    luxury: 3.0,
    jewelry: 2.5,
    boutique: 2.0,
    restaurant: 0.5,
    fast_food: -1.5,
  },
  touristy: {
    attraction: 3.0,
    information: 2.5,
    hotel: 2.0,
    hostel: 1.5,
    guest_house: 1.5,
    museum: 1.5,
    gallery: 1.0,
    bureau_de_change: 2.0,
  },
  working_class: {
    marketplace: 2.0,
    social_facility: 2.0,
    fast_food: 1.0,
    luxury: -2.0,
    jewelry: -1.0,
  },
  financial: {
    bank: 3.0,
    bureau_de_change: 1.5,
  },
  foodie: {
    restaurant: 2.5,
    cafe: 2.0,
    marketplace: 1.0,
    fast_food: -0.5,
  },
  student: {
    university: 3.0,
    library: 2.0,
    language_school: 2.5,
    hostel: 1.0,
    cafe: 0.5,
    bar: 0.5,
  },
};
