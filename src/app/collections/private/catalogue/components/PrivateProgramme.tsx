'use client';

import React from 'react';
import Link from 'next/link';
import FscPanel from '@/components/ui/FscPanel';
import SpecList from '@/components/ui/SpecList';
import { brand, certification, packingNote } from '@/lib/site';

const PRIVATE_LABEL = [
  {
    index: '01',
    title: 'Your specification',
    detail:
      'Send drawings, a photograph, or one of our references with the changes marked. The drawing floor returns a dimensioned sheet before anything is cut.',
  },
  {
    index: '02',
    title: 'Your finish',
    detail:
      'Any finish in the house range, or matched to a physical sample you post us. Colour is signed off against a retained sample, not a code, because two batches of timber take the same stain differently.',
  },
  {
    index: '03',
    title: 'Your label',
    detail:
      'Woven or printed labels, branded cartons, your own barcodes and carton markings, your packing list format. Nothing in or on the carton has to carry our name.',
  },
  {
    index: '04',
    title: 'One approval sample',
    detail:
      'Made, photographed and shipped before the production floor commits. It is retained here for the life of the programme so a reorder in two years matches the first run.',
  },
] as const;

const DOCUMENTS = [
  { key: 'Commercial invoice', value: 'Your format or ours' },
  { key: 'Packing list', value: 'Per carton, with CBM and weights' },
  { key: 'Bill of lading', value: 'Issued against loaded quantities' },
  { key: 'Certificate of origin', value: 'Chamber-attested' },
  { key: 'Fumigation certificate', value: 'ISPM 15 where required' },
  { key: 'FSC claim', value: 'On invoice and packing list, on request' },
] as const;

/**
 * What a verified buyer gets that a visitor does not: the programme, the
 * paperwork, and a named route in. Sits below the range because it is what you
 * read once you have found something you want made.
 */
export default function PrivateProgramme() {
  return (
    <>
      {/* Private label */}
      <section className="mt-20 lg:mt-28 py-20 lg:py-28 bg-paper-deep">
        <div className="shell">
          <header className="rule-label rise" style={{ borderColor: 'var(--line-strong)' }}>
            <div className="flex-1">
              <h2 className="font-serif text-display font-light -mt-2">
                Private <span className="italic">label</span>
              </h2>
            </div>
          </header>

          <p className="text-lead text-ink-soft max-w-measure mt-8 rise">
            Roughly half of what leaves this factory ships under someone else&apos;s name. The
            programme is not a service bolted on: it is how most of the floor already works.
          </p>

          <ol data-reveal-group className="grid lg:grid-cols-2 gap-x-16 mt-12">
            {PRIVATE_LABEL.map((step) => (
              <li key={step.index} className="flex gap-5 py-6 border-t border-line-strong rise">
                <span className="text-manifest-sm text-clay numeral shrink-0 pt-1.5">
                  {step.index}
                </span>
                <div>
                  <h3 className="text-title">{step.title}</h3>
                  <p className="text-body text-muted mt-2 max-w-measure">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Certification and paperwork — the two things a buying team asks for
          before it asks about price. */}
      <section className="py-20 lg:py-28 bg-teal text-paper grain">
        <div className="shell relative z-10">
          <header className="rule-label rise" style={{ borderColor: 'var(--line-invert)' }}>
            <div className="flex-1">
              <h2 className="font-serif text-display font-light -mt-2">
                Certification &amp; <span className="italic text-timber">paperwork</span>
              </h2>
            </div>
          </header>

          <div className="mt-12 lg:mt-16">
            <FscPanel invert />
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-16 lg:mt-20 pt-10 border-t border-line-invert">
            <div className="lg:col-span-5">
              <h3 className="font-serif text-display-sm font-light rise">
                What ships with the <span className="italic text-timber">container</span>
              </h3>
              <p className="text-body text-paper/70 mt-5 max-w-measure rise">
                Documents are issued against what was actually loaded rather than what was ordered.
                If a quantity changed on the packing line, the paperwork changes with it.
              </p>
              {certification.fsc.code && (
                <p className="text-manifest-sm text-timber numeral mt-6 rise">
                  FSC {certification.fsc.code}
                </p>
              )}
            </div>

            <div className="lg:col-span-6 lg:col-start-7 rise">
              <SpecList rows={DOCUMENTS} invert />
              <p className="text-manifest-sm text-paper/45 mt-6 leading-relaxed">{packingNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Direct line */}
      <section className="py-20 lg:py-28">
        <div className="shell">
          <div className="rule pt-8 grid lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-6">
              <h2 className="font-serif text-display-sm font-light rise">
                Not shown here? We produce to <span className="italic">specification</span>.
              </h2>
              <p className="text-body text-muted mt-5 max-w-measure rise">
                The catalogue is what we have photographed, not the limit of what we make. Send a
                drawing, a reference photograph or a sketch on a napkin. All three have started
                programmes here.
              </p>
              <div className="flex flex-wrap gap-3 mt-8 rise">
                <a href={`mailto:${brand.email}`} className="btn btn-solid">
                  Email the factory
                </a>
                <Link href="/contact" className="btn btn-ghost">
                  Send a full brief
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 lg:col-start-8 rise">
              <SpecList
                rows={[
                  { key: 'Direct line', value: brand.phone },
                  { key: 'Email', value: brand.email },
                  { key: 'Hours', value: 'Mon–Sat, 09:30–18:30 IST' },
                  { key: 'Works', value: brand.address.line2 },
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
