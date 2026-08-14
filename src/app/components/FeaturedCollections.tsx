'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useReveal } from '@/components/ui/useReveal';
import { collections, img } from '@/lib/site';

/**
 * Asymmetric widths, but no gaps.
 *
 * Six cards pair into three full rows (7+5, 5+7, 7+5), so every row is exactly
 * twelve columns wide and nothing is ever left over. The pair in each row shares
 * one fixed height, which is the part that matters: giving cards of different
 * widths the same aspect ratio made their heights differ, so captions landed on
 * ragged baselines and voids opened beside the shorter card. With the height
 * pinned per row, `object-cover` absorbs the difference, captions align, and the
 * row heights themselves vary to keep the rhythm from feeling mechanical.
 */
const LAYOUT = [
  { span: 'lg:col-span-7', height: 'lg:h-[26rem]' },
  { span: 'lg:col-span-5', height: 'lg:h-[26rem]' },
  { span: 'lg:col-span-5', height: 'lg:h-[21rem]' },
  { span: 'lg:col-span-7', height: 'lg:h-[21rem]' },
  { span: 'lg:col-span-7', height: 'lg:h-[24rem]' },
  { span: 'lg:col-span-5', height: 'lg:h-[24rem]' },
] as const;

export default function FeaturedCollections() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} id="collections" className="py-20 lg:py-32">
      <div className="shell">
        <header className="rule-label rise">
          <div className="flex-1">
            <h2 className="font-serif text-display font-light -mt-2">
              The <span className="italic">collections</span>
            </h2>
          </div>
          <Link
            href="/collections"
            className="link-arrow tap hidden sm:inline-flex items-center gap-2.5 text-manifest text-ink-soft hover:text-clay transition-colors duration-fast ease-out"
          >
            All collections
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </header>

        <div
          data-reveal-group
          className="grid lg:grid-cols-12 gap-x-6 gap-y-12 lg:gap-y-16 mt-12 lg:mt-16"
        >
          {collections.map((collection, i) => {
            const plate = img(collection.image);
            return (
              <Link
                key={collection.name}
                href={collection.href}
                className={`group flex flex-col rise ${LAYOUT[i].span}`}
              >
                <div className={`plate h-[62vw] sm:h-[46vw] ${LAYOUT[i].height}`}>
                  <AppImage
                    src={plate.src}
                    alt={plate.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    placeholder="blur"
                    blurDataURL={plate.blurDataURL}
                    className="object-cover"
                  />
                </div>

                {/* Caption below the plate, catalogue-style — no scrim. */}
                <div className="flex items-baseline gap-4 pt-4 mt-4 border-t border-line group-hover:border-ink transition-colors duration-fast ease-out">
                  <span className="text-manifest-sm text-muted numeral">{collection.index}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-title group-hover:text-clay transition-colors duration-fast ease-out">
                        {collection.name}
                      </h3>
                      <span className="text-manifest-sm text-muted shrink-0">
                        {collection.range}
                      </span>
                    </div>
                    <p className="text-body text-muted mt-1.5 max-w-measure">
                      {collection.tagline}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="rule mt-16 lg:mt-20 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rise">
          <p className="text-body text-muted max-w-measure">
            The full catalogue runs to over a thousand designs. Verified trade buyers receive access
            to the private range.
          </p>
          <Link href="/collections#access" className="btn btn-ghost shrink-0">
            Request catalogue access
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
