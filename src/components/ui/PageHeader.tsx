'use client';

import React from 'react';
import { useReveal } from '@/components/ui/useReveal';
import { delay } from '@/lib/reveal';

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  /** Manifest pairs rendered as a filed-document row beneath the lead. */
  meta?: readonly { key: string; value: string }[];
  /**
   * Tightens the masthead where the page's own content has to reach the first
   * screen. /collections is the case it exists for: at full height this block is
   * 607px on a 1280x720 laptop, which pushed the first collection poster's slot to
   * 641 and left its photograph entirely below the fold — so the entrance that
   * page is built around landed where nobody could see it.
   */
  compact?: boolean;
  children?: React.ReactNode;
}

/**
 * The interior-page masthead. Interior pages previously each opened with a
 * dark photo behind a scrim and low-contrast type; this puts them on paper and
 * lets the typography carry the page.
 *
 * `reveal-now` is the load-bearing class here. This is the first viewport on
 * seven routes, and on a throttled phone its lead paragraph was the LCP element
 * on two of them — painting at ~2.9s against a first paint of ~1.0s, because
 * `useReveal` cannot add `shown` until the page has hydrated. The class hands the
 * entrance to a CSS animation that starts at first paint instead. `useReveal`
 * stays: it is what tells GSAP this section is already done.
 */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  meta,
  compact = false,
  children,
}: PageHeaderProps) {
  const ref = useReveal<HTMLElement>({ immediate: true });

  return (
    <header
      ref={ref}
      className={`reveal-now ${
        compact ? 'pt-28 lg:pt-32 pb-6 lg:pb-8' : 'pt-32 lg:pt-44 pb-12 lg:pb-16'
      }`}
    >
      <div className="shell">
        <p className="text-manifest text-clay veil">{eyebrow}</p>

        <h1 className="font-serif text-display font-light mt-6 lg:mt-8 max-w-[18ch]">
          <span className="wipe">
            <span className="wipe-inner" style={delay(90)}>
              {title}
            </span>
          </span>
        </h1>

        {lead && (
          <p className="text-lead text-ink-soft max-w-measure mt-7 rise" style={delay(300)}>
            {lead}
          </p>
        )}

        {children && (
          <div className="mt-8 rise" style={delay(380)}>
            {children}
          </div>
        )}

        {meta && (
          <dl
            className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 mt-12 pt-6 border-t border-line rise"
            style={delay(440)}
          >
            {meta.map((entry) => (
              <div key={entry.key}>
                <dt className="text-manifest-sm text-muted">{entry.key}</dt>
                <dd className="text-body text-ink mt-1.5 numeral">{entry.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}
