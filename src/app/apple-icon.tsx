import { ImageResponse } from 'next/og';
import fs from 'node:fs';
import path from 'node:path';

/**
 * The iOS home-screen icon.
 *
 * `icons.apple` in the root layout pointed at `/favicon.png`, which is 64x64 with
 * an alpha channel. iOS draws this at 180x180 and does not honour transparency —
 * it composites whatever it is given onto a flat background of its own choosing.
 * So a dark monogram on transparent, upscaled 2.8x, arrived soft and sitting on
 * black. Two faults, one file doing two jobs.
 *
 * Generated rather than committed: this is the existing mark on the house ground
 * at the size Apple actually asks for, so there is nothing to draw and nothing to
 * keep in sync. Same read-from-disk approach as `opengraph-image.tsx` — this runs
 * at build time, when there is no server to fetch from, and the deployment already
 * carries `public/`. The 256px mark rather than the favicon, because here it is
 * being scaled up rather than down.
 *
 * The mark occupies 58% of the canvas. iOS rounds the corners itself and clips
 * hard, so artwork run to the edges loses its extremities; the inset is what keeps
 * the V's arms inside the mask.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const PAPER = '#EFE9DF';

const mark = () => {
  const file = fs.readFileSync(
    path.join(process.cwd(), 'public', 'assets', 'images', 'vi-mark-256.png')
  );
  return `data:image/png;base64,${file.toString('base64')}`;
};

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        /* Opaque. The whole reason this file exists. */
        background: PAPER,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- satori renders its
            own raster; next/image has no meaning inside an ImageResponse. */}
      <img src={mark()} width={104} height={104} alt="" />
    </div>,
    size
  );
}
