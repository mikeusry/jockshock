/**
 * /api/lead-magnet — footer email capture for the Gear Smell Field Guide.
 *
 * Identifies the person in Customer.io and fires `field_guide_requested`,
 * which is what the JockShock Field Guide automation triggers on.
 *
 * ── Klaviyo is gone (2026-08-11, Nexus T-1175) ───────────────────────────────
 *
 * This endpoint used to write to Klaviyo list `XWVKzw` ("JockShock — Field
 * Guide Subscribers"). That list ran for 3 months with no flow behind it: at
 * cutover it held 6 profiles — 4 test accounts and 2 real people who got the
 * SendGrid confirmation below and nothing else, ever.
 *
 * JockShock shares the SOUTHLAND Customer.io workspace — it is a sub-brand, not
 * a separate account, so there is one set of credentials and one profile per
 * human. `sub_brand: "jockshock"` is what separates JockShock people from
 * Southland people. 🛑 Every JockShock segment MUST filter on it, or a
 * JockShock send goes to the entire Southland book.
 *
 * ── DELIVERY: the SendGrid confirmation is still load-bearing ────────────────
 *
 * The confirmation below is what actually puts the PDF in the inbox on submit.
 * The Customer.io automation adds the 3-email nurture on top (immediate / +3d /
 * +6d), but it is NOT what delivers the guide at signup — if
 * FIELD_GUIDE_PDF_URL is null, subscribers get nothing at the moment they ask.
 * Do not delete this on the assumption that the automation covers it.
 *
 * ── Event + attribute contract the automation depends on ─────────────────────
 *
 * Trigger event: `field_guide_requested`
 * Segment filter: attribute `sub_brand` equals `jockshock`
 *
 * `source` is passed by the caller, written to the `jockshock_lead_source`
 * attribute AND onto the event data. Only two values are ever sent:
 *   - `jockshock-footer-field-guide` — Footer.astro capture (also the default
 *     when `source` is omitted)
 *   - `jockshock-bottle-label-qr`    — label.astro QR landing
 * There is NO `jockshock-field-guide` value. A segment built on that string
 * matches nobody.
 *
 * ⚠️ Uses the TRACK credentials (site id + track api key, HTTP Basic against
 * track.customer.io) — NOT the App API bearer key, which is a different
 * credential against a different host and cannot identify or track.
 *
 * Env required (Vercel production, project `jockshock`):
 *   CUSTOMERIO_SITE_ID        - Track site id, Southland workspace
 *   CUSTOMERIO_TRACK_API_KEY  - Track api key, Southland workspace
 *   SENDGRID_API_KEY          - immediate confirmation with the PDF
 *
 * Pattern matches southland-inventory/src/lib/review-invite-event.ts:
 *   - Basic auth over `${siteId}:${apiKey}`
 *   - PUT /customers/:id to identify, THEN POST /customers/:id/events
 */
import type { APIRoute } from "astro";

const CIO_TRACK_API = "https://track.customer.io/api/v1/customers";
const SENDGRID_API = "https://api.sendgrid.com/v3/mail/send";

// Public Cloudinary URL of the Field Guide PDF (v6, 8pp, carries the
// FIELDGUIDE20 coupon on p8). Verified live 2026-08-11: HTTP 200,
// content-type application/pdf, content-length 6211174.
//
// Unversioned on purpose so a new revision swaps in without a redeploy — BUT
// the overwrite MUST pass `invalidate: true`. Cloudinary's CDN caches 404s:
// this URL was fetched before the asset existed, the negative got cached, and
// a later upload without invalidation kept serving that stale 404 for hours
// while the Admin API happily reported the asset as present. If this ever
// 404s again, suspect the CDN cache before you suspect the account settings.
const FIELD_GUIDE_PDF_URL: string | null =
  "https://res.cloudinary.com/southland-organics/image/upload/JockShock/gear-smell-field-guide.pdf";

/**
 * Immediate confirmation email via SendGrid — Aaron voice, deodorizer-only
 * (no kill-microbe / EPA / sanitize claims). Mirrors the teams-intake.ts
 * SendGrid pattern. Fire-and-forget: a failure here never fails the signup
 * (Customer.io already has the profile), it's just logged.
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
  const siteId = import.meta.env.CUSTOMERIO_SITE_ID;
  const trackKey = import.meta.env.CUSTOMERIO_TRACK_API_KEY;

  if (!siteId || !trackKey) {
    console.error("[lead-magnet] Customer.io env not configured");
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

  // Customer.io is identify-then-track, in that order and never merged:
  //   1. PUT /customers/:id  — upsert the profile with attributes
  //   2. POST /customers/:id/events — fire the automation trigger
  // Order matters. An event on a profile Customer.io has never seen creates a
  // stub with no email address, and the automation has nothing to send to.
  //
  // ⚖️ Deliberately does NOT set `unsubscribed: false`. Someone who previously
  // opted out of Southland marketing stays opted out — this form is not consent
  // to re-subscribe them across the whole workspace.
  const auth = Buffer.from(`${siteId}:${trackKey}`).toString("base64");
  const id = encodeURIComponent(email);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
  };

  try {
    const identify = await fetch(`${CIO_TRACK_API}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        email,
        // 🛑 The segment filter. Without this the JockShock automation cannot
        // tell a JockShock signup from a Southland customer.
        sub_brand: "jockshock",
        jockshock_persona: persona,
        jockshock_lead_source: source,
        jockshock_lead_magnet: "gear-smell-field-guide",
        // Customer.io convention is unix seconds for timestamp attributes;
        // an ISO string sorts as text and breaks date filters in segments.
        jockshock_signup_at: Math.floor(Date.now() / 1000),
      }),
    });

    if (!identify.ok) {
      const errorText = await identify.text();
      console.error(
        "[lead-magnet] Customer.io identify error:",
        identify.status,
        errorText,
      );
      // Still send the guide — the person asked for it and the delivery path
      // below does not depend on Customer.io.
      const sent = await sendConfirmation(email);
      return new Response(
        JSON.stringify({ ok: true, queued: false, emailed: sent }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Fire the trigger. `field_guide_requested` is what the automation listens
    // on.
    //
    // 🛑 No `id` (dedupe key) on purpose. Re-submitting SHOULD re-enter the
    // person — someone who lost the PDF and signs up again expects it back.
    // Customer.io's own re-entry setting on the automation is where that gets
    // limited, not here.
    const track = await fetch(`${CIO_TRACK_API}/${id}/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "field_guide_requested",
        data: {
          source,
          persona,
          sub_brand: "jockshock",
          lead_magnet: "gear-smell-field-guide",
          // The automation renders the download button from this, so a future
          // PDF move only has to change the constant above.
          pdf_url: FIELD_GUIDE_PDF_URL || "",
        },
      }),
    });

    if (!track.ok) {
      const errorText = await track.text();
      console.error(
        "[lead-magnet] Customer.io track error:",
        track.status,
        errorText,
      );
      // Profile exists from step 1, so this is recoverable by re-firing the
      // event from a segment. Still deliver the guide now.
      const sent = await sendConfirmation(email);
      return new Response(
        JSON.stringify({ ok: true, queued: false, emailed: sent }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Immediate SendGrid thank-you with the guide. Independent of the
    // Customer.io automation (which may lag) — guarantees the reader gets a
    // response now.
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
