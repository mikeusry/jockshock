/**
 * /api/teams-intake — Carmen B2B quote intake handler.
 *
 * POST endpoint that receives the form from /teams.astro, sends a branded
 * email to Mike via SendGrid. v1 keeps it simple: email notification only,
 * Mike replies with a quote within 24 hours per the page's promise.
 *
 * v2 follow-up (Nexus #652): wire HubSpot contact + deal creation, Klaviyo
 * subscribe + B2B intake flow, Slack notification. The scaffolding here
 * leaves a clear seam for that — payload shape and response shape both
 * already match what a v2 handler would expect.
 */
import type { APIRoute } from "astro";

const SENDGRID_API = "https://api.sendgrid.com/v3/mail/send";
const NOTIFY_RECIPIENTS = [
  { email: "mike@southlandorganics.com", name: "Mike Usry" },
];

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
      <td style="padding:10px 14px;border-bottom:1px solid #1f2937;font-weight:700;color:#facc15;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1f2937;color:#f3f4f6;font-size:14px;">${value}</td>
    </tr>`;

  const phone = data.phone
    ? `<a href="tel:${escapeHtml(data.phone)}" style="color:#facc15;text-decoration:none;">${escapeHtml(data.phone)}</a>`
    : '<span style="color:#6b7280;">—</span>';

  const notes = data.notes
    ? `
    <div style="margin-top:24px;padding:20px;background:#0a0a0a;border-left:3px solid #facc15;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#facc15;text-transform:uppercase;letter-spacing:0.08em;">What they're trying to solve</p>
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
              <td style="color:#facc15;font-size:20px;font-weight:900;letter-spacing:0.04em;">JOCKSHOCK</td>
              <td align="right" style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Team Quote Request</td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#141414;padding:32px;border-left:1px solid #1f2937;border-right:1px solid #1f2937;">

          <h2 style="margin:0 0 8px;font-size:22px;color:#fff;font-weight:800;letter-spacing:-0.01em;">New B2B quote request</h2>
          <p style="margin:0 0 24px;color:#9ca3af;font-size:13px;">From the JockShock /teams page. Reply within one business day per the page's promise.</p>

          <table style="border-collapse:collapse;width:100%;">
            ${row("Name", escapeHtml(data.name))}
            ${row("Role", escapeHtml(data.role))}
            ${row("Organization", escapeHtml(data.organization))}
            ${row("Email", `<a href="mailto:${escapeHtml(data.email)}" style="color:#facc15;text-decoration:none;">${escapeHtml(data.email)}</a>`)}
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
            Lead from <a href="https://jockshock.com/teams" style="color:#facc15;text-decoration:none;">jockshock.com/teams</a> ·
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

  const subject = `[JockShock Teams] ${data.organization} — ${data.sport}, ${data.roster_size}, ${data.timeline}`;

  const sendgridPayload = {
    personalizations: [{ to: NOTIFY_RECIPIENTS, subject }],
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
