import { MetadataRoute } from 'next';
import { collections, journal, pieceHref, pieces } from '@/lib/site';

/**
 * Everything publicly reachable. The private catalogue and its access gate are
 * deliberately absent — both are `noindex`, and listing the gate here would
 * advertise the range behind it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, priority: 1.0 },
    { url: `${baseUrl}/collections`, lastModified, priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified, priority: 0.8 },
    { url: `${baseUrl}/craft`, lastModified, priority: 0.7 },
    { url: `${baseUrl}/factory`, lastModified, priority: 0.7 },
    { url: `${baseUrl}/journal`, lastModified, priority: 0.6 },

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
