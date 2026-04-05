export type VibeDimension =
  | "artsy"
  | "nightlife"
  | "upscale"
  | "touristy"
  | "working_class"
  | "financial"
  | "foodie"
  | "student";

export const VIBE_LABELS: Record<VibeDimension, string> = {
  artsy: "Artsy",
  nightlife: "Nightlife",
  upscale: "Upscale",
  touristy: "Touristy",
  working_class: "Working Class",
  financial: "Financial",
  foodie: "Foodie",
  student: "Student",
};

export const VIBE_COLORS: Record<VibeDimension, string> = {
  artsy: "#9333ea",
  nightlife: "#ec4899",
  upscale: "#f59e0b",
  touristy: "#3b82f6",
  working_class: "#22c55e",
  financial: "#64748b",
  foodie: "#ef4444",
  student: "#06b6d4",
};

export interface NeighborhoodProperties {
  name: string;
  city: string;
  vibes: Record<VibeDimension, number>; // 0-1
  description: string;
  dominantVibe: VibeDimension;
}

export interface CityConfig {
  name: string;
  country: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
}

export interface CitiesIndex {
  [key: string]: CityConfig & {
    osmRelationId?: number;
    boundaryStrategy?: string;
    adminLevel?: number;
    filterRadiusKm?: number;
  };
}

export async function loadCities(): Promise<Record<string, CityConfig>> {
  const res = await fetch("/data/cities.json");
  const data: CitiesIndex = await res.json();
  // Extract just the CityConfig fields the frontend needs
  const cities: Record<string, CityConfig> = {};
  for (const [key, val] of Object.entries(data)) {
    cities[key] = {
      name: val.name,
      country: val.country,
      center: val.center,
      zoom: val.zoom,
    };
  }
  return cities;
}
