/**
 * One line of JSON per fault, for whatever is reading the runtime logs.
 *
 * The failures on this site are quiet ones. A missing `ACCESS_SECRET` in the Edge
 * runtime turns the trade gate into a wall that refuses correct codes, and the
 * only trace is an `x-vi-gate: unavailable` header on a redirect nobody is
 * watching. A mailer that times out returns a 502 the visitor sees and nothing
 * else records. Both are outages, and both currently depend on somebody happening
 * to look.
 *
 * So: `console.error` and `console.warn`, which is the whole mechanism. Vercel
 * captures both from every runtime — Edge middleware included — and its log
 * drains and alerts match on the text of a line. That is the entire reason this is
 * JSON on ONE line: a drain splits on newlines, so a multi-line log becomes
 * several unrelated entries and an alert keyed to `"evt":"gate.secret_unavailable"`
 * silently stops matching.
 *
 * Deliberately not Sentry, or an OpenTelemetry exporter. Either would mean a
 * dependency, an ingest endpoint, a DSN in the environment and — for the browser
 * SDK — tens of kilobytes on a site whose whole performance story is how few
 * kilobytes it sends. This costs nothing, works in both runtimes today, and every
 * call site below is a one-line change away from becoming a Sentry capture if the
 * volume ever justifies one.
 *
 * NO PERSONAL DATA GOES THROUGH HERE. Not enquiry field contents, not a visitor's
 * email address, not an IP, not an access code or a token. The privacy notice at
 * /privacy names Vercel as seeing request metadata "in the ordinary course of
 * delivering pages"; application logs that accumulate identifiers are a different
 * processing purpose, and this file is not the place to start one without saying
 * so there first. Where an address genuinely helps — a refused recipient — log the
 * domain and drop the local part. `mailDomain` below exists for exactly that.
 */

type Field = string | number | boolean;

/** Long enough to be useful in an alert, short enough that a log line stays one. */
const MAX_FIELD = 200;

/**
 * `JSON.stringify` and not a template string, and not only for the shape.
 *
 * Some of these values carry text that originated outside — an SMTP server's error
 * message, most obviously. Concatenated into a log line, a newline in one of those
 * ends the entry and everything after it becomes a forged entry of the attacker's
 * choosing, which is how log injection works and why a drain's alert rules cannot
 * be trusted afterwards. `JSON.stringify` escapes newlines to `\n` inside the
 * string, so the single-line guarantee holds no matter what arrives here.
 */
function emit(level: 'warn' | 'error', event: string, fields: Record<string, Field>): void {
  const safe: Record<string, Field> = {};
  for (const [key, value] of Object.entries(fields)) {
    safe[key] = typeof value === 'string' ? value.slice(0, MAX_FIELD) : value;
  }

  // No timestamp: every platform that collects these stamps the line itself, and a
  // second one only invites the two to disagree.
  const line = JSON.stringify({ evt: event, ...safe });

  if (level === 'error') console.error(line);
  else console.warn(line);
}

/**
 * Records a fault.
 *
 * `error` is for something an operator has to fix — configuration missing, a
 * dependency refusing. `warn` is for something worth counting but not waking
 * anyone for: one visitor's typo, one rejected token.
 *
 *   observe('error', 'gate.secret_unavailable', { path: '/collections/private/catalogue' })
 *   → {"evt":"gate.secret_unavailable","path":"/collections/private/catalogue"}
 */
export function observe(
  level: 'warn' | 'error',
  event: string,
  fields: Record<string, Field> = {}
): void {
  emit(level, event, fields);
}

/**
 * The domain of an address, for logging, with the local part discarded.
 *
 * `buyer@example.com` becomes `example.com`. Enough to tell a typo'd domain from a
 * provider outage, and not enough to identify anybody. Returns `unknown` rather
 * than the input when there is no `@`, so a malformed value cannot smuggle a whole
 * address through this function.
 */
export function mailDomain(address: string): string {
  const at = address.lastIndexOf('@');
  return at === -1 ? 'unknown' : address.slice(at + 1).toLowerCase();
}
