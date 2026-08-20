import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import CollectionPosters from '@/app/collections/components/CollectionPosters';
import CollectionsGrid from '@/app/collections/components/CollectionsGrid';
import ExclusiveAccess from '@/app/collections/components/ExclusiveAccess';
import { collections, facts, pieces } from '@/lib/site';

/*
 * Nobody searches for "collections", so the title spends its length on the three
 * casegoods a buyer actually types and leaves the word in front only because it
 * is what the navigation and the inbound links call this page.
 *
 * The description counts the catalogue rather than describing it — the two totals
 * and the range figure are interpolated, so a design added at /keystatic cannot
 * leave the snippet claiming a number the grid below no longer shows.
 */
export const metadata: Metadata = {
  /* Self-referencing canonical — see src/app/page.tsx. */
  alternates: { canonical: '/collections' },
  title: 'Collections · Sideboards, Cabinets & Chests',
  description: `Sideboards, cabinets, consoles, vitrines and chests in solid mango and reclaimed hardwood, made in Jodhpur. ${collections.length} collections, ${pieces.length} designs shown of ${facts.designs}+.`,
};

/*
 * Filed after the range rather than in front of it.
 *
 * This used to be the masthead's `lead` and `meta`, and together they made that
 * block 607px tall on a 1280x720 laptop — which put the first collection poster's
 * slot at 641 and its photograph wholly below the fold, so the entrance the page is
 * built around landed somewhere nobody could see. A page whose entire job is
 * showing the range should not spend a screen introducing itself. The words are
 * unchanged and still on the page; they simply come after the thing they describe.
 */
const LEAD =
  'A working selection from the range: casegoods in solid mango, reclaimed hardwood and iron. ' +
  'The full catalogue runs deeper, and opens to verified trade buyers.';

const META = [
  { key: 'Catalogue', value: `${facts.designs}+ designs` },
  { key: 'Timber', value: 'Mango, reclaimed, sheesham' },
  { key: 'Minimum', value: 'Low MOQ, mixed containers' },
  { key: 'Lead time', value: '45–60 days' },
] as const;

export default function CollectionsPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHeader eyebrow="The catalogue" title="Everything we make." compact />

        {/* The directory, as a flock of posters that lands into a list. The
            filter below scans pieces; this scans collections, so a buyer who
            knows they want storage does not have to read the grid.

            No `<Reveal>` around it, and that is the point of it. This is the
            first fold, and `Reveal` is a client component whose entrance runs
            after hydration; the posters carry their own CSS animation instead
            and start at first paint. See CollectionPosters. */}
        <CollectionPosters />

        {/* See LEAD above for why these sit here and not in the masthead. */}
        <section className="pb-16 lg:pb-24">
          <div className="shell">
            <p className="text-lead text-ink-soft max-w-measure">{LEAD}</p>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 mt-10 pt-6 border-t border-line">
              {META.map((entry) => (
                <div key={entry.key}>
                  <dt className="text-manifest-sm text-muted">{entry.key}</dt>
                  <dd className="text-body text-ink mt-1.5 numeral">{entry.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <CollectionsGrid />
        <ExclusiveAccess />
      </main>
      <Footer />
    </>
  );
}
