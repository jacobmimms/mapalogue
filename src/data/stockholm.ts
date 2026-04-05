import { NeighborhoodProperties } from "./types";
import type { FeatureCollection, Polygon } from "geojson";

const stockholm: FeatureCollection<Polygon, NeighborhoodProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Södermalm",
        city: "stockholm",
        description:
          "Creative, bohemian heart of Stockholm. Vintage shops, independent cafes, and a strong arts scene. Think Brooklyn or Kreuzberg.",
        dominantVibe: "artsy",
        vibes: {
          artsy: 0.9,
          nightlife: 0.7,
          upscale: 0.3,
          touristy: 0.4,
          working_class: 0.6,
          financial: 0.05,
          foodie: 0.8,
          student: 0.5,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [18.055, 59.322],
            [18.04, 59.315],
            [18.045, 59.305],
            [18.06, 59.298],
            [18.08, 59.3],
            [18.095, 59.305],
            [18.1, 59.315],
            [18.09, 59.322],
            [18.075, 59.325],
            [18.055, 59.322],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Östermalm",
        city: "stockholm",
        description:
          "Stockholm's upscale neighborhood. Designer boutiques, fine dining, and leafy boulevards. The Upper East Side of Stockholm.",
        dominantVibe: "upscale",
        vibes: {
          artsy: 0.2,
          nightlife: 0.5,
          upscale: 0.95,
          touristy: 0.3,
          working_class: 0.05,
          financial: 0.3,
          foodie: 0.8,
          student: 0.1,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [18.07, 59.34],
            [18.07, 59.335],
            [18.08, 59.33],
            [18.1, 59.33],
            [18.11, 59.335],
            [18.11, 59.345],
            [18.1, 59.35],
            [18.085, 59.348],
            [18.07, 59.34],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Gamla Stan",
        city: "stockholm",
        description:
          "The medieval old town. Cobblestone streets, the Royal Palace, and tourist crowds. Beautiful but heavily visited.",
        dominantVibe: "touristy",
        vibes: {
          artsy: 0.3,
          nightlife: 0.2,
          upscale: 0.4,
          touristy: 0.95,
          working_class: 0.05,
          financial: 0.1,
          foodie: 0.5,
          student: 0.05,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [18.065, 59.328],
            [18.065, 59.323],
            [18.07, 59.322],
            [18.075, 59.323],
            [18.078, 59.325],
            [18.078, 59.328],
            [18.075, 59.33],
            [18.068, 59.33],
            [18.065, 59.328],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Kungsholmen",
        city: "stockholm",
        description:
          "Residential island with a yuppie vibe. Good restaurants, waterfront walks, and young professionals. Stockholm's Williamsburg.",
        dominantVibe: "foodie",
        vibes: {
          artsy: 0.4,
          nightlife: 0.4,
          upscale: 0.6,
          touristy: 0.15,
          working_class: 0.3,
          financial: 0.2,
          foodie: 0.75,
          student: 0.3,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [18.02, 59.335],
            [18.025, 59.33],
            [18.04, 59.325],
            [18.06, 59.325],
            [18.065, 59.33],
            [18.06, 59.34],
            [18.045, 59.345],
            [18.03, 59.342],
            [18.02, 59.335],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Norrmalm",
        city: "stockholm",
        description:
          "Central Stockholm's commercial and financial hub. Department stores, offices, and the central station. Busy and polished.",
        dominantVibe: "financial",
        vibes: {
          artsy: 0.1,
          nightlife: 0.4,
          upscale: 0.7,
          touristy: 0.5,
          working_class: 0.1,
          financial: 0.85,
          foodie: 0.5,
          student: 0.15,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [18.055, 59.335],
            [18.06, 59.33],
            [18.07, 59.33],
            [18.075, 59.335],
            [18.07, 59.34],
            [18.06, 59.34],
            [18.055, 59.335],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Vasastan",
        city: "stockholm",
        description:
          "Quiet, residential neighborhood north of Norrmalm. Beautiful turn-of-century buildings, local restaurants, and a bookish vibe.",
        dominantVibe: "foodie",
        vibes: {
          artsy: 0.5,
          nightlife: 0.3,
          upscale: 0.5,
          touristy: 0.1,
          working_class: 0.3,
          financial: 0.1,
          foodie: 0.7,
          student: 0.4,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [18.04, 59.345],
            [18.045, 59.34],
            [18.06, 59.34],
            [18.07, 59.343],
            [18.065, 59.35],
            [18.05, 59.352],
            [18.04, 59.348],
            [18.04, 59.345],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Djurgården",
        city: "stockholm",
        description:
          "Island of museums and parks. Skansen, Vasa Museum, ABBA Museum. Green space meets cultural tourism.",
        dominantVibe: "touristy",
        vibes: {
          artsy: 0.4,
          nightlife: 0.05,
          upscale: 0.3,
          touristy: 0.85,
          working_class: 0.0,
          financial: 0.0,
          foodie: 0.3,
          student: 0.1,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [18.1, 59.33],
            [18.105, 59.325],
            [18.12, 59.32],
            [18.14, 59.322],
            [18.15, 59.328],
            [18.14, 59.335],
            [18.12, 59.335],
            [18.1, 59.33],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Hornstull",
        city: "stockholm",
        description:
          "Western Södermalm's hipster pocket. Craft beer bars, flea markets, and waterfront hangouts. The new cool kid on the block.",
        dominantVibe: "nightlife",
        vibes: {
          artsy: 0.7,
          nightlife: 0.85,
          upscale: 0.2,
          touristy: 0.2,
          working_class: 0.5,
          financial: 0.0,
          foodie: 0.7,
          student: 0.6,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [18.03, 59.315],
            [18.035, 59.31],
            [18.05, 59.308],
            [18.055, 59.312],
            [18.05, 59.318],
            [18.04, 59.32],
            [18.03, 59.318],
            [18.03, 59.315],
          ],
        ],
      },
    },
  ],
};

export default stockholm;
