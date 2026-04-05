"use client";

import {
  NeighborhoodProperties,
  VibeDimension,
  VIBE_LABELS,
  VIBE_COLORS,
} from "@/data/types";
import type { Feature, Polygon } from "geojson";

interface VibePanelProps {
  selected: Feature<Polygon, NeighborhoodProperties> | null;
  matches: {
    feature: Feature<Polygon, NeighborhoodProperties>;
    similarity: number;
  }[];
  targetCity: string;
  onMatchClick: (name: string) => void;
}

function VibeBar({ dimension, value }: { dimension: VibeDimension; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 text-xs text-zinc-500">{VIBE_LABELS[dimension]}</span>
      <div className="h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${value * 100}%`,
            backgroundColor: VIBE_COLORS[dimension],
          }}
        />
      </div>
      <span className="w-8 text-right text-xs text-zinc-400">
        {Math.round(value * 100)}
      </span>
    </div>
  );
}

export default function VibePanel({
  selected,
  matches,
  targetCity,
  onMatchClick,
}: VibePanelProps) {
  if (!selected) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-400">
        Click a neighborhood on either map to see its vibe profile and find
        matches in the other city.
      </div>
    );
  }

  const vibes = selected.properties.vibes;
  const sortedVibes = (Object.keys(vibes) as VibeDimension[]).sort(
    (a, b) => vibes[b] - vibes[a]
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {/* Selected neighborhood */}
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Selected
        </p>
        <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {selected.properties.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {selected.properties.description}
        </p>
      </div>

      {/* Vibe bars */}
      <div className="mb-4 space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Vibe Profile
        </p>
        {sortedVibes.map((dim) => (
          <VibeBar key={dim} dimension={dim} value={vibes[dim]} />
        ))}
      </div>

      {/* Matches */}
      {matches.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Best matches in {targetCity}
          </p>
          <div className="mt-2 space-y-2">
            {matches.slice(0, 4).map((m) => (
              <button
                key={m.feature.properties.name}
                onClick={() => onMatchClick(m.feature.properties.name)}
                className="w-full rounded-lg border border-zinc-200 p-3 text-left transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {m.feature.properties.name}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {Math.round(m.similarity * 100)}% match
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {m.feature.properties.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
