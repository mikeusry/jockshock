/**
 * /api/lead-magnet — email capture. Two offers, one route.
 *
 * Identifies the person in Customer.io, then fires the trigger event the
 * matching automation listens on.
 *
 * ── The two offers ───────────────────────────────────────────────────────────
 *
 * | source                       | event                          | PDF? |
 * |------------------------------|--------------------------------|------|
 * | jockshock-footer-field-guide | field_guide_requested          | yes  |
 * | jockshock-bottle-label-qr    | field_guide_requested          | yes  |
 * | jockshock-firefighters       | firefighter_discount_requested | no   |
 *
 * `source` is the ONLY thing that distinguishes them. The fire-service lander
 * (/firefighters) sends the third value; everything else defaults to the
 * Field Guide. 🛑 The firefighter automation MUST trigger on
 * `firefighter_discount_requested` — segmenting on `field_guide_requested`
 * drops firefighters into the guide nurture and sends them a youth-sports PDF.
 *
 * The fire-service offer skips the SendGrid confirmation entirely: its
 * deliverable is the discount code, which Customer.io sends.
 *
 * Each signup mints its own single-use Shopify code — 20% for the Field Guide,
 * 10% for fire service — written to the profile as `jockshock_discount_code`.
 * See `mintDiscountCode`. Coupons are created in Shopify directly; no other
 * system owns discount logic.
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
 * Trigger event: `field_guide_requested` / `firefighter_discount_requested`
 * Segment filter: attribute `sub_brand` equals `jockshock`
 *
 * `source` is passed by the caller, written to the `jockshock_lead_source`
 * attribute AND onto the event data. Only three values are ever sent:
 *   - `jockshock-footer-field-guide` — Footer.astro capture (also the default
 *     when `source` is omitted)
 *   - `jockshock-bottle-label-qr`    — label.astro QR landing
 *   - `jockshock-firefighters`       — firefighters.astro fire-service form
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
 *   SHOPIFY_SHOP              - e.g. southland-organics.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN       - Admin API token; needed to mint discount codes
 *                               (the Storefront token is read-only and has no
 *                               discount mutation at all)
 *
 * Pattern matches southland-inventory/src/lib/review-invite-event.ts:
 *   - Basic auth over `${siteId}:${apiKey}`
 *   - PUT /customers/:id to identify, THEN POST /customers/:id/events
 */
import type { APIRoute } from "astro";

const CIO_TRACK_API = "https://track.customer.io/api/v1/customers";
const SENDGRID_API = "https://api.sendgrid.com/v3/mail/send";

