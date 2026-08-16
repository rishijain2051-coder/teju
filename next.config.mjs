import { imageHosts } from './image-hosts.config.mjs';

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
