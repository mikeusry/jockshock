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
const SENDGRID_API = "https://api.sendgrid.com/v3/mail/send";

// Public Cloudinary URL of the Field Guide PDF. The PDF asset does NOT exist
// yet (verified 2026-06-09: Cloudinary returns 404, no raw asset). Until
// Joseph produces it and uploads to JockShock/gear-smell-field-guide.pdf,
// leave this null — the confirmation email omits the download button and sends
// an honest "your guide is on the way" instead of linking a dead PDF. Set the
// URL string here the moment the asset is live; the email upgrades itself.
const FIELD_GUIDE_PDF_URL: string | null = null;

/**
 * Immediate confirmation email via SendGrid — Aaron voice, deodorizer-only
 * (no kill-microbe / EPA / sanitize claims). Mirrors the teams-intake.ts
 * SendGrid pattern. Fire-and-forget: a failure here never fails the signup
 * (Klaviyo already has the profile), it's just logged.
 */
async function sendConfirmation(email: string): Promise<boolean> {
  const sendgridKey = import.meta.env.SENDGRID_API_KEY;
  if (!sendgridKey) {
    console.error(
      "[lead-magnet] SENDGRID_API_KEY not configured — skipping confirmation email",
    );
    return false;
  }

  // The guide block depends on whether the PDF asset exists yet.
  const guideBlock = FIELD_GUIDE_PDF_URL
    ? `<p style="margin:24px 0;">
        <a href="${FIELD_GUIDE_PDF_URL}"
           style="background:#FFE500;color:#111;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;">
          Download the Field Guide (PDF)
        </a>
      </p>`
    : `<p style="font-size:15px;line-height:1.5;">
        We're putting the finishing touches on it — your copy lands in this
        inbox within a couple of days. Keep an eye out.
      </p>`;

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;color:#111;">
      <h1 style="font-size:22px;margin:0 0 12px;">You're on the list for the Gear Smell Field Guide.</h1>
      <p style="font-size:15px;line-height:1.5;">
        It breaks down why gear, shoes, and feet actually smell — and the
        routine that goes after it at the source instead of masking it.
      </p>
      ${guideBlock}
      <p style="font-size:15px;line-height:1.5;">
        When you're ready to handle the funk for real:
        <a href="https://www.jockshockspray.com/products/jockshock/" style="color:#111;font-weight:600;">grab a bottle</a>.
      </p>
      <p style="font-size:13px;color:#666;margin-top:28px;">
        JockShock — a Southland Organics brand. 189 Luke Road, Bogart, GA 30622.
      </p>
    </div>`;

  const payload = {
    personalizations: [
      { to: [{ email }], subject: "Your Gear Smell Field Guide is here 🏒" },
    ],
    from: { email: "noreply@southlandorganics.com", name: "JockShock" },
    reply_to: { email: "hello@southlandorganics.com", name: "JockShock" },
    content: [{ type: "text/html", value: html }],
  };

  try {
    const r = await fetch(SENDGRID_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error("[lead-magnet] SendGrid error:", r.status, await r.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[lead-magnet] SendGrid fetch error:", err);
    return false;
  }
}

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
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
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

  // Klaviyo's bulk-subscription endpoint does NOT accept `properties` on the
  // profile (returns 400 "properties is not a valid field"). So this is a
  // two-step dance:
  //   1. POST /profile-import/ — upsert profile with the custom properties
  //   2. POST /profile-subscription-bulk-create-jobs/ — subscribe the profile
  //      to the list with consent
  // Doing them in this order matters: the profile + properties are always
  // created. The subscribe step is what feeds the welcome flow trigger; if
  // it fails we still have the profile, so worst case we can backfill via
  // a Klaviyo segment + flow re-trigger.
  const profileProperties = {
    sub_brand: "jockshock",
    jockshock_persona: persona,
    jockshock_lead_source: source,
    jockshock_lead_magnet: "gear-smell-field-guide",
    jockshock_signup_at: new Date().toISOString(),
  };

  const baseHeaders = {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    revision: KLAVIYO_REVISION,
  };

  // Step 1: upsert profile with custom properties.
  const profilePayload = {
    data: {
      type: "profile",
      attributes: { email, properties: profileProperties },
    },
  };

  try {
    const profRes = await fetch(`${KLAVIYO_API}/profile-import/`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(profilePayload),
    });
    if (!profRes.ok) {
      const errorText = await profRes.text();
      console.error(
        "[lead-magnet] Klaviyo profile-import error:",
        profRes.status,
        errorText,
      );
      // Continue to subscribe anyway — we'd rather have an unsubscribed
      // profile with properties than fail the whole request.
    }

    // Step 2: subscribe to the list (no properties on the inner profile here —
    // those are already set in step 1 by email match).
    const subPayload = {
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
                  subscriptions: {
                    email: { marketing: { consent: "SUBSCRIBED" } },
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

    const subRes = await fetch(
      `${KLAVIYO_API}/profile-subscription-bulk-create-jobs/`,
      {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify(subPayload),
      },
    );

    if (!subRes.ok) {
      const errorText = await subRes.text();
      console.error(
        "[lead-magnet] Klaviyo subscribe error:",
        subRes.status,
        errorText,
      );
      // Don't 500 the user — profile may still have been imported in step 1.
      // Still send the confirmation so they get the guide regardless.
      const sent = await sendConfirmation(email);
      return new Response(
        JSON.stringify({ ok: true, queued: false, emailed: sent }),
        { status: 200 },
      );
    }

    // Immediate SendGrid thank-you with the guide. Independent of the Klaviyo
    // welcome flow (which may lag) — guarantees the reader gets a response now.
    const sent = await sendConfirmation(email);

    return new Response(
      JSON.stringify({ ok: true, queued: true, emailed: sent }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[lead-magnet] fetch error:", err);
    return new Response(JSON.stringify({ ok: true, queued: false }), {
      status: 200,
    });
  }
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ error: "POST only" }), {
    status: 405,
    headers: { "Content-Type": "application/json", Allow: "POST" },
  });
