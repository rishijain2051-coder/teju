import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import PlateLink from '@/components/ui/PlateLink';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/ui/Reveal';
import AppImage from '@/components/ui/AppImage';
import { findArticle, img, journal } from '@/lib/site';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return journal.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return { title: 'Journal' };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      images: [{ url: img(article.image).src }],
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  const plate = img(article.image);
  const more = journal.filter((entry) => entry.slug !== article.slug).slice(0, 3);

  return (
    <>
      <Header />
      <main id="main">
        {/* A bespoke masthead rather than PageHeader: an article needs its
            dateline and standfirst, and a measure narrower than a page lead. */}
        <Reveal immediate>
          <header className="pt-32 lg:pt-44 pb-10 lg:pb-14">
            <div className="shell">
              <nav aria-label="Breadcrumb" className="veil">
                <Link
                  href="/journal"
                  className="text-manifest-sm text-muted hover:text-clay transition-colors duration-fast ease-out tap"
                >
                  Journal
                </Link>
              </nav>

              <h1 className="font-serif text-display font-light mt-6 lg:mt-8 max-w-[26ch]">
                <span className="wipe">
                  <span className="wipe-inner" style={{ transitionDelay: '90ms' }}>
                    {article.title}
                  </span>
                </span>
              </h1>

              <p
                className="text-lead text-ink-soft max-w-measure mt-7 rise"
                style={{ transitionDelay: '300ms' }}
              >
                {article.standfirst}
              </p>

              <dl
                className="flex flex-wrap items-baseline gap-x-10 gap-y-3 mt-10 pt-6 border-t border-line rise"
                style={{ transitionDelay: '400ms' }}
              >
                <div>
                  <dt className="text-manifest-sm text-muted">Filed under</dt>
                  <dd className="text-body text-ink mt-1">{article.category}</dd>
                </div>
                <div>
                  <dt className="text-manifest-sm text-muted">Published</dt>
                  <dd className="text-body text-ink mt-1">{article.date}</dd>
                </div>
                <div>
                  <dt className="text-manifest-sm text-muted">Reading</dt>
                  <dd className="text-body text-ink mt-1 numeral">{article.readTime}</dd>
                </div>
              </dl>
            </div>
          </header>
        </Reveal>

        <Reveal>
          <div className="shell">
            {/* Destination of the journal-card morph — see PlateLink. */}
            <div data-plate="active" className="plate aspect-[16/9] lg:aspect-[21/9]">
              <AppImage
                src={plate.src}
                alt={plate.alt}
                fill
                sizes="100vw"
                placeholder="blur"
                blurDataURL={plate.blurDataURL}
                priority
                className="object-cover"
              />
            </div>
          </div>

          {/* Body. Measure is held at 68ch by `max-w-measure`, offset into the
              grid so the column sits where an editorial page would set it. */}
          <article className="py-16 lg:py-24">
            <div className="shell">
              <div className="grid lg:grid-cols-12">
                <div className="lg:col-span-8 lg:col-start-3">
                  {article.body.map((block, i) => (
                    <section key={i} className={i > 0 ? 'mt-12 lg:mt-16' : ''}>
                      {block.heading && <h2 className="text-title mb-5 rise">{block.heading}</h2>}

                      {block.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph.slice(0, 32)}
                          className="text-lead text-ink-soft max-w-measure mt-5 first:mt-0 rise"
                        >
                          {paragraph}
                        </p>
                      ))}

                      {block.pull && (
                        <blockquote className="my-10 lg:my-14 pl-6 lg:pl-8 border-l-2 border-clay rise">
                          <p className="font-serif text-display-sm font-light italic max-w-[34ch]">
                            {block.pull}
                          </p>
                        </blockquote>
                      )}
                    </section>
                  ))}

                  <div className="rule mt-16 pt-6 rise">
                    <p className="text-manifest-sm text-muted">
                      Written at the works, Boranada · {article.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* More */}
          <section className="py-16 lg:py-24 bg-paper-deep">
            <div className="shell">
              <header className="rule-label rise" style={{ borderColor: 'var(--line-strong)' }}>
                <div className="flex-1">
                  <h2 className="font-serif text-display-sm font-light -mt-1">
                    More from the <span className="italic">journal</span>
                  </h2>
                </div>
                <Link
                  href="/journal"
                  className="link-arrow tap hidden sm:inline-flex items-center gap-2.5 text-manifest text-ink-soft hover:text-clay transition-colors duration-fast ease-out"
                >
                  All notes
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </header>

              <div data-reveal-group className="grid md:grid-cols-3 gap-x-6 gap-y-12 mt-10">
                {more.map((entry) => {
                  const cover = img(entry.image);
                  return (
                    <article key={entry.slug} className="group rise">
                      <PlateLink href={`/journal/${entry.slug}`} className="block">
                        <div data-plate="idle" className="plate aspect-[3/2] bg-paper">
                          <AppImage
                            src={cover.src}
                            alt={cover.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            placeholder="blur"
                            blurDataURL={cover.blurDataURL}
                            className="object-cover"
                          />
                        </div>
                        <div className="pt-4 mt-4 border-t border-line-strong group-hover:border-ink transition-colors duration-fast ease-out">
                          <span className="text-manifest-sm text-clay">{entry.category}</span>
                          <h3 className="text-title mt-2.5 group-hover:text-clay transition-colors duration-fast ease-out">
                            {entry.title}
                          </h3>
                        </div>
                      </PlateLink>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
