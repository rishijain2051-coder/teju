/**
 * The one place the site's own address is decided.
 *
 * Four files used to read `NEXT_PUBLIC_SITE_URL` independently — the root layout's
 * `metadataBase`, `robots.ts`, `sitemap.ts` and `schema.ts` — with their own
 * fallbacks. One of them defaulted to port 3000 while the dev server runs on 4028,
 * and nothing stopped the next reader from inventing a fifth default.
 *
 * The `www` normalisation is not cosmetic. `vardhman-impex.com` answers 308 to
 * `www.vardhman-impex.com`, so a canonical, an `og:url` or a sitemap entry on the
 * bare apex names a URL that redirects — which is a worse signal than no canonical
 * at all, because the page then contradicts itself. `.env.example` and `.env.local`
 * both carried the apex form while production carried `www`, so a build from the
 * repo's own documented value produced exactly that. Enforcing it here means the
 * environment can be wrong without the output being wrong.
 *
 * If the redirect is ever pointed the other way, change it here and in DNS
 * together — those two facts have to agree, and this comment is the reminder.
 */
const FALLBACK = 'http://localhost:4028';

function resolve(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK).trim().replace(/\/+$/, '');

  try {
    const url = new URL(raw);
    // Only the production apex, never localhost or a preview deployment.
    if (url.hostname === 'vardhman-impex.com') url.hostname = 'www.vardhman-impex.com';
    return url.origin;
  } catch {
    // An unparseable value is a deployment fault; localhost is the safe answer
    // because it cannot be mistaken for a real canonical.
    return FALLBACK;
  }
}

export const SITE_URL = resolve();
