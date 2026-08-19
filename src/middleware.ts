import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, accessSecretConfigured, verifyAccessToken } from '@/lib/access';
import { observe } from '@/lib/observe';

/**
 * Guards the trade catalogue.
 *
 * THIS FILE MUST LIVE IN `src/`. Next.js looks for middleware beside the app
 * directory, so with `src/app` it reads `src/middleware.ts` and ignores a
 * `middleware.ts` at the project root — silently, with no warning and no build
 * error. It sat at the root until now, which meant the manifest contained zero
 * middleware entries and /collections/private/catalogue answered 200 to anyone
 * who typed the URL. Moving it here is what actually closed the gate.
 *
 * The check itself used to be `cookie === 'granted'`, which any visitor could
 * satisfy from the devtools cookie editor. It now verifies an HMAC signature
 * over the token's own expiry, so a forged or expired value is rejected and an
 * unset `ACCESS_SECRET` denies everyone rather than admitting everyone.
 */
/*
 * Closes the CMS route in production, with a real 404.
 *
 * `/keystatic/[[...params]]` already guards itself — `notFound()` when NODE_ENV is
 * production, because storage is `kind: 'local'` and the editor cannot write to a
 * deployed filesystem. That guard renders the right page and returns the wrong
 * status. The route is statically prerendered, so production served the 404 *body*
 * with **HTTP 200**, titled "Content — Vardhman Impex". That is a soft 404: Google
 * indexes it as a real page, and a genuine unknown URL on this site correctly
 * returns 404, so the two disagree.
 *
 * Middleware runs ahead of the static response, which is the only place that can
 * fix the status without making the route dynamic. Bare body on purpose: this is
 * an admin path that should not be reachable here, and a crawler needs the status,
 * not the styling. `robots.ts` disallows it as well — belt to this brace.
 */
export async function middleware(request: NextRequest) {
  /*
   * One branch owning the whole path, and it must return in both cases. Falling
   * through here is not harmless: the code below is the trade gate, so in
   * development `/keystatic` answered 307 to /collections/private and the CMS
   * became unreachable locally. Production never saw it — the 404 returns first —
   * which is exactly the shape of bug that ships.
   */
  if (/^\/(api\/)?keystatic(\/|$)/.test(request.nextUrl.pathname)) {
    return process.env.NODE_ENV === 'production'
      ? new NextResponse('Not Found', { status: 404 })
      : NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;

  if (await verifyAccessToken(token)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/collections/private';
  url.search = '';

  const response = NextResponse.redirect(url);

  /*
   * Why the bounce, for whoever is debugging a deployment.
   *
   * This redirect is the one failure that cannot be told apart from the outside:
   * a buyer whose correct code was accepted, whose cookie was set, and who then
   * lands back on the gate with the cookie deleted below sees exactly what a
   * wrong code looks like. `unavailable` means ACCESS_SECRET is missing or under
   * 32 characters **in the Edge runtime specifically**, which is the only way
   * that can happen once /api/verify-access has issued a token.
   *
   *   curl -sI https://…/collections/private/catalogue | grep x-vi-gate
   *
   * Grants nothing: two fixed words, nothing about the codes, and the redirect
   * still happens either way.
   */
  const configured = accessSecretConfigured();
  response.headers.set('x-vi-gate', configured ? 'denied' : 'unavailable');

  /*
   * The header above is the diagnosis; this is the alarm. `unavailable` is an
   * outage — the secret is missing or under 32 characters in the Edge runtime, so
   * the gate is refusing codes that are correct — and until now the only way to
   * find out was to curl the endpoint and read a header. It logs on every request
   * while it lasts, which is loud, and that is the point: it should be.
   *
   * A rejected token is a warning and not an error, and only when a token was
   * actually sent. An empty cookie jar just means somebody typed the URL, which is
   * ordinary and would bury the signal; a *present* token that fails verification
   * is expired, tampered with, or signed by a secret that has since changed —
   * worth counting. Neither line carries the token, the path's query, or an IP.
   */
  if (!configured) {
    observe('error', 'gate.secret_unavailable', { path: request.nextUrl.pathname });
  } else if (token) {
    observe('warn', 'gate.token_rejected', { path: request.nextUrl.pathname });
  }

  // Clear the rejected cookie on the way out, so a stale or tampered token does
  // not sit in the browser being re-sent on every request.
  if (token) response.cookies.set(ACCESS_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}

export const config = {
  matcher: [
    '/collections/private/catalogue/:path*',
    '/keystatic',
    '/keystatic/:path*',
    '/api/keystatic',
    '/api/keystatic/:path*',
  ],
};
