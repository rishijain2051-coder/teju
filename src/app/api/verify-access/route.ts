import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_TTL_SECONDS,
  accessSecretConfigured,
  issueAccessToken,
} from '@/lib/access';
import { clientKey, createRateLimit } from '@/lib/rate-limit';
import { readJsonBounded } from '@/lib/request-guard';

/**
 * Codes live ONLY here on the server — never sent to the browser.
 * Set ACCESS_CODES in your host's environment variables.
 * Format: comma-separated, e.g.  teju,radheshyam,ramkishore
 *
 * Read inside the request, not once at module scope. A module-scope constant is
 * captured the first time the function instance is warmed, so "I set the
 * variable in Vercel and redeployed and it still refuses me" had two possible
 * causes and no way to tell them apart. The read costs nothing per request; the
 * ambiguity cost days.
 *
 * The quote stripping is not cosmetic. dotenv strips quotes from `.env.local`;
 * the Vercel and Netlify dashboards do NOT — they store the value **literally**.
 * So typing `"teju,radheshyam"` into Vercel, quotes and all, made the codes
 * `"teju` and `radheshyam"`, and every correct code came back 401 looking exactly
 * like a typo. Stripping them cannot admit anyone: a quote is not a legitimate
 * character in an access code, so the only value this changes is one the operator
 * did not mean to set.
 */
function validCodes(): string[] {
  return (process.env.ACCESS_CODES || '')
    .split(',')
    .map((code) =>
      code
        .trim()
        .replace(/^["']|["']$/g, '')
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

/* Shown to the visitor verbatim by the gate. Honest about the fault being ours,
   and says nothing about whether any code exists or what one looks like. */
const UNAVAILABLE = 'Access is temporarily unavailable. Please contact us directly.';

/**
 * Deliberately slow to brute-force from a single client: a wrong code costs a
 * fixed delay. Not a substitute for a rate limiter at the edge, but it turns a
 * few thousand guesses a second into a few per second.
 */
const WRONG_CODE_DELAY_MS = 400;

/*
 * The delay alone was the whole defence, and a delay is not a limit.
 *
 * 400ms per wrong code caps one client at about two and a half guesses a second,
 * sustained, forever — which is a rate, not a ceiling. Against a short
 * human-memorable code that is a real threat to the gated catalogue, and it was the
 * only mutating endpoint on the site with no budget at all.
 *
 * Ten attempts per ten minutes. A buyer typing a code they were issued needs one,
 * and three if they fumble it; ten leaves room for a shared office address behind
 * one NAT without leaving room to enumerate anything. The refusal says it is a rate
 * problem rather than a code problem — the gate's copy stopped blaming the buyer
 * for the server's faults, and it should not start blaming them for their own
 * colleagues either.
 */
const limit = createRateLimit(10 * 60_000, 10);

/*
 * A code is short. Comparing a multi-megabyte string against the list is work
 * nobody asked for, and `equal()` in access.ts is deliberately length-dependent at
 * its first branch, so an oversized value is cheap to reject and pointless to keep.
 */
const MAX_CODE = 200;
const MAX_BODY = 2 * 1024;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  if (limit.exceeded(clientKey(request))) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please wait a few minutes and try again.' },
      { status: 429 }
    );
  }

  const read = await readJsonBounded(request, MAX_BODY);
  if (!read.ok) {
    return NextResponse.json({ success: false, error: read.error }, { status: read.status });
  }
  const code = (read.data as { code?: unknown } | null)?.code;

  if (!code || typeof code !== 'string' || code.length > MAX_CODE) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  /* An unset or too-short secret is a deployment fault, not a wrong code. Saying
     so plainly beats telling a verified buyer their correct code is invalid.

     `reason` is for whoever is deploying, not for the visitor: it names which of
     the two variables is wrong so the fix takes a minute instead of a week of
     guessing. It grants nothing — it discloses that one environment variable is
     unset, never a code, a count, or a format. */
  if (!accessSecretConfigured()) {
    return NextResponse.json(
      { success: false, error: UNAVAILABLE, reason: 'access-secret' },
      { status: 503 }
    );
  }

  const codes = validCodes();

  /* No codes configured at all used to fall through to the 401 below, which told
     the buyer their code was wrong when the server had nothing to compare it
     against. That is the same fault as a missing secret and it reports the same
     way. */
  if (codes.length === 0) {
    return NextResponse.json(
      { success: false, error: UNAVAILABLE, reason: 'access-codes' },
      { status: 503 }
    );
  }

  if (!codes.includes(code.trim().toLowerCase())) {
    await wait(WRONG_CODE_DELAY_MS);
    /* Bare 401, no `error` string: this is the ONE status that means the code was
       wrong, and the client owns that wording. Anything else it receives is our
       fault and it says so instead. */
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const token = await issueAccessToken();
  /* Unreachable while `accessSecretConfigured()` above is the same check, and kept
     anyway: the day those two drift apart, a correct code must not fall through
     to a wrong-code message. */
  if (!token) {
    return NextResponse.json(
      { success: false, error: UNAVAILABLE, reason: 'access-secret' },
      { status: 503 }
    );
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
