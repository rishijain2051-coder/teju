import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import ContactSplit from '@/app/contact/components/ContactSplit';
import JsonLd from '@/components/seo/JsonLd';
import { localBusinessSchema } from '@/lib/schema';
import { brand, facts } from '@/lib/site';

/*
 * `title.absolute`, because the root layout's `%s · Vardhman Impex` template on
 * top of a title that already carries the brand runs past 79 characters and gets
 * truncated in the result. "Contact" alone was competing with every other
 * contact page on the web; this one names the material, the trade and the city,
 * which is how a buyer actually types the search.
 */
export const metadata: Metadata = {
  /* Self-referencing canonical — see src/app/page.tsx. */
  alternates: { canonical: '/contact' },
  title: { absolute: `Contact ${brand.name} · Mango Wood Furniture Export, Jodhpur` },
  description:
    'Send an enquiry straight to our Boranada works in Jodhpur: ranges, volumes, finishes, ' +
    `container plans. We reply within two working days. Low MOQ, ${facts.countries} markets.`,
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
      {/* Also on the home page. This is the location page, so it is the one a
          "furniture manufacturer near Jodhpur" result would land on. */}
      <JsonLd data={localBusinessSchema()} />
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
