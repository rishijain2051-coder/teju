import { NextResponse } from 'next/server';

// Codes live ONLY here on the server — never sent to the browser.
// Set ACCESS_CODES in Vercel: Project Settings → Environment Variables
// Format: comma-separated, e.g.  teju,radheshyam,ramkishore
const VALID_CODES = (process.env.ACCESS_CODES || '')
  .split(',')
  .map((c) => c.trim().toLowerCase())
  .filter(Boolean);

const COOKIE_NAME = 'vi_private_access';

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const normalised = code.trim().toLowerCase();
  const isValid = VALID_CODES.includes(normalised);

  if (!isValid) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(COOKIE_NAME, 'granted', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
