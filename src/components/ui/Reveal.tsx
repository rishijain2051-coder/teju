'use client';

import React from 'react';
import { useReveal } from '@/components/ui/useReveal';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Show on mount rather than on scroll. For content above the fold. */
  immediate?: boolean;
}

/**
 * Mounts the reveal fallback around server-rendered content.
 *
 * GSAP drives reveals by global selector on every route change, so markup only
 * has to carry `.rise` / `.veil` / `.wipe-inner` to animate. This exists for
 * when GSAP never arrives — a failed dynamic import, or reduced motion — and it
 * is the reason no page can be left holding invisible content. One instance per
 * page is enough: `useReveal` collects every matching descendant, so wrapping
 * each section separately would only duplicate observers.
 */
export default function Reveal({ children, className, immediate = false }: RevealProps) {
  const ref = useReveal<HTMLDivElement>({ immediate });

  /*
   * `immediate` means above the fold, and above the fold must not wait for
   * hydration to become visible — that cost ~2s of LCP on a throttled phone.
   * `reveal-now` is server-rendered, so the entrance is a CSS animation running
   * at first paint; the hook still runs, to tell GSAP this section is done.
   */
  return (
    <div ref={ref} className={[immediate && 'reveal-now', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
