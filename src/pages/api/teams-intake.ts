/**
 * /api/teams-intake — gym + team B2B intake handler.
 *
 * Per the May 2026 gym-channel pivot (see project_gym_channel_program memory):
 * lead routes to Fred Munzenmaier first (UGA RB, owns a D1 Training franchise,
 * runs the JockShock gym channel). Mike is cc'd for visibility but Fred owns
 * the response.
 *
 * v2 (Nexus T-652, May 2026): after the SendGrid email succeeds, fire-and-
 * forget a POST to Nexus `/api/leads/ingest`. That endpoint owns:
 *   - dedup (30-day cross-source on email/phone)
 *   - insert into `leads` table with lead_type=jockshock_teams
 *   - Klaviyo `Lead Created` event (Joseph builds the carmen B2B confirmation
 *     flow in Klaviyo UI, filtered by source_system=jockshock)
 *   - auto-assignment (Fred owns the gym channel, set via lead_assignment rules)
 *   - HubSpot push happens later when a rep clicks "Push to HubSpot" on the
 *     qualified lead — keeps unqualified junk out of CRM.
 *
 * Failure modes are non-fatal: SendGrid is the source-of-truth for "did Fred
 * get notified." Nexus is bonus tracking. If `NEXUS_INGEST_URL` or
 * `NEXUS_INGEST_API_KEY` are unset, we silently skip — the form still
 * succeeds for the user.
 */
import type { APIRoute } from "astro";

const SENDGRID_API = "https://api.sendgrid.com/v3/mail/send";

// Primary recipient is Fred. Mike is cc'd. If Fred's email becomes a placeholder
// (env override below), make sure Mike still receives the lead.
const PRIMARY_RECIPIENT = { email: "fmunzjr@gmail.com", name: "Fred Munzenmaier" };
const CC_RECIPIENTS = [{ email: "mike@southlandorganics.com", name: "Mike Usry" }];

interface TeamsIntakePayload {
  name: string;
  role: string;
  organization: string;
  email: string;
  phone?: string;
  sport: string;
  roster_size: string;
  timeline: string;
  notes?: string;
  persona?: string;
  source?: string;
}

