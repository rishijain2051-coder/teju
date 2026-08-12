'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useReveal } from '@/components/ui/useReveal';
import { capabilities, img } from '@/lib/site';

export default function WhyBrandsSection() {
  const ref = useReveal<HTMLElement>();
  const plate = img('pr-industrial-drawers');

  return (
    <section ref={ref} id="factory" className="relative bg-teal text-paper grain py-20 lg:py-32">
      <div className="shell relative z-10">
        <header className="flex items-baseline gap-5 pt-6 border-t border-line-invert rise">
          <span className="text-manifest-sm text-paper/45 numeral">02</span>
          <h2 className="font-serif text-display font-light -mt-2">
            Why brands <span className="italic text-timber">stay</span>
          </h2>
        </header>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-12 lg:mt-20">
          {/* Plate */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <div className="plate aspect-[3/4] bg-teal-soft rise">
              <AppImage
                src={plate.src}
                alt={plate.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                placeholder="blur"
                blurDataURL={plate.blurDataURL}
                className="object-cover"
              />
            </div>
            <p className="text-manifest-sm text-paper/50 mt-4 rise">
              Boranada Industrial Area — Jodhpur
            </p>
          </div>

          {/* Capability ledger */}
          <div className="lg:col-span-7">
            <p className="text-lead text-paper/75 max-w-measure rise">
              We are a factory, not a trading desk. Every stage from rough stock to
              the packed container happens on one floor, which is the only reliable
              way to promise a buyer that the third container matches the first.
            </p>

            <ul data-reveal-group className="mt-12 lg:mt-16">
              {capabilities.map((capability) => (
                <li
                  key={capability.index}
                  className="flex gap-5 lg:gap-8 py-6 border-t border-line-invert rise"
                >
                  <span className="text-manifest-sm text-timber numeral shrink-0 pt-1.5">
                    {capability.index}
                  </span>
                  <div>
                    <h3 className="font-serif text-title font-light">{capability.title}</h3>
                    <p className="text-body text-paper/65 mt-2 max-w-measure">
                      {capability.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line-invert pt-8 mt-2 rise">
              <Link href="/contact" className="btn btn-invert">
                Talk to the factory
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
