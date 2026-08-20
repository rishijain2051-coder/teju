import React from 'react';
import PlateLink from '@/components/ui/PlateLink';
import AppImage from '@/components/ui/AppImage';
import { collections, img, piecesIn } from '@/lib/site';

/**
 * The collections directory, as a flock of posters that lands into a list.
 *
 * Every collection spawns scattered across the first viewport, drifts, then
 * converges on the slot it belongs to — the four that settle below the fold sail
 * down out of frame on the way, which is the scroll cue. The animation itself is
 * `poster-land` in `src/styles/tailwind.css`; this file supplies the scatter and
 * the markup, and deliberately ships no JavaScript of its own.
 *
 * A server component, in other words, and that is the whole design. This is the
 * first fold on /collections and a poster is its LCP element, so an entrance
 * driven from `useEffect` would not begin until the bundle had parsed — the
 * measured ~2s of blank, fully-downloaded page that `.reveal-now` was introduced
 * to fix. A CSS animation on server-rendered markup starts at first paint. The
 * only client code on the row is `PlateLink`, which the old directory already
 * used and which the page already pays for.
 *
 * It replaces the six-row directory that used to sit here — a 64px square
 * thumbnail per collection, which showed the photography at a size that could not
 * carry it. The plate morph is unchanged: `data-plate` still marks the element
 * that travels, `PlateLink` still flips it to `active` on click, and the
 * destination is still the 4:3 plate at the top of the collection page. Source and
 * destination now have different aspect ratios, which the morph rules already
 * handle — both snapshots are `object-fit: cover`, so a 1.71:1 poster opens into a
 * 4:3 plate by narrowing its crop rather than squashing.
 */

/*
 * A stable pseudo-random number in [0, 1) from a string and a salt.
 *
 * Deterministic, and it has to be. The scatter is delivered as inline custom
 * properties on server-rendered elements, so `Math.random()` would put one set of
 * values in the HTML and a different set in the hydrating tree — a style attribute
 * mismatch, which React reports and pointedly does not patch. It would also mean
 * the flock re-scattered on every return to this page, and a layout that differs
 * run to run is not a texture, it is a flicker.
 *
 * FNV-1a with an avalanche step on the way out. The plain hash leaves too little
 * entropy in the low bits: taking a modulus of it directly put four of the six
 * posters within three degrees of the same rotation, which is not a flock, it is
 * a stack that has been nudged.
 */
