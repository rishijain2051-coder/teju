import { NextResponse } from 'next/server';
import { brand } from '@/lib/site';
import { isMailConfigured, sendMail } from '@/lib/mail';
import { clientKey, createRateLimit } from '@/lib/rate-limit';
import { readJsonBounded, singleLine } from '@/lib/request-guard';
import { observe } from '@/lib/observe';

/**
 * Enquiry intake for both forms: the contact form and the trade catalogue
 * request on /collections.
 *
 * Every field is treated as untrusted text and escaped before it reaches the
 * HTML body — these values come from a public form.
 */

/*
 * Declared, not inherited. Vercel's default is 10s on Hobby and 15s on Pro, and
 * the mailer's own ceiling is 25s (see the timeout block in `lib/mail.ts`) — so on
 * either plan a stalled SMTP provider gets the invocation killed before the mailer
 * gives up, and the visitor sees an opaque gateway error instead of the 502 below,
 * which is the one that names the WhatsApp fallback. 30 leaves the mailer room to
 * fail first and still bounds the request; the two numbers are a pair, so change
 * them together. Both plans allow at least 60s, so this is within budget.
 */
export const maxDuration = 30;

interface Field {
  label: string;
  value: string;
}

/*
 * Ceilings, in the order a hostile request meets them.
 *
 * MAX_BODY is the one that was missing: the per-field cap below runs after the
 * whole body has been parsed, so it bounded the email and not the memory. 64 kB is
 * about sixteen times the largest plausible enquiry — every field at its limit —
 * and small enough that a flood of them costs the function nothing.
 *
 * MAX_FIELDS matters for the same reason. The array length was only checked for
 * being non-empty, so a hundred thousand entries each inside MAX_FIELD passed every
 * check and produced an email nobody could open. The forms send four to eight.
 */
const MAX_BODY = 64 * 1024;
const MAX_FIELDS = 40;
const MAX_SUBJECT = 200;
const MAX_LABEL = 120;
const MAX_FIELD = 4000;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/*
 * Five a minute is generous for a form a person fills in by hand, and it is the
 * SMTP quota being protected as much as the mailbox. Per instance — see
 * `createRateLimit` for why that is the honest description and what to pair it with.
 */
const limit = createRateLimit(60_000, 5);

export async function POST(request: Request) {
  if (limit.exceeded(clientKey(request))) {
    return NextResponse.json(
      { ok: false, error: 'Too many enquiries in a short time. Please try again shortly.' },
      { status: 429 }
    );
  }

  const read = await readJsonBounded(request, MAX_BODY);
  if (!read.ok) {
    return NextResponse.json({ ok: false, error: read.error }, { status: read.status });
  }
  const body = read.data;

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

  /* The subject reaches a mail header, so it loses its control characters here
     rather than being trusted to arrive without any. */
  const safeSubject = singleLine(subject, MAX_SUBJECT);
  if (!safeSubject) {
    return NextResponse.json({ ok: false, error: 'Missing subject.' }, { status: 400 });
  }

  if (!Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json({ ok: false, error: 'Nothing to send.' }, { status: 400 });
  }

  if (fields.length > MAX_FIELDS) {
    return NextResponse.json({ ok: false, error: 'That request is too large.' }, { status: 413 });
  }

  const clean: Field[] = [];
  for (const entry of fields) {
    const { label, value } = (entry ?? {}) as { label?: unknown; value?: unknown };
    if (typeof label !== 'string' || typeof value !== 'string') continue;
    if (!value.trim()) continue;
    clean.push({ label: singleLine(label, MAX_LABEL), value: value.slice(0, MAX_FIELD) });
  }

  if (clean.length === 0) {
    return NextResponse.json({ ok: false, error: 'Nothing to send.' }, { status: 400 });
  }

  if (!isMailConfigured()) {
    observe('error', 'enquiry.mail_unconfigured');
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
          <div style="color:#973F24;font:12px/1.5 monospace;text-transform:uppercase;letter-spacing:.18em">${escapeHtml(safeSubject)}</div>
          <div style="color:#17130F;font:22px/1.3 Georgia,serif;margin-top:8px">New enquiry · ${escapeHtml(brand.name)}</div>
        </td></tr>
        <tr><td style="padding:24px 32px">
          <table style="border-collapse:collapse;width:100%">${rows}</table>
        </td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #D6CCBC;color:#655B4E;font:12px/1.5 monospace">
          Sent from vardhman-impex.com
        </td></tr>
      </table>
    </div>`;

  /*
   * A Reply-To has to be one address on one line. `includes('@')` accepted "a@" and,
   * more to the point, accepted a value with a newline in it — which is where the
   * next mail header begins. Shape-checked and stripped of control characters, and
   * dropped entirely rather than guessed at if it does not hold up: a missing
   * Reply-To costs a click, a forged header costs more.
   */
  const candidate = typeof email === 'string' ? singleLine(email, 254) : '';
  const replyTo = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(candidate) ? candidate : undefined;

  const delivered = await sendMail({
    to: brand.email,
    subject: singleLine(`${safeSubject} · ${clean[0]?.value ?? 'enquiry'}`, MAX_SUBJECT),
    html,
    replyTo,
  });

  if (!delivered) {
    /* A lead that reached the site and did not reach the inbox. `sendMail` has
       already logged why; this is the one that says a sale may have been lost, and
       it is the line worth alerting on. */
    observe('error', 'enquiry.send_failed');
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
