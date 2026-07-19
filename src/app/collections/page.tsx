import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollectionsHero from '@/app/collections/components/CollectionsHero';
import CollectionsGrid from '@/app/collections/components/CollectionsGrid';
import ExclusiveAccess from '@/app/collections/components/ExclusiveAccess';

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header transparent={false} />
      <CollectionsHero />
      <CollectionsGrid />
      <ExclusiveAccess />
      <Footer />
    </main>
  );
}