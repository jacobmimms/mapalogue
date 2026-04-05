import { NeighborhoodProperties } from "./types";
import type { FeatureCollection, Polygon } from "geojson";

const barcelona: FeatureCollection<Polygon, NeighborhoodProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "El Raval",
        city: "barcelona",
        description:
          "Gritty, multicultural, and creative. Street art, independent galleries, MACBA, and dive bars. Barcelona's Kreuzberg.",
        dominantVibe: "artsy",
        vibes: {
          artsy: 0.85,
          nightlife: 0.75,
          upscale: 0.1,
          touristy: 0.4,
          working_class: 0.8,
          financial: 0.05,
          foodie: 0.6,
          student: 0.5,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.165, 41.385],
            [2.165, 41.378],
            [2.17, 41.375],
            [2.175, 41.378],
            [2.175, 41.385],
            [2.17, 41.387],
            [2.165, 41.385],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "El Born",
        city: "barcelona",
        description:
          "Trendy medieval quarter. Boutique shopping, cocktail bars, Picasso Museum, and the best tapas in town. Stockholm's Södermalm equivalent.",
        dominantVibe: "foodie",
        vibes: {
          artsy: 0.7,
          nightlife: 0.8,
          upscale: 0.5,
          touristy: 0.6,
          working_class: 0.2,
          financial: 0.05,
          foodie: 0.9,
          student: 0.3,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.175, 41.387],
            [2.175, 41.381],
            [2.182, 41.38],
            [2.188, 41.382],
            [2.188, 41.387],
            [2.183, 41.389],
            [2.175, 41.387],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Barri Gòtic",
        city: "barcelona",
        description:
          "The Gothic Quarter. Roman ruins, the cathedral, narrow medieval streets packed with tourists. Barcelona's Gamla Stan.",
        dominantVibe: "touristy",
        vibes: {
          artsy: 0.3,
          nightlife: 0.5,
          upscale: 0.3,
          touristy: 0.95,
          working_class: 0.1,
          financial: 0.1,
          foodie: 0.5,
          student: 0.1,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.17, 41.387],
            [2.17, 41.381],
            [2.175, 41.379],
            [2.178, 41.381],
            [2.178, 41.387],
            [2.175, 41.389],
            [2.17, 41.387],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Eixample",
        city: "barcelona",
        description:
          "The grand grid district. Modernista architecture, Sagrada Familia, high-end shopping on Passeig de Gràcia. Elegant and central.",
        dominantVibe: "upscale",
        vibes: {
          artsy: 0.4,
          nightlife: 0.5,
          upscale: 0.85,
          touristy: 0.6,
          working_class: 0.1,
          financial: 0.5,
          foodie: 0.7,
          student: 0.2,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.145, 41.4],
            [2.145, 41.39],
            [2.16, 41.388],
            [2.18, 41.39],
            [2.18, 41.4],
            [2.17, 41.405],
            [2.155, 41.405],
            [2.145, 41.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Gràcia",
        city: "barcelona",
        description:
          "Village-feel neighborhood. Plaza life, indie boutiques, young creatives, and the best vermouth. Barcelona's Vasastan meets Södermalm.",
        dominantVibe: "artsy",
        vibes: {
          artsy: 0.85,
          nightlife: 0.6,
          upscale: 0.3,
          touristy: 0.3,
          working_class: 0.5,
          financial: 0.05,
          foodie: 0.8,
          student: 0.6,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.15, 41.41],
            [2.15, 41.403],
            [2.16, 41.4],
            [2.17, 41.403],
            [2.17, 41.41],
            [2.163, 41.413],
            [2.155, 41.413],
            [2.15, 41.41],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Barceloneta",
        city: "barcelona",
        description:
          "The beach neighborhood. Seafood restaurants, boardwalk bars, surfers, and sun-seekers. Tourist-heavy but with local character.",
        dominantVibe: "touristy",
        vibes: {
          artsy: 0.1,
          nightlife: 0.6,
          upscale: 0.2,
          touristy: 0.9,
          working_class: 0.6,
          financial: 0.0,
          foodie: 0.7,
          student: 0.3,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.185, 41.385],
            [2.185, 41.378],
            [2.19, 41.373],
            [2.195, 41.375],
            [2.198, 41.38],
            [2.195, 41.385],
            [2.19, 41.387],
            [2.185, 41.385],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Poble Sec",
        city: "barcelona",
        description:
          "Up-and-coming area at the base of Montjuïc. Pintxo bars on Carrer Blai, local feel, increasingly hip. Barcelona's Hornstull.",
        dominantVibe: "nightlife",
        vibes: {
          artsy: 0.5,
          nightlife: 0.8,
          upscale: 0.15,
          touristy: 0.2,
          working_class: 0.7,
          financial: 0.0,
          foodie: 0.85,
          student: 0.5,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.155, 41.378],
            [2.155, 41.372],
            [2.165, 41.37],
            [2.175, 41.372],
            [2.175, 41.378],
            [2.165, 41.38],
            [2.155, 41.378],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Sarrià-Sant Gervasi",
        city: "barcelona",
        description:
          "Wealthy residential area in the hills. International schools, quiet streets, upscale dining. Barcelona's Östermalm.",
        dominantVibe: "upscale",
        vibes: {
          artsy: 0.1,
          nightlife: 0.3,
          upscale: 0.95,
          touristy: 0.1,
          working_class: 0.05,
          financial: 0.3,
          foodie: 0.5,
          student: 0.2,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.12, 41.41],
            [2.12, 41.4],
            [2.135, 41.395],
            [2.15, 41.4],
            [2.15, 41.41],
            [2.14, 41.415],
            [2.13, 41.415],
            [2.12, 41.41],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Poblenou",
        city: "barcelona",
        description:
          "Former industrial area turned tech and design hub. 22@ district, co-working spaces, beach access. Barcelona's emerging creative center.",
        dominantVibe: "artsy",
        vibes: {
          artsy: 0.7,
          nightlife: 0.4,
          upscale: 0.3,
          touristy: 0.2,
          working_class: 0.5,
          financial: 0.3,
          foodie: 0.5,
          student: 0.4,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.19, 41.405],
            [2.19, 41.395],
            [2.2, 41.39],
            [2.21, 41.393],
            [2.21, 41.403],
            [2.2, 41.408],
            [2.19, 41.405],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Sant Antoni",
        city: "barcelona",
        description:
          "Trendy market district. The renovated Mercat de Sant Antoni, brunch spots, and a young professional crowd. Buzzy and walkable.",
        dominantVibe: "foodie",
        vibes: {
          artsy: 0.5,
          nightlife: 0.6,
          upscale: 0.4,
          touristy: 0.2,
          working_class: 0.4,
          financial: 0.1,
          foodie: 0.85,
          student: 0.4,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.155, 41.39],
            [2.155, 41.383],
            [2.163, 41.38],
            [2.17, 41.383],
            [2.17, 41.39],
            [2.163, 41.392],
            [2.155, 41.39],
          ],
        ],
      },
    },
  ],
};

export default barcelona;
