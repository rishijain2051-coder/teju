import React from 'react';
import FscMark from '@/components/ui/FscMark';
import { certification, type FscPlacement } from '@/lib/works';

const { fsc } = certification;

interface FscPanelProps {
  /** `full` carries the claims and the custody chain; `brief` is a single card. */
  variant?: 'full' | 'brief';
  invert?: boolean;
  /**
   * The registered placement this panel's artwork occupies, or omitted to render
   * the copy without the mark.
   *
   * A boolean used to sit here, which made it far too easy to switch the artwork
   * on inside a route template and quietly turn one placement into twenty. An id
   * from the registry cannot be reused for a second page, so the budget stays
   * honest.
   */
  placement?: FscPlacement;
}

/**
 * The FSC block: the position, the three claims, the custody chain, and — on a
 * registered placement — the licensed artwork.
 *
 * The licence code gates the identity line. FSC only permits the marks alongside
 * the holder's own code, so an empty `certification.fsc.code` makes the panel
 * state the certification in words and print nothing it cannot substantiate.
 */
export default function FscPanel({ variant = 'full', invert = false, placement }: FscPanelProps) {
  const line = invert ? 'border-line-invert' : 'border-line';
  const lead = invert ? 'text-paper/70' : 'text-muted';
  /*
   * `sand`, not `timber`. The accent lands on `text-manifest` — 13px — and this
   * panel cannot see the ground it was dropped onto: `invert` is mounted on teal
   * today and on ink elsewhere. timber reads 3.51 on teal, which fails AA below
   * 24px, while sand clears it on both (5.58 on teal, 9.56 on ink). A component
   * that does not know its background has to pick the colour that is safe on
   * either one.
   */
  const accent = invert ? 'text-sand' : 'text-clay';
  const body = invert ? 'text-paper/75' : 'text-ink-soft';

  if (variant === 'brief') {
    return (
      <div
        className={`border ${
          invert ? 'border-line-invert' : 'border-line-strong'
        } p-6 lg:p-8 flex flex-wrap items-start gap-x-8 gap-y-6`}
      >
        <div className="flex-1 min-w-[16rem]">
          <p className={`text-manifest ${accent}`}>Certified timber</p>
          <p className={`text-body ${body} mt-3 max-w-measure`}>
            FSC-certified stock is available across the mango and reclaimed ranges when your market
            needs the paperwork. The claim and our certificate code travel on the invoice and the
            packing list.
          </p>
          {fsc.code && <p className={`text-manifest-sm ${lead} numeral mt-4`}>{fsc.code}</p>}
        </div>

        {placement && (
          <FscMark
            placement={placement}
            variant="panel"
            height={200}
            ground={invert ? 'dark' : 'light'}
          />
        )}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
      {/* The position */}
      <div className="lg:col-span-5">
        <p className={`text-manifest ${accent} rise`}>Chain of custody</p>
        {/*
         * `text-title`, not `text-display-sm`. Section headings are display-sm,
         * so an h3 set there tied with its own parent h2 — and on the craft page
         * it sat at 68px among twelve sibling h3s at 28px, reading as a section
         * of its own until you looked for one.
         *
         * The emphasis moves from italic to the accent colour with it. There is
         * no DM Sans italic face on this site (only Fraunces has one, see
         * `fonts.css`), so an italic span here would be a browser-synthesised
         * oblique sitting a few centimetres from real Fraunces italics.
         */}
        <h3 className="text-title mt-5 rise">
          Certified <span className={accent}>on request</span>, not by default.
        </h3>
        <p className={`text-body ${body} mt-6 max-w-measure rise`}>{fsc.position}</p>

        <dl className="mt-10 rise">
          <div className={`flex items-baseline justify-between gap-6 py-4 border-t ${line}`}>
            <dt className={`text-manifest-sm ${lead}`}>Certificate holder</dt>
            <dd className={`text-body ${invert ? 'text-paper' : 'text-ink'} text-right`}>
              {fsc.holder}
            </dd>
          </div>
          <div className={`flex items-baseline justify-between gap-6 py-4 border-t ${line}`}>
            <dt className={`text-manifest-sm ${lead}`}>Scope</dt>
            <dd
              className={`text-body ${invert ? 'text-paper' : 'text-ink'} text-right max-w-[22ch]`}
            >
              {fsc.scope}
            </dd>
          </div>
          <div className={`flex items-baseline justify-between gap-6 py-4 border-t ${line}`}>
            <dt className={`text-manifest-sm ${lead}`}>Licensed by</dt>
            <dd
              className={`text-body text-right max-w-[22ch] ${invert ? 'text-paper' : 'text-ink'}`}
            >
              {fsc.licensor}
            </dd>
          </div>
          <div className={`flex items-baseline justify-between gap-6 py-4 border-y ${line}`}>
            <dt className={`text-manifest-sm ${lead}`}>Licence code</dt>
            <dd
              className={`text-body numeral text-right ${fsc.code ? (invert ? 'text-paper' : 'text-ink') : lead}`}
            >
              {/* Never invented: an FSC claim without the holder's own code is
                  one the buyer cannot verify. */}
              {fsc.code || 'On the certificate, quoted with each claim'}
            </dd>
          </div>
        </dl>

        {/* The licensed panel itself, unaltered. Its strapline — "Ask for our
            FSC-certified materials" — is FSC's own wording and happens to say
            exactly what the heading above it says. */}
        {placement && (
          <FscMark
            placement={placement}
            variant="panel"
            height={230}
            ground={invert ? 'dark' : 'light'}
            className="mt-10 rise"
          />
        )}
      </div>

      {/* Claims, then the floor process */}
      <div className="lg:col-span-6 lg:col-start-7">
        <p className={`text-manifest-sm ${lead} rise`}>Three claims, not one</p>
        <ul data-reveal-group className="mt-5">
          {fsc.claims.map((entry) => (
            <li key={entry.claim} className={`py-5 border-t ${line} rise`}>
              <p className={`text-manifest ${invert ? 'text-paper' : 'text-ink'}`}>{entry.claim}</p>
              <p className={`text-body ${body} mt-2 max-w-measure`}>{entry.detail}</p>
            </li>
          ))}
        </ul>

        <p className={`text-manifest-sm ${lead} mt-12 rise`}>How the claim is kept intact</p>
        <ol data-reveal-group className="mt-5">
          {fsc.custody.map((step) => (
            <li key={step.index} className={`flex gap-5 py-4 border-t ${line} rise`}>
              <span className={`text-manifest-sm numeral shrink-0 ${accent}`}>{step.index}</span>
              <span className={`text-body ${body}`}>{step.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
