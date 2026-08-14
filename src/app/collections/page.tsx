import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import AppImage from '@/components/ui/AppImage';
import CollectionsGrid from '@/app/collections/components/CollectionsGrid';
import ExclusiveAccess from '@/app/collections/components/ExclusiveAccess';
import { collections, facts, img, piecesIn } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Sideboards, cabinets, consoles, vitrines and chests in solid mango and reclaimed hardwood. Over a thousand designs, made at Boranada and exported worldwide.',
};

const META = [
  { key: 'Catalogue', value: `${facts.designs}+ designs` },
  { key: 'Timber', value: 'Mango, reclaimed, sheesham' },
  { key: 'Minimum', value: 'Low MOQ, mixed containers' },
  { key: 'Lead time', value: '45–60 days' },
] as const;

export default function CollectionsPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHeader
          eyebrow="The catalogue"
          title="Everything we make."
          lead="A working selection from the range: casegoods in solid mango, reclaimed hardwood and iron. The full catalogue runs deeper, and opens to verified trade buyers."
          meta={META}
        />

        {/* Directory. The filter below scans pieces; this scans collections, so a
            buyer who knows they want storage does not have to read the grid. */}
        <Reveal immediate>
          <section className="pb-16 lg:pb-20">
            <div className="shell">
              <p className="text-manifest-sm text-muted rise">Six collections</p>

              <ul data-reveal-group className="mt-5">
                {collections.map((collection) => {
                  const plate = img(collection.image);
                  const shown = piecesIn(collection.name).length;
                  return (
                    <li key={collection.slug} className="rise">
                      <Link
                        href={collection.href}
                        className="group flex items-center gap-5 sm:gap-8 py-4 border-t border-line"
                      >
                        <span className="text-manifest-sm text-muted numeral shrink-0">
                          {collection.index}
                        </span>

                        <div className="plate w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                          <AppImage
                            src={plate.src}
                            alt={plate.alt}
                            fill
                            sizes="80px"
                            placeholder="blur"
                            blurDataURL={plate.blurDataURL}
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h2 className="text-title group-hover:text-clay transition-colors duration-base">
                            {collection.name}
                          </h2>
                          <p className="text-body text-muted mt-1 hidden sm:block">
                            {collection.tagline}
                          </p>
                        </div>

                        <span className="text-manifest-sm text-muted shrink-0 text-right">
                          {collection.bespoke ? collection.range : `${shown} shown`}
                        </span>

                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          aria-hidden="true"
                          className="shrink-0 text-muted group-hover:text-clay transition-colors duration-base"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </Reveal>

        <CollectionsGrid />
        <ExclusiveAccess />
      </main>
      <Footer />
    </>
  );
}
