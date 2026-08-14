import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import SectionHead from '@/components/ui/SectionHead';
import SpecList from '@/components/ui/SpecList';
import AppImage from '@/components/ui/AppImage';
import FscPanel from '@/components/ui/FscPanel';
import {
  brand,
  capabilities,
  exportMarkets,
  facts,
  floorAreas,
  img,
  logistics,
  notOurWork,
  orderTimeline,
  stats,
} from '@/lib/site';

export const metadata: Metadata = {
  title: 'Factory',
  description:
    'Nine thousand square metres at Boranada Industrial Area, Jodhpur. Floor layout, order timeline, export markets, logistics terms and FSC chain of custody.',
};

const META = [
  { key: 'Works', value: 'Boranada, Jodhpur' },
  { key: 'Floor', value: `${facts.factory} sq.mt` },
  { key: 'In-house', value: `${facts.craftspeople}+ craftspeople` },
  { key: 'Established', value: String(brand.established) },
] as const;

export default function FactoryPage() {
  const opening = img('pr-industrial-drawers');
  const yard = img('hero-mango-light');

  return (
    <>
      <Header />
      <main id="main">
        <PageHeader
          eyebrow={`${brand.origin} · since ${brand.established}`}
          title="Nine thousand square metres."
          lead="We are a factory, not a trading desk. Every stage from rough stock to the packed container happens on one floor at Boranada, and this page is what is on it: the areas, the timeline, the markets, and the paperwork that goes with them."
          meta={META}
        />

        <Reveal>
          <section className="shell">
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <div className="plate aspect-[3/2] rise">
                  <AppImage
                    src={opening.src}
                    alt={opening.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 62vw"
                    placeholder="blur"
                    blurDataURL={opening.blurDataURL}
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="lg:col-span-4">
                <div className="plate aspect-[3/2] lg:h-full lg:aspect-auto rise">
                  <AppImage
                    src={yard.src}
                    alt={yard.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 32vw"
                    placeholder="blur"
                    blurDataURL={yard.blurDataURL}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <p className="text-manifest-sm text-muted mt-4 rise">
              {brand.address.line1} · {brand.address.line2}
            </p>
          </section>

          {/* The floor, area by area. A plan, set as a manifest. */}
          <section className="py-20 lg:py-32">
            <div className="shell">
              <SectionHead
                title={
                  <>
                    The <span className="italic">floor</span>
                  </>
                }
              />

              <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-12 lg:mt-16">
                <div className="lg:col-span-7">
                  <ul data-reveal-group>
                    {floorAreas.map((area) => (
                      <li
                        key={area.name}
                        className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5 py-5 border-t border-line rise"
                      >
                        <div>
                          <h3 className="text-title">{area.name}</h3>
                          <p className="text-body text-muted mt-1">{area.detail}</p>
                        </div>
                        <span className="text-manifest text-clay numeral shrink-0">
                          {area.size}
                        </span>
                      </li>
                    ))}
                    <li className="flex items-baseline justify-between gap-8 py-5 border-y border-line-strong rise">
                      <span className="text-manifest text-ink">Total</span>
                      <span className="text-manifest text-ink numeral">{facts.factory} sq.mt</span>
                    </li>
                  </ul>
                </div>

                {/* Figures, stated plainly — the animated count-up belongs on the
                    home page, not on the page a buyer reads for numbers. */}
                <div className="lg:col-span-4 lg:col-start-9">
                  <p className="text-manifest-sm text-muted rise">By the numbers</p>
                  <SpecList
                    className="mt-4 rise"
                    rows={stats.map((stat) => ({
                      key: stat.label,
                      value: `${stat.value.toLocaleString('en-IN')}${stat.suffix}`,
                    }))}
                  />
                  <p className="text-body text-muted mt-6 max-w-measure rise">
                    Every one of the {facts.craftspeople}+ people here is on our own payroll.
                    Contract labour is how consistency slips between orders.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Order timeline */}
          <section className="py-20 lg:py-32 bg-paper-deep">
            <div className="shell">
              <SectionHead
                title={
                  <>
                    Order to <span className="italic">container</span>
                  </>
                }
              />
              <p className="text-lead text-ink-soft max-w-measure mt-8 rise">
                Forty-five to sixty days is the figure we quote, and this is where it goes. Buyers
                usually see two moments: the sample and the delivery. Here is the middle.
              </p>

              <ol data-reveal-group className="mt-12 lg:mt-16">
                {orderTimeline.map((step) => (
                  <li
                    key={step.when}
                    className="grid sm:grid-cols-12 gap-x-8 gap-y-2 py-6 border-t border-line-strong rise"
                  >
                    <span className="sm:col-span-2 text-manifest-sm text-clay numeral">
                      {step.when}
                    </span>
                    <h3 className="sm:col-span-4 text-title">{step.title}</h3>
                    <p className="sm:col-span-6 text-body text-muted max-w-measure">
                      {step.detail}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Capability ledger, on the dark ground the home page uses for it. */}
          <section className="py-20 lg:py-32 bg-teal text-paper grain">
            <div className="shell relative z-10">
              <SectionHead
                invert
                title={
                  <>
                    What the floor <span className="italic text-timber">gives you</span>
                  </>
                }
              />

              <ul data-reveal-group className="grid lg:grid-cols-2 gap-x-16 mt-12 lg:mt-16">
                {capabilities.map((capability) => (
                  <li
                    key={capability.index}
                    className="flex gap-5 lg:gap-8 py-6 border-t border-line-invert rise"
                  >
                    <span className="text-manifest-sm text-timber numeral shrink-0 pt-1.5">
                      {capability.index}
                    </span>
                    <div>
                      <h3 className="text-title">{capability.title}</h3>
                      <p className="text-body text-paper/65 mt-2 max-w-measure">
                        {capability.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* The honest half. Reads better than a seventh capability, and it
                  ends the conversations that were never going to work. */}
              <div className="mt-16 lg:mt-20 pt-8 border-t border-line-invert">
                <p className="text-manifest text-timber rise">And what we don&apos;t do</p>
                <ul data-reveal-group className="grid lg:grid-cols-2 gap-x-16 mt-6">
                  {notOurWork.map((item) => (
                    <li key={item} className="text-body text-paper/65 py-3 max-w-measure rise">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Export */}
          <section className="py-20 lg:py-32">
            <div className="shell">
              <SectionHead
                title={
                  <>
                    Export &amp; <span className="italic">logistics</span>
                  </>
                }
              />

              <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-12 lg:mt-16">
                <div className="lg:col-span-6">
                  <p className="text-manifest-sm text-muted rise">
                    Active destinations · {exportMarkets.length} markets
                  </p>
                  <ul data-reveal-group className="mt-4">
                    {exportMarkets.map((market, i) => (
                      <li
                        key={market}
                        className="flex items-baseline gap-5 py-3.5 border-t border-line rise"
                      >
                        <span className="text-manifest-sm text-muted numeral">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-body text-ink">{market}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-5 lg:col-start-8">
                  <p className="text-manifest-sm text-muted rise">Terms and paperwork</p>
                  <SpecList className="mt-4 rise" rows={logistics} />
                  <p className="text-body text-muted mt-6 max-w-measure rise">
                    Lead times we quote are lead times we hold. If a date cannot be met it is not
                    offered. A slipped shipment costs a buyer more than a longer honest one.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Certification, in brief here. The full chain of custody is on Craft,
              where sourcing actually happens. */}
          <section className="pb-20 lg:pb-32">
            <div className="shell">
              <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 pt-8 border-t border-line">
                <div className="lg:col-span-5">
                  <h2 className="font-serif text-display-sm font-light rise">
                    FSC <span className="italic">certified</span>
                  </h2>
                  <p className="text-body text-muted mt-5 max-w-measure rise">
                    We hold chain-of-custody certification and keep certified stock tagged
                    separately in the yard. Ask at the quote stage rather than the shipping stage:
                    it is a sourcing decision, and sourcing happens in week one.
                  </p>
                  <Link href="/craft#fsc" className="btn btn-ghost mt-8 rise">
                    How the claim is kept intact
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
                <div className="lg:col-span-6 lg:col-start-7 rise">
                  <FscPanel variant="brief" placement="factory-certification" />
                </div>
              </div>
            </div>
          </section>

          {/* Close */}
          <section className="pb-20 lg:pb-28">
            <div className="shell">
              <div className="rule pt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 rise">
                <p className="text-lead text-ink-soft max-w-measure">
                  Visits are welcome, and so are awkward questions. Boranada is eight hours by road
                  from Mundra and forty minutes from Jodhpur airport.
                </p>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <Link href="/craft" className="btn btn-ghost">
                    How it is made
                  </Link>
                  <Link href="/contact" className="btn btn-solid">
                    Talk to the factory
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
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
