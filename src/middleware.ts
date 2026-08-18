import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, accessSecretConfigured, verifyAccessToken } from '@/lib/access';

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
export async function middleware(request: NextRequest) {
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
  response.headers.set('x-vi-gate', accessSecretConfigured() ? 'denied' : 'unavailable');

  // Clear the rejected cookie on the way out, so a stale or tampered token does
  // not sit in the browser being re-sent on every request.
  if (token) response.cookies.set(ACCESS_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}

export const config = {
  matcher: ['/collections/private/catalogue/:path*'],
};
