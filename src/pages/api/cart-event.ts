/**
 * /api/cart-event — server-side bridge from our buy-path events to Customer.io.
 *
 * The point.dog pixel already fires on the client for the CDP. This route
 * mirrors specific cart events to Customer.io so an abandon-cart automation has
 * a profile-attached event to fork on, even before the visitor reaches the
 * Shopify checkout page.
 *
 * ── Klaviyo is gone (2026-08-11, Nexus T-1175) ───────────────────────────────
 *
 * Migrated with /api/lead-magnet. The old strategy note here said Klaviyo's
 * native Shopify integration was "the workhorse for abandon-cart" and this
 * route was the supplement. That workhorse no longer exists on this rail —
 * ⚠️ nothing in Customer.io currently listens to these four events. Emitting
 * them is deliberate (they are the raw material for the automation, and losing
 * three months of signal the way the field-guide list did is the failure mode
 * being avoided) but do NOT assume an abandon-cart automation is running just
 * because this route returns attributed:true.
 *
 * Nexus already owns the authoritative `checkout_started` event for Southland
 * (src/lib/checkout-event.ts, automation 38). These JockShock storefront events
 * are earlier-funnel than that and land on the same profile in the same shared
 * workspace — `sub_brand: "jockshock"` is what keeps them separable.
 *
 * Strategy:
 *   - Captures earlier-funnel signal (viewed_product, added_to_cart,
 *     viewed_cart, started_checkout from our drawer) so an automation can
 *     include "you put something in the cart and didn't even click checkout"
 *     branches.
 *   - We only fire when we can identify the profile by email (from a cookie
 *     set by the lead-magnet signup or persona pipeline). Anonymous events stay
 *     in point.dog only — no point pushing them without a profile to attach to.
 *
 * ⚠️ Uses the TRACK credentials (site id + track api key, HTTP Basic against
 * track.customer.io) — NOT the App API bearer key.
 *
 * Env required (Vercel production):
 *   CUSTOMERIO_SITE_ID       — same pair used by /api/lead-magnet
 *   CUSTOMERIO_TRACK_API_KEY
 *
 * Note: client identifies via the `sl_email` cookie (set by lead-magnet
 * signup flow). If that cookie isn't present, we skip the POST and return
 * ok:true with attributed:false.
 */
import type { APIRoute } from "astro";

const CIO_TRACK_API = "https://track.customer.io/api/v1/customers";

const ALLOWED_EVENTS = new Set([
  "viewed_product",
  "added_to_cart",
  "viewed_cart",
  "started_checkout",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CartEventPayload {
  event: string;
  properties: Record<string, unknown>;
}

function readEmailFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(/(?:^|;\s*)sl_email=([^;]+)/);
  if (!m) return null;
  try {
    const decoded = decodeURIComponent(m[1]).toLowerCase().trim();
    return EMAIL_RE.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const siteId = import.meta.env.CUSTOMERIO_SITE_ID;
  const trackKey = import.meta.env.CUSTOMERIO_TRACK_API_KEY;

  let data: CartEventPayload;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!data.event || !ALLOWED_EVENTS.has(data.event)) {
    return new Response(JSON.stringify({ error: "Invalid event name" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Resolve identity. Without an email we can't attach to a profile — return
  // ok:true so the client doesn't retry, but flag attributed:false.
  const email = readEmailFromCookie(request.headers.get("cookie"));
  if (!email) {
    return new Response(JSON.stringify({ ok: true, attributed: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!siteId || !trackKey) {
    console.error("[cart-event] Customer.io env not configured");
    return new Response(JSON.stringify({ ok: true, attributed: false }), {
      status: 200,
    });
  }

  // 🛑 Do NOT identify here. This route fires on browsing behaviour, and a PUT
  // would create a Customer.io profile for anyone whose sl_email cookie is set
  // — including people who never consented to marketing. The lead-magnet form
  // is where a profile gets created, deliberately and with consent. If the
  // profile does not exist yet, Customer.io drops the event, which is correct.
  const auth = Buffer.from(`${siteId}:${trackKey}`).toString("base64");
  const id = encodeURIComponent(email);

  try {
    const r = await fetch(`${CIO_TRACK_API}/${id}/events`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Customer.io event names are the trigger string verbatim — snake_case
        // as passed, no Title Case mapping the way Klaviyo metrics used.
        name: data.event,
        data: {
          ...(data.properties || {}),
          sub_brand: "jockshock",
          persona: (data.properties?.persona as string | undefined) ?? "aaron",
        },
      }),
    });

    if (!r.ok) {
      const errorText = await r.text();
      console.error("[cart-event] Customer.io error:", r.status, errorText);
      return new Response(JSON.stringify({ ok: true, attributed: false }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ ok: true, attributed: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[cart-event] fetch error:", err);
    return new Response(JSON.stringify({ ok: true, attributed: false }), {
      status: 200,
    });
  }
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ error: "POST only" }), {
    status: 405,
    headers: { "Content-Type": "application/json", Allow: "POST" },
  });
