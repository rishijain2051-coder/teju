import React from 'react';
import type { Metadata, Viewport } from 'next';
import MotionProvider from '@/components/motion/MotionProvider';
import '../styles/fonts.css';
import '../styles/tailwind.css';

/*
 * The three families — DM Sans, Fraunces with its SOFT/WONK/opsz axes, and IBM
 * Plex Mono — are self-hosted from `public/fonts/` and declared in
 * `src/styles/fonts.css`, rather than requested through `next/font/google`.
 *
 * `next/font/google` fetches from fonts.gstatic.com during compilation. When a
 * build machine cannot reach it, next/font retries three times and then fails the
 * build — which is what took CI down, with nothing wrong in the code. The files in
 * `public/fonts/` are the exact bytes that loader was producing, lifted out of the
 * build output, so the rendered type, the unicode-range splitting and the
 * metric-adjusted fallbacks are unchanged. Nothing here touches the network.
 *
 * The latin faces are preloaded below, which is the one thing next/font did for us
 * that a plain stylesheet does not.
 */
const PRELOADED_FONTS = [
  '/fonts/dm-sans-300-latin.woff2',
  '/fonts/fraunces-latin.woff2',
  '/fonts/fraunces-latin-italic.woff2',
  '/fonts/ibm-plex-mono-400-latin.woff2',
  '/fonts/ibm-plex-mono-500-latin.woff2',
];

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
    <html lang="en">
      <head>
        {PRELOADED_FONTS.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body className="bg-paper text-ink antialiased">
        <MotionProvider />
        {children}
      </body>
    </html>
  );
}
