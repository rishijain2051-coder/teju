import { NextResponse } from 'next/server';
import { brand } from '@/lib/site';
import { isMailConfigured, sendMail } from '@/lib/mail';

/**
 * Enquiry intake for both forms: the contact form and the trade catalogue
 * request on /collections.
 *
 * Every field is treated as untrusted text and escaped before it reaches the
 * HTML body — these values come from a public form.
 */

interface Field {
  label: string;
  value: string;
}

const MAX_FIELD = 4000;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Very small fixed-window limiter, per instance. Not a substitute for a real
 * one behind a load balancer, but enough that a single client cannot loop the
 * form and empty the SMTP quota.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    // Opportunistic sweep so the map cannot grow without bound.
    if (hits.size > 500) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many enquiries in a short time. Please try again shortly.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const { subject, fields, email, honeypot } = (body ?? {}) as {
    subject?: unknown;
    fields?: unknown;
    email?: unknown;
    honeypot?: unknown;
  };

  // A bot fills every input it finds; a person never sees this one. Answer 200 so
  // the bot has no signal to retry against.
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  if (typeof subject !== 'string' || !subject.trim()) {
    return NextResponse.json({ ok: false, error: 'Missing subject.' }, { status: 400 });
  }

  if (!Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json({ ok: false, error: 'Nothing to send.' }, { status: 400 });
  }

  const clean: Field[] = [];
  for (const entry of fields) {
    const { label, value } = (entry ?? {}) as { label?: unknown; value?: unknown };
    if (typeof label !== 'string' || typeof value !== 'string') continue;
    if (!value.trim()) continue;
    clean.push({ label: label.slice(0, 120), value: value.slice(0, MAX_FIELD) });
  }

  if (clean.length === 0) {
    return NextResponse.json({ ok: false, error: 'Nothing to send.' }, { status: 400 });
  }

  if (!isMailConfigured()) {
    console.error('[enquiry] SMTP is not configured; refusing to accept a lead it cannot deliver');
    return NextResponse.json(
      {
        ok: false,
        error:
          'Email is not configured on the server yet. Please use WhatsApp or write to us directly.',
      },
      { status: 503 }
    );
  }

  const rows = clean
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:6px 16px 6px 0;color:#655B4E;font:12px/1.5 monospace;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
          <td style="padding:6px 0;color:#17130F;font:15px/1.6 -apple-system,Segoe UI,sans-serif;vertical-align:top">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="background:#EFE9DF;padding:32px">
      <table style="max-width:640px;margin:0 auto;background:#fff;border-collapse:collapse">
        <tr><td style="padding:28px 32px;border-bottom:1px solid #D6CCBC">
          <div style="color:#973F24;font:12px/1.5 monospace;text-transform:uppercase;letter-spacing:.18em">${escapeHtml(subject)}</div>
          <div style="color:#17130F;font:22px/1.3 Georgia,serif;margin-top:8px">New enquiry — ${escapeHtml(brand.name)}</div>
        </td></tr>
        <tr><td style="padding:24px 32px">
          <table style="border-collapse:collapse;width:100%">${rows}</table>
        </td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #D6CCBC;color:#655B4E;font:12px/1.5 monospace">
          Sent from vardhman-impex.com
        </td></tr>
      </table>
    </div>`;

  const replyTo = typeof email === 'string' && email.includes('@') ? email.trim() : undefined;

  const delivered = await sendMail({
    to: brand.email,
    subject: `${subject} — ${clean[0]?.value ?? 'enquiry'}`,
    html,
    replyTo,
  });

  if (!delivered) {
    return NextResponse.json(
      {
        ok: false,
        error: 'We could not send that just now. Please use WhatsApp or email us directly.',
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
