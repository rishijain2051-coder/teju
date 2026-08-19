import { imageHosts } from './image-hosts.config.mjs';

/*
 * Content Security Policy.
 *
 * Read the script-src line first, because it is the one that is *not* strict and
 * the reason is structural rather than an oversight. This site is statically
 * rendered, and the App Router streams its hydration payload as inline
 * `<script>self.__next_f.push(...)</script>` blocks whose content differs per
 * page — so they cannot be enumerated as hashes in a static header, and the only
 * thing that covers them is a per-request nonce. A nonce has to be minted in
 * middleware, which opts every page into dynamic rendering: no full-route cache,
 * and middleware on every request instead of the five paths it guards today.
 * That trades away the whole caching posture of this repo to close one hole, so
 * `'unsafe-inline'` stays and the honest summary is: this policy does not stop
 * injected inline script. If that trade is ever worth making, the change is a
 * nonce in `src/middleware.ts` and a widened matcher — not an edit here.
 *
 * Everything else is real, and three directives in particular are why this is
 * worth shipping without the nonce:
 *
 *   form-action 'self'   an injected <form action="https://…"> cannot post the
 *                        enquiry fields, or a typed access code, off-origin.
 *   base-uri 'self'      an injected <base> cannot re-point every relative script
 *                        and asset URL on the page at another host.
 *   frame-ancestors      nothing may frame this site. There is no legitimate
 *          'none'        embedder, and the trade gate is exactly the kind of form
 *                        worth clickjacking.
 *
 * Production only, and deliberately so. `next dev` serves HMR over a websocket
 * that `connect-src 'self'` refuses, compiles with eval-based source maps that
 * need `'unsafe-eval'`, and hosts the Keystatic editor — none of which exist in a
 * production build, and all of which would have to be loosened here to keep the
 * dev loop working, weakening the policy that actually ships. Test the real one
 * locally with `npm run serve`, which runs NODE_ENV=production.
 *
 * data: in img-src is required: `next/image` blur placeholders are inline
 * `data:image/webp` payloads generated into `src/lib/imagery.ts`.
 *
 * blob: is deliberately absent. The private catalogue's CSV export builds a Blob
 * and clicks an `<a download href="blob:…">`, which is a download rather than a
 * subresource fetch — no fetch directive governs it, `navigate-to` was dropped
 * from the spec and never shipped, so listing blob: anywhere would protect
 * nothing. If that export ever breaks under this policy, the directive to look at
 * is the one for however it is being rendered, not this comment.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/*
 * The analytics hosts are conditional on the same variable the root layout reads,
 * so a deployment with no GA property does not advertise Google in its policy —
 * and a deployment with one cannot have its beacons refused. Both facts come from
 * one value; see the note on GA in `src/app/layout.tsx`.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${GA_ID ? ' https://www.googletagmanager.com' : ''}`,
  // 38 `style={{…}}` props across the tree, and React renders those as style
  // attributes, which style-src-attr inherits from here. GSAP writes through the
  // CSSOM instead, which CSP does not govern at all.
  "style-src 'self' 'unsafe-inline'",
  /*
   * `https:` — any HTTPS host — and only when GA is configured. This is the
   * loosest directive in the policy and it is a deliberate, priced decision.
   *
   * It buys the Google Ads remarketing pixel, which is an <img> to
   * `www.google.<cctld>/ads/ga-audiences`. The host follows the *visitor's*
   * country: google.co.in from Jodhpur, google.de from Düsseldorf, and so on
   * across the ~190 country domains Google operates. CSP host-sources cannot
   * express that — `*` matches a subdomain, never a TLD — so there is no tight
   * spelling of "the remarketing pixel" to write here. The choice was this or
   * enumerating country domains forever, and this was chosen.
   *
   * What it costs, stated plainly: an image request is a GET with data in the URL,
   * which makes `img-src` an exfiltration channel. With `https:` here, script that
   * has already achieved execution on this page can beacon what it has read to any
   * host it likes by setting an image source. Combined with the `'unsafe-inline'`
   * on script-src above, treat this policy as defence against a *hijacked
   * subresource* and against clickjacking, framing and form redirection — and not
   * as containment once arbitrary script is running.
   *
   * With no GA property configured the directive tightens back to `'self' data:`
   * on its own, because the only reason for the looseness is Google's ads stack.
   * `data:` is required either way for the next/image blur placeholders.
   */
  `img-src 'self' data:${GA_ID ? ' https:' : ''}`,
  "font-src 'self'",
  /*
   * `analytics.google.com` is listed WITHOUT a leading wildcard as well as with
   * one, and that is not redundancy. A host-source of `*.analytics.google.com`
   * matches a subdomain and specifically does not match the bare host — and GA4's
   * consent-mode endpoint is `https://analytics.google.com/g/collect`, no
   * subdomain. Verified from a real page load: with only the wildcard form, every
   * pageview logged "Refused to connect ... violates ... connect-src" and no hit
   * reached the property. The wildcard stays for the regional
   * `region1.analytics.google.com` variants.
   *
   * `www.google.com` is here for Google Ads conversion tracking, not analytics.
   * This property has an Ads link, and /contact fires
   * `www.google.com/measurement/conversion?...&en=ads_conversion_Contact_Us_1` —
   * blocked, that silently stops attributing contact conversions to ad spend,
   * which is the one failure in this policy with a budget attached. Also found on
   * the wire rather than by reading the code, which is the argument for checking a
   * CSP against a real page load before shipping it.
   */
  `connect-src 'self'${
    GA_ID
      ? ' https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com'
      : ''
  }`,
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * Source maps stay off in production. The scaffold shipped them, which
   * published the entire readable source — including every comment — to anyone
   * who opened devtools, and added the map files to every deploy. Turn this back
   * on temporarily if you need to debug a production-only fault.
   */
  productionBrowserSourceMaps: false,

  distDir: process.env.DIST_DIR || '.next',

  /*
   * Both of these were `true`, which meant `next build` succeeded with type
   * errors and lint errors in the tree — the build proved nothing. `tsc` and
   * `eslint` now gate the build itself, so CI cannot go green on a broken type.
   */
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  images: {
    remotePatterns: imageHosts,

    /*
     * AVIF first, WebP behind it. This is a furniture catalogue — photographs are
     * the payload, 1.4 MB of them on the home page alone at mobile sizes — and
     * AVIF carries the same picture in roughly a third less. Content negotiation
     * means a browser without it silently gets the WebP, so nothing degrades.
     */
    formats: ['image/avif', 'image/webp'],

    /*
     * Thirty-one days, not sixty seconds. The optimiser re-encoded every size
     * after a minute, so a returning visitor paid for the work again and any CDN
     * in front of it could barely hold anything.
     *
     * The trade is real and worth stating: this caches by request path, so
     * replacing a photograph at an existing filename can serve the old one for up
     * to a month. Give a replacement a new filename — `process-images.mjs` picks
     * it up from the directory and rewrites `imagery.ts` either way — or purge.
     */
    minimumCacheTTL: 2678400,

    qualities: [75, 85, 100],
  },

  /*
   * Cache headers for everything under `public/`.
   *
   * Vercel serves static files with `public, max-age=0, must-revalidate` because
   * their filenames are not content-hashed and it cannot know whether a deploy
   * changed them. Its edge cache absorbs the origin cost, so this is cheap for us
   * and not free for the visitor: every one of these is revalidated on every page
   * view, and four of them are fonts this layout preloads on every route.
   *
   * That default is also where the optimiser's `max-age=0` came from. Next sets
   * `minimumCacheTTL` on its own optimised responses — verified locally, where
   * /_next/image answers `max-age=2678400` — but the header is derived from the
   * upstream file, and on Vercel the upstream is a static asset saying zero.
   *
   * A year and `immutable` for the fonts. These are the exact bytes `next/font`
   * produced, lifted out of a build output; the file at a given name is a fixed
   * artefact, and `immutable` stops even a reload revalidating it.
   *
   * Thirty-one days and no `immutable` for the imagery, matching `minimumCacheTTL`
   * so the browser and the optimiser expire together. Not a year, and deliberately
   * revalidatable: a photograph *can* be replaced at an existing filename, and
   * while the convention here is to give a replacement a new name — see the note on
   * minimumCacheTTL above, and `vi-mark-256.png` — a month is the longest mistake
   * worth risking on content someone might swap in place.
   */
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2678400' }],
      },
      {
        source: '/favicon.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2678400' }],
      },
      /*
       * Every route, including the static assets above — a second entry with a
       * different key does not displace the Cache-Control ones, Next sends both.
       * Guarded on NODE_ENV rather than filtered by path: see the note above `csp`
       * for why development is exempt.
       */
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/:path*',
              headers: [{ key: 'Content-Security-Policy', value: csp }],
            },
          ]
        : []),
    ];
  },

  webpack(config, { dev }) {
    /*
     * The DhiWise component-tagger loader used to run over every .jsx/.tsx file
     * here. It was the last piece of the Rocket.new scaffold: a build-time
     * transform that annotated components for their visual editor and did
     * nothing for the shipped site. If you go back to editing through that
     * editor, reinstall `@dhiwise/component-tagger` and restore the rule.
     */
    if (dev) {
      const ignoredPaths = (process.env.WATCH_IGNORED_PATHS || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      config.watchOptions = {
        ignored: ignoredPaths.length
          ? ignoredPaths.map((p) => `**/${p.replace(/^\/+|\/+$/g, '')}/**`)
          : undefined,
      };
    }
    return config;
  },
};

export default nextConfig;
