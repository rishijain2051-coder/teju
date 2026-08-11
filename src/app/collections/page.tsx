import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import CollectionsGrid from '@/app/collections/components/CollectionsGrid';
import ExclusiveAccess from '@/app/collections/components/ExclusiveAccess';
import { facts } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Sideboards, cabinets, consoles, vitrines and chests in solid mango and reclaimed hardwood. Over a thousand designs, made at Boranada and exported worldwide.',
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
          lead="A working selection from the range — casegoods in solid mango, reclaimed hardwood and iron. The full catalogue runs deeper, and opens to verified trade buyers."
          meta={META}
        />
        <CollectionsGrid />
        <ExclusiveAccess />
      </main>
      <Footer />
    </>
  );
}
