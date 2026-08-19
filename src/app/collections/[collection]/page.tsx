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
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import AppImage from '@/components/ui/AppImage';
import FscPanel from '@/components/ui/FscPanel';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, type Crumb } from '@/lib/schema';
import {
  collections,
  findCollection,
  img,
  piecesIn,
  testimonials,
  type Collection,
  type CollectionName,
} from '@/lib/site';

interface Params {
  params: Promise<{ collection: string }>;
}

export function generateStaticParams() {
  return collections.map((collection) => ({ collection: collection.slug }));
}

/*
 * The product words a buyer types, one line per collection.
 *
 * A `Record` over `CollectionName` rather than nouns pulled out of the tagline by
 * regex: the union *is* the list of collections, so a seventh one fails the type
 * check here instead of shipping a title with no product word in it. Every noun
 * below is one the collection's own tagline or story already uses — this is the
 * search phrasing of the copy on the page, not a new claim about the range.
 */
const CATEGORY: Record<CollectionName, string> = {
  Living: 'Sideboards, Consoles & Bar Cabinets',
  Storage: 'Vitrines, Almirahs & Cabinets',
  Dining: 'Dressers, Servers & Glazed Hutches',
  Bedroom: 'Chests & Nightstands',
  Hospitality: 'Contract-Grade Casegoods',
  Occasional: 'Coffee Tables, Side Tables & Mirrors',
};

/* The spec rows are content, so their keys differ by collection — the five ranges
   carry Timber, the contract programme carries Programme and Volume instead. Read
   by key and absent rather than assumed: a description that names a timber the
   page does not list is a fact we invented. */
const specValue = (collection: Collection, key: string) =>
  collection.spec.find((row) => row.key === key)?.value;

/**
 * The longest line that still fits a result snippet, as on the journal.
 *
 * One template cannot land inside 160 characters for all six: the taglines run 50
 * to 60 and the timber lists 11 to 33, which is a 40-character spread before any
 * of the trade terms. So the trade clause is what gives — mixed containers first,
 * then the FSC line that only the shortest of them has room for.
 */
const describe = (collection: Collection) => {
  const lead = (specValue(collection, 'Lead time') ?? '45–60 days').toLowerCase();
  const timber = specValue(collection, 'Timber')?.toLowerCase();
  const stock = timber ? `${collection.range} in ${timber}` : collection.range;

  const candidates = collection.bespoke
    ? [
        `${collection.tagline} Built to your drawings in Jodhpur, one approval sample before production, ${lead}.`,
        `${collection.tagline} Built to your drawings in Jodhpur, one approval sample before production.`,
      ]
    : [
        `${collection.tagline} ${stock}, made in Jodhpur. Low MOQ, mixed containers, ${lead}. FSC timber on request.`,
        `${collection.tagline} ${stock}, made in Jodhpur. Low MOQ, mixed containers, ${lead}.`,
        `${collection.tagline} ${stock}, made in Jodhpur. Low MOQ, ${lead}.`,
      ];

  return candidates.find((line) => line.length <= 160) ?? candidates[candidates.length - 1];
};

const trailFor = (collection: Collection): Crumb[] => [
  { name: 'Collections', href: '/collections' },
  { name: collection.name },
];

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = findCollection(slug);
  if (!collection) return { title: 'Collections' };

  return {
    /* From the resolved record, not the incoming param — see src/app/page.tsx. */
    alternates: { canonical: `/collections/${collection.slug}` },
    title: `${collection.name} · ${CATEGORY[collection.name]}`,
    description: describe(collection),
    openGraph: {
      title: `${collection.name} · Vardhman Impex`,
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
  const trail = trailFor(collection);

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail)} />

      <Header />
      <main id="main">
        <PageHeader
          eyebrow={`Collection ${collection.index} · ${collection.range}`}
          title={collection.name}
          lead={collection.tagline}
          meta={collection.spec}
        />

        {/* `immediate`, because this is the first fold and the plate in it is the
            destination of the card morph. Left to scroll it entered after the
            photograph had already landed, which is the one thing the morph is
            meant to avoid. */}
        <Reveal immediate>
          {/* Plate and story, side by side. */}
          <section className="shell">
            {/* Pulled up into the gap the masthead already leaves, rather than
                laid on top of it. The plate below is the destination of the
                collection-card morph, so every pixel added above it comes off the
                landing the photograph was aimed at — a line of 12px mono inside
                PageHeader's 64px of bottom padding costs 18 of them. */}
            <Breadcrumbs trail={trail} className="veil -mt-5 lg:-mt-8 mb-6 lg:mb-8" />

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
              <div className="lg:col-span-7">
                {/* Destination of the collection-card morph — see PlateLink. */}
                <div data-plate="active" className="plate aspect-[4/3]">
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
                  <p key={i} className="text-lead text-ink-soft max-w-measure mt-6 first:mt-0 rise">
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
                  title={
                    <>
                      How a programme <span className="italic">runs</span>
                    </>
                  }
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
                        {/* Upright, matching the home page pull quote. The
                            quotation marks mark it as speech; italic on top of
                            them is the same signal twice. */}
                        <p className="text-title leading-[1.45]">&ldquo;{reference.quote}&rdquo;</p>
                        <footer className="mt-5">
                          <p className="text-manifest text-ink">{reference.author}</p>
                          <p className="text-manifest-sm text-muted mt-1">
                            {reference.title}, {reference.company} · {reference.country}
                          </p>
                        </footer>
                      </blockquote>
                    </div>
                  )}
                </div>

                {shown.length > 0 && (
                  <div className="mt-20 lg:mt-28">
                    <p className="text-manifest-sm text-muted rise">
                      Representative builds, specified rather than stocked
                    </p>
                    <div data-reveal-group className="grid sm:grid-cols-2 gap-x-6 gap-y-12 mt-6">
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
                  title={
                    <>
                      In this <span className="italic">collection</span>
                    </>
                  }
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
                <FscPanel variant="brief" />
              </div>

              {/* The two routes that substantiate the claim this panel makes.
                  A buyer who reads "certified on request" next asks who did the
                  work, and the answer is a floor and a sequence, not a paragraph
                  repeated here. */}
              <p className="text-body text-muted max-w-measure mt-6 rise">
                Timber for this collection is sawn, dried, joined and finished on one floor, and
                nothing in it is subcontracted.{' '}
                <Link href="/craft" className="text-clay link-draw tap">
                  The eight stages
                </Link>{' '}
                set out what happens at each bench, and{' '}
                <Link href="/factory" className="text-clay link-draw tap">
                  the works at Boranada
                </Link>{' '}
                gives the floor area by area.
              </p>
            </div>
          </section>

          {/* Sideways navigation between collections. */}
          <section className="pb-20 lg:pb-32 bg-paper-deep pt-20 lg:pt-28">
            <div className="shell">
              <SectionHead
                title={
                  <>
                    Other <span className="italic">collections</span>
                  </>
                }
              />

              <ul data-reveal-group className="mt-10">
                {others.map((entry) => (
                  <li key={entry.slug} className="rise">
                    <Link
                      href={entry.href}
                      className="group flex flex-wrap items-baseline gap-x-6 gap-y-1 py-6 border-t border-line-strong"
                    >
                      <span className="text-manifest-sm text-muted numeral">{entry.index}</span>
                      <h3 className="font-serif text-display-sm font-light group-hover:text-clay transition-colors duration-fast ease-out">
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
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
