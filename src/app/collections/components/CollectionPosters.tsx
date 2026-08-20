import React from 'react';
import PlateLink from '@/components/ui/PlateLink';
import AppImage from '@/components/ui/AppImage';
import Arrow from '@/components/ui/Arrow';
import { collections, img, piecesIn } from '@/lib/site';

/**
 * The collections directory, as a flock of posters that lands into a list.
 *
 * All six spawn scattered across the first screen, drift, then converge on the
 * slots they belong to. Only the first slot is on screen, so the rest travel down
 * and out of frame to reach theirs — which is the scroll cue: the stack is visibly
 * still going when it leaves the bottom of the viewport. The animation itself is
 * `poster-land` in `src/styles/tailwind.css`; this file supplies the scatter and
 * the markup.
 *
 * A server component, and that is the whole design. The first
 * poster is this route's LCP element — the masthead above it is deliberately
 * compact so that it is — so an entrance driven from `useEffect` would not begin
 * until the bundle had parsed, which is the measured ~2s of blank,
 * fully-downloaded page that `.reveal-now` was introduced to fix. A CSS animation
 * on server-rendered markup starts at first paint instead, and `poster-flock` is
 * in the markup rather than added later, so there is no frame in which the
 * keyframes are not yet armed.
 *
 * This file adds no client code of its own. It is not a client-free row, though:
 * `PlateLink` is `'use client'` for its morph handler, and so is `AppImage`, both
 * of which the old directory also used and the page already pays for.
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
 * Which is why the band runs downward. Every poster's spawn position works out to
 * `poster 0's slot + --fy`, and that slot now sits near the top of the screen
 * because this route opens with a compact masthead — so the cloud spreads down
 * from it into the screen below. The band ran the other way while the masthead
 * was 607px tall, and that was the bug: the cloud formed up over the title and
 * the whole flock then landed below the fold, where nobody saw it.
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
    '--fy': `${band(DOWN[at], COUNT, -10, 48, seeded(slug, 2)).toFixed(2)}vh`,
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
     * `poster-flock` gates the keyframes, so `.poster` stays inert markup unless
     * this class is above it — which keeps the animation away from anything else
     * that ever adopts the class.
     */
    <section className="poster-flock pb-8 lg:pb-12">
      <div className="shell">
        {/*
          An `h2` at manifest size, not a `p`, and not a `SectionHead`.
          
          It has to be a heading: without one, the six collection names below took
          this section's level, and the twenty piece headings in the grid further
          down then read as belonging to whichever collection came last. Level and
          type scale are already decoupled across this codebase — the footer's
          column headings are `h2` at `text-manifest-sm`, `PieceCard`'s name is an
          `h3` at `text-title` — so this changes the outline and nothing visual.

          And not `SectionHead`, which would render it as display serif and push
          the first poster's photograph back below the fold, undoing the whole
          reason `PageHeader` gained its `compact` prop.

          Counted, not spelled out: the page description interpolates the same
          figure so a collection added at /keystatic cannot leave a stale number
          behind, and this reads from the same array.
        */}
        <h2 className="text-manifest-sm text-muted numeral">
          {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
        </h2>

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
                    {/* `aria-hidden`, because the position is what the list
                        conveys already, and read aloud it puts a bare numeral in
                        front of every name in a links rotor. */}
                    <span
                      aria-hidden="true"
                      className="text-manifest-sm text-muted numeral shrink-0"
                    >
                      {collection.index}
                    </span>

                    {/*
                      `truncate` is structural here, not cosmetic. Every other item
                      in this row is `shrink-0`, and the range text is the widest of
                      them: `.text-manifest-sm` is 12px at 0.15em tracking below
                      1024px, so the bespoke collection's "To specification" measures
                      ~144px. At 320px that leaves this heading about 37px for a
                      103px unbreakable word, and "Hospitality" painted straight over
                      the range.

                      It has to ellipsise rather than wrap: the `--slot * -100%` lift
                      is only correct while every row is exactly the same height, so
                      anything in this row gaining a second line would break the
                      entrance for every poster below it.
                    */}
                    <h3 className="text-title flex-1 min-w-[7ch] truncate group-hover:text-clay transition-colors duration-fast ease-out">
                      {collection.name}
                    </h3>

                    {/* The bespoke programme has a range rather than a count:
                        it is specified to drawing, so "2 shown" would imply a
                        catalogue of two to order from. */}
                    {/* Shrinkable, and it gives way before the name does. With this
                        `shrink-0` and the name free to collapse, 320px squeezed
                        "Hospitality" to 24px — "H…" — while "To specification" kept
                        all 87 of its pixels. The name is the thing being chosen
                        between; the count is a detail. `truncate` carries
                        `white-space: nowrap`, so neither can gain a second line and
                        break the uniform row height the entrance depends on. */}
                    <span className="text-manifest-sm text-muted min-w-0 truncate text-right">
                      {collection.bespoke ? collection.range : `${shown} shown`}
                    </span>

                    <Arrow className="shrink-0 text-muted group-hover:text-clay transition-colors duration-fast ease-out" />
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
                    Capped against the viewport's height as well as a fixed
                    maximum, because the row has to fit the screen it lands on. A
                    1.71:1 poster filling the shell's 1584 stands 928px tall; even
                    at 860 the row came to 738, taller than a 1280x720 laptop — so
                    the poster could never be wholly visible at the moment it
                    arrived, which is the entire point of the entrance.

                    `105vh` is that constraint solved for width. The plate is
                    `width / 1.705` tall, so 105vh of width is about 62vh of
                    height, and the caption and padding above it fit in what is
                    left. On a 720px screen: 756 wide, 443 tall, row 677. On a
                    900px screen the 860 cap takes over: 504 tall, row 738. Both
                    leave the next collection's caption just showing, so the stack
                    always visibly continues.
                  */}
                  <div
                    data-plate="idle"
                    className="plate aspect-[2000/1173] mt-5 max-w-[min(860px,105vh)]"
                  >
                    {/*
                      `alt=""`. The photograph is inside a link the collection name
                      already names, so its seventeen words were appended to that
                      name — every poster announced as a numeral, a name, a count, a
                      tagline and then a description of pampas in a vase, which is
                      thirty-odd words to choose between six links on. And it
                      describes one styled shot, not the collection: none of it is
                      information a buyer acts on. The string stays in `imagery.ts`
                      and stays load-bearing where it is the only text there is —
                      HeroSection builds a control label out of it.
                    */}
                    <AppImage
                      src={plate.src}
                      alt=""
                      fill
                      sizes="(min-width: 956px) 860px, 100vw"
                      placeholder="blur"
                      blurDataURL={plate.blurDataURL}
                      /* No `object-cover` class: AppImage's `fill` branch already
                         sets `object-fit: cover` inline, which would win anyway. */
                      /* The first poster is the LCP element on this route. */
                      priority={at === 0}
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
