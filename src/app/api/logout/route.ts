import { NextResponse } from 'next/server';

const COOKIE_NAME = 'vi_private_access';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return response;
}
