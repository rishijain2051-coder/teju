'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { brand } from '@/lib/site';

/*
 * Routes that already end in an action, or already carry a bar of their own.
 *
 * The private catalogue docks its container planner at the bottom of the viewport
 * (ContainerPlan), and two stacked bars would cover a third of a phone screen
 * between them. The contact page and the access gate are the destination this bar
 * points at, so on those it would be a link to the page you are reading. Prefix
 * matched, which is what takes the catalogue in with the gate.
 */
const NO_BAR = ['/contact', '/collections/private', '/keystatic'];

/**
 * The mobile conversion bar.
 *
 * `sticky`, not `fixed`, and mounted as the last element in `<body>` — so the bar
 * occupies real space at the end of the document rather than floating over it.
 * The distinction is the whole reason it is built this way: a fixed bar sits on
 * top of the last 60px of every page forever, which on the contact-CTA sections
 * and the footer's enquiry column is exactly the content a reader has scrolled
 * that far to reach. Sticky pins it to the bottom edge while there is still page
 * below, then lets it settle into its own slot under the footer when there is
 * not. Same reasoning as the planner, which reserves its space with padding
 * because it cannot be the last element in its own document; here the element is
 * the last thing in the layout, so the flow reserves it for free.
 *
 * `lg:hidden` and not a media-query hook: the desktop masthead already carries a
 * persistent Enquire button and the phone number, so above 1024px this bar would
 * be the third copy of the same two links. Hiding it in CSS also gives the slot
 * back — `display: none` takes it out of flow — rather than rendering an
 * invisible 60px gap under every desktop footer.
 */
export default function StickyCta(): React.ReactElement | null {
  const pathname = usePathname();

  if (NO_BAR.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return null;

  return (
    <aside
      aria-label="Enquiries"
      /*
       * `paper-warm` over the page's `paper`, with a strong hairline: the bar
       * crosses both grounds as it travels, and on `paper-deep` sections a bar in
       * plain `paper` read as a lighter panel with no edge. The bottom padding is
       * the iOS home-indicator inset, which is 34px on a notched phone and 0
       * everywhere else — without it the buttons sit under the gesture bar.
       */
      className="lg:hidden sticky bottom-0 z-30 bg-paper-warm border-t border-line-strong pb-[env(safe-area-inset-bottom)]"
    >
      <div className="shell flex items-stretch gap-3 py-3">
        <Link href="/contact" className="btn btn-solid flex-1 justify-center">
          Enquire
        </Link>
        {/* Labelled with the number itself, because "Call" alone tells a screen
            reader nothing about where it goes. The visible label stays short —
            the number at 12px next to a filled button is unreadable on a 360px
            screen, and it is already in the masthead and the footer. */}
        <a
          href={`tel:${brand.phoneHref}`}
          aria-label={`Call ${brand.phone}`}
          className="btn btn-ghost shrink-0 justify-center"
        >
          Call
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.9.36 1.79.7 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.27a2 2 0 0 1 2.11-.45c.84.34 1.73.57 2.63.7A2 2 0 0 1 22 16.92Z" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
