import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const prerender = false;

// Env vars (set in Vercel project settings, NOT exposed to the client):
// - SUPABASE_URL                     https://lmtjxckdcsdymqxpgjxo.supabase.co  (Southland Nexus)
// - SUPABASE_SERVICE_ROLE_KEY        service-role key for INSERT into jockshock_team_quotes
// - SENDGRID_API_KEY                 SendGrid API key (Southland tenant)
// - SENDGRID_FROM_EMAIL              verified sender, e.g. notifications@southlandorganics.com
// - QUOTE_NOTIFY_TO                  default mike@southlandorganics.com

const QuoteSchema = z.object({
  contact_name: z.string().trim().min(1).max(120),
  contact_role: z.string().trim().min(1).max(60),
  contact_email: z.string().trim().email().max(200),
  contact_phone: z.string().trim().max(40).optional().default(''),
  program_name: z.string().trim().min(1).max(160),
  program_sport: z.string().trim().min(1).max(80),
  program_location: z.string().trim().min(1).max(160),
  athlete_count: z.string().trim().min(1).max(20),
  notes: z.string().trim().max(2000).optional().default(''),
  utm_source: z.string().trim().max(120).optional().default(''),
  utm_medium: z.string().trim().max(120).optional().default(''),
  utm_campaign: z.string().trim().max(120).optional().default(''),
  referrer: z.string().trim().max(500).optional().default(''),
});

type QuotePayload = z.infer<typeof QuoteSchema>;

async function logToSupabase(payload: QuotePayload, request: Request) {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('[team-quote] Supabase env not set; skipping DB log');
    return { logged: false, reason: 'env-missing' };
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from('jockshock_team_quotes').insert({
    contact_name: payload.contact_name,
    contact_role: payload.contact_role,
    contact_email: payload.contact_email,
    contact_phone: payload.contact_phone,
    program_name: payload.program_name,
    program_sport: payload.program_sport,
    program_location: payload.program_location,
    athlete_count: payload.athlete_count,
    notes: payload.notes,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    referrer: payload.referrer,
    user_agent: request.headers.get('user-agent') || '',
    submitted_ip:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '',
  });

  if (error) {
    console.error('[team-quote] Supabase insert error:', error);
    return { logged: false, reason: error.message };
  }
  return { logged: true };
}

async function sendNotificationEmail(payload: QuotePayload) {
  const apiKey = import.meta.env.SENDGRID_API_KEY;
  const fromEmail = import.meta.env.SENDGRID_FROM_EMAIL;
  const toEmail = import.meta.env.QUOTE_NOTIFY_TO || 'mike@southlandorganics.com';

  if (!apiKey || !fromEmail) {
    console.warn('[team-quote] SendGrid env not set; skipping email');
    return { sent: false, reason: 'env-missing' };
  }

  const subject = `[JockShock Team Quote] ${payload.program_name} (${payload.program_sport}) — ${payload.athlete_count} athletes`;

  const text = [
    `New JockShock team-quote request:`,
    ``,
    `Contact: ${payload.contact_name} — ${payload.contact_role}`,
    `Email:   ${payload.contact_email}`,
    `Phone:   ${payload.contact_phone || '(not provided)'}`,
    ``,
    `Program: ${payload.program_name}`,
    `Sport:   ${payload.program_sport}`,
    `Location:${payload.program_location}`,
    `Size:    ${payload.athlete_count} athletes`,
    ``,
    `Notes:`,
    payload.notes || '(none)',
    ``,
    `Attribution:`,
    `  utm_source:   ${payload.utm_source || '(none)'}`,
    `  utm_medium:   ${payload.utm_medium || '(none)'}`,
    `  utm_campaign: ${payload.utm_campaign || '(none)'}`,
    `  referrer:     ${payload.referrer || '(none)'}`,
  ].join('\n');

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail, name: 'JockShock Quotes' },
      reply_to: { email: payload.contact_email, name: payload.contact_name },
      subject,
      content: [{ type: 'text/plain', value: text }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[team-quote] SendGrid error:', res.status, body);
    return { sent: false, reason: `sendgrid-${res.status}` };
  }
  return { sent: true };
}

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid-json' }), { status: 400 });
  }

  const parsed = QuoteSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'validation', issues: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const payload = parsed.data;

  // Log + email in parallel. Either failing should not break the user's
  // submission flow as long as ONE of them succeeded — we'd rather the form
  // succeeds and we recover the request from logs than reject a real lead.
  const [logResult, emailResult] = await Promise.allSettled([
    logToSupabase(payload, request),
    sendNotificationEmail(payload),
  ]);

  const logged = logResult.status === 'fulfilled' && logResult.value.logged;
  const emailed = emailResult.status === 'fulfilled' && emailResult.value.sent;

  if (!logged && !emailed) {
    console.error('[team-quote] BOTH log and email failed for', payload.contact_email);
    return new Response(
      JSON.stringify({ error: 'delivery-failed' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, logged, emailed }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
