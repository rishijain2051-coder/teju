'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useReveal } from '@/components/ui/useReveal';
import { pieces, img } from '@/lib/site';

const SHOWN = 6;

export default function FeaturedProducts() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} id="pieces" className="py-20 lg:py-32 bg-paper-deep">
      <div className="shell">
        <header className="rule-label rise" style={{ borderColor: 'var(--line-strong)' }}>
          <span className="text-manifest-sm text-muted numeral">03</span>
          <div className="flex-1">
            <h2 className="font-serif text-display font-light -mt-2">
              Selected <span className="italic">pieces</span>
            </h2>
          </div>
          <Link
            href="/collections"
            className="link-arrow hidden sm:inline-flex items-center gap-2.5 text-manifest text-ink-soft hover:text-clay transition-colors duration-base"
          >
            Full catalogue
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </header>

        <div data-reveal-group className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-12 lg:mt-16">
          {pieces.slice(0, SHOWN).map((piece, i) => {
            const plate = img(piece.image);
            return (
              <article
                key={piece.ref}
                className="group rise"
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <Link href="/collections" className="block">
                  <div className="plate aspect-[4/3] bg-paper">
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

                  {/* Spec block, set like a catalogue entry. */}
                  <div className="pt-4 mt-4 border-t border-line-strong group-hover:border-ink transition-colors duration-base">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-title font-light group-hover:text-clay transition-colors duration-base">
                        {piece.name}
                      </h3>
                      <span className="text-manifest-sm text-muted numeral shrink-0">{piece.ref}</span>
                    </div>

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
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-14 sm:hidden rise">
          <Link href="/collections" className="btn btn-ghost w-full justify-center">
            Full catalogue
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
