'use client';

import React from 'react';
import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';
import AppImage from '@/components/ui/AppImage';
import { useReveal } from '@/components/ui/useReveal';
import { brand, img } from '@/lib/site';

export default function ContactCTA() {
  const ref = useReveal<HTMLElement>();
  const plate = img('craft-mirror');

  return (
    <section ref={ref} className="relative bg-ink text-paper grain overflow-hidden">
      <div className="grid lg:grid-cols-12">
        {/* Statement */}
        <div className="lg:col-span-7 px-gutter py-20 lg:py-32 flex flex-col justify-center">
          <p className="text-manifest text-clay-soft rise">Start a conversation</p>

          <h2 className="font-serif text-display-sm font-light mt-8">
            <span className="wipe">
              <span className="wipe-inner">Let&apos;s build</span>
            </span>
            <span className="wipe">
              <span className="wipe-inner italic">something lasting.</span>
            </span>
          </h2>

          <p className="text-lead text-paper/70 max-w-measure mt-8 rise">
            Retailer, interior designer, or hospitality buyer: send us the specification and we will
            come back with honest lead times and a price that holds.
          </p>

          <div className="flex flex-wrap gap-3 mt-10 rise">
            <Link href="/contact" className="btn btn-invert">
              Send an enquiry
              <Arrow />
            </Link>
            <Link href="/collections#access" className="btn btn-invert">
              Request catalogue access
            </Link>
          </div>

          {/* Quoted verbatim from the hero, the trade-access form and the container
              plan. The last thing read before the last decision on the page. */}
          <p className="text-note text-paper/70 mt-5 rise">We reply within two working days.</p>

          {/* Direct lines, set as a manifest block. */}
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mt-14 pt-8 border-t border-line-invert rise">
            <div>
              <dt className="text-manifest-sm text-paper/55">Email</dt>
              <dd className="mt-1.5">
                <a href={`mailto:${brand.email}`} className="text-body text-paper link-draw press">
                  {brand.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-manifest-sm text-paper/55">Telephone</dt>
              <dd className="mt-1.5">
                <a
                  href={`tel:${brand.phoneHref}`}
                  className="text-body text-paper link-draw numeral press"
                >
                  {brand.phone}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-manifest-sm text-paper/55">Works</dt>
              <dd className="text-body text-paper/70 mt-1.5">
                {brand.address.line1}, {brand.address.line2}
              </dd>
            </div>
          </dl>
        </div>

        {/* Plate */}
        <div className="lg:col-span-5 relative min-h-[52vh] lg:min-h-0 order-first lg:order-last overflow-hidden">
          <AppImage
            src={plate.src}
            alt={plate.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            placeholder="blur"
            blurDataURL={plate.blurDataURL}
            data-parallax
            className="object-cover scale-[1.14]"
          />
        </div>
      </div>
    </section>
  );
}
