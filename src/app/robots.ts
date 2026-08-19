import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* `/keystatic` and not `/admin/`: there has never been an `/admin` path on
         this site, and the CMS route that does exist was crawlable. It is 404'd in
         production by middleware too — this stops the crawl before the request. */
      disallow: ['/api/', '/_next/', '/keystatic', '/collections/private'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
