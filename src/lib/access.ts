/**
 * The trade access token.
 *
 * The cookie used to hold the literal string `granted`, which meant the gate was
 * decoration: the access codes were never exposed, but anyone could type
 * `vi_private_access=granted` into the devtools cookie editor and walk straight
 * in. A value that proves nothing is not a credential.
 *
 * It now carries an HMAC-SHA256 signature over its own expiry, so a forged value
 * cannot be produced without `ACCESS_SECRET`. Web Crypto rather than
 * `node:crypto` because middleware runs on the Edge runtime, where the Node
 * module is not available.
 *
 * Stateless on purpose. A session table would have to live somewhere, and for a
 * handful of trade buyers on an 8-hour window the signature is the whole
 * mechanism — there is nothing to revoke that rotating the secret does not do.
 */

export const ACCESS_COOKIE = 'vi_private_access';

/** Eight hours: a working day, then the buyer signs in again. */
export const ACCESS_TTL_SECONDS = 60 * 60 * 8;

const encoder = new TextEncoder();

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/**
 * Fails closed. An unset secret cannot mean "let everyone in" — that is exactly
 * the bug this replaces — so every caller treats `null` as a denial and the
 * verify route reports it as a server error rather than a wrong code.
 */
function secret(): string | null {
  const value = process.env.ACCESS_SECRET;
  if (!value || value.length < 32) return null;
  return value;
}

export const accessSecretConfigured = () => secret() !== null;

async function sign(message: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message)));
}

/** `<expiry seconds>.<signature>`. Returns null when no secret is configured. */
export async function issueAccessToken(now = Date.now()): Promise<string | null> {
  const key = secret();
  if (!key) return null;

  const expiresAt = Math.floor(now / 1000) + ACCESS_TTL_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${await sign(payload, key)}`;
}

/** Constant-time comparison. A length-dependent early return on a signature
 *  check is the classic way to leak it a byte at a time. */
function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyAccessToken(
  token: string | undefined | null,
  now = Date.now()
): Promise<boolean> {
  const key = secret();
  if (!key || !token) return false;

  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!/^\d+$/.test(payload)) return false;
  if (Number(payload) * 1000 <= now) return false;

  return equal(signature, await sign(payload, key));
}
