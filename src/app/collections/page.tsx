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
        <PageHeader
          eyebrow="The catalogue"
          title="Everything we make."
          lead="A working selection from the range: casegoods in solid mango, reclaimed hardwood and iron. The full catalogue runs deeper, and opens to verified trade buyers."
          meta={META}
        />

        {/* The directory, as a flock of posters that lands into a list. The
            filter below scans pieces; this scans collections, so a buyer who
            knows they want storage does not have to read the grid.

            No `<Reveal>` around it, and that is the point of it. This is the
            first fold, and `Reveal` is a client component whose entrance runs
            after hydration; the posters carry their own CSS animation instead
            and start at first paint. See CollectionPosters. */}
        <CollectionPosters />

        <CollectionsGrid />
        <ExclusiveAccess />
      </main>
      <Footer />
    </>
  );
}
