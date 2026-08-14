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
 */
const AppLogo = memo(function AppLogo({
  src = '/assets/images/app_logo.png',
  size = 64,
  className = '',
  onClick,
}: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
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
        priority
        unoptimized={src.endsWith('.svg')}
      />
    </div>
  );
});

export default AppLogo;
