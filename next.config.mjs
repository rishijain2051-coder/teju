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
    minimumCacheTTL: 60,
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
