import fs from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { brand, facts } from '@/lib/site';

/**
 * The share card, for every route that does not name a photograph of its own.
 *
 * Which is the useful half of the site: the home page, the collections index,
 * craft, factory, contact and the journal index. The three routes that do —
 * a collection, a piece and an article — already point Open Graph at the actual
 * plate in their own `generateMetadata`, and Next only falls back to this file
 * where `openGraph.images` is unset. A photograph of the piece beats a typeset
 * card on a furniture catalogue, so those are left alone deliberately.
 *
 * Every box below declares `display: flex`, including the ones with a single text
 * child that satori would accept without it. The build rejected this file for a
 * missing one and the error names no element, so the file no longer depends on
 * knowing which box it meant.
 *
 * Set as a bill of lading, like the rest of the site: paper ground, a hairline
 * rule, the mark and the wordmark filed at the top, the facts along the foot.
 *
 * One deviation from the site, and it is not a choice: the display line is not
 * Fraunces. `next/og` accepts TTF, OTF and WOFF, and every face in
 * `public/fonts/` is WOFF2 — passing one in fails with "Unsupported OpenType
 * signature wOF2", verified against this exact version. So this renders in the
 * bundled default face, and the card is built to survive that: hierarchy comes
 * from size, tracking and the clay rule rather than from a serif contrast that
 * would be silently substituted. Drop a TTF or WOFF build of Fraunces into
 * `public/fonts/` and this becomes a two-line change — a `fonts` entry below and
 * `fontFamily` on the display line.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${brand.name} — furniture manufacturer and exporter, Jodhpur`;

/* Read from disk rather than fetched over HTTP: this runs at build time, when
   there is no server to fetch from, and the deployment already carries `public/`.
   The 64px favicon rather than the 256px mark: this lands 56px wide and the
   favicon is already the right order of magnitude. `app_logo.png`, which this
   comment used to warn about at 1.7 MB, is gone — see AppLogo. */
const monogram = () => {
  const file = fs.readFileSync(path.join(process.cwd(), 'public', 'favicon.png'));
  return `data:image/png;base64,${file.toString('base64')}`;
};

const PAPER = '#EFE9DF';
const INK = '#17130F';
const INK_SOFT = '#3A332B';
const MUTED = '#655B4E';
const CLAY = '#973F24';
const LINE = '#D6CCBC';

const MANIFEST = [
  { key: 'Established', value: brand.established },
  { key: 'Factory', value: `${facts.factory} sq.mt` },
  { key: 'Catalogue', value: `${facts.designs}+ designs` },
  { key: 'Export', value: `${facts.countries} countries` },
];

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: PAPER,
        color: INK,
        padding: '64px 72px',
      }}
    >
      {/* Masthead */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders
                its own raster; next/image has no meaning inside an ImageResponse. */}
          <img src={monogram()} width={56} height={56} alt="" />
          <div style={{ display: 'flex', fontSize: 38, letterSpacing: '-0.015em' }}>
            {brand.name}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 18, letterSpacing: '0.18em', color: MUTED }}>
          JODHPUR · INDIA
        </div>
      </div>

      {/* The line the card exists to carry. Two lines by construction, not by
            wrapping: satori breaks on width alone, and a break landing after
            "and" read as a mistake at every card size. */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', width: 92, height: 3, background: CLAY }} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 34,
            fontSize: 60,
            lineHeight: 1.14,
            letterSpacing: '-0.02em',
            color: INK,
          }}
        >
          <div style={{ display: 'flex' }}>Solid mango and reclaimed timber,</div>
          {/* One interpolated string, not text plus an expression: satori lays
              every child of a flex box out as its own item, so a split line
              arrives as three boxes and loses the space between them. */}
          <div style={{ display: 'flex', color: INK_SOFT }}>
            {`made in one factory since ${brand.established}.`}
          </div>
        </div>
      </div>

      {/* The manifest strip, keys over values, exactly as the site files them. */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: `1px solid ${LINE}`,
          paddingTop: 26,
        }}
      >
        {MANIFEST.map((row) => (
          <div key={row.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', fontSize: 15, letterSpacing: '0.2em', color: MUTED }}>
              {row.key.toUpperCase()}
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: INK }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>,
    size
  );
}
