"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CityConfig, NeighborhoodProperties, VIBE_COLORS } from "@/data/types";
import type { FeatureCollection, Polygon, Feature } from "geojson";

interface CityMapProps {
  city: CityConfig;
  data: FeatureCollection<Polygon, NeighborhoodProperties>;
  selectedNeighborhood: string | null;
  highlightedNeighborhood: string | null;
  highlightOpacity?: number;
  onNeighborhoodClick: (
    feature: Feature<Polygon, NeighborhoodProperties>
  ) => void;
  onNeighborhoodHover: (name: string | null) => void;
}

export default function CityMap({
  city,
  data,
  selectedNeighborhood,
  highlightedNeighborhood,
  highlightOpacity = 0.6,
  onNeighborhoodClick,
  onNeighborhoodHover,
}: CityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sourceLoaded = useRef(false);

  const updatePaint = useCallback(() => {
    const map = mapRef.current;
    if (!map || !sourceLoaded.current) return;

    // Build color expression: matched/selected neighborhoods use their dominant vibe color
    const colorExpr: mapboxgl.Expression = [
      "match",
      ["get", "name"],
      ...data.features.flatMap((f) => [
        f.properties.name,
        VIBE_COLORS[f.properties.dominantVibe],
      ]),
      "#888",
    ];

    // Opacity: selected = full, highlighted = highlightOpacity, default = 0.35
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let opacityExpr: any = 0.35;
    if (selectedNeighborhood) {
      if (highlightedNeighborhood) {
        opacityExpr = [
          "case",
          ["==", ["get", "name"], selectedNeighborhood], 0.7,
          ["==", ["get", "name"], highlightedNeighborhood], highlightOpacity,
          0.25,
        ];
      } else {
        opacityExpr = [
          "case",
          ["==", ["get", "name"], selectedNeighborhood], 0.7,
          0.25,
        ];
      }
    } else if (highlightedNeighborhood) {
      opacityExpr = [
        "case",
        ["==", ["get", "name"], highlightedNeighborhood], highlightOpacity,
        0.35,
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let outlineOpacity: any = 0.6;
    if (selectedNeighborhood) {
      if (highlightedNeighborhood) {
        outlineOpacity = [
          "case",
          ["==", ["get", "name"], selectedNeighborhood], 1,
          ["==", ["get", "name"], highlightedNeighborhood], 0.8,
          0.4,
        ];
      } else {
        outlineOpacity = [
          "case",
          ["==", ["get", "name"], selectedNeighborhood], 1,
          0.4,
        ];
      }
    }

    map.setPaintProperty("neighborhoods-fill", "fill-color", colorExpr);
    map.setPaintProperty("neighborhoods-fill", "fill-opacity", opacityExpr);
    map.setPaintProperty("neighborhoods-outline", "line-opacity", outlineOpacity);
  }, [data, selectedNeighborhood, highlightedNeighborhood, highlightOpacity]);

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: city.center,
      zoom: city.zoom,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("neighborhoods", {
        type: "geojson",
        data: data,
      });

      map.addLayer({
        id: "neighborhoods-fill",
        type: "fill",
        source: "neighborhoods",
        paint: {
          "fill-color": "#888",
          "fill-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "neighborhoods-outline",
        type: "line",
        source: "neighborhoods",
        paint: {
          "line-color": "#333",
          "line-width": 1.5,
          "line-opacity": 0.6,
        },
      });

      map.addLayer({
        id: "neighborhoods-labels",
        type: "symbol",
        source: "neighborhoods",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-anchor": "center",
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#1a1a1a",
          "text-halo-color": "#fff",
          "text-halo-width": 1.5,
        },
      });

      sourceLoaded.current = true;
      updatePaint();

      map.on("click", "neighborhoods-fill", (e) => {
        if (e.features?.[0]) {
          const feature = data.features.find(
            (f) => f.properties.name === e.features![0].properties!.name
          );
          if (feature) onNeighborhoodClick(feature);
        }
      });

      map.on("mouseenter", "neighborhoods-fill", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (e.features?.[0]) {
          onNeighborhoodHover(e.features[0].properties!.name);
        }
      });

      map.on("mouseleave", "neighborhoods-fill", () => {
        map.getCanvas().style.cursor = "";
        onNeighborhoodHover(null);
      });
    });

    return () => {
      sourceLoaded.current = false;
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city.name]);

  useEffect(() => {
    updatePaint();
  }, [updatePaint]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-zinc-800 shadow backdrop-blur dark:bg-zinc-900/90 dark:text-zinc-200">
        {city.name}
      </div>
    </div>
  );
}
