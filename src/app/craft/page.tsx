import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Arrow from '@/components/ui/Arrow';
import PageHeader from '@/components/ui/PageHeader';
import Reveal from '@/components/ui/Reveal';
import SectionHead from '@/components/ui/SectionHead';
import AppImage from '@/components/ui/AppImage';
import FscPanel from '@/components/ui/FscPanel';
import { craftStages, img } from '@/lib/site';

/*
 * The title carries the question a buyer actually types. "Craft" alone competed
 * with every furniture brand's craft page and told a search result nothing about
 * what is on this one; the description is built from the four claims here that a
 * sourcing team can verify on a visit — moisture at the joint, framed carcass, a
 * retained finish sample, and nothing leaving the building to a subcontractor.
 */
export const metadata: Metadata = {
  /* Self-referencing canonical — see src/app/page.tsx. */
  alternates: { canonical: '/craft' },
  title: 'Craft · How a Piece Is Made, Stage by Stage',
  description:
    'Eight stages, one roof, nothing subcontracted: timber to 8–10% moisture before it meets a joint, framed carcasses, finishes matched to a retained sample.',
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
  /*
   * Plated rows alternate sides so the eye travels down the column instead of
   * tracking one straight edge. The counter runs over plated stages only —
   * counting over all eight would land 04 and 06 on the same side, because 05
   * falls between them and the parity would not advance.
   */
  let plated = 0;
  const stages = craftStages.map((stage) => {
    const plate = stage.image ? img(stage.image) : null;
    return { ...stage, plate, flip: plate ? plated++ % 2 === 1 : false };
  });

  return (
    <>
      <Header />
      <main id="main">
        <PageHeader
          eyebrow="The making"
          title="Eight stages, one roof."
          /* Three sentences, not two. The claim used to arrive as one 38-word
             sentence with its payoff buried in a trailing relative clause; the
             promise a buyer is actually being made deserves its own full stop. */
          lead="Nothing here is subcontracted. A board is graded in our own yard, cut on our own saws, framed, carved, finished and packed by people on our own payroll. That is the only reliable way to promise a buyer that the third container matches the first."
          meta={META}
        />

        <Reveal>
          {/* The stages. Five of the eight carry a plate — the ones where a
              finished piece is evidence for the claim. See `craftStages`: the
              other three would need photographs of the floor that do not exist
              yet, and a room set standing in for a kiln is worse than none. */}
          <section className="py-20 lg:py-32">
            <div className="shell">
              <SectionHead
                title={
                  <>
                    From board to <span className="italic">carton</span>
                  </>
                }
              />

              {/* The whole sequence up front. It reads as a contents line and it
                  earns its place twice: a buyer sees all eight stages before
                  committing to the scroll, and sales can link one stage from an
                  email. Thirteen screens of page on a phone needs a way in. */}
              <nav aria-label="The eight stages" className="mt-8 lg:mt-10 rise">
                <ul className="flex flex-wrap gap-x-7 gap-y-0.5">
                  {stages.map((stage) => (
                    <li key={stage.index}>
                      <a
                        href={`#stage-${stage.index}`}
                        className="press inline-flex items-baseline gap-2 py-2 text-manifest text-muted hover:text-clay transition-colors duration-fast ease-out"
                      >
                        <span className="numeral">{stage.index}</span>
                        {stage.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <ol data-reveal-group className="mt-10 lg:mt-14">
                {stages.map((stage) => (
                  <li
                    key={stage.index}
                    id={`stage-${stage.index}`}
                    /* `last:border-b` closes the list. Eight rows each opened by a
                       rule left the eighth with no bottom edge, so the sequence
                       ended by running out. `scroll-mt` clears the fixed masthead
                       when the contents line jumps here. */
                    className="grid lg:grid-cols-12 gap-6 lg:gap-16 py-10 lg:py-14 border-t border-line last:border-b rise scroll-mt-24 lg:scroll-mt-32"
                  >
                    <div className="lg:col-start-1 lg:col-span-3 flex items-baseline gap-5">
                      {/* `aria-hidden` because the ordered list already carries the
                          position — without it this reads "list item 4, 04
                          Joinery". */}
                      <span aria-hidden="true" className="text-index text-clay">
                        {stage.index}
                      </span>
                      <div>
                        <h3 className="text-title">{stage.title}</h3>
                        <p className="text-manifest-sm text-muted mt-1.5">{stage.place}</p>
                      </div>
                    </div>

                    {/*
                     * Five columns whether or not a plate follows. Letting the
                     * plateless rows spread to eight ran them at 88 characters a
                     * line against 47 in their neighbours — a 1.7x swing inside
                     * one list. The empty columns are the alternation.
                     */}
                    <div
                      className={`lg:row-start-1 ${
                        stage.flip ? 'lg:col-start-8 lg:col-span-5' : 'lg:col-start-4 lg:col-span-5'
                      }`}
                    >
                      <p className="text-lead text-ink-soft max-w-measure">{stage.detail}</p>
                    </div>

                    {stage.plate && (
                      /*
                       * `row-start-1` is load-bearing, not tidiness. Grid's sparse
                       * auto-placement increments the row cursor whenever a
                       * definite column-start sits left of where the cursor
                       * already is — so on a flipped row this plate, at column 4,
                       * dropped into an implicit second row behind text that had
                       * just ended at column 13. Rows 04 and 06 measured 588 and
                       * 623px against 348px siblings.
                       */
                      <div
                        className={`lg:row-start-1 ${
                          stage.flip
                            ? 'lg:col-start-4 lg:col-span-4'
                            : 'lg:col-start-9 lg:col-span-4'
                        }`}
                      >
                        {/* The sources' own ratio, so no plate is cropped. A 4:3
                            box took 22% off the width of every landscape file and
                            46% off the height of the two portrait ones — and what
                            it cropped from the carving shot was the carving. */}
                        <div className="plate aspect-[2000/1173]">
                          <AppImage
                            src={stage.plate.src}
                            alt={stage.plate.alt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 30vw"
                            placeholder="blur"
                            blurDataURL={stage.plate.blurDataURL}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </li>
                ))}
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

              {/*
               * `gap-y-10`, not `gap-y-2`. Each cell's rule is its own heading's
               * rule, and at 8px it sat 32px below the previous cell's last line
               * and 25px above its own title — near enough equidistant to belong
               * to neither. 40px makes that 64/25, and the rule reads as owned.
               */}
              <div
                data-reveal-group
                className="grid sm:grid-cols-2 gap-x-8 gap-y-10 mt-12 lg:mt-16"
              >
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
                {/*
                 * The two controls the paragraph above actually offers. The solid
                 * button used to point at /factory — which the paragraph does not
                 * promise, which the masthead nav already carries, and which left
                 * the one thing it does promise with no control at all. Nothing
                 * inside `<main>` linked to /contact on this page.
                 *
                 * `flex-col` below `sm` so both buttons fill the column. Wrapped
                 * at content width they stacked at 229 and 245px, ragged right.
                 */}
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Link href="/collections" className="btn btn-ghost justify-center">
                    See the collections
                  </Link>
                  <Link href="/contact" className="btn btn-solid justify-center">
                    Send a specification
                    <Arrow />
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
