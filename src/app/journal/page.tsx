import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import AppImage from '@/components/ui/AppImage';
import { img, journal } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Notes from the workshop floor at Boranada: materials, manufacturing, certification and what the export order book is actually saying.',
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
              <Link href={`/journal/${lead.slug}`} className="block">
                <div className="plate aspect-[16/9] lg:aspect-[21/9] rise">
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

                <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 pt-5 mt-5 border-t border-line group-hover:border-ink transition-colors duration-base">
                  <div className="lg:col-span-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                    <span className="text-manifest-sm text-clay">{lead.category}</span>
                    <span className="text-manifest-sm text-muted">{lead.date}</span>
                    <span className="text-manifest-sm text-muted numeral">{lead.readTime}</span>
                  </div>
                  <div className="lg:col-span-8">
                    <h2 className="font-serif text-display font-light group-hover:text-clay transition-colors duration-base rise">
                      {lead.title}
                    </h2>
                    <p className="text-lead text-ink-soft mt-4 max-w-measure rise">
                      {lead.standfirst}
                    </p>
                  </div>
                </div>
              </Link>
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
                      <Link href={`/journal/${article.slug}`} className="block">
                        <div className="plate aspect-[3/2]">
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

                        <div className="pt-4 mt-4 border-t border-line group-hover:border-ink transition-colors duration-base">
                          <div className="flex items-baseline justify-between gap-4">
                            <span className="text-manifest-sm text-clay">{article.category}</span>
                            <span className="text-manifest-sm text-muted">{article.date}</span>
                          </div>
                          <h2 className="font-serif text-title font-light mt-3 group-hover:text-clay transition-colors duration-base">
                            {article.title}
                          </h2>
                          <p className="text-body text-muted mt-2">{article.excerpt}</p>
                          <p className="text-manifest-sm text-muted numeral mt-3">
                            {article.readTime}
                          </p>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>

              <div className="rule mt-16 lg:mt-20 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rise">
                <p className="text-body text-muted max-w-measure">
                  Something you would like us to write about, or a question the site does not
                  answer? Ask it directly.
                </p>
                <Link href="/contact" className="btn btn-ghost shrink-0">
                  Send an enquiry
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
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
