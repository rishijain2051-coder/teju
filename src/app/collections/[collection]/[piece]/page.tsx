import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/ui/Reveal';
import SectionHead from '@/components/ui/SectionHead';
import SpecList from '@/components/ui/SpecList';
import PieceCard from '@/components/ui/PieceCard';
import PieceEnquiry from '@/components/ui/PieceEnquiry';
import AppImage from '@/components/ui/AppImage';
import {
  findCollection,
  findPiece,
  fscClaimFor,
  img,
  pieces,
  relatedTo,
  slugify,
} from '@/lib/site';

interface Params {
  params: Promise<{ collection: string; piece: string }>;
}

/**
 * Public designs only. Private references are intentionally absent: a generated
 * route would be reachable without the access cookie, so the gated range would
 * be a sitemap away from public. Their detail opens inline inside the private
 * catalogue instead.
 */
export function generateStaticParams() {
  return pieces.map((piece) => ({
    collection: slugify(piece.collection),
    piece: piece.slug,
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { collection, piece: pieceSlug } = await params;
  const piece = findPiece(collection, pieceSlug);
  if (!piece) return { title: 'Collections' };

  return {
    title: `${piece.name} · ${piece.ref}`,
    description: `${piece.note} ${piece.material}, ${piece.finish.toLowerCase()}, ${piece.dimensions}.`,
    openGraph: {
      title: `${piece.name} · Vardhman Impex`,
      description: piece.note,
      images: [{ url: img(piece.image).src }],
    },
  };
}

export default async function PiecePage({ params }: Params) {
  const { collection: collectionSlug, piece: pieceSlug } = await params;
  const piece = findPiece(collectionSlug, pieceSlug);

  // A private reference reached by URL guess is a 404, not a redirect: a
  // redirect would confirm the reference exists.
  if (!piece || piece.private) notFound();

  const collection = findCollection(collectionSlug);
  if (!collection) notFound();

  const plate = img(piece.image);
  const related = relatedTo(piece, 3);
  const fsc = fscClaimFor(piece);

  return (
    <>
      <Header />
      <main id="main">
        <Reveal immediate>
          <section className="pt-28 lg:pt-36 pb-16 lg:pb-24">
            <div className="shell">
              <nav aria-label="Breadcrumb" className="veil">
                <ol className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-manifest-sm text-muted">
                  <li>
                    <Link href="/collections" className="hover:text-clay transition-colors duration-base tap">
                      Collections
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={collection.href} className="hover:text-clay transition-colors duration-base tap">
                      {collection.name}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li className="text-ink-soft numeral">{piece.ref}</li>
                </ol>
              </nav>

              <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-8 lg:mt-10">
                {/* Plate */}
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
                  <p className="text-manifest-sm text-muted mt-4 rise">{plate.alt}</p>
                </div>

                {/* Record */}
                <div className="lg:col-span-5">
                  <p className="text-manifest text-clay veil">
                    {collection.name} · {piece.ref}
                  </p>

                  <h1 className="font-serif text-display font-light mt-5">
                    <span className="wipe">
                      <span className="wipe-inner" style={{ transitionDelay: '90ms' }}>
                        {piece.name}
                      </span>
                    </span>
                  </h1>

                  <p
                    className="text-lead text-ink-soft max-w-measure mt-6 rise"
                    style={{ transitionDelay: '260ms' }}
                  >
                    {piece.note}
                  </p>

                  <SpecList
                    className="mt-9 rise"
                    rows={[
                      { key: 'Reference', value: piece.ref },
                      { key: 'Collection', value: piece.collection },
                      { key: 'Material', value: piece.material },
                      { key: 'Finish', value: piece.finish },
                      { key: 'Dimensions', value: piece.dimensions },
                      { key: 'Lead time', value: '45–60 days' },
                      { key: 'Minimum', value: 'From two pieces' },
                    ]}
                  />

                  {/* Certification, at the point of decision. Derived from the
                      material, so it can never contradict the row above it. */}
                  <div className="mt-8 pt-5 border-t border-line rise">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <p className="text-manifest text-clay">{fsc.claim}</p>
                      <p className="text-manifest-sm text-muted">Available on request</p>
                    </div>
                    <p className="text-body text-muted mt-2 max-w-measure">{fsc.detail}</p>
                  </div>

                  <div className="mt-10 rise">
                    <p className="text-manifest-sm text-muted mb-5">Enquire on this design</p>
                    <PieceEnquiry piece={piece} />
                    <p className="text-manifest-sm text-muted mt-5 max-w-measure leading-relaxed">
                      Packed carton size, CBM and container counts are issued with the quotation, or
                      in full to verified trade buyers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          {/* A single detail band: the same photograph, cropped tight. Honest —
              there is one photograph of each design, and pretending otherwise
              with a fabricated gallery would misrepresent the range. */}
          <section aria-hidden="true" className="relative h-[45vh] lg:h-[60vh] overflow-hidden bg-paper-deep">
            <AppImage
              src={plate.src}
              alt=""
              fill
              sizes="100vw"
              placeholder="blur"
              blurDataURL={plate.blurDataURL}
              data-parallax
              className="scale-[1.3]"
              /* AppImage's `fill` branch sets `objectFit` inline and spreads
                 extra props after it, so a bare `objectPosition` here would
                 replace the whole style object and drop the fit. */
              style={{ objectFit: 'cover', objectPosition: '50% 35%' }}
            />
          </section>

          {/* How it is made — a route into the craft page rather than a repeat. */}
          <section className="py-20 lg:py-28">
            <div className="shell">
              <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-5">
                  <h2 className="font-serif text-display-sm font-light rise">
                    Made at <span className="italic">Boranada</span>
                  </h2>
                  <p className="text-body text-muted mt-5 max-w-measure rise">
                    Framed carcass, timber brought to 8–10% moisture before it reaches a joint,
                    finished against a retained sample rather than a colour code. Nothing in this
                    piece was subcontracted.
                  </p>
                  <Link href="/craft" className="btn btn-ghost mt-8 rise">
                    The eight stages
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="lg:col-span-6 lg:col-start-7">
                  <SpecList
                    className="rise"
                    rows={[
                      { key: 'Carcass', value: 'Framed, not slab-built' },
                      { key: 'Moisture at joint', value: '8–10%' },
                      { key: 'Private label', value: 'Available' },
                      { key: 'Custom finish', value: 'Sampled before production' },
                      { key: 'Packing', value: '3 cm protection per face' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="py-20 lg:py-28 bg-paper-deep">
              <div className="shell">
                <SectionHead
                  title={<>Also in the <span className="italic">range</span></>}
                  href={collection.href}
                  linkLabel={`All ${collection.name.toLowerCase()}`}
                />

                <div
                  data-reveal-group
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-12"
                >
                  {related.map((entry) => (
                    <PieceCard key={entry.ref} piece={entry} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
