import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import SectionHead from '@/components/ui/SectionHead';
import AppImage from '@/components/ui/AppImage';
import FscPanel from '@/components/ui/FscPanel';
import { craftStages, img } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Craft',
  description:
    'How a piece is made at Boranada: timber selection and seasoning, joinery, hand carving, parquet and tile work, finishing, and inspection before the carton.',
};

const META = [
  { key: 'Stages', value: 'Eight, one roof' },
  { key: 'Moisture', value: '8–10% at the joint' },
  { key: 'Carcass', value: 'Framed, not slab-built' },
  { key: 'Subcontracted', value: 'None of it' },
] as const;

const MATERIALS = [
  {
    name: 'Solid mango',
    detail:
      'Plantation timber from orchard trees past fruiting, 640–700 kg/m³. Hard enough to hold a carved edge, even enough to take a stain without blotching.',
  },
  {
    name: 'Reclaimed hardwood',
    detail:
      'Recovered stock, sorted by tone before it is laid. Every strip is a different age, which is why no two chevron fronts match exactly.',
  },
  {
    name: 'Iron',
    detail:
      'Frames and bases cut and welded in-house, then powder-coated. Welded rather than bolted, so a frame arrives as square as it left.',
  },
  {
    name: 'Ceramic & stone',
    detail:
      'Tiles painted and fired in Jodhpur, set into a rebate to finish flush. Stone tops arrive as slabs and are cut to size here.',
  },
] as const;

export default function CraftPage() {
  const opening = img('craft-barn-door');

  return (
    <>
      <Header />
      <main id="main">
        <PageHeader
          eyebrow="The making"
          title="Eight stages, one roof."
          lead="Nothing here is subcontracted. A board is graded in our own yard, cut on our own saws, framed, carved, finished and packed by people on our own payroll, which is the only reliable way to promise a buyer that the third container matches the first."
          meta={META}
        />

        <Reveal>
          {/* Opening plate, full width. The craft page earns one big image. */}
          <section className="shell">
            <div className="plate aspect-[16/9] lg:aspect-[21/9] rise">
              <AppImage
                src={opening.src}
                alt={opening.alt}
                fill
                sizes="100vw"
                placeholder="blur"
                blurDataURL={opening.blurDataURL}
                priority
                className="object-cover"
              />
            </div>
            <p className="text-note text-muted mt-4 rise">
              Sliding barn-door cabinet, iron track fitted at the frame bench · Boranada
            </p>
          </section>

          {/* The stages. Alternating plates rather than a plate on each: eight
              images in a column reads as a gallery, and the copy is the point. */}
          <section className="py-20 lg:py-32">
            <div className="shell">
              <SectionHead
                title={
                  <>
                    From board to <span className="italic">carton</span>
                  </>
                }
              />

              <ol data-reveal-group className="mt-12 lg:mt-16">
                {craftStages.map((stage) => {
                  const plate = stage.image ? img(stage.image) : null;
                  return (
                    <li
                      key={stage.index}
                      className="grid lg:grid-cols-12 gap-6 lg:gap-16 py-10 lg:py-14 border-t border-line rise"
                    >
                      <div className="lg:col-span-3 flex items-baseline gap-5">
                        <span className="text-manifest-sm text-clay numeral">{stage.index}</span>
                        <div>
                          <h3 className="text-title">{stage.title}</h3>
                          <p className="text-manifest-sm text-muted mt-1.5">{stage.place}</p>
                        </div>
                      </div>

                      <div className={plate ? 'lg:col-span-5' : 'lg:col-span-8'}>
                        <p className="text-lead text-ink-soft max-w-measure">{stage.detail}</p>
                      </div>

                      {plate && (
                        <div className="lg:col-span-4">
                          <div className="plate aspect-[4/3]">
                            <AppImage
                              src={plate.src}
                              alt={plate.alt}
                              fill
                              sizes="(max-width: 1024px) 100vw, 30vw"
                              placeholder="blur"
                              blurDataURL={plate.blurDataURL}
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* Materials */}
          <section className="py-20 lg:py-32 bg-paper-deep">
            <div className="shell">
              <SectionHead
                title={
                  <>
                    What we <span className="italic">build with</span>
                  </>
                }
              />

              <div data-reveal-group className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-12 lg:mt-16">
                {MATERIALS.map((material) => (
                  <div key={material.name} className="py-6 border-t border-line-strong rise">
                    <h3 className="text-title">{material.name}</h3>
                    <p className="text-body text-muted mt-2.5 max-w-measure">{material.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Certification. It belongs here rather than on a page of its own:
              chain of custody is a sourcing decision, and sourcing is stage one. */}
          <section id="fsc" className="relative py-20 lg:py-32 bg-teal text-paper grain">
            <div className="shell relative z-10">
              <SectionHead
                invert
                title={
                  <>
                    Certified <span className="italic text-timber">timber</span>
                  </>
                }
              />
              <div className="mt-12 lg:mt-16">
                <FscPanel invert placement="craft-chain-of-custody" />
              </div>
            </div>
          </section>

          {/* Close */}
          <section className="py-20 lg:py-28">
            <div className="shell">
              <div className="rule pt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 rise">
                <p className="text-lead text-ink-soft max-w-measure">
                  The work is easier to judge than to describe. Look at the range, or send us a
                  specification and we will quote it honestly.
                </p>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <Link href="/collections" className="btn btn-ghost">
                    See the collections
                  </Link>
                  <Link href="/factory" className="btn btn-solid">
                    Inside the factory
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
