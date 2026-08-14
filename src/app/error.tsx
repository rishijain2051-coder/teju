'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { brand } from '@/lib/site';

/**
 * Route-level error boundary.
 *
 * Without this, an exception anywhere in a page tree fell through to Next's own
 * error screen: a stack trace in development and an unbranded blank in
 * production, either way with no route back and no way to reach us. A buyer who
 * hits a fault mid-enquiry should still be able to finish the enquiry.
 *
 * `reset()` re-renders the segment rather than reloading the document, so a
 * transient fault — a failed fetch, a hydration hiccup — costs a click.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only handle on the server-side stack in production, so
    // it goes to the console where a support conversation can ask for it.
    console.error('Page error', error.digest ? `(digest ${error.digest})` : '', error);
  }, [error]);

  return (
    <>
      <Header />
      <main id="main" className="min-h-[70vh] flex items-center pt-32 pb-24">
        <div className="shell">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <p className="text-manifest text-clay">Something broke</p>
              <h1 className="font-serif text-display font-light mt-6">
                That is <span className="italic">our fault.</span>
              </h1>
              <p className="text-lead text-ink-soft max-w-measure mt-7">
                This page failed to load. Nothing you did caused it, and nothing you sent us has
                been lost. Try again, and if it keeps happening please tell us — knowing which page
                is more useful than you might think.
              </p>

              <div className="flex flex-wrap gap-3 mt-10">
                <button type="button" onClick={reset} className="btn btn-solid">
                  Try again
                </button>
                <Link href="/" className="btn btn-ghost">
                  Back to the front
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <p className="text-manifest-sm text-muted pb-4 border-b border-line-strong">
                Reach us directly
              </p>
              <dl>
                <div className="py-4 border-b border-line">
                  <dt className="text-manifest-sm text-muted">Email</dt>
                  <dd className="text-body mt-1.5">
                    <a href={`mailto:${brand.email}`} className="text-ink link-draw break-all tap">
                      {brand.email}
                    </a>
                  </dd>
                </div>
                <div className="py-4 border-b border-line">
                  <dt className="text-manifest-sm text-muted">Telephone</dt>
                  <dd className="text-body mt-1.5">
                    <a href={`tel:${brand.phoneHref}`} className="text-ink link-draw numeral tap">
                      {brand.phone}
                    </a>
                  </dd>
                </div>
              </dl>

              {error.digest && (
                <p className="text-note text-muted mt-6">
                  Reference for us: <span className="numeral">{error.digest}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
