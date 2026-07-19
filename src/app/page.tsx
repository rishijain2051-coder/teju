import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import FeaturedCollections from '@/app/components/FeaturedCollections';
import WhyBrandsSection from '@/app/components/WhyBrandsSection';
import FeaturedProducts from '@/app/components/FeaturedProducts';
import TrustSection from '@/app/components/TrustSection';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import JournalSection from '@/app/components/JournalSection';
import ContactCTA from '@/app/components/ContactCTA';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header transparent={true} />
      <HeroSection />
      <FeaturedCollections />
      <WhyBrandsSection />
      <FeaturedProducts />
      <TrustSection />
      <TestimonialsSection />
      <JournalSection />
      <ContactCTA />
      <Footer />
    </main>
  );
}