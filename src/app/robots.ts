import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;
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
