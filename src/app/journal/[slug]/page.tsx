import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import PlateLink from '@/components/ui/PlateLink';
import { delay } from '@/lib/reveal';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/ui/Reveal';
import AppImage from '@/components/ui/AppImage';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { articleSchema, breadcrumbSchema, type Crumb } from '@/lib/schema';
import { findArticle, img, journal, pieceHref, pieces, type Article, type Piece } from '@/lib/site';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return journal.map((article) => ({ slug: article.slug }));
}

/**
 * The standfirsts run 101 to 146 characters and a result snippet has room for
 * about 160, so the dateline is appended only where it fits: the longest candidate
 * inside the limit wins, and the FSC note keeps its standfirst alone at 146. The
 * excerpt is not used here — it is card copy, written to sit under a headline the
 * reader can already see, and it repeats the title on three of the four.
 */
const describe = (article: Article) =>
  [
    `${article.standfirst} From the works at Boranada, ${article.date}.`,
    `${article.standfirst} Boranada, ${article.date}.`,
    article.standfirst,
  ].find((line) => line.length <= 160) ?? article.standfirst;

/* Opens at the section, not at Home. The hand-rolled trail this replaced started
   at Collections, the masthead links home from every page, and a crumb whose only
   job is to duplicate the logo is a link that costs a tap target and returns
   nothing. Kept in step with the collections trails. */
const trailFor = (article: Article): Crumb[] => [
  { name: 'Journal', href: '/journal' },
  { name: article.title },
];

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return { title: 'Journal' };

  const description = describe(article);

  return {
    /* From the resolved record, not the incoming param — see src/app/page.tsx. */
    alternates: { canonical: `/journal/${article.slug}` },
    title: article.title,
    description,
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      images: [{ url: img(article.image).src }],
    },
  };
}

const designLink = (piece: Piece) => (
  <Link href={pieceHref(piece)} className="text-clay link-draw press">
    {piece.name}
  </Link>
);

/**
 * ", the X and Y among them." — and just "." when nothing resolves, which is why
 * the clause owns the full stop rather than the sentence it closes.
 *
 * Designs are resolved through `pieces` rather than written as paths: `pieceHref`
 * derives the route from the collection, so a design that moves collection changes
 * URL, and a design that goes private loses its public page altogether. A lookup
 * is the only form of this that can neither 404 nor name a gated design.
 */
const among = (slugs: readonly string[]) => {
  const found = slugs
    .map((wanted) => pieces.find((piece) => piece.slug === wanted))
    .filter((piece): piece is Piece => Boolean(piece));

  if (found.length === 0) return '.';

  return (
    <>
      , the{' '}
      {found.map((piece, i) => (
        <React.Fragment key={piece.slug}>
          {i > 0 && ' and '}
          {designLink(piece)}
        </React.Fragment>
      ))}{' '}
      among them.
    </>
  );
};

/**
 * Where each article sends a reader next, written per slug.
 *
 * Not derived from `category`, because the useful next step differs by subject
 * rather than by filing: out of the mango note it is the drying stage on /craft,
 * out of the FSC note it is the chain-of-custody panel, and a category map would
 * have sent both back to the journal index. One paragraph of prose, because a
 * buyer researching a supplier arrives on these pages from search and the four
 * journal routes otherwise link nowhere but to each other.
 */
const ONWARD: Record<string, React.ReactNode> = {
  'solid-mango-wood': (
    <>
      The drying this piece turns on is the second of eight stages.{' '}
      <Link href="/craft" className="text-clay link-draw press">
        The rest of the sequence
      </Link>{' '}
      is set out bench by bench, and the mango casegoods that come off it run through the{' '}
      <Link href="/collections/dining" className="text-clay link-draw press">
        dining range
      </Link>
      {among(['osian-barn-sideboard', 'marwar-parquet-sideboard'])}
    </>
  ),
  'timber-to-container': (
    <>
      The benches in this account have addresses.{' '}
      <Link href="/factory" className="text-clay link-draw press">
        The factory page
      </Link>{' '}
      gives the floor area by area and the same nine weeks as a dated timeline, and{' '}
      <Link href="/craft" className="text-clay link-draw press">
        the eight stages
      </Link>{' '}
      describe what happens at each one. Everything in{' '}
      <Link href="/collections" className="text-clay link-draw press">
        the collections
      </Link>{' '}
      goes through it.
    </>
  ),
  'european-retail-2027': (
    <>
      An order book is easier to read against the pieces themselves. The painted, tiled and parquet
      fronts it is moving towards are separate trades in this building —{' '}
      <Link href="/craft" className="text-clay link-draw press">
        the carving, parquet and tile benches
      </Link>{' '}
      — and they run across{' '}
      <Link href="/collections" className="text-clay link-draw press">
        the collections
      </Link>
      {among(['marwar-parquet-sideboard', 'pichola-tile-cabinet'])}
    </>
  ),
  'what-fsc-actually-certifies': (
    <>
      <Link href="/craft#fsc" className="text-clay link-draw press">
        The chain-of-custody panel
      </Link>{' '}
      sets out which claim we hold and the certificate code it travels with, the tagged stacks it
      describes are in{' '}
      <Link href="/factory" className="text-clay link-draw press">
        the yard at Boranada
      </Link>
      , and every design in{' '}
      <Link href="/collections" className="text-clay link-draw press">
        the collections
      </Link>{' '}
      states the claim it can be supplied under.
    </>
  ),
};

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  const plate = img(article.image);
  const trail = trailFor(article);
  const onward = ONWARD[article.slug];
  const more = journal.filter((entry) => entry.slug !== article.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail)} />
      {/* The records carry no byline — title, category, dateline, reading time and
          nothing else — so `articleSchema` files both author and publisher as the
          organisation. That is the same claim the dateline at the foot of the body
          makes in prose: written at the works, not signed. */}
      <JsonLd data={articleSchema(article, `/journal/${article.slug}`)} />

      <Header />
      <main id="main">
        {/* A bespoke masthead rather than PageHeader: an article needs its
            dateline and standfirst, and a measure narrower than a page lead. */}
        <Reveal immediate>
          <header className="pt-32 lg:pt-44 pb-10 lg:pb-14">
            <div className="shell">
              {/* One line, above the wipe, so the plate below keeps its place in
                  the first viewport — this page is the destination of the journal
                  card's morph and the photograph has to land where it was aimed. */}
              <Breadcrumbs trail={trail} className="veil" />

              <h1 className="font-serif text-display font-light mt-6 lg:mt-8 max-w-[26ch]">
                <span className="wipe">
                  <span className="wipe-inner" style={delay(90)}>
                    {article.title}
                  </span>
                </span>
              </h1>

              <p className="text-lead text-ink-soft max-w-measure mt-7 rise" style={delay(300)}>
                {article.standfirst}
              </p>

              <dl
                className="flex flex-wrap items-baseline gap-x-10 gap-y-3 mt-10 pt-6 border-t border-line rise"
                style={delay(400)}
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

                  {/* Onward links first, dateline last: the reader who finished the
                      piece is looking for the next thing, and one shared rule keeps
                      that from reading as a second footer. */}
                  <div className="rule mt-16 pt-6 rise">
                    {/* One step down from the body measure's `text-lead`: this is
                        apparatus, not the last paragraph of the argument. */}
                    {onward && <p className="text-body text-ink-soft max-w-measure">{onward}</p>}
                    <p className={`text-manifest-sm text-muted ${onward ? 'mt-10' : ''}`}>
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
