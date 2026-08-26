import React from 'react';
import { brand } from '@/lib/site';

interface WordmarkProps {
  className?: string;
}

/**
 * The house lockup: the VI monogram and the company name, as one thing.
 *
 * This did not exist. Four mastheads assembled the lockup by hand — `<AppLogo>`
 * beside a `<span>` with the name typed as a literal — and it had drifted exactly
 * as you would expect. Three sizes for the same wordmark (`text-[1.15rem]`,
 * `text-[1.15rem] lg:text-[1.35rem]`, `text-[1.35rem]`), a monogram fixed at 30px
 * regardless of the type beside it, and the name spelled out five times in JSX
 * while `brand.name` sat in the content record being used for titles, schema, the
 * OG card and the footer's own copyright line. Footer.tsx did both, eighty-five
 * lines apart. Renaming the company in Keystatic would have changed every page
 * title and left five visible wordmarks saying the old name.
 *
 * The mark is a mask, not an `<img>`. That is the load-bearing decision here and
 * it settles four separate problems at once:
 *
 *   - Colour. `background-color: currentColor` means the mark is whatever colour
 *     the text is. The private catalogue masthead used to reach for
 *     `brightness-0 invert` to get a white mark on ink, which lands on pure
 *     #FFFFFF while the wordmark beside it is `paper` #EFE9DF — two temperatures
 *     in one lockup. A filter also forces a compositor render surface for a 30px
 *     glyph.
 *   - Resolution. `next/image` with fixed width/height and no `sizes` emits only
 *     1x and 2x candidates: `w=32` and `w=64`. A 30px box on a DPR-3 phone needs
 *     90 physical pixels, so the mark was drawn at 0.71x density and looked soft
 *     on every current handset. Verified by asking the browser what it fetched —
 *     `w=64` at DPR 3. A mask is handed the whole 256px file and downsamples from
 *     it, so it is sharp at any ratio.
 *   - Weight in the bundle. `AppLogo` was a client component with `memo` and
 *     `useMemo` serving an `onClick` prop that none of its four call sites passed.
 *   - The accessible name. The mark used to be an `<img alt="Vardhman Impex">`
 *     inside a link that also contained the text "Vardhman Impex", so the home
 *     link announced "Vardhman Impex Vardhman Impex". A mask has no alt to get
 *     wrong; the text node is the accessible name.
 *
 * Sizing and baseline live in `.vi-mark` — see tailwind.css, where the ink extents
 * this is derived from are written down.
 */
export default function Wordmark({ className = '' }: WordmarkProps) {
  return (
    <span className={`text-wordmark ${className}`}>
      <span aria-hidden="true" className="vi-mark" />
      {brand.name}
    </span>
  );
}
