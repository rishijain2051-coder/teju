import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Arrow from '@/components/ui/Arrow';
import { brand, collections, nav } from '@/lib/site';

/*
 * No reveal classes anywhere on this page, deliberately.
 *
 * `not-found.tsx` is rendered for any unmatched URL, including ones reached with
 * JavaScript disabled or blocked — and a 404 whose every link sits at opacity 0
 * waiting for GSAP is a dead end twice over. The one page on the site that exists
 * to recover a lost visitor is the one page that cannot afford an entrance.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="pt-32 lg:pt-44 pb-20 lg:pb-28">
        <div className="shell">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <p className="text-manifest text-clay">Error 404</p>
              <h1 className="font-serif text-display font-light mt-6">
                This page has <span className="italic">shipped.</span>
              </h1>
              <p className="text-lead text-ink-soft max-w-measure mt-7">
                The address you followed does not lead anywhere on this site. It may have moved, or
                it may never have existed. Everything we make is still one link away.
              </p>
              <div className="flex flex-wrap gap-3 mt-10">
                <Link href="/collections" className="btn btn-solid">
                  View the collections
                  <Arrow />
                </Link>
                <Link href="/" className="btn btn-ghost">
                  Back to the front
                </Link>
              </div>

              {/* A broken link of ours is a defect, and the person who found it is
                  the only one who can tell us where it was. */}
              <p className="text-note text-muted max-w-measure mt-8">
                If you followed this from somewhere on our own site, tell us where and we will fix
                it:{' '}
                <a href={`mailto:${brand.email}`} className="link-draw text-ink tap">
                  {brand.email}
                </a>
                . For anything urgent, the works is on{' '}
                <a href={`tel:${brand.phoneHref}`} className="link-draw text-ink tap numeral">
                  {brand.phone}
                </a>
                .
              </p>
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
                      className="group flex items-baseline gap-4 py-4 border-b border-line hover:border-ink transition-colors duration-fast ease-out"
                    >
                      <span className="text-manifest-sm text-muted numeral">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-title group-hover:text-clay transition-colors duration-fast ease-out">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/*
           * The collections, by name.
           *
           * A dead URL on this site is most often a design or a collection that
           * has been renamed, so the nav list above is the wrong granularity on
           * its own — somebody looking for a sideboard needs the collection, not
           * the word "Collections". The taglines are the catalogue's own, so this
           * block cannot drift from what the collections actually are.
           */}
          <section className="mt-20 lg:mt-28">
            <h2 className="text-manifest-sm text-muted pb-4 border-b border-line-strong">
              Or straight to a collection
            </h2>
            <ul className="grid sm:grid-cols-2 gap-x-8">
              {collections.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    href={collection.href}
                    className="group block py-5 border-b border-line hover:border-ink transition-colors duration-fast ease-out"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="text-manifest-sm text-muted numeral shrink-0">
                        {collection.index}
                      </span>
                      <span className="text-title group-hover:text-clay transition-colors duration-fast ease-out">
                        {collection.name}
                      </span>
                    </span>
                    <span className="block text-body text-muted mt-1.5">{collection.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
