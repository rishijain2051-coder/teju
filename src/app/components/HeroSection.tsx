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
        <div className="lg:col-span-7 flex flex-col justify-between pt-24 pb-8 lg:pt-28 lg:pb-10 px-gutter">
          <div className="max-w-[46rem]">
            <p className="text-manifest text-clay veil" style={{ transitionDelay: '80ms' }}>
              Est. {brand.established} · {brand.origin}
            </p>

            {/* Three lines, not two: each word wipes on its own beat, and the
                delays stay 100ms apart so the cadence reads as a list rather than
                a sentence being assembled. */}
            <h1 className="font-serif text-mega font-light mt-5 lg:mt-6">
              <span className="wipe">
                <span className="wipe-inner" style={{ transitionDelay: '160ms' }}>
                  Raw
                </span>
              </span>
              <span className="wipe">
                <span className="wipe-inner" style={{ transitionDelay: '260ms' }}>
                  Real
                </span>
              </span>
              <span className="wipe">
                <span className="wipe-inner italic text-clay" style={{ transitionDelay: '360ms' }}>
                  Remarkable
                </span>
              </span>
            </h1>

            <p
              className="text-lead text-ink-soft max-w-measure mt-5 lg:mt-7 rise"
              style={{ transitionDelay: '520ms' }}
            >
              Solid mango and reclaimed hardwood, cut, carved and finished on our own floor in
              Boranada, then packed into containers bound for nine countries. Low minimums. Honest
              lead times. One set of hands from log to lorry.
            </p>

            <div
              className="flex flex-wrap gap-3 mt-7 lg:mt-8 rise"
              style={{ transitionDelay: '640ms' }}
            >
              <Link href="/collections" className="btn btn-solid">
                View the collections
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
              <Link href="/contact" className="btn btn-ghost">
                Become a partner
              </Link>
            </div>
          </div>

          {/* Plate index, set like a contact sheet. */}
          <div
            className="hidden lg:flex items-center gap-5 mt-8 rise"
            style={{ transitionDelay: '760ms' }}
          >
            {PLATES.map((plate, i) => (
              <button
                key={plate}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show plate ${i + 1}: ${img(plate).alt}`}
                aria-current={i === active}
                className="group flex items-center gap-2.5 py-3.5"
              >
                {/* Rules alone, no numerals. The plate caption already reads
                    "Plate 01 / 03", and these three sat within a screen of the
                    collection card indices below — the same digits meaning two
                    different things. Scales rather than resizing: `width` is a
                    layout property and this re-runs every 7s for the life of the
                    page. The `aria-label` still names each plate. */}
                <span
                  className={`block h-px w-16 origin-left transition-[transform,background-color] duration-base ease-out ${
                    i === active
                      ? 'scale-x-100 bg-ink'
                      : 'scale-x-[0.45] bg-line-strong group-hover:bg-ink'
                  }`}
                />
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
                className="absolute inset-0 transition-[opacity,filter] duration-[1400ms] ease-out-soft"
                style={{
                  opacity: i === active ? 1 : 0,
                  // A slight blur on the outgoing plate stops two sharp
                  // photographs reading as a double exposure mid-crossfade.
                  // `blur(0px)` not `none` — `filter` cannot interpolate to a keyword.
                  filter: i === active ? 'blur(0px)' : 'blur(4px)',
                }}
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
