/**
 * /api/lead-magnet — footer email capture for the Gear Smell Field Guide.
 *
 * Adds the email to a Klaviyo list (LEAD_MAGNET_LIST_ID) with consent and
 * tags the profile with `source=jockshock-field-guide` so the Klaviyo
 * welcome flow can fire and deliver the PDF link. The PDF itself is hosted
 * on Cloudinary; the URL is in the welcome flow template, not in this
 * endpoint, so we can swap the asset without redeploying.
 *
 * Env required (Vercel production):
 *   KLAVIYO_PRIVATE_API_KEY   - server-side key, scoped to Lists+Profiles
 *   KLAVIYO_LEAD_MAGNET_LIST_ID - the list id welcome flow listens on
 *
 * Pattern matches southland-inventory/src/lib/klaviyo.ts:
 *   - revision header 2024-02-15
 *   - Authorization: Klaviyo-API-Key <key>
 */
import type { APIRoute } from "astro";

const KLAVIYO_REVISION = "2024-02-15";
const KLAVIYO_API = "https://a.klaviyo.com/api";

interface LeadMagnetPayload {
  email: string;
  source?: string;
  persona?: string;
  /** Optional honeypot — bots fill this; humans don't see it. */
  company_website?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.KLAVIYO_PRIVATE_API_KEY;
  const listId = import.meta.env.KLAVIYO_LEAD_MAGNET_LIST_ID;

  if (!apiKey || !listId) {
    console.error("[lead-magnet] Klaviyo env not configured");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let data: LeadMagnetPayload;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Honeypot: bots fill `company_website`; silently drop without telling them.
  if (data.company_website && data.company_website.trim().length > 0) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const email = (data.email || "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: "Valid email required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const persona = data.persona || "aaron";
  const source = data.source || "jockshock-footer-field-guide";

  // Klaviyo Profile Subscription Bulk Create Job
  // https://developers.klaviyo.com/en/reference/subscribe_profiles
  const payload = {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        custom_source: source,
        profiles: {
          data: [
            {
              type: "profile",
              attributes: {
                email,
                properties: {
                  sub_brand: "jockshock",
                  jockshock_persona: persona,
                  jockshock_lead_source: source,
                  jockshock_lead_magnet: "gear-smell-field-guide",
                  jockshock_signup_at: new Date().toISOString(),
                },
                subscriptions: {
                  email: {
                    marketing: { consent: "SUBSCRIBED" },
                  },
                },
              },
            },
          ],
        },
      },
      relationships: {
        list: { data: { type: "list", id: listId } },
      },
    },
  };

  try {
    const r = await fetch(`${KLAVIYO_API}/profile-subscription-bulk-create-jobs/`, {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const errorText = await r.text();
      console.error("[lead-magnet] Klaviyo error:", r.status, errorText);
      // Don't 500 the user — let them see success even if Klaviyo's having a
      // moment, and we'll backfill from Sentry. Worst case: they don't get
      // the email; best case: it shows up a few minutes late.
      return new Response(JSON.stringify({ ok: true, queued: false }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: true, queued: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[lead-magnet] fetch error:", err);
    return new Response(JSON.stringify({ ok: true, queued: false }), { status: 200 });
  }
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ error: "POST only" }), {
    status: 405,
    headers: { "Content-Type": "application/json", Allow: "POST" },
  });
