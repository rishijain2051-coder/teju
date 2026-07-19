import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactHero from '@/app/contact/components/ContactHero';
import ContactSplit from '@/app/contact/components/ContactSplit';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header transparent={false} />
      <ContactHero />
      <ContactSplit />
      <Footer />
    </main>
  );
}