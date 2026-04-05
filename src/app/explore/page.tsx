"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import CityMap from "@/components/CityMap";
import VibePanel from "@/components/VibePanel";
import {
  CityConfig,
  NeighborhoodProperties,
  loadCities,
} from "@/data/types";
import { findMatches } from "@/data/matching";
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";

type CityData = FeatureCollection<Polygon | MultiPolygon, NeighborhoodProperties>;

export default function ExplorePage() {
  const [cities, setCities] = useState<Record<string, CityConfig> | null>(null);
  const [cityKeys, setCityKeys] = useState<string[]>([]);
  const [leftCity, setLeftCity] = useState<string>("");
  const [rightCity, setRightCity] = useState<string>("");
  const [leftData, setLeftData] = useState<CityData | null>(null);
  const [rightData, setRightData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Feature<
    Polygon | MultiPolygon,
    NeighborhoodProperties
  > | null>(null);
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [highlightedMatch, setHighlightedMatch] = useState<string | null>(null);

  // Load cities index on mount
  useEffect(() => {
    loadCities().then((c) => {
      setCities(c);
      const keys = Object.keys(c);
      setCityKeys(keys);
      if (keys.length >= 2) {
        setLeftCity(keys[0]);
        setRightCity(keys[1]);
      }
    });
  }, []);

  // Load city data when selection changes
  useEffect(() => {
    if (!leftCity) return;
    setLoading(true);
    fetch(`/data/${leftCity}/city.json`)
      .then((r) => r.json())
      .then((d) => {
        setLeftData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [leftCity]);

  useEffect(() => {
    if (!rightCity) return;
    fetch(`/data/${rightCity}/city.json`)
      .then((r) => r.json())
      .then(setRightData);
  }, [rightCity]);

  const matches = useMemo(() => {
    if (!selected || !selectedSide || !leftData || !rightData) return [];
    const targetFeatures =
      selectedSide === "left" ? rightData.features : leftData.features;
    return findMatches(
      selected as Feature<Polygon, NeighborhoodProperties>,
      targetFeatures as Feature<Polygon, NeighborhoodProperties>[]
    );
  }, [selected, selectedSide, leftData, rightData]);

  const targetCityName =
    cities && selectedSide
      ? selectedSide === "left"
        ? cities[rightCity]?.name
        : cities[leftCity]?.name
      : "";

  const handleNeighborhoodClick = useCallback(
    (side: "left" | "right") =>
      (feature: Feature<Polygon, NeighborhoodProperties>) => {
        setSelected(feature as Feature<Polygon | MultiPolygon, NeighborhoodProperties>);
        setSelectedSide(side);
        setHighlightedMatch(null);
      },
    []
  );

  const handleMatchClick = useCallback((name: string) => {
    setHighlightedMatch(name);
  }, []);

  const handleSwap = useCallback(() => {
    const l = leftCity;
    setLeftCity(rightCity);
    setRightCity(l);
    setSelected(null);
    setSelectedSide(null);
    setHighlightedMatch(null);
  }, [leftCity, rightCity]);

  if (!cities || !leftData || !rightData || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
        <p className="text-zinc-500">Loading city data...</p>
      </div>
    );
  }

  const bestMatchName =
    matches.length > 0 ? matches[0].feature.properties.name : null;

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
              setLeftCity(e.target.value);
              setSelected(null);
            }}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {cityKeys.map((key) => (
              <option key={key} value={key}>
                {cities[key].name}
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
              setRightCity(e.target.value);
              setSelected(null);
            }}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {cityKeys.map((key) => (
              <option key={key} value={key}>
                {cities[key].name}
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
            city={cities[leftCity]}
            data={leftData as FeatureCollection<Polygon, NeighborhoodProperties>}
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
            selected={selected as Feature<Polygon, NeighborhoodProperties> | null}
            matches={matches}
            targetCity={targetCityName}
            onMatchClick={handleMatchClick}
          />
        </div>

        {/* Right map */}
        <div className="flex-1">
          <CityMap
            city={cities[rightCity]}
            data={rightData as FeatureCollection<Polygon, NeighborhoodProperties>}
            selectedNeighborhood={
              selectedSide === "right"
                ? selected?.properties.name ?? null
                : null
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
