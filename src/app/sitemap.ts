import { MetadataRoute } from 'next';
import { collections, journal, pieceHref, pieces } from '@/lib/site';

/**
 * Everything publicly reachable. The private catalogue and its access gate are
 * deliberately absent — both are `noindex`, and listing the gate here would
 * advertise the range behind it.
 *
 * /thank-you is absent for the same reason: it is `noindex`, and a sitemap entry
 * for a page we have asked not to be indexed is a contradiction Search Console
 * reports back as an error.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /* 4028, matching `layout.tsx`, `lib/schema.ts` and the dev script. This read
     3000 — Next's own default port, not this project's — so with the env var unset
     every absolute URL below pointed at a port nothing here ever serves. */
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028';
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, priority: 1.0 },
    { url: `${baseUrl}/collections`, lastModified, priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified, priority: 0.8 },
    { url: `${baseUrl}/craft`, lastModified, priority: 0.7 },
    { url: `${baseUrl}/factory`, lastModified, priority: 0.7 },
    { url: `${baseUrl}/journal`, lastModified, priority: 0.6 },
    // Listed so it is indexable and findable, at the lowest priority on the site:
    // it should never outrank a collection for anything.
    { url: `${baseUrl}/privacy`, lastModified, priority: 0.2 },

    ...collections.map((collection) => ({
      url: `${baseUrl}${collection.href}`,
      lastModified,
      priority: 0.8,
    })),

    ...pieces.map((piece) => ({
      url: `${baseUrl}${pieceHref(piece)}`,
      lastModified,
      priority: 0.6,
    })),

    ...journal.map((article) => ({
      url: `${baseUrl}/journal/${article.slug}`,
      lastModified,
      priority: 0.5,
    })),
  ];
}
