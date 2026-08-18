import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import { delay } from '@/lib/reveal';
import { brand } from '@/lib/site';
import { whatsappUrl } from '@/lib/enquiry';

export const metadata: Metadata = {
  title: 'Enquiry received',
  description: 'Your enquiry has reached the works at Boranada. We reply within two working days.',
  /*
   * Noindex, follow. A confirmation page has nothing to rank for and would only
   * compete with /contact for the same query, but the entire job of this page is
   * to hand the visitor onward — so the links out of it should still be crawled.
   */
  robots: { index: false, follow: true },
};

/* The reply time is the one commitment on this page, and it is the same figure
   the container planner and the contact page already quote. Two working days. */
const META = [
  { key: 'Reply time', value: 'Within 2 working days' },
  { key: 'Our hours', value: 'Mon–Sat, 09:30–18:30 IST' },
  { key: 'Sooner', value: brand.phone },
] as const;

/*
 * Three routes, deliberately not the whole nav — the nav is already in the
 * masthead and the footer. Somebody who has just enquired is waiting on us, and
 * the useful thing to hand them is evidence: the range, how it is made, where it
 * is made. A fourth link would only dilute the three that answer a buyer's next
 * question.
 */
const ONWARD = [
  {
    href: '/collections',
    label: 'The collections',
    note: 'Sideboards, cabinets, consoles and chests across six collections. Every design carries a reference you can add to your enquiry.',
  },
  {
    href: '/craft',
    label: 'How it is made',
    note: 'Joinery, carving and finishing, bench by bench. Worth reading before a first order.',
  },
  {
    href: '/factory',
    label: 'The works',
    /* Deliberately no floor area and no headcount. `src/lib/works.ts` still
       carries "FIGURES TO CONFIRM WITH THE WORKS" against them, and a page whose
       job is to be believed is the wrong place to add a fresh instance of a number
       nobody has checked. /factory quotes them; this only points at it. */
    note: 'Sawing, joinery, carving, finishing and packing at Boranada, under one roof. Nothing is subcontracted.',
  },
] as const;

export default function ThankYouPage() {
  /* Built through `whatsappUrl` rather than a second hardcoded wa.me link, so the
     number lives in exactly one place. No fields: there is no enquiry in scope
     here, just a chat that opens with a line we can recognise. */
  const chat = whatsappUrl('Following up on an enquiry from vardhman-impex.com', []);

  return (
    <>
      <Header />
      <main id="main">
        <PageHeader
          eyebrow="Enquiry received"
          title="It's in our inbox."
          lead={`What you sent is with ${brand.email}, where a person reads it rather than a queue. We reply within two working days, with lead times we can hold to.`}
          meta={META}
        />

        <Reveal immediate>
          <section className="pb-20 lg:pb-28">
            <div className="shell">
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                <div className="lg:col-span-7">
                  <h2 className="text-title rise">If it cannot wait two days</h2>

                  <p className="text-lead text-ink-soft max-w-measure mt-5 rise" style={delay(80)}>
                    The telephone reaches the works during Indian business hours and WhatsApp
                    reaches the same desk outside them. Either is faster than following up on the
                    email you have just sent.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-8 rise" style={delay(160)}>
                    <a href={`tel:${brand.phoneHref}`} className="btn btn-solid numeral">
                      {brand.phone}
                    </a>
                    <a
                      href={chat}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.1 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9a11.4 11.4 0 0 1-4.5-4.3c-.9-1.6-.7-2.6-.5-3.1.2-.5.7-.9 1-1 .2 0 .4-.1.6 0 .2 0 .3 0 .5.4l.7 1.6c.1.2.1.4 0 .5l-.3.5-.3.3c-.1.1-.2.2 0 .5.2.3.6 1 1.3 1.6.8.7 1.4 1 1.7 1.1.2.1.4.1.5 0l.7-.8c.2-.2.3-.2.5-.1l1.5.8c.3.2.4.3.4.4.1.2 0 .7-.1 1.3Z" />
                      </svg>
                      WhatsApp
                    </a>
                  </div>

                  <p className="text-note text-muted mt-7 max-w-measure rise" style={delay(220)}>
                    Or write to{' '}
                    <a href={`mailto:${brand.email}`} className="link-draw text-ink tap">
                      {brand.email}
                    </a>
                    . We use what you sent only to answer it —{' '}
                    <Link href="/privacy" className="link-draw text-ink tap">
                      how we handle it
                    </Link>
                    .
                  </p>
                </div>

                {/* Numbered like the 404's section list, because the two pages do
                    the same job: a visitor who cannot go forward on their own. */}
                <nav className="lg:col-span-4 lg:col-start-9" aria-label="Where to next">
                  <p className="text-manifest-sm text-muted pb-4 border-b border-line-strong veil">
                    While you wait
                  </p>
                  <ul data-reveal-group>
                    {ONWARD.map((item, i) => (
                      <li key={item.href} className="rise">
                        <Link
                          href={item.href}
                          className="group block py-5 border-b border-line hover:border-ink transition-colors duration-fast ease-out"
                        >
                          <span className="flex items-baseline gap-4">
                            <span className="text-manifest-sm text-muted numeral">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="text-title group-hover:text-clay transition-colors duration-fast ease-out">
                              {item.label}
                            </span>
                          </span>
                          <span className="block text-body text-muted mt-2">{item.note}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
