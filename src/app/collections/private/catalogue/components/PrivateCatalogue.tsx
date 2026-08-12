'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import AppLogo from '@/components/ui/AppLogo';
import { useReveal } from '@/components/ui/useReveal';
import { pieces, privateAdditions, brand, img, type Piece } from '@/lib/site';
import { sendEnquiry } from '@/lib/enquiry';

const ALL_PIECES: Piece[] = [...pieces, ...privateAdditions];
const CATEGORIES = ['All', 'Living', 'Storage', 'Dining', 'Bedroom', 'Occasional'] as const;
type Category = (typeof CATEGORIES)[number];

export default function PrivateCatalogue() {
  const router = useRouter();
  const ref = useReveal<HTMLDivElement>({ immediate: true });
  const [active, setActive] = useState<Category>('All');
  const [signingOut, setSigningOut] = useState(false);

  const filtered = useMemo(
    () => (active === 'All' ? ALL_PIECES : ALL_PIECES.filter((p) => p.collection === active)),
    [active]
  );

  const handleSignOut = async () => {
    setSigningOut(true);
    await fetch('/api/logout', { method: 'POST' });
    router.push('/collections');
    router.refresh();
  };

  const handleEnquire = (piece: Piece) => {
    sendEnquiry(`Private catalogue enquiry — ${piece.name}`, {
      Reference: piece.ref,
      Piece: piece.name,
      Collection: piece.collection,
      Material: piece.material,
      Finish: piece.finish,
      Dimensions: piece.dimensions,
    });
  };

  return (
    <div ref={ref} className="min-h-screen">
      {/* Private masthead — deliberately distinct from the public one */}
      <header className="sticky top-0 z-50 bg-ink text-paper">
        <div className="shell-wide flex items-center justify-between h-16 lg:h-18 py-3">
          <Link href="/" className="flex items-center gap-3">
            <AppLogo size={26} className="brightness-0 invert" />
            <span className="font-serif text-[1.15rem] leading-none tracking-tight">
              Vardhman <span className="italic">Impex</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <span className="hidden sm:inline text-manifest-sm text-timber">
              Private catalogue
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-manifest-sm text-paper/60 hover:text-paper transition-colors duration-base disabled:opacity-50"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="py-12 lg:py-16">
        <div className="shell">
          <p className="text-manifest text-clay veil">Verified trade access</p>
          <h1 className="font-serif text-display font-light mt-5">
            The full <span className="italic">range</span>
          </h1>
          <p className="text-lead text-ink-soft max-w-measure mt-6 rise">
            {ALL_PIECES.length} designs currently live, including private-label bases.
            Enquire on any piece and the reference travels with the message.
          </p>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 py-5 mt-10 border-y border-line rise">
            {CATEGORIES.map((category) => {
              const count =
                category === 'All'
                  ? ALL_PIECES.length
                  : ALL_PIECES.filter((p) => p.collection === category).length;
              const isActive = category === active;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActive(category)}
                  aria-pressed={isActive}
                  className={`text-manifest transition-colors duration-base ${
                    isActive ? 'text-clay' : 'text-muted hover:text-ink'
                  }`}
                >
                  {category}
                  <span className="ml-2 text-manifest-sm text-muted numeral">
                    {String(count).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Keyed on `active` so the grid replays its entrance on every filter
              change. See CollectionsGrid for why these cards avoid `.rise`. */}
          <div
            key={active}
            data-reveal-group
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-12 filter-swap"
          >
            {filtered.map((piece) => {
              const plate = img(piece.image);
              return (
                <article key={piece.ref} className="group">
                  <div className="plate aspect-[4/3] bg-paper-deep">
                    <AppImage
                      src={plate.src}
                      alt={plate.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL={plate.blurDataURL}
                      className="object-cover"
                    />
                  </div>

                  <div className="pt-4 mt-4 border-t border-line">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-serif text-title font-light">{piece.name}</h2>
                      <span className="text-manifest-sm text-muted numeral shrink-0">{piece.ref}</span>
                    </div>
                    <p className="text-manifest-sm text-clay mt-2">{piece.collection}</p>

                    <dl className="mt-3 space-y-1">
                      {[
                        ['Material', piece.material],
                        ['Finish', piece.finish],
                        ['Dimensions', piece.dimensions],
                      ].map(([key, value]) => (
                        <div key={key} className="flex gap-3">
                          <dt className="text-manifest-sm text-muted w-24 shrink-0">{key}</dt>
                          <dd className="text-manifest-sm text-ink-soft numeral">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <button
                      type="button"
                      onClick={() => handleEnquire(piece)}
                      className="btn btn-ghost mt-5 !py-2.5 !px-4 w-full justify-center"
                    >
                      Enquire on {piece.ref}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rule mt-16 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-body text-muted max-w-measure">
              Need something not shown here? We produce to specification.
            </p>
            <a href={`mailto:${brand.email}`} className="btn btn-solid shrink-0">
              Email the factory
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
