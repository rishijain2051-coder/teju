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
/*
 * Four faces, not five. The italic Fraunces is 146 kB — the largest single file
 * on the site — and preloading it put that on the critical path of every route at
 * highest priority, ahead of the photograph. On the Slow 4G profile the five
 * preloads were 321 kB, which is about 1.6 seconds of a 1.6 Mbps pipe spent
 * before an image can have any of it.
 *
 * Dropping it costs nothing measurable. Every face is `font-display: swap`, so
 * text paints in the fallback immediately either way, and the metric-adjusted
 * fallbacks hold CLS at 0 — the swap moves no layout. Italic is a secondary face
 * here, usually one word inside a heading, so it is the one that can afford to
 * arrive at normal priority with everything else.
 */
const PRELOADED_FONTS = [
  '/fonts/dm-sans-300-latin.woff2',
  '/fonts/fraunces-latin.woff2',
  '/fonts/ibm-plex-mono-400-latin.woff2',
  '/fonts/ibm-plex-mono-500-latin.woff2',
];

/*
 * Composes the first fold before the incoming morph snapshot is taken.
 *
 * `pagereveal` fires at the new document's first render opportunity, and the
 * transition's new state is captured *after* its handlers run — so this is the
 * one moment at which the incoming page can still be changed.
 *
 * It has to be. Every page renders its opening copy at `opacity: 0` and waits
 * for the reveal machinery, which runs after hydration. Measured on the piece
 * page, the snapshot the morph was animating towards contained: eyebrow at 0,
 * lead at 0, spec list at 0, and the h1's text translated 135px down inside its
 * own clip. The photograph was travelling onto a blank page, and the writing
 * arrived about a second later on a separate 640ms wave. Two events, not one.
 *
 * So it raises one flag on `<html>` and CSS does the rest: inside `.reveal-now`,
 * the first-fold entrance resolves to its end state with no animation at all.
 *
 * One flag, and specifically not a class on each element. The first version of
 * this walked the fold adding `shown` and `data-morph-settled` to every match,
 * and that is a DOM mutation before hydration on nodes React owns — React found
 * `veil shown` where it had rendered `veil` and reported a hydration mismatch it
 * explicitly would not patch, leaving its own tree believing the class was absent.
 * The next render touching that element would have written `veil` back and taken
 * the content off the page. `<html>` is the one element React does not diff
 * attributes on, which is why the theme-flash scripts everywhere use it.
 *
 * The flag is never cleared. A morph arrival *is* the first fold's entrance, for
 * the life of that document; there is nothing to hand back to later.
 *
 * It has to be raw markup at the top of `<body>`, and neither of the two obvious
 * homes works. A `<script>` inside `<head>` in the App Router is serialised into
 * the RSC payload and inserted by React on hydration; `next/script` at
 * `beforeInteractive` is a client component and renders as a lazy reference, so
 * it lands in the payload too. Both were measurably doing nothing — the fold came
 * through at opacity 0 either way, and `beforeInteractive` also pushed the frozen
 * frame from 29ms to 69ms for the privilege. Here it is real markup, parsed and
 * run before the page content it looks for, which is well before `pagereveal`
 * (measured: parsing done at 59ms, `pagereveal` at 69ms).
 */
const COMPOSE_FIRST_FOLD = `
addEventListener('pagereveal', function (e) {
  if (e.viewTransition) document.documentElement.classList.add('morph-in');
});
`.trim();

/*
 * Warms the document behind a morph link on hover, so the frozen frame between
 * the outgoing snapshot and the incoming one stays at the ~30ms it measures on
 * localhost rather than becoming a round trip on a real connection. `moderate`
 * is the browser's hover/pointerdown heuristic; only the five plate links opt
 * in, so this never speculates across the whole nav.
 */
const PREFETCH_MORPH_TARGETS = JSON.stringify({
  prefetch: [{ where: { selector_matches: 'a[data-morph]' }, eagerness: 'moderate' }],
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

/*
 * `suppressHydrationWarning` on `<html>` because COMPOSE_FIRST_FOLD puts
 * `morph-in` there before React hydrates, and React diffs `<html>`'s attributes
 * like any other element's — which is the same reason a theme script needs it.
 * It applies to this element's own attributes and text, one level deep, so
 * nothing in the tree below stops being checked.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <script dangerouslySetInnerHTML={{ __html: COMPOSE_FIRST_FOLD }} />
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{ __html: PREFETCH_MORPH_TARGETS }}
        />
        <MotionProvider />
        {children}
      </body>
    </html>
  );
}
