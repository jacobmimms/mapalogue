import { queryOverpass } from "./lib/overpass.js";

async function main() {
  const city = process.argv[2] || "Stockholm";
  const query = `
[out:json][timeout:120];
area["name"="${city}"]["admin_level"~"^[47]$"]->.city;
(
  rel(area.city)["boundary"="administrative"]["admin_level"~"^(8|9|10|11)$"];
);
out tags;
`;
  const raw = (await queryOverpass(query)) as {
    elements: Array<{ tags?: Record<string, string> }>;
  };
  const levels: Record<string, string[]> = {};
  for (const el of raw.elements) {
    const lvl = el.tags?.admin_level || "unknown";
    const name = el.tags?.name || "unnamed";
    if (!levels[lvl]) levels[lvl] = [];
    levels[lvl].push(name);
  }
  for (const [lvl, names] of Object.entries(levels).sort()) {
    console.log(
      `Level ${lvl} (${names.length}): ${names.slice(0, 10).join(", ")}${names.length > 10 ? "..." : ""}`
    );
  }
}

main();
