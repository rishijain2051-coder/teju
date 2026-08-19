/**
 * Bounded JSON reading for route handlers.
 *
 * App Router route handlers have no body size limit — the 1 MB cap that Pages
 * API routes applied does not exist here — so a bare `await request.json()` will
 * parse whatever it is sent, however large, into memory before a single field
 * check runs. The enquiry route caps each field at 4 kB, which does nothing about
 * the 50 MB that had to be decoded to find them.
 *
 * So the body is read through the stream with a hard ceiling and abandoned the
 * moment it is passed, rather than buffered and measured afterwards.
 * `content-length` is checked first because it is free, but it is a claim and not
 * a fact — chunked encoding omits it and a hostile client can lie — so the ceiling
 * is enforced against bytes actually received either way.
 *
 * 413 for too large and 400 for unparseable, because they are different faults:
 * one is a client that must send less, the other a client that must send
 * something else.
 */
export type JsonResult =
  { ok: true; data: unknown } | { ok: false; status: 413 | 400; error: string };

export async function readJsonBounded(request: Request, maxBytes: number): Promise<JsonResult> {
  const tooLarge = {
    ok: false,
    status: 413,
    error: 'That request is too large.',
  } as const;

  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return tooLarge;

  const body = request.body;
  if (!body) return { ok: false, status: 400, error: 'Empty request.' };

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return tooLarge;
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: 'Malformed request.' };
  }

  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { ok: true, data: JSON.parse(new TextDecoder().decode(buffer)) };
  } catch {
    return { ok: false, status: 400, error: 'Malformed request.' };
  }
}

/**
 * A single-line, header-safe string.
 *
 * Anything destined for a mail header — a Reply-To, a Subject — must not carry a
 * CR or LF, because a newline in a header value is where the next header begins.
 * Nodemailer guards its own headers, but a value is easier to trust when the
 * control characters were never in it. Also strips the rest of the C0 range and
 * U+2028/2029, which are line terminators to a JavaScript parser even though they
 * are not to a human.
 */
export const singleLine = (value: string, maxLength: number) =>
  value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
