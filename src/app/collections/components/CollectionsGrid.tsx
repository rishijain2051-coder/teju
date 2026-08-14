'use client';

import React, { useMemo, useState } from 'react';
import PieceCard from '@/components/ui/PieceCard';
import { useReveal } from '@/components/ui/useReveal';
import { collections, pieces } from '@/lib/site';

/* Derived from the collections themselves. Hard-coding the tabs is how
   Hospitality came to be missing from this filter while having a card of its
   own three sections further up the same page. */
const CATEGORIES = ['All', ...collections.map((collection) => collection.name)] as const;
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
                className={`text-manifest transition-colors duration-base tap ${
                  isActive ? 'text-clay' : 'text-muted hover:text-ink'
                }`}
              >
                {category}
                {/* Not zero-padded. A leading zero says "fixed-width
                    identifier", so `02` beside a tab read as an index and
                    collided with the collection indices further up the page.
                    A count is a quantity. */}
                <span className="ml-2 text-manifest-sm text-muted numeral">{count}</span>
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
          {filtered.map((piece) => (
            <PieceCard key={piece.ref} piece={piece} reveal={false} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-lead text-muted mt-16">Nothing in this collection yet.</p>
        )}
      </div>
    </section>
  );
}
