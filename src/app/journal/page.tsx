import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';
import PlateLink from '@/components/ui/PlateLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import AppImage from '@/components/ui/AppImage';
import { facts, img, journal } from '@/lib/site';

/*
 * Named subjects rather than the categories, because "materials, manufacturing,
 * certification" describes any furniture blog. The four things listed are the four
 * articles, so the description and the page cannot get out of step.
 */
export const metadata: Metadata = {
  /* Self-referencing canonical — see src/app/page.tsx. */
  alternates: { canonical: '/journal' },
  title: 'Journal · Notes From the Workshop Floor',
  description: `Notes from the floor at Boranada: how mango behaves, what FSC chain of custody certifies, how a piece reaches a container, and what ${facts.countries} markets are ordering.`,
};

const [lead, ...rest] = journal;

export default function JournalPage() {
  const leadPlate = img(lead.image);

  return (
    <>
      <Header />
      <main id="main">
        <PageHeader
          eyebrow="From the workshop"
          title="Notes from the floor."
          lead="Written by the people who make the furniture rather than by an agency: what a material is actually like to work, what certification really certifies, and what nine export markets are ordering this season."
        />

        <Reveal>
          {/* Lead article, given the room it deserves. */}
          <section className="shell">
            <article className="group">
              <PlateLink href={`/journal/${lead.slug}`} className="block">
                <div data-plate="idle" className="plate aspect-[16/9] lg:aspect-[21/9] rise">
                  <AppImage
                    src={leadPlate.src}
                    alt={leadPlate.alt}
                    fill
                    sizes="100vw"
                    placeholder="blur"
                    blurDataURL={leadPlate.blurDataURL}
                    priority
                    className="object-cover"
                  />
                </div>

                <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 pt-5 mt-5 border-t border-line group-hover:border-ink transition-colors duration-fast ease-out">
                  <div className="lg:col-span-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                    <span className="text-manifest-sm text-clay">{lead.category}</span>
                    <span className="text-manifest-sm text-muted">{lead.date}</span>
                    <span className="text-manifest-sm text-muted numeral">{lead.readTime}</span>
                  </div>
                  <div className="lg:col-span-8">
                    <h2 className="font-serif text-display font-light group-hover:text-clay transition-colors duration-fast ease-out rise">
                      {lead.title}
                    </h2>
                    <p className="text-lead text-ink-soft mt-4 max-w-measure rise">
                      {lead.standfirst}
                    </p>
                  </div>
                </div>
              </PlateLink>
            </article>
          </section>

          {/* The rest */}
          <section className="py-20 lg:py-28">
            <div className="shell">
              <div data-reveal-group className="grid md:grid-cols-3 gap-x-6 gap-y-14">
                {rest.map((article) => {
                  const plate = img(article.image);
                  return (
                    <article key={article.slug} className="group rise">
                      <PlateLink href={`/journal/${article.slug}`} className="block">
                        <div data-plate="idle" className="plate aspect-[3/2]">
                          <AppImage
                            src={plate.src}
                            alt={plate.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            placeholder="blur"
                            blurDataURL={plate.blurDataURL}
                            className="object-cover"
                          />
                        </div>

                        <div className="pt-4 mt-4 border-t border-line group-hover:border-ink transition-colors duration-fast ease-out">
                          <div className="flex items-baseline justify-between gap-4">
                            <span className="text-manifest-sm text-clay">{article.category}</span>
                            <span className="text-manifest-sm text-muted">{article.date}</span>
                          </div>
                          <h2 className="text-title mt-3 group-hover:text-clay transition-colors duration-fast ease-out">
                            {article.title}
                          </h2>
                          <p className="text-body text-muted mt-2">{article.excerpt}</p>
                          <p className="text-manifest-sm text-muted numeral mt-3">
                            {article.readTime}
                          </p>
                        </div>
                      </PlateLink>
                    </article>
                  );
                })}
              </div>

              <div className="rule mt-16 lg:mt-20 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rise">
                {/* Most of these notes began as a buyer's question about something
                    in the range, so the range is the link that belongs here. */}
                <p className="text-body text-muted max-w-measure">
                  Every note here started as a question from someone looking at{' '}
                  <Link href="/collections" className="text-clay link-draw press">
                    the collections
                  </Link>
                  . If yours is not answered above, ask it directly.
                </p>
                <Link href="/contact" className="btn btn-ghost shrink-0">
                  Send an enquiry
                  <Arrow />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
