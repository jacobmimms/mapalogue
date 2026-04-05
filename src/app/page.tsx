import Link from "next/link";

const CITIES = [
  { name: "Stockholm", country: "SE", emoji: "🇸🇪", neighborhoods: 19 },
  { name: "Barcelona", country: "ES", emoji: "🇪🇸", neighborhoods: 10 },
];

const VIBE_TAGS = [
  { label: "Artsy", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { label: "Nightlife", color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" },
  { label: "Upscale", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  { label: "Touristy", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { label: "Working Class", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { label: "Financial", color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200" },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Hero */}
      <header className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
          City Vibe Translator
        </p>
        <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
          Mapalogue
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          You know the vibes of your city. We translate them to cities you
          haven&apos;t explored yet. Pick two cities, see which neighborhoods match.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/explore"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Explore the Map
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            How It Works
          </a>
        </div>
      </header>

      {/* City cards */}
      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <h2 className="mb-8 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          POC Cities
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {CITIES.map((city) => (
            <div
              key={city.name}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{city.emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {city.name}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {city.neighborhoods} neighborhoods mapped
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vibe tags */}
      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <h2 className="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Vibe Dimensions
        </h2>
        <p className="mb-8 text-center text-zinc-500">
          Each neighborhood is scored across these dimensions, then matched to
          similar neighborhoods in other cities.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {VIBE_TAGS.map((tag) => (
            <span
              key={tag.label}
              className={`rounded-full px-4 py-2 text-sm font-medium ${tag.color}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto w-full max-w-4xl px-6 py-12"
      >
        <h2 className="mb-8 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          How It Works
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Pick your home city",
              desc: "Choose a city you know well. See its neighborhoods and their vibe profiles.",
            },
            {
              step: "2",
              title: "Select a destination",
              desc: "Pick a city you're visiting. We score neighborhoods using POI data from OpenStreetMap.",
            },
            {
              step: "3",
              title: "See the matches",
              desc: 'Click any neighborhood to find its "vibe equivalent" in the other city.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 px-6 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        Mapalogue — POC. Data from OpenStreetMap via Overpass API.
      </footer>
    </div>
  );
}
