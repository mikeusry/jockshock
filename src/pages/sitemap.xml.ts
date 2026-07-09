/**
 * /sitemap.xml — JockShock's sitemap, generated dynamically from the page routes.
 *
 * WHY: The old sitemap was a hand-maintained static file (public/sitemap.xml) that
 * listed only 4 URLs (/, /products/jockshock/, /parents/, /teams/). The entire
 * /learn/ hub-and-spoke cluster (hub + 8 spokes) plus /founders/ + the legal pages
 * were live, internally linked, and indexable — but absent from the sitemap, so
 * Google was never told about our best SEO assets. GSC showed 0 impressions.
 *
 * This site is `output: "server"` with no prerendered pages, so @astrojs/sitemap
 * would emit an empty sitemap (it only sees statically built routes). Instead we
 * enumerate the real .astro routes at request time via import.meta.glob and map
 * them to clean, trailing-slash URLs. New /learn/ spokes are picked up
 * automatically — the sitemap can never go stale again.
 *
 * Mirrors the dynamic-XML-endpoint pattern already used by
 * src/pages/api/google-shopping-feed.xml.ts.
 */
import type { APIRoute } from "astro";

const SITE = "https://www.jockshockspray.com";

// Every .astro page under src/pages. Eager so we just need the keys (route paths),
// not the modules themselves.
const PAGE_MODULES = import.meta.glob("./**/*.astro", { eager: true });

// Routes that must never appear in the sitemap: dynamic params, internal/dev
// surfaces, error pages, API/admin. The QR label lander (/label) and the Shopify
// dev demo are internal-only, not organic-search surfaces.
const EXCLUDE = [
  /(^|\/)404$/,
  /(^|\/)admin(\/|$)/,
  /(^|\/)api(\/|$)/,
  /\[/, // dynamic routes, e.g. products/[...handle]
  /(^|\/)label$/,
  /(^|\/)shopify-demo$/,
];

// changefreq + priority by route. Anything not listed falls back to DEFAULT.
const DEFAULT = { changefreq: "monthly", priority: "0.5" };
const ROUTE_META: Record<string, { changefreq: string; priority: string }> = {
  "/": { changefreq: "weekly", priority: "1.0" },
  "/products/jockshock/": { changefreq: "weekly", priority: "0.9" },
  "/learn/": { changefreq: "weekly", priority: "0.8" },
  "/parents/": { changefreq: "monthly", priority: "0.7" },
  "/teams/": { changefreq: "monthly", priority: "0.7" },
  "/founders/": { changefreq: "monthly", priority: "0.6" },
};
// /learn/* spokes: cornerstone content, refreshed as the cluster grows.
const SPOKE_META = { changefreq: "monthly", priority: "0.7" };
// Legal/utility pages: indexable (footer-linked) but low priority.
const UTILITY_META = { changefreq: "yearly", priority: "0.3" };
const UTILITY_ROUTES = new Set([
  "/privacy/",
  "/terms/",
  "/shipping/",
  "/returns/",
]);

/** "./learn/get-smell-out-of-cleats/index.astro" -> "/learn/get-smell-out-of-cleats/" */
function globKeyToRoute(key: string): string | null {
  // strip leading "./" and trailing ".astro"
  let path = key.replace(/^\.\//, "").replace(/\.astro$/, "");
  // index files map to their directory
  path = path.replace(/(^|\/)index$/, "$1");
  if (EXCLUDE.some((re) => re.test(path))) return null;
  // normalize to leading + trailing slash
  const route = "/" + path;
  return route.endsWith("/") ? route : route + "/";
}

function metaFor(route: string) {
  if (ROUTE_META[route]) return ROUTE_META[route];
  if (UTILITY_ROUTES.has(route)) return UTILITY_META;
  if (route.startsWith("/learn/")) return SPOKE_META;
  return DEFAULT;
}

export const GET: APIRoute = () => {
  const routes = Array.from(
    new Set(
      Object.keys(PAGE_MODULES)
        .map(globKeyToRoute)
        .filter((r): r is string => r !== null),
    ),
  ).sort();

  const urls = routes
    .map((route) => {
      const { changefreq, priority } = metaFor(route);
      return `  <url>
    <loc>${SITE}${route}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
