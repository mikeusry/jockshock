/**
 * /api/cart-event — server-side bridge from our buy-path events to Klaviyo.
 *
 * The point.dog pixel already fires on the client for the CDP. This route
 * mirrors specific cart events to Klaviyo so the abandon-cart flow has a
 * profile-attached event to fork on, even before the visitor reaches the
 * Shopify checkout page.
 *
 * Strategy:
 *   - Klaviyo's native Shopify integration is the workhorse for abandon-cart
 *     (it fires Started Checkout + Placed Order from Shopify's own events
 *     once the visitor reaches checkout). This route is the SUPPLEMENT —
 *     it captures earlier-funnel signal (viewed_product, added_to_cart,
 *     viewed_cart, started_checkout from our drawer) so the flow can
 *     include "you put something in the cart and didn't even click
 *     checkout" branches.
 *   - We only fire to Klaviyo when we can identify the profile by email
 *     (from a cookie set by the lead-magnet signup or persona pipeline).
 *     Anonymous events stay in point.dog only — no point pushing them to
 *     Klaviyo without a profile to attach them to.
 *
 * Env required (Vercel production):
 *   KLAVIYO_PRIVATE_API_KEY — same key used by /api/lead-magnet
 *
 * Note: client identifies via the `sl_email` cookie (set by lead-magnet
 * signup flow). If that cookie isn't present, we skip the Klaviyo POST and
 * return ok:true with attributed:false.
 */
import type { APIRoute } from "astro";

const KLAVIYO_REVISION = "2024-02-15";
const KLAVIYO_API = "https://a.klaviyo.com/api";

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
  const apiKey = import.meta.env.KLAVIYO_PRIVATE_API_KEY;

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

  // Resolve identity. Without an email we can't attach to a Klaviyo profile —
  // return ok:true so the client doesn't retry, but flag attributed:false.
  const email = readEmailFromCookie(request.headers.get("cookie"));
  if (!email) {
    return new Response(JSON.stringify({ ok: true, attributed: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!apiKey) {
    console.error("[cart-event] KLAVIYO_PRIVATE_API_KEY not configured");
    return new Response(JSON.stringify({ ok: true, attributed: false }), {
      status: 200,
    });
  }

  // Klaviyo Events API — POST /api/events/
  // https://developers.klaviyo.com/en/reference/create_event
  const metricName = ({
    viewed_product: "Viewed Product",
    added_to_cart: "Added to Cart",
    viewed_cart: "Viewed Cart",
    started_checkout: "Started Checkout",
  } as const)[data.event];

  const klaviyoPayload = {
    data: {
      type: "event",
      attributes: {
        properties: {
          ...(data.properties || {}),
          sub_brand: "jockshock",
        },
        time: new Date().toISOString(),
        metric: {
          data: {
            type: "metric",
            attributes: { name: metricName },
          },
        },
        profile: {
          data: {
            type: "profile",
            attributes: {
              email,
              properties: {
                sub_brand: "jockshock",
                jockshock_persona:
                  (data.properties?.persona as string | undefined) ?? "aaron",
              },
            },
          },
        },
      },
    },
  };

  try {
    const r = await fetch(`${KLAVIYO_API}/events/`, {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify(klaviyoPayload),
    });

    if (!r.ok) {
      const errorText = await r.text();
      console.error("[cart-event] Klaviyo error:", r.status, errorText);
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
