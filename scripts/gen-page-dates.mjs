#!/usr/bin/env node
/**
 * Generates src/data/page-dates.json — the <lastmod> source for /sitemap.xml.
 *
 * WHY THIS EXISTS: the sitemap route runs at request time on Cloudflare, where
 * there is no filesystem and no git. So the dates have to be resolved at BUILD
 * time and baked into a module the route can import.
 *
 * WHY GIT AND NOT mtime: a fresh CI checkout gives every file the same mtime
 * (clone time), which would stamp all 21 URLs with one identical date — worse
 * than emitting nothing, because it tells Google every page changed at once.
 * The last commit that touched a page is the honest answer to "when did this
 * page last change".
 *
 * FALLBACK: if git is unavailable (shallow clone with no history, tarball
 * deploy), we emit an empty map and the sitemap simply omits <lastmod> — the
 * same behavior as before this script existed. An absent lastmod is a
 * non-signal; a wrong one is a bad signal. Never guess a date.
 *
 * Run automatically via the `prebuild` npm script.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES_DIR = join(ROOT, "src/pages");
const OUT = join(ROOT, "src/data/page-dates.json");

/** Recursively collect every .astro file under src/pages. */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".astro")) out.push(full);
  }
  return out;
}

/**
 * Last commit date for a path, as YYYY-MM-DD.
 * Returns null when git can't answer — no history, untracked, or no git at all.
 */
function lastCommitDate(file) {
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", relative(ROOT, file)],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    return iso ? iso.slice(0, 10) : null;
  } catch {
    return null;
  }
}

const dates = {};
let resolved = 0;
let missing = 0;

for (const file of walk(PAGES_DIR)) {
  // Key by path relative to src/pages, matching the route glob keys in
  // sitemap.xml.ts (e.g. "learn/get-smell-out-of-cleats/index.astro").
  const key = relative(PAGES_DIR, file).split("\\").join("/");
  const date = lastCommitDate(file);
  if (date) {
    dates[key] = date;
    resolved++;
  } else {
    missing++;
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(dates, null, 2) + "\n");

console.log(
  `[gen-page-dates] ${resolved} page dates resolved` +
    (missing ? `, ${missing} without git history (lastmod omitted for those)` : ""),
);
