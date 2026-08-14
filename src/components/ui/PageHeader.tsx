'use client';

import React from 'react';
import { useReveal } from '@/components/ui/useReveal';

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  /** Manifest pairs rendered as a filed-document row beneath the lead. */
  meta?: readonly { key: string; value: string }[];
  children?: React.ReactNode;
}

/**
 * The interior-page masthead. Interior pages previously each opened with a
 * dark photo behind a scrim and low-contrast type; this puts them on paper and
 * lets the typography carry the page.
 */
export default function PageHeader({ eyebrow, title, lead, meta, children }: PageHeaderProps) {
  const ref = useReveal<HTMLElement>({ immediate: true });

  return (
    <header ref={ref} className="pt-32 lg:pt-44 pb-12 lg:pb-16">
      <div className="shell">
        <p className="text-manifest text-clay veil">{eyebrow}</p>

        <h1 className="font-serif text-display font-light mt-6 lg:mt-8 max-w-[18ch]">
          <span className="wipe">
            <span className="wipe-inner" style={{ transitionDelay: '90ms' }}>
              {title}
            </span>
          </span>
        </h1>

        {lead && (
          <p
            className="text-lead text-ink-soft max-w-measure mt-7 rise"
            style={{ transitionDelay: '300ms' }}
          >
            {lead}
          </p>
        )}

        {children && (
          <div className="mt-8 rise" style={{ transitionDelay: '380ms' }}>
            {children}
          </div>
        )}

        {meta && (
          <dl
            className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 mt-12 pt-6 border-t border-line rise"
            style={{ transitionDelay: '440ms' }}
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
