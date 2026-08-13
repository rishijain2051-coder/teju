import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import SectionHead from '@/components/ui/SectionHead';
import SpecList from '@/components/ui/SpecList';
import PieceCard from '@/components/ui/PieceCard';
import AppImage from '@/components/ui/AppImage';
import FscPanel from '@/components/ui/FscPanel';
import { collections, findCollection, img, piecesIn, testimonials } from '@/lib/site';

interface Params {
  params: Promise<{ collection: string }>;
}

export function generateStaticParams() {
  return collections.map((collection) => ({ collection: collection.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = findCollection(slug);
  if (!collection) return { title: 'Collections' };

  return {
    title: `${collection.name} — Collections`,
    description: `${collection.tagline} ${collection.story[0]}`.slice(0, 300),
    openGraph: {
      title: `${collection.name} — Vardhman Impex`,
      description: collection.tagline,
      images: [{ url: img(collection.image).src }],
    },
  };
}

export default async function CollectionPage({ params }: Params) {
  const { collection: slug } = await params;
  const collection = findCollection(slug);
  if (!collection) notFound();

  const plate = img(collection.image);
  const shown = piecesIn(collection.name);
  const others = collections.filter((entry) => entry.slug !== collection.slug);

  /* The contract collection carries the hospitality reference rather than a
     grid — a programme is sold on evidence it has been delivered before. */
  const reference = testimonials.find((entry) => /hospitality/i.test(entry.company));

  return (
    <>
      <Header />
      <main id="main">
        <PageHeader
          eyebrow={`Collection ${collection.index} — ${collection.range}`}
          title={collection.name}
          lead={collection.tagline}
          meta={collection.spec}
        />

        <Reveal>
          {/* Plate and story, side by side. */}
          <section className="shell">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
              <div className="lg:col-span-7">
                <div className="plate aspect-[4/3] rise">
                  <AppImage
                    src={plate.src}
                    alt={plate.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    placeholder="blur"
                    blurDataURL={plate.blurDataURL}
                    priority
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-center">
                {collection.story.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-lead text-ink-soft max-w-measure mt-6 first:mt-0 rise"
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {collection.bespoke ? (
            /* Programme, not a range. A filtered grid of two examples would
               undersell it and imply there is a catalogue to order from. */
            <section className="py-20 lg:py-32">
              <div className="shell">
                <SectionHead
                  index="01"
                  title={<>How a programme <span className="italic">runs</span></>}
                />

                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-12 lg:mt-16">
                  <div className="lg:col-span-6">
                    <SpecList rows={collection.spec} className="rise" />
                    <p className="text-body text-muted mt-6 max-w-measure rise">
                      Bring drawings and we will build to them. Bring a brief and a photograph and
                      our drawing floor will come back with something to sign off. Either way one
                      approval sample is made and retained before the production floor commits.
                    </p>
                  </div>

                  {reference && (
                    <div className="lg:col-span-5 lg:col-start-8 rise">
                      <blockquote className="border-t border-line-strong pt-6">
                        <p className="font-serif text-title font-light italic">
                          &ldquo;{reference.quote}&rdquo;
                        </p>
                        <footer className="mt-5">
                          <p className="text-manifest text-ink">{reference.author}</p>
                          <p className="text-manifest-sm text-muted mt-1">
                            {reference.title}, {reference.company} — {reference.country}
                          </p>
                        </footer>
                      </blockquote>
                    </div>
                  )}
                </div>

                {shown.length > 0 && (
                  <div className="mt-20 lg:mt-28">
                    <p className="text-manifest-sm text-muted rise">
                      Representative builds — specified, not stocked
                    </p>
                    <div
                      data-reveal-group
                      className="grid sm:grid-cols-2 gap-x-6 gap-y-12 mt-6"
                    >
                      {shown.map((piece) => (
                        <PieceCard
                          key={piece.ref}
                          piece={piece}
                          showNote
                          sizes="(max-width: 640px) 100vw, 45vw"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="py-20 lg:py-32">
              <div className="shell">
                <SectionHead
                  index="01"
                  title={<>In this <span className="italic">collection</span></>}
                  href="/collections"
                  linkLabel="All collections"
                />

                <p className="text-body text-muted max-w-measure mt-6 rise">
                  {shown.length} {shown.length === 1 ? 'design' : 'designs'} shown here of{' '}
                  {collection.range.toLowerCase()} in the range. Verified trade buyers see the rest.
                </p>

                <div
                  data-reveal-group
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-12"
                >
                  {shown.map((piece) => (
                    <PieceCard key={piece.ref} piece={piece} showNote />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Certification, briefly. A buyer asking about timber is on this page,
              not on the factory page. */}
          <section className="pb-20 lg:pb-28">
            <div className="shell">
              {/* Pointer, not the explanation — so no trademark artwork here.
                  The mark belongs on /craft and /factory, where the claim is set
                  out in full. */}
              <div className="rise">
                <FscPanel variant="brief" mark={false} />
              </div>
            </div>
          </section>

          {/* Sideways navigation between collections. */}
          <section className="pb-20 lg:pb-32 bg-paper-deep pt-20 lg:pt-28">
            <div className="shell">
              <SectionHead index="02" title={<>Other <span className="italic">collections</span></>} />

              <ul data-reveal-group className="mt-10">
                {others.map((entry) => (
                  <li key={entry.slug} className="rise">
                    <Link
                      href={entry.href}
                      className="group flex flex-wrap items-baseline gap-x-6 gap-y-1 py-6 border-t border-line-strong"
                    >
                      <span className="text-manifest-sm text-muted numeral">{entry.index}</span>
                      <h3 className="font-serif text-display-sm font-light group-hover:text-clay transition-colors duration-base">
                        {entry.name}
                      </h3>
                      <p className="text-body text-muted flex-1 min-w-[16rem]">{entry.tagline}</p>
                      <span className="text-manifest-sm text-muted shrink-0">{entry.range}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="rule mt-16 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rise">
                <p className="text-body text-muted max-w-measure">
                  The full catalogue runs to over a thousand designs. Verified trade buyers receive
                  access to the private range.
                </p>
                <Link href="/collections#access" className="btn btn-solid shrink-0">
                  Request catalogue access
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
