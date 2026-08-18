'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';

interface AppImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  onClick?: () => void;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
  [key: string]: any;
}

/*
 * `fallbackSrc` is the house mark, which is what it always was.
 *
 * It used to point at `no_image.png` — a file with the same MD5 as `app_logo.png`,
 * so the placeholder for a broken image was already the VI monogram, at 2572px and
 * 1.71 MB. Two identical copies of the largest file in `public/`, one of them for a
 * path that cannot fire while every image on the site is a committed local WebP.
 * Same picture, 6.6 kB, one copy.
 */
const AppImage = memo(function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  onClick,
  fallbackSrc = '/assets/images/vi-mark-256.png',
  loading = 'lazy',
  unoptimized = false,
  ...props
}: AppImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isExternalUrl = useMemo(
    () => typeof imageSrc === 'string' && imageSrc.startsWith('http'),
    [imageSrc]
  );
  const resolvedUnoptimized = unoptimized || isExternalUrl;

  const handleError = useCallback(() => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  }, [hasError, imageSrc, fallbackSrc]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const imageClassName = useMemo(() => {
    const classes = [className];
    if (isLoading) classes.push('bg-paper-deep');
    if (onClick)
      classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-fast ease-out');
    return classes.filter(Boolean).join(' ');
  }, [className, isLoading, onClick]);

  /* `alt` is deliberately not in here. It is passed as its own attribute on the
     two <Image>s below, because a11y linting cannot see an attribute that arrives
     through a spread — every call site was passing real alt text and the rule
     still reported both branches as missing it. An explicit attribute is also the
     one prop a later spread must not be able to overwrite. */
  const imageProps = useMemo(() => {
    const baseProps: any = {
      src: imageSrc,
      className: imageClassName,
      quality,
      placeholder,
      unoptimized: resolvedUnoptimized,
      onError: handleError,
      onLoad: handleLoad,
      onClick,
    };

    if (priority) {
      baseProps.priority = true;
    } else {
      baseProps.loading = loading;
    }

    if (blurDataURL && placeholder === 'blur') {
      baseProps.blurDataURL = blurDataURL;
    }

    return baseProps;
  }, [
    imageSrc,
    imageClassName,
    quality,
    placeholder,
    blurDataURL,
    resolvedUnoptimized,
    priority,
    loading,
    handleError,
    handleLoad,
    onClick,
  ]);

  if (fill) {
    return (
      <div className="relative" style={{ width: '100%', height: '100%' }}>
        <Image
          {...imageProps}
          fill
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          style={{ objectFit: 'cover' }}
          {...props}
          alt={alt}
        />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 300}
      sizes={sizes}
      {...props}
      alt={alt}
    />
  );
});

AppImage.displayName = 'AppImage';

export default AppImage;
