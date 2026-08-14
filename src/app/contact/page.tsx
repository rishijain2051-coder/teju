import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import ContactSplit from '@/app/contact/components/ContactSplit';
import { facts } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Speak to the factory directly. Vardhman Impex, Boranada Industrial Area, Jodhpur. Furniture manufacturing and export enquiries.',
};

const META = [
  { key: 'Reply time', value: 'Within 2 working days' },
  { key: 'Minimum', value: 'Low MOQ, mixed containers' },
  { key: 'Lead time', value: '45–60 days' },
  { key: 'Markets', value: `${facts.countries}+ countries` },
] as const;

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHeader
          eyebrow="Enquiries"
          title="Talk to the factory."
          lead="No agents, no middle layer. Tell us the ranges, the volumes and the timeline, and we will come back with honest lead times and a price that holds."
          meta={META}
        />
        <ContactSplit />
      </main>
      <Footer />
    </>
  );
}
