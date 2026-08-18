'use client';

import React, { memo, useMemo } from 'react';
import AppImage from './AppImage';

interface AppLogoProps {
  /** Defaults to the house mark; passed only when a variant is needed. */
  src?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * The VI monogram.
 *
 * There used to be an icon fallback here for when no `src` was given, which
 * pulled the whole of `@heroicons/react` — 3.5 MB — into the dependency tree for
 * a branch that could never run: `src` has a default, so it is never falsy, and
 * all four call sites use that default. The mark is an image, and `AppImage`
 * already has its own fallback if the file is missing.
 *
 * 256px, and `eager` rather than `priority`.
 *
 * The default used to be `app_logo.png`: 2572px square and 1.71 MB of flat black
 * letterform, for a mark that renders at 26–30px at every one of those four call
 * sites. `priority` then preloaded it at high fetch priority, so the largest file
 * in `public/` sat on the critical path of every route, ahead of the photograph
 * that is actually the page — and the optimiser had to decode all 1.71 MB on the
 * first request for each size it derived. Same picture at 6.6 kB here, which is
 * 256px: eight times the 30px it draws at, so it still has headroom on a 3x screen
 * and clears the 112px minimum Google wants for the Organization logo in
 * `schema.ts`.
 *
 * Dropping `priority` is not the same as making it lazy. `loading="eager"` keeps it
 * out of the viewport-intersection queue, so it is fetched immediately and the
 * masthead never paints an empty box, and it drops the `fetchpriority="high"` that
 * `priority` was claiming next to the four preloaded font files. A 30px logo has no
 * business competing with those, or with the hero plate that is the LCP element.
 *
 * `fetchPriority="low"` is doing real work here and is not decoration — do not
 * delete it. `loading="eager"` on its own still emits a `<link rel="preload"
 * as="image">` for the mark on every route; adding this removes it. Measured both
 * ways on clean rebuilds: with it, `/privacy` and `/contact` carry zero image
 * preloads and `/` carries exactly one, the hero. Without it, all three carry one
 * more. It is worth knowing that it never appears as an attribute on the rendered
 * `<img>`, so it reads like a no-op and is not one.
 *
 * A new filename on purpose: `minimumCacheTTL` is 31 days, so the optimiser would
 * happily serve the old bytes for a month against the old path. See next.config.mjs.
 */
const AppLogo = memo(function AppLogo({
  src = '/assets/images/vi-mark-256.png',
  size = 64,
  className = '',
  onClick,
}: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick)
      classes.push('cursor-pointer hover:opacity-80 transition-opacity duration-fast ease-out');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      <AppImage
        src={src}
        alt="Vardhman Impex"
        width={size}
        height={size}
        className="flex-shrink-0"
        loading="eager"
        fetchPriority="low"
        unoptimized={src.endsWith('.svg')}
      />
    </div>
  );
});

export default AppLogo;
