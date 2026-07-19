import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'vi_private_access';

export function middleware(request: NextRequest) {
  const hasAccess = request.cookies.get(COOKIE_NAME)?.value === 'granted';

  if (!hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = '/collections/private';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/collections/private/catalogue/:path*'],
};
