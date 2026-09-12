// Generation quality eval. Runs the real generation path against a set of books
// and scores each guide on structure completeness + a light accuracy spot-check.
//
//   AI_PROVIDER=groq GROQ_API_KEY=... npm run eval
//
// Not part of `npm test` — it makes real API calls and costs money. Use it when
// tuning the prompt (lib/ai/prompts.ts) or comparing models (GROQ_MODEL=...).

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getProvider, buildGenerationPrompt, extractJson } from "@/lib/ai";
import { normalizeGeneratedBook } from "@/lib/schemas";
import { slugify } from "@/lib/store";
import type { Book } from "@/lib/types";

interface Expect {
  title: string;
  author: string;
  year: string;
  category: "fiction" | "non-fiction";
}

const here = dirname(fileURLToPath(import.meta.url));
const cases: Expect[] = JSON.parse(await readFile(join(here, "books.json"), "utf-8"));

function structureScore(b: Book): { score: number; misses: string[] } {
  const checks: [boolean, string][] = [
    [b.overview.length > 120, "overview too short"],
    [b.summary.length >= 3, "< 3 summary paragraphs"],
    [b.chapters.length >= 4, "< 4 chapters"],
    [b.chapters.every((c) => c.summary.length > 10), "empty chapter summaries"],
    [b.lessons.length >= 3, "< 3 lessons"],
    [b.timeline.length >= 3, "< 3 timeline events"],
    [b.mindMap.some((n) => n.parent === null), "no mind-map root"],
    [b.mindMap.filter((n) => n.parent !== null).length >= 4, "< 4 mind-map branches"],
    [b.qa.length >= 3, "< 3 Q&A"],
    [b.category !== "fiction" || b.characters.length >= 3, "fiction with < 3 characters"],
  ];
  const misses = checks.filter(([ok]) => !ok).map(([, m]) => m);
  return { score: (checks.length - misses.length) / checks.length, misses };
}

function accuracyScore(b: Book, e: Expect): { score: number; misses: string[] } {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const checks: [boolean, string][] = [
    [norm(b.title).includes(norm(e.title).split(" ")[0]!), "title drift"],
    [norm(b.author).includes(norm(e.author.split(" ").pop()!)), `author: got "${b.author}"`],
    [b.year.includes(e.year) || b.year.includes(e.year.slice(0, 3)), `year: got "${b.year}"`],
    [b.category === e.category, `category: got "${b.category}"`],
  ];
  const misses = checks.filter(([ok]) => !ok).map(([, m]) => m);
  return { score: (checks.length - misses.length) / checks.length, misses };
}

const provider = await getProvider();
if (!provider) {
  console.error("No live AI provider. Set AI_PROVIDER + a key.");
  process.exit(1);
}
console.log(`Provider: ${provider.name}\n`);

let totalStruct = 0;
let totalAcc = 0;
let ok = 0;

for (const e of cases) {
  const slug = slugify(e.title);
  process.stdout.write(`• ${e.title.padEnd(28)} `);
  try {
    const raw = await provider.complete(buildGenerationPrompt(e.title), { json: true, temperature: 0.6 });
    const book = normalizeGeneratedBook(extractJson(raw), slug);
    const s = structureScore(book);
    const a = accuracyScore(book, e);
    totalStruct += s.score;
    totalAcc += a.score;
    const pass = s.score >= 0.8 && a.score >= 0.75;
    if (pass) ok += 1;
    console.log(
      `struct ${(s.score * 100).toFixed(0)}%  acc ${(a.score * 100).toFixed(0)}%  ${pass ? "PASS" : "FAIL"}`,
    );
    for (const m of [...s.misses, ...a.misses]) console.log(`    - ${m}`);
  } catch (err) {
    console.log(`ERROR — ${(err as Error).message}`);
  }
}

const n = cases.length;
console.log(
  `\n${ok}/${n} pass · avg structure ${((totalStruct / n) * 100).toFixed(0)}% · avg accuracy ${((totalAcc / n) * 100).toFixed(0)}%`,
);
process.exit(ok === n ? 0 : 1);