function seeded(text: string, salt: number): number {
  let h = (2166136261 ^ salt) >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/*
 * A stable permutation of 0..n-1.
 *
 * Fisher-Yates, driven by the same hash, so the order is fixed per salt. One
 * permutation per axis, with different salts, which is what keeps the axes
 * independent — share a single order and the leftmost poster is reliably also the
 * smallest, and a cloud with a size gradient across it reads as a perspective
 * grid rather than as scattered objects.
 */
function shuffled(n: number, salt: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(seeded(`p${i}`, salt) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** One evenly-spaced band of `lo..hi`, jittered within itself by `jitter` in [0,1). */
const band = (slot: number, n: number, lo: number, hi: number, jitter: number) =>
  lo + ((hi - lo) / n) * (slot + jitter);

/*
 * Where a poster is before it belongs anywhere.
 *
 * `--fx` reads across the viewport and `--fy` down it, but only relative to
 * poster 0's slot — the stylesheet adds the `--slot` lift that brings every poster
 * back up to that slot, so `--fy` is measured from there rather than from the top
 * of the page.
 *
 * Which is why the vertical band is almost entirely negative. Every poster's
 * spawn position works out to `poster 0's slot + --fy`, and poster 0's slot is not
 * near the top of anything: the masthead above it is 641px on a phone and 797px on
 * a 1440 desktop, so that slot is already four fifths of the way down the first
 * screen. Measured with the band running to +46vh, posters 3, 4 and 5 spawned at
 * document y 849, 968 and 818 against an 812px viewport — half the flock began
 * its life below the fold, and the cloud the visitor actually saw was three
 * posters. Running -72vh to +6vh instead puts all six on screen at both sizes.
 *
 * It does mean the flock crosses the masthead on its way in. That is the intent
 * rather than a side effect — the swarm should own the whole first screen and
 * resolve out of it — and the fixed header sits at z-50 above all of it, so the
 * navigation stays readable throughout.
 *
 * Stratified, not simply hashed, and that distinction is the difference between
 * this reading as a cloud and reading as a mistake. A hash gives determinism; it
 * does not give distribution, and with only six draws there is nothing forcing
 * them apart. Measured on the real six slugs, the straight-hash version put five
 * of six posters left of centre and every scale inside a 0.10 band — so the flock
 * leaned to one side and had no depth in it at all. Each axis is now cut into six
 * equal bands, every poster takes exactly one, and the hash only chooses which
 * band and where inside it. Same determinism, guaranteed coverage: 3 left and 3
 * right, and a scale range of 0.33.
 *
 * The limits are chosen rather than picked. Rotation stops at 14deg because past
 * roughly fifteen a full-bleed 1.71:1 photograph starts showing its own corners
 * against the paper and the illusion becomes a rotated rectangle. Scale bottoms
 * out at 0.54 rather than near zero: a poster small enough to read as a speck
 * reads as a rendering fault on the way back up, and the blur is carrying the
 * sense of distance anyway.
 */
const COUNT = collections.length;
const ACROSS = shuffled(COUNT, 11);
const DOWN = shuffled(COUNT, 22);
const TURN = shuffled(COUNT, 33);
const SIZE = shuffled(COUNT, 44);

const scatterFor = (slug: string, at: number): React.CSSProperties =>
  ({
    '--fx': `${band(ACROSS[at], COUNT, -40, 40, seeded(slug, 1)).toFixed(2)}vw`,
    '--fy': `${band(DOWN[at], COUNT, -72, 6, seeded(slug, 2)).toFixed(2)}vh`,
    '--fr': `${band(TURN[at], COUNT, -14, 14, seeded(slug, 3)).toFixed(2)}deg`,
    '--fs': band(SIZE[at], COUNT, 0.54, 0.94, seeded(slug, 4)).toFixed(3),
    '--slot': at,
    /* 85ms, not the reveal scale's 100: six posters at 100 spends half a second
       getting the last one moving, by which time the first has already landed and
       the flock has stopped being a flock. */
    '--land-delay': `${at * 85}ms`,
  }) as React.CSSProperties;

export default function CollectionPosters() {
  return (
    /*
     * `poster-flock` gates the animation, so the posters are inert markup until
     * this class is above them — which keeps the keyframes out of the way of
     * anything else that ends up using `.poster`.
     */
    <section className="poster-flock pb-8 lg:pb-12">
      <div className="shell">
        {/* Counted, not spelled out. The page description interpolates the same
            figure so a collection added at /keystatic cannot leave a stale number
            behind; this line reads from the same array. */}
        <p className="text-manifest-sm text-muted numeral">
          {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
        </p>

        {/*
          The spacing between rows is padding *inside* each item, not a gap on the
          list, and that is load-bearing rather than a style preference. The lift
          that starts each poster in the first viewport is `translateY(--slot *
          -100%)`, and a percentage there resolves against the element's own
          height — so the element has to be the whole row pitch. Move this to
          `gap-y` and poster 5 starts five gaps too low.
        */}
        <ul className="mt-5">
          {collections.map((collection, at) => {
            const plate = img(collection.image);
            const shown = piecesIn(collection.name).length;

            return (
              <li
                key={collection.slug}
                className="poster pb-14 lg:pb-24"
                style={scatterFor(collection.slug, at)}
              >
                <PlateLink
                  href={collection.href}
                  className="group block border-t border-line pt-4 press"
                >
                  <div className="flex items-baseline gap-5 sm:gap-8">
                    <span className="text-manifest-sm text-muted numeral shrink-0">
                      {collection.index}
                    </span>

                    <h2 className="text-title flex-1 min-w-0 group-hover:text-clay transition-colors duration-fast ease-out">
                      {collection.name}
                    </h2>

                    {/* The bespoke programme has a range rather than a count:
                        it is specified to drawing, so "2 shown" would imply a
                        catalogue of two to order from. */}
                    <span className="text-manifest-sm text-muted shrink-0 text-right">
                      {collection.bespoke ? collection.range : `${shown} shown`}
                    </span>

                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      aria-hidden="true"
                      className="shrink-0 text-muted group-hover:text-clay transition-colors duration-fast ease-out"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/*
                    Clamped to two lines and reserving both, which is arithmetic
                    before it is taste. The lift that starts each poster in the
                    first viewport is `--slot * -100%`, and a percentage there
                    resolves against the element's own height — so it is only
                    correct while every row is the same height. Measured with the
                    taglines free to wrap, the six rows came out 570 to 851px, and
                    poster 5 was lifted by five of its own 851 against an actual
                    offset of 3,347: it started 908px above the viewport and flew
                    in from off-screen rather than out of the cloud.

                    `3.36em` is two lines of `.text-body`, whose line-height is
                    1.68. It also gives the list a steady pitch, which an
                    editorial run of six wants anyway.
                  */}
                  <p className="text-body text-muted mt-2 max-w-measure line-clamp-2 min-h-[3.36em]">
                    {collection.tagline}
                  </p>

                  {/*
                    Capped at 980px rather than filling the shell's 1584. At full
                    width a 1.71:1 poster is 928px tall on a 1440 screen, which
                    puts the caption of the next collection two thirds of a screen
                    below the fold and makes the list feel like six separate
                    pages. At 980 one poster and the top of the next are in view,
                    so the stack always visibly continues.
                  */}
                  <div data-plate="idle" className="plate aspect-[2000/1173] mt-5 max-w-[980px]">
                    <AppImage
                      src={plate.src}
                      alt={plate.alt}
                      fill
                      sizes="(min-width: 1076px) 980px, 100vw"
                      placeholder="blur"
                      blurDataURL={plate.blurDataURL}
                      /* The first poster is the LCP element on this route. */
                      priority={at === 0}
                      className="object-cover"
                    />
                  </div>
                </PlateLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
