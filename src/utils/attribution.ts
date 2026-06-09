/**
 * Cross-origin attribution capture for JockShock.
 *
 * THE PROBLEM (same class as d2-attribution-two-origin-gap):
 * jockshockspray.com (Astro) and the Shopify checkout are DIFFERENT ORIGINS.
 * A Google Ads click lands on jockshockspray.com with ?gclid=…; if we don't
 * persist + carry that click id, it's gone by the time the buyer hits Shopify
 * checkout — so the order has no gclid, Nexus can't attribute the sale to the
 * Search campaign, and the Ads conversion upload has nothing to send. Spend
 * runs blind.
 *
 * THE FIX (mirrors southland-platform's working pattern):
 *   1. On landing, capture gclid/fbclid/utm_* from the URL into localStorage
 *      (last-touch overwrite + first-touch set-once). See BaseLayout.astro.
 *   2. When the cart is created, stamp those values as Shopify CART ATTRIBUTES
 *      (`_pd_*`). Cart attributes persist onto the order as note_attributes,
 *      which the Nexus order webhook reads via extractAttribution() to populate
 *      orders.gclid / utm_* — surviving the cross-origin checkout jump.
 *
 * This module owns step 2's read side + the localStorage write helpers.
 */

const LAST_TOUCH_KEY = "_pd_attribution";
const FIRST_TOUCH_KEY = "_pd_first_touch";

const PARAMS = [
  "gclid",
  "fbclid",
  "wbraid",
  "gbraid",
  "msclid",
  "ttclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

type AttributionData = Record<string, string>;

function readStore(key: string): AttributionData {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

/**
 * Capture attribution params from the current URL into localStorage.
 * Last-touch overwrites on every visit that carries params; first-touch is
 * set once and never overwritten. Call on every page load (BaseLayout).
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const found: AttributionData = {};
  let hasNew = false;
  for (const p of PARAMS) {
    const v = url.searchParams.get(p);
    if (v) {
      found[p] = v;
      hasNew = true;
    }
  }
  // srsltid fallback: Google Shopping clicks may arrive with only ?srsltid and
  // no utm/gclid — still mark as google/cpc so they don't read as "direct".
  const srsltid = url.searchParams.get("srsltid");
  if (srsltid && !found.utm_source) {
    found.utm_source = "google";
    found.utm_medium = found.utm_medium || "cpc";
    found.srsltid = srsltid;
    hasNew = true;
  }
  if (!hasNew) return;

  // Last-touch: merge over existing.
  const merged = {
    ...readStore(LAST_TOUCH_KEY),
    ...found,
    _timestamp: String(Date.now()),
  };
  try {
    localStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(merged));
  } catch {
    /* private-mode / quota — non-fatal */
  }

  // First-touch: set once, never overwrite.
  if (
    typeof localStorage !== "undefined" &&
    !localStorage.getItem(FIRST_TOUCH_KEY)
  ) {
    try {
      localStorage.setItem(
        FIRST_TOUCH_KEY,
        JSON.stringify({ ...found, _timestamp: String(Date.now()) }),
      );
    } catch {
      /* non-fatal */
    }
  }
}

/**
 * Build the Shopify cart-attribute list from stored attribution.
 * Last-touch → `_pd_<param>`, first-touch → `_pd_ft_<param>`. These are the
 * keys the Nexus order webhook's extractAttribution() looks for. Returns []
 * when nothing was captured (direct/organic) so cartCreate stays clean.
 */
export function getAttributionAttributes(): Array<{
  key: string;
  value: string;
}> {
  const out: Array<{ key: string; value: string }> = [];
  const last = readStore(LAST_TOUCH_KEY);
  for (const [k, v] of Object.entries(last)) {
    if (k.startsWith("_")) continue; // skip _timestamp
    if (v) out.push({ key: `_pd_${k}`, value: String(v) });
  }
  const first = readStore(FIRST_TOUCH_KEY);
  for (const [k, v] of Object.entries(first)) {
    if (k.startsWith("_")) continue;
    if (v) out.push({ key: `_pd_ft_${k}`, value: String(v) });
  }
  // Persona (sl_persona cookie) too, so the order carries the JockShock persona.
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|; )sl_persona=([^;]*)/);
    if (m) out.push({ key: "_pd_persona", value: decodeURIComponent(m[1]) });
  }
  // Shopify caps cart attributes; we're well under, but guard anyway.
  return out.slice(0, 25);
}