const REQUIRED: (keyof TeamsIntakePayload)[] = [
  "name",
  "role",
  "organization",
  "email",
  "sport",
  "roster_size",
  "timeline",
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmail(data: TeamsIntakePayload): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #1f2937;font-weight:700;color:#FFE500;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1f2937;color:#f3f4f6;font-size:14px;">${value}</td>
    </tr>`;

  const phone = data.phone
    ? `<a href="tel:${escapeHtml(data.phone)}" style="color:#FFE500;text-decoration:none;">${escapeHtml(data.phone)}</a>`
    : '<span style="color:#6b7280;">—</span>';

  const notes = data.notes
    ? `
    <div style="margin-top:24px;padding:20px;background:#0a0a0a;border-left:3px solid #FFE500;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#FFE500;text-transform:uppercase;letter-spacing:0.08em;">What they're trying to solve</p>
      <p style="margin:0;color:#f3f4f6;white-space:pre-wrap;line-height:1.6;font-size:14px;">${escapeHtml(data.notes)}</p>
    </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0a0a0a;padding:24px 32px;border:1px solid #1f2937;border-bottom:none;border-radius:6px 6px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#FFE500;font-size:20px;font-weight:900;letter-spacing:0.04em;">JOCKSHOCK</td>
              <td align="right" style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Gym + Team Lead</td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#141414;padding:32px;border-left:1px solid #1f2937;border-right:1px solid #1f2937;">

          <h2 style="margin:0 0 8px;font-size:22px;color:#fff;font-weight:800;letter-spacing:-0.01em;">New gym / team lead</h2>
          <p style="margin:0 0 24px;color:#9ca3af;font-size:13px;">From the JockShock /teams page. Fred — please reply within one business day per the page's promise. Mike is cc'd for visibility.</p>

          <table style="border-collapse:collapse;width:100%;">
            ${row("Name", escapeHtml(data.name))}
            ${row("Role", escapeHtml(data.role))}
            ${row("Organization", escapeHtml(data.organization))}
            ${row("Email", `<a href="mailto:${escapeHtml(data.email)}" style="color:#FFE500;text-decoration:none;">${escapeHtml(data.email)}</a>`)}
            ${row("Phone", phone)}
            ${row("Sport", escapeHtml(data.sport))}
            ${row("Roster size", escapeHtml(data.roster_size))}
            ${row("Timeline", escapeHtml(data.timeline))}
          </table>

          ${notes}

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0a0a0a;padding:20px 32px;border:1px solid #1f2937;border-top:none;border-radius:0 0 6px 6px;">
          <p style="margin:0;font-size:11px;color:#6b7280;text-align:center;line-height:1.6;">
            Lead from <a href="https://jockshock.com/teams" style="color:#FFE500;text-decoration:none;">jockshock.com/teams</a> ·
            persona: <strong style="color:#9ca3af;">${escapeHtml(data.persona || "carmen")}</strong> ·
            source: <strong style="color:#9ca3af;">${escapeHtml(data.source || "jockshock-teams-page")}</strong>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const POST: APIRoute = async ({ request }) => {
  const sendgridKey = import.meta.env.SENDGRID_API_KEY;

  if (!sendgridKey) {
    console.error("[teams-intake] SENDGRID_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let data: TeamsIntakePayload;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  for (const field of REQUIRED) {
    if (!data[field] || (typeof data[field] === "string" && !(data[field] as string).trim())) {
      return new Response(
        JSON.stringify({ error: `Missing required field: ${field}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Honeypot-free for now; if spam shows up, add a phone-shaped trap field
  // and reject submissions that fill it.

  const subject = `[JockShock Gym Lead] ${data.organization} — ${data.sport}, ${data.roster_size}, ${data.timeline}`;

  const sendgridPayload = {
    personalizations: [
      {
        to: [PRIMARY_RECIPIENT],
        cc: CC_RECIPIENTS,
        subject,
      },
    ],
    from: {
      email: "noreply@southlandorganics.com",
      name: "JockShock Teams",
    },
    reply_to: { email: data.email, name: data.name },
    content: [{ type: "text/html", value: buildEmail(data) }],
  };

  try {
    const r = await fetch(SENDGRID_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendgridPayload),
    });

    if (!r.ok) {
      const errorText = await r.text();
      console.error("[teams-intake] SendGrid error:", r.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to send" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // v2: snapshot to Nexus leads pipeline (non-blocking; SendGrid is truth)
    await postToNexusIngest(data, request).catch((err) =>
      console.error("[teams-intake] Nexus ingest unhandled:", err)
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[teams-intake] fetch error:", err);
    return new Response(JSON.stringify({ error: "Failed to send" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Reject anything that isn't POST so the route isn't a 404 on GET (helps
// debugging if someone hits the URL in a browser).
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ error: "POST only" }), {
    status: 405,
    headers: { "Content-Type": "application/json", Allow: "POST" },
  });

// ============================================================================
// Nexus ingest — fire-and-forget snapshot into the leads pipeline (T-652 v2)
// ============================================================================

/**
 * POST the validated payload to Nexus `/api/leads/ingest`. Caller awaits this
 * but the surrounding code never blocks the user response on the result —
 * we log failures and move on.
 *
 * The `external_id` is constructed from email + a short timestamp so Nexus's
 * idempotency check works on retries. Sport/role/roster_size/timeline land in
 * `intent` and get rendered as structured notes on the lead record.
 */
async function postToNexusIngest(
  data: TeamsIntakePayload,
  request: Request
): Promise<void> {
  const url = import.meta.env.NEXUS_INGEST_URL;
  const apiKey = import.meta.env.NEXUS_INGEST_API_KEY;
  if (!url || !apiKey) {
    // Not configured yet — silently skip. SendGrid already delivered the lead.
    return;
  }

  const referer = request.headers.get("referer") || "";
  const ua = request.headers.get("user-agent") || "";

  // Extract UTMs from the referer if present (the form page itself; UTMs
  // arrive on the lander URL that loaded the form).
  let utm: Record<string, string> = {};
  let landingPage: string | null = null;
  try {
    if (referer) {
      const refUrl = new URL(referer);
      landingPage = refUrl.pathname;
      ["utm_source", "utm_medium", "utm_campaign", "gclid"].forEach((k) => {
        const v = refUrl.searchParams.get(k);
        if (v) utm[k] = v;
      });
    }
  } catch {
    // ignore malformed referer
  }

  // Split "First Last" into parts; fall back to whole name in first_name
  const trimmedName = data.name.trim().replace(/\s+/g, " ");
  const spaceIdx = trimmedName.indexOf(" ");
  const firstName =
    spaceIdx === -1 ? trimmedName : trimmedName.slice(0, spaceIdx);
  const lastName =
    spaceIdx === -1 ? null : trimmedName.slice(spaceIdx + 1).trim() || null;

  const externalId = `jockshock-teams-${data.email.toLowerCase()}-${Date.now()}`;

  const payload = {
    source: "jockshock",
    external_id: externalId,
    lead_type: "jockshock_teams",
    contact: {
      email: data.email,
      phone: data.phone || null,
      first_name: firstName,
      last_name: lastName,
      company: data.organization,
    },
    intent: {
      role: data.role,
      sport: data.sport,
      roster_size: data.roster_size,
      timeline: data.timeline,
      persona: data.persona || "carmen",
      notes: data.notes || null,
    },
    summary: data.notes || null,
    attribution: {
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      gclid: utm.gclid || null,
      landing_page: landingPage,
    },
    meta: {
      submitted_from: data.source || "jockshock-teams-page",
      user_agent: ua.slice(0, 500),
    },
  };

  try {
    const res = await fetch(url.replace(/\/+$/, "") + "/api/leads/ingest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[teams-intake] Nexus ingest error:", res.status, text);
    }
  } catch (err) {
    console.error("[teams-intake] Nexus ingest fetch failed:", err);
  }
}
