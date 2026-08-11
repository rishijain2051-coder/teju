import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { nav } from '@/lib/site';

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="min-h-[70vh] flex items-center pt-32 pb-24">
        <div className="shell">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <p className="text-manifest text-clay">Error 404</p>
              <h1 className="font-serif text-display font-light mt-6">
                This page has <span className="italic">shipped.</span>
              </h1>
              <p className="text-lead text-ink-soft max-w-measure mt-7">
                The address you followed does not lead anywhere on this site. It may
                have moved, or it may never have existed.
              </p>
              <div className="flex flex-wrap gap-3 mt-10">
                <Link href="/" className="btn btn-solid">
                  Back to the front
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/collections" className="btn btn-ghost">
                  View the collections
                </Link>
              </div>
            </div>

            <nav className="lg:col-span-4 lg:col-start-9" aria-label="Site sections">
              <p className="text-manifest-sm text-muted pb-4 border-b border-line-strong">
                Everywhere else
              </p>
              <ul>
                {nav.map((link, i) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-baseline gap-4 py-4 border-b border-line"
                    >
                      <span className="text-manifest-sm text-muted numeral">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-serif text-title font-light group-hover:text-clay transition-colors duration-base">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
