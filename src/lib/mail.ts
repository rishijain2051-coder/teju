import nodemailer, { type Transporter } from 'nodemailer';
import { mailDomain, observe } from '@/lib/observe';

/**
 * SMTP mail, following the same contract as the DueDo/Pro-sys implementation:
 * a lazily-built singleton transporter, an explicit "is it configured" check, and
 * a send that never throws — callers branch on the boolean.
 *
 * Configure via .env.local (see .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
 *
 * With nothing set, `isMailConfigured()` is false and the enquiry route reports a
 * clear error rather than silently accepting a lead it cannot deliver.
 */

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },

    /*
     * Every one of these had to be set, because nodemailer's defaults are written
     * for a long-lived server process and this runs in a serverless function.
     *
     * Out of the box it waits 30s for DNS, 2 minutes for the TCP connection, 30s
     * for the SMTP greeting and 10 minutes of socket inactivity — so a provider
     * that accepts a connection and then says nothing holds the function open for
     * ten minutes. It never gets there: the platform kills the invocation at its
     * own limit first, and the visitor gets an opaque gateway error instead of the
     * route's 502 and its "use WhatsApp or email us directly" fallback. The
     * enquiry is lost either way, but only one of those tells the person that.
     *
     * So the mailer must give up before the platform does. The ceiling here is
     * 5 + 5 + 5 + 10 = 25s if every phase stalls to its own limit and then
     * recovers, against the `maxDuration = 30` declared on /api/enquiry — which
     * is what keeps the route's own error the one that wins the race. Change one
     * of those numbers and check the other.
     *
     * Generous against a real send: Gmail's submission endpoint answers in well
     * under a second from bom1, and the whole exchange is normally ~1.5s.
     */
    dnsTimeout: 5_000,
    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
  });
  return transporter;
}

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Set to the enquirer's address so a reply goes straight back to them. */
  replyTo?: string;
}

/**
 * Domains reserved by RFC 2606 / RFC 6761 as guaranteed never to exist.
 *
 * Delivery to these fails *asynchronously*: the SMTP server accepts the message
 * at submission and bounces it minutes later, so a naive send reports success
 * and the bounce lands in the sending account's own inbox. Refusing up front
 * turns that into an immediate, visible false.
 */
const UNDELIVERABLE = /(^|\.)(invalid|test|localhost|example)$|(^|@)example\.(com|net|org)$/i;

export function isUndeliverable(address: string): boolean {
  const domain = address.split('@')[1]?.trim().toLowerCase();
  return !domain || UNDELIVERABLE.test(domain);
}

/** Sends one email. Returns true on success, false if skipped or failed. Never throws. */
export async function sendMail(options: SendMailOptions): Promise<boolean> {
  if (isUndeliverable(options.to)) {
    observe('warn', 'mail.recipient_refused', { domain: mailDomain(options.to) });
    return false;
  }

  const t = getTransporter();
  if (!t) {
    // Nearly unreachable — /api/enquiry checks `isMailConfigured()` and answers 503
    // before it gets here — but "returns false and says nothing" is the exact
    // failure mode this module is being audited for. One line costs nothing.
    observe('error', 'mail.transport_unconfigured');
    return false;
  }

  const from = process.env.MAIL_FROM || `Vardhman Impex <${process.env.SMTP_USER}>`;

  try {
    await t.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text:
        options.text ??
        options.html
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      // Only set when the enquirer's own address is deliverable, so a typo'd or
      // reserved domain cannot poison the reply header.
      ...(options.replyTo && !isUndeliverable(options.replyTo) ? { replyTo: options.replyTo } : {}),
    });
    return true;
  } catch (err) {
    /* The reason is the whole value of this line — a timeout from the block above
       reads differently from an auth rejection or a refused relay, and they need
       different fixes. Domain only, never the address. */
    observe('error', 'mail.send_failed', {
      domain: mailDomain(options.to),
      reason: (err as Error).message,
    });
    return false;
  }
}
