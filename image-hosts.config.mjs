/**
 * Remote hosts the Next.js Image Optimization API may fetch from.
 *
 * Deliberately empty. `next.config.mjs` feeds this straight into
 * `images.remotePatterns`, and an empty list means /_next/image refuses every
 * remote URL outright — it will not fetch foreign bytes and hand them to
 * sharp/libvips to decode at request time. That decode is the reachable path
 * for the libvips advisories (GHSA-f88m-g3jw-g9cj), so closing it turns them
 * from a runtime exposure back into a build-time-only concern.
 *
 * Nothing here needs a remote host. Every photograph is a local file under
 * public/assets/images/catalogue/, addressed through the generated manifest in
 * src/lib/imagery.ts, and the Keystatic image fields are `select`s bound to
 * that same manifest rather than free-text URLs. The four hosts this list used
 * to carry — images.unsplash.com, images.pexels.com, images.pixabay.com, and
 * img.rocket.new from the Rocket.new scaffold — were never referenced by a
 * single component or content file.
 *
 * If you ever do need to render an image from somewhere else, add the one host
 * you need, as narrowly as you can scope it (`pathname` as well as `hostname`),
 * and understand that you are re-opening that decode path to it.
 */

export const imageHosts = [];
