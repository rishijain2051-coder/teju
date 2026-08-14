import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_TTL_SECONDS,
  accessSecretConfigured,
  issueAccessToken,
} from '@/lib/access';

// Codes live ONLY here on the server — never sent to the browser.
// Set ACCESS_CODES in your host's environment variables.
// Format: comma-separated, e.g.  teju,radheshyam,ramkishore
const VALID_CODES = (process.env.ACCESS_CODES || '')
  .split(',')
  .map((c) => c.trim().toLowerCase())
  .filter(Boolean);

/**
 * Deliberately slow to brute-force from a single client: a wrong code costs a
 * fixed delay. Not a substitute for a rate limiter at the edge, but it turns a
 * few thousand guesses a second into a few per second.
 */
const WRONG_CODE_DELAY_MS = 400;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = (body as { code?: unknown } | null)?.code;

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  /* An unset secret is a deployment fault, not a wrong code. Saying so plainly
     beats telling a verified buyer their correct code is invalid. */
  if (!accessSecretConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Access is temporarily unavailable. Please contact us directly.' },
      { status: 503 }
    );
  }

  if (!VALID_CODES.includes(code.trim().toLowerCase())) {
    await wait(WRONG_CODE_DELAY_MS);
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const token = await issueAccessToken();
  if (!token) {
    return NextResponse.json({ success: false }, { status: 503 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    // Off on plain-HTTP localhost, or the cookie is set and never sent back.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TTL_SECONDS,
  });

  return response;
}
