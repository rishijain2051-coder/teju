'use client';

import React, { useMemo, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { useReveal } from '@/components/ui/useReveal';
import { pieces, img } from '@/lib/site';

const CATEGORIES = ['All', 'Living', 'Storage', 'Dining', 'Bedroom', 'Occasional'] as const;
type Category = (typeof CATEGORIES)[number];

export default function CollectionsGrid() {
  const [active, setActive] = useState<Category>('All');
  const ref = useReveal<HTMLElement>({ immediate: true });

  const filtered = useMemo(
    () => (active === 'All' ? pieces : pieces.filter((p) => p.collection === active)),
    [active]
  );

  return (
    <section ref={ref} className="pb-20 lg:pb-32">
      <div className="shell">
        {/* Filter — a row of tabs, not pills */}
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 py-5 border-y border-line rise">
          {CATEGORIES.map((category) => {
            const count =
              category === 'All'
                ? pieces.length
                : pieces.filter((p) => p.collection === category).length;
            const isActive = category === active;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                aria-pressed={isActive}
                className={`text-manifest transition-colors duration-base ${
                  isActive ? 'text-clay' : 'text-muted hover:text-ink'
                }`}
              >
                {category}
                <span className="ml-2 text-manifest-sm text-muted numeral">
                  {String(count).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>

        {/*
          Keyed on `active` so the grid remounts and replays its entrance on every
          filter change. The cards deliberately do NOT use `.rise`: that class is
          switched on by a one-shot observer wired at mount, so filtered-in cards
          would mount at opacity 0 with nothing left to reveal them.
        */}
        <div
          key={active}
          data-reveal-group
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-12 filter-swap"
        >
          {filtered.map((piece) => {
            const plate = img(piece.image);
            return (
              <article key={piece.ref} className="group">
                <div className="plate aspect-[4/3] bg-paper-deep">
                  <AppImage
                    src={plate.src}
                    alt={plate.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL={plate.blurDataURL}
                    className="object-cover"
                  />
                </div>

                <div className="pt-4 mt-4 border-t border-line group-hover:border-ink transition-colors duration-base">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-title font-light">{piece.name}</h3>
                    <span className="text-manifest-sm text-muted numeral shrink-0">{piece.ref}</span>
                  </div>
                  <p className="text-manifest-sm text-clay mt-2">{piece.collection}</p>

                  <dl className="mt-3 space-y-1">
                    {[
                      ['Material', piece.material],
                      ['Finish', piece.finish],
                      ['Dimensions', piece.dimensions],
                    ].map(([key, value]) => (
                      <div key={key} className="flex gap-3">
                        <dt className="text-manifest-sm text-muted w-24 shrink-0">{key}</dt>
                        <dd className="text-manifest-sm text-ink-soft numeral">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-lead text-muted mt-16">Nothing in this collection yet.</p>
        )}
      </div>
    </section>
  );
}
