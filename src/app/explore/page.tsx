"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CityMap from "@/components/CityMap";
import VibePanel from "@/components/VibePanel";
import { CITIES, NeighborhoodProperties } from "@/data/types";
import { findMatches } from "@/data/matching";
import stockholm from "@/data/stockholm";
import barcelona from "@/data/barcelona";
import type { Feature, Polygon } from "geojson";

const CITY_DATA = {
  stockholm,
  barcelona,
} as const;

type CityKey = keyof typeof CITY_DATA;

export default function ExplorePage() {
  const [leftCity, setLeftCity] = useState<CityKey>("stockholm");
  const [rightCity, setRightCity] = useState<CityKey>("barcelona");
  const [selected, setSelected] = useState<Feature<
    Polygon,
    NeighborhoodProperties
  > | null>(null);
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(
    null
  );
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [highlightedMatch, setHighlightedMatch] = useState<string | null>(null);

  const matches = useMemo(() => {
    if (!selected || !selectedSide) return [];
    const targetData =
      selectedSide === "left"
        ? CITY_DATA[rightCity].features
        : CITY_DATA[leftCity].features;
    return findMatches(selected, targetData);
  }, [selected, selectedSide, leftCity, rightCity]);

  const targetCityName =
    selectedSide === "left" ? CITIES[rightCity].name : CITIES[leftCity].name;

  const handleNeighborhoodClick = useCallback(
    (side: "left" | "right") =>
      (feature: Feature<Polygon, NeighborhoodProperties>) => {
        setSelected(feature);
        setSelectedSide(side);
        setHighlightedMatch(null);
      },
    []
  );

  const handleMatchClick = useCallback((name: string) => {
    setHighlightedMatch(name);
  }, []);

  const handleSwap = useCallback(() => {
    setLeftCity((l) => {
      setRightCity(l);
      return rightCity;
    });
    setSelected(null);
    setSelectedSide(null);
    setHighlightedMatch(null);
  }, [rightCity]);

  const bestMatchName = matches.length > 0 ? matches[0].feature.properties.name : null;

  return (
    <div className="flex h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <Link
          href="/"
          className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
        >
          Mapalogue
        </Link>
        <div className="flex items-center gap-2">
          <select
            value={leftCity}
            onChange={(e) => {
              setLeftCity(e.target.value as CityKey);
              setSelected(null);
            }}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {Object.entries(CITIES).map(([key, c]) => (
              <option key={key} value={key}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSwap}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            title="Swap cities"
          >
            ⇄
          </button>
          <select
            value={rightCity}
            onChange={(e) => {
              setRightCity(e.target.value as CityKey);
              setSelected(null);
            }}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {Object.entries(CITIES).map(([key, c]) => (
              <option key={key} value={key}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left map */}
        <div className="flex-1">
          <CityMap
            city={CITIES[leftCity]}
            data={CITY_DATA[leftCity]}
            selectedNeighborhood={
              selectedSide === "left" ? selected?.properties.name ?? null : null
            }
            highlightedNeighborhood={
              selectedSide === "right"
                ? highlightedMatch ?? bestMatchName
                : hoveredName
            }
            highlightOpacity={highlightedMatch ? 0.65 : 0.5}
            onNeighborhoodClick={handleNeighborhoodClick("left")}
            onNeighborhoodHover={setHoveredName}
          />
        </div>

        {/* Center panel */}
        <div className="w-80 shrink-0 border-x border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <VibePanel
            selected={selected}
            matches={matches}
            targetCity={targetCityName}
            onMatchClick={handleMatchClick}
          />
        </div>

        {/* Right map */}
        <div className="flex-1">
          <CityMap
            city={CITIES[rightCity]}
            data={CITY_DATA[rightCity]}
            selectedNeighborhood={
              selectedSide === "right" ? selected?.properties.name ?? null : null
            }
            highlightedNeighborhood={
              selectedSide === "left"
                ? highlightedMatch ?? bestMatchName
                : hoveredName
            }
            highlightOpacity={highlightedMatch ? 0.65 : 0.5}
            onNeighborhoodClick={handleNeighborhoodClick("right")}
            onNeighborhoodHover={setHoveredName}
          />
        </div>
      </div>
    </div>
  );
}
