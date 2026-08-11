'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useReveal } from '@/components/ui/useReveal';
import { brand, img } from '@/lib/site';
import type { CatalogueKey } from '@/lib/imagery';

/** Three portrait plates, held long enough to actually be looked at. */
const PLATES: CatalogueKey[] = ['hero-mango-light', 'hero-starburst', 'hero-tall-chest'];
const HOLD = 7000;

export default function HeroSection() {
  const ref = useReveal<HTMLElement>({ immediate: true });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % PLATES.length), HOLD);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className="relative grain">
      <div className="grid lg:grid-cols-12 min-h-[100svh]">
        {/* ── Type column ──────────────────────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col justify-between pt-28 pb-10 lg:pt-40 lg:pb-12 px-gutter">
          <div className="max-w-[46rem]">
            <p className="text-manifest text-clay veil" style={{ transitionDelay: '80ms' }}>
              Est. {brand.established} — {brand.origin}
            </p>

            <h1 className="font-serif text-mega font-light mt-8 lg:mt-12">
              <span className="wipe">
                <span className="wipe-inner" style={{ transitionDelay: '160ms' }}>
                  Timber
                </span>
              </span>
              <span className="wipe">
                <span className="wipe-inner italic text-clay" style={{ transitionDelay: '280ms' }}>
                  that travels.
                </span>
              </span>
            </h1>

            <p
              className="text-lead text-ink-soft max-w-measure mt-8 lg:mt-12 rise"
              style={{ transitionDelay: '520ms' }}
            >
              Solid mango and reclaimed hardwood, cut, carved and finished on our own
              floor in Boranada — then packed into containers bound for nine countries.
              Low minimums. Honest lead times. One set of hands from log to lorry.
            </p>

            <div
              className="flex flex-wrap gap-3 mt-10 lg:mt-14 rise"
              style={{ transitionDelay: '640ms' }}
            >
              <Link href="/collections" className="btn btn-solid">
                View the collections
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                Become a partner
              </Link>
            </div>
          </div>

          {/* Plate index, set like a contact sheet. */}
          <div
            className="hidden lg:flex items-center gap-5 mt-16 rise"
            style={{ transitionDelay: '760ms' }}
          >
            {PLATES.map((plate, i) => (
              <button
                key={plate}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show plate ${i + 1}: ${img(plate).alt}`}
                aria-current={i === active}
                className="group flex items-center gap-2.5 py-2"
              >
                <span
                  className={`block h-px transition-all duration-base ease-out ${
                    i === active ? 'w-14 bg-ink' : 'w-7 bg-line-strong group-hover:bg-ink'
                  }`}
                />
                <span
                  className={`text-manifest-sm numeral transition-colors duration-base ${
                    i === active ? 'text-ink' : 'text-muted group-hover:text-ink'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Plate column — bleeds to the right edge ───────────────────── */}
        <div className="lg:col-span-5 relative min-h-[62vh] lg:min-h-0 bg-paper-deep overflow-hidden">
          {PLATES.map((plate, i) => {
            const plateImg = img(plate);
            return (
              <div
                key={plate}
                aria-hidden={i !== active}
                className="absolute inset-0 transition-opacity duration-[1400ms] ease-out-soft"
                style={{ opacity: i === active ? 1 : 0 }}
              >
                <AppImage
                  src={plateImg.src}
                  alt={plateImg.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  placeholder="blur"
                  blurDataURL={plateImg.blurDataURL}
                  className={`object-cover drift ${i === active ? 'shown' : ''}`}
                />
              </div>
            );
          })}

          {/* Caption sits on the plate, bottom-left, like a printed credit. */}
          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8 scrim-soft pt-24">
            <p className="text-manifest-sm text-paper/75 numeral">
              Plate {String(active + 1).padStart(2, '0')} / {String(PLATES.length).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
