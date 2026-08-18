import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import ManifestStrip from '@/app/components/ManifestStrip';
import FeaturedCollections from '@/app/components/FeaturedCollections';
import WhyBrandsSection from '@/app/components/WhyBrandsSection';
import FeaturedProducts from '@/app/components/FeaturedProducts';
import TrustSection from '@/app/components/TrustSection';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import JournalSection from '@/app/components/JournalSection';
import ContactCTA from '@/app/components/ContactCTA';
import JsonLd from '@/components/seo/JsonLd';
import { localBusinessSchema } from '@/lib/schema';
import { brand } from '@/lib/site';

/*
 * `title.absolute`, not a plain string: the root layout's `%s · Vardhman Impex`
 * template would append the brand a second time, and the layout's `title.default`
 * cannot be reached from here without editing it. The materials are in the title
 * because that is the query — buyers search "mango wood furniture manufacturer",
 * not "furniture manufacturer" — and the trade terms are in the description,
 * which is where they decide whether to click.
 */
export const metadata: Metadata = {
  title: {
    absolute: `${brand.name} · Mango & Reclaimed Wood Furniture Manufacturer, Jodhpur`,
  },
  description:
    'Solid mango and reclaimed hardwood casegoods, cut and finished in our own Jodhpur factory since ' +
    `${brand.established}. Low MOQ, mixed containers, 45–60 day lead times.`,
};

export default function HomePage() {
  return (
    <>
      {/* The premises, on the two pages that are about the premises — here and
          /contact. Deliberately not site-wide: a LocalBusiness node repeated on
          forty routes says nothing extra, and `parentOrganization` already ties it
          to the Organization the layout mounts. */}
      <JsonLd data={localBusinessSchema()} />
      <Header />
      <main id="main">
        <HeroSection />
        <ManifestStrip />
        <FeaturedCollections />
        <WhyBrandsSection />
        <FeaturedProducts />
        <TrustSection />
        <TestimonialsSection />
        <JournalSection />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
