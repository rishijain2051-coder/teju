import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, verifyAccessToken } from '@/lib/access';

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
  // Clear the rejected cookie on the way out, so a stale or tampered token does
  // not sit in the browser being re-sent on every request.
  if (token) response.cookies.set(ACCESS_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}

export const config = {
  matcher: ['/collections/private/catalogue/:path*'],
};