// Public Cloudinary URL of the Field Guide PDF. Verified live 2026-08-11:
// HTTP 200, content-type application/pdf, content-length 6211174.
//
// 🛑 The PDF served here is still v6, which PRINTS "FIELDGUIDE20" on page 8 —
// but that code no longer exists: its Shopify price rule was deleted
// 2026-08-11 (unlimited uses, no expiry, 0 redemptions at deletion). Anyone
// typing it at checkout gets nothing. v7 removes the block from the page;
// until it lands, page 8 advertises a dead code. That is the intended state —
// a dead code is strictly better than a live shared one. Discounts are now
// minted per signup, one use each (see mintDiscountCode below).
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
async function sendConfirmation(
  email: string,
  isFirefighter = false,
): Promise<boolean> {
  // The fire-service offer is a discount code, not the guide. Customer.io's
  // firefighter automation owns that send — this SendGrid confirmation would
  // put an unrelated PDF in their inbox. Gate at the top so every call site is
  // covered, including the two error paths.
  if (isFirefighter) return false;

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

/**
 * Mint a single-use percentage discount code directly in Shopify.
 *
 * 🛑 COUPONS ARE A SHOPIFY CONCERN. This used to POST to a Nexus endpoint
 * (`/api/jockshock-field-guide-discount`) purely because Nexus happened to hold
 * the Shopify admin token — an accident of credential placement, not a design.
 * It also hardcoded 20%, so the fire-service offer inherited the Field Guide's
 * discount. Nexus is an inventory/ops system and owns no discount logic; the
 * percentage now travels with the offer.
 *
 * Two calls, because Shopify's REST discount model is two objects:
 *   1. POST /price_rules            — the rule (who/what/how much)
 *   2. POST /price_rules/:id/discount_codes — the code string itself
 *
 * The code is then written onto the Customer.io profile as
 * `jockshock_discount_code`, which is what the automation emails print.
 *
 * 🛑 Fire-and-forget. A discount failure must NEVER cost us the signup — the
 * person asked for the guide (or the code) and the profile already exists.
 * Both automations wrap their code block in `{% if %}`, so a profile with no
 * code renders no block rather than a broken one.
 */
async function mintDiscountCode(
  email: string,
  percent: number,
  siteId: string,
  trackKey: string,
): Promise<void> {
  const shop = import.meta.env.SHOPIFY_SHOP;
  const adminToken = import.meta.env.SHOPIFY_ADMIN_TOKEN;
  if (!shop || !adminToken) {
    console.error("[lead-magnet] SHOPIFY_ADMIN_TOKEN/SHOP not configured — skipping mint");
    return;
  }

  // Unambiguous alphabet — no O/0/I/1, since people retype these from an email.
  const suffix = Array.from({ length: 8 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)),
  ).join("");
  const code = `JS-${suffix}`;

  const api = `https://${shop}/admin/api/2025-04`;
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": adminToken,
  };

  try {
    // 30-day window matches what both emails promise.
    const endsAt = new Date(Date.now() + 30 * 86_400_000).toISOString();

    const ruleRes = await fetch(`${api}/price_rules.json`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        price_rule: {
          title: `JockShock ${percent}% (${code})`,
          target_type: "line_item",
          target_selection: "all",
          allocation_method: "across",
          value_type: "percentage",
          value: `-${percent}`,
          customer_selection: "all",
          // usage_limit 1 is what makes the code single-use — without it a
          // forwarded code is a public discount.
          usage_limit: 1,
          starts_at: new Date().toISOString(),
          ends_at: endsAt,
        },
      }),
    });
    if (!ruleRes.ok) {
      console.error("[lead-magnet] price rule failed:", ruleRes.status, await ruleRes.text());
      return;
    }
    const { price_rule: rule } = await ruleRes.json();

    const codeRes = await fetch(`${api}/price_rules/${rule.id}/discount_codes.json`, {
      method: "POST",
      headers,
      body: JSON.stringify({ discount_code: { code } }),
    });
    if (!codeRes.ok) {
      console.error("[lead-magnet] discount code failed:", codeRes.status, await codeRes.text());
      // Orphaned rule with no code — harmless, but clean it up so the Shopify
      // discounts list doesn't fill with unusable rules.
      await fetch(`${api}/price_rules/${rule.id}.json`, { method: "DELETE", headers }).catch(
        () => {},
      );
      return;
    }

    // Write it back to the profile so the automation can print it.
    const auth = Buffer.from(`${siteId}:${trackKey}`).toString("base64");
    await fetch(`${CIO_TRACK_API}/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ jockshock_discount_code: code }),
    });

    console.log(`[lead-magnet] minted ${code} (${percent}%) for ${email}`);
  } catch (err) {
    console.error("[lead-magnet] discount mint error:", err);
  }
}

interface LeadMagnetPayload {
  email: string;
  source?: string;
  persona?: string;
  /** Optional honeypot — bots fill this; humans don't see it. */
  company_website?: string;
}

/**
 * The fire-service lander (/firefighters) posts here with this source. It is a
 * different offer from the Field Guide — a discount code, no PDF — so it fires
 * its own trigger event and skips the Field Guide confirmation email.
 */
const FIREFIGHTER_SOURCE = "jockshock-firefighters";

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
  const isFirefighter = source === FIREFIGHTER_SOURCE;

  // Two offers share this route. They differ in three ways and nothing else:
  // the trigger event, the lead-magnet attribute, and whether the Field Guide
  // PDF confirmation goes out.
  const triggerEvent = isFirefighter
    ? "firefighter_discount_requested"
    : "field_guide_requested";
  const leadMagnet = isFirefighter
    ? "fire-service-discount"
    : "gear-smell-field-guide";
  // The offer carries its own discount. Fire service is 10%; the Field Guide
  // stays at the 20% it has always been.
  const discountPercent = isFirefighter ? 10 : 20;

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
        jockshock_lead_magnet: leadMagnet,
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
      const sent = await sendConfirmation(email, isFirefighter);
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
        name: triggerEvent,
        data: {
          source,
          persona,
          sub_brand: "jockshock",
          lead_magnet: leadMagnet,
          // The Field Guide automation renders the download button from this,
          // so a future PDF move only has to change the constant above. Empty
          // for the fire-service offer — there's no PDF in that one.
          pdf_url: isFirefighter ? "" : FIELD_GUIDE_PDF_URL || "",
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
      const sent = await sendConfirmation(email, isFirefighter);
      return new Response(
        JSON.stringify({ ok: true, queued: false, emailed: sent }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Mint the single-use discount now, so the attribute is on the profile
    // long before Email 3 fires 6 days from now. Runs AFTER identify so the
    // profile exists for Nexus to write onto.
    await mintDiscountCode(email, discountPercent, siteId, trackKey);

    // Immediate SendGrid thank-you with the guide. Independent of the
    // Customer.io automation (which may lag) — guarantees the reader gets a
    // response now.
    const sent = await sendConfirmation(email, isFirefighter);

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
