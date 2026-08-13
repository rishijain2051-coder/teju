import nodemailer, { type Transporter } from 'nodemailer';

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
    console.warn(`[mail] refusing ${options.to}: reserved domain that cannot receive mail`);
    return false;
  }

  const t = getTransporter();
  if (!t) return false;

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
      ...(options.replyTo && !isUndeliverable(options.replyTo)
        ? { replyTo: options.replyTo }
        : {}),
    });
    return true;
  } catch (err) {
    console.error(`[mail] failed to send to ${options.to}:`, (err as Error).message);
    return false;
  }
}
