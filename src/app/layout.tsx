import React from 'react';
import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fraunces, IBM_Plex_Mono } from 'next/font/google';
import MotionProvider from '@/components/motion/MotionProvider';
import '../styles/tailwind.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

// Variable axes are requested explicitly. Left at defaults Fraunces reads like
// any other serif; driven at high optical size with WONK on, it carries the
// display voice for the whole site.
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

// The manifest layer. Previously every `font-mono` class on the site fell back
// to whatever monospace the browser happened to have.
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EFE9DF',
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Vardhman Impex · Furniture Manufacturer & Exporter, Jodhpur',
    template: '%s · Vardhman Impex',
  },
  description:
    'Solid mango and reclaimed timber furniture, made in Jodhpur and shipped to nine countries. Eighteen years of in-house manufacturing, low minimums, a catalogue of over a thousand designs.',
  keywords: [
    'furniture manufacturer India',
    'furniture exporter Jodhpur',
    'mango wood furniture wholesale',
    'reclaimed wood furniture supplier',
    'contract furniture India',
    'low MOQ furniture export',
  ],
  authors: [{ name: 'Vardhman Impex' }],
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: [{ url: '/favicon.png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE,
    siteName: 'Vardhman Impex',
    title: 'Vardhman Impex · Furniture Manufacturer & Exporter, Jodhpur',
    description:
      'Solid mango and reclaimed timber furniture, made in Jodhpur and shipped to nine countries.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vardhman Impex · Furniture Manufacturer & Exporter, Jodhpur',
    description:
      'Solid mango and reclaimed timber furniture, made in Jodhpur and shipped to nine countries.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${plexMono.variable}`}>
      <body className="bg-paper text-ink antialiased">
        <MotionProvider />
        {children}
      </body>
    </html>
  );
}
