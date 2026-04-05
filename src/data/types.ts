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

export const CITIES: Record<string, CityConfig> = {
  stockholm: {
    name: "Stockholm",
    country: "SE",
    center: [18.07, 59.33],
    zoom: 12,
  },
  barcelona: {
    name: "Barcelona",
    country: "ES",
    center: [2.17, 41.39],
    zoom: 12.5,
  },
};
