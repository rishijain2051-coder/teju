import React from 'react';
import FscMark from '@/components/ui/FscMark';
import { certification } from '@/lib/works';

const { fsc } = certification;

interface FscPanelProps {
  /** `full` carries the claims and the custody chain; `brief` is a single card. */
  variant?: 'full' | 'brief';
  invert?: boolean;
  /**
   * Whether to show the licensed panel artwork. On where certification is
   * actually explained; off where the block is only a pointer to it, so the mark
   * stays meaningful rather than becoming wallpaper on every page.
   */
  mark?: boolean;
}

/**
 * The FSC block.
 *
 * No FSC logo artwork here on purpose. FSC's trademark rules only permit the
 * marks alongside the holder's own licence code, so the certificate number in
 * `certification.fsc.code` gates the whole identity line: fill it in and the
 * code prints wherever a claim appears, leave it empty and the site states the
 * certification in words and prints nothing it cannot substantiate.
 */
export default function FscPanel({
  variant = 'full',
  invert = false,
  mark = true,
}: FscPanelProps) {
  const line = invert ? 'border-line-invert' : 'border-line';
  const lead = invert ? 'text-paper/70' : 'text-muted';
  const accent = invert ? 'text-timber' : 'text-clay';
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
            FSC-certified stock is available across the mango and reclaimed ranges when your
            market needs the paperwork. The claim and our certificate code travel on the
            invoice and the packing list.
          </p>
          {fsc.code && (
            <p className={`text-manifest-sm ${lead} numeral mt-4`}>{fsc.code}</p>
          )}
        </div>

        {mark && <FscMark variant="panel" height={200} ground={invert ? 'dark' : 'light'} />}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
      {/* The position */}
      <div className="lg:col-span-5">
        <p className={`text-manifest ${accent} rise`}>Chain of custody</p>
        <h3 className="font-serif text-display-sm font-light mt-5 rise">
          Certified <span className="italic">on request</span>, not by default.
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
            <dd className={`text-body ${invert ? 'text-paper' : 'text-ink'} text-right max-w-[22ch]`}>
              {fsc.scope}
            </dd>
          </div>
          <div className={`flex items-baseline justify-between gap-6 py-4 border-t ${line}`}>
            <dt className={`text-manifest-sm ${lead}`}>Licensed by</dt>
            <dd className={`text-body text-right max-w-[22ch] ${invert ? 'text-paper' : 'text-ink'}`}>
              {fsc.licensor}
            </dd>
          </div>
          <div className={`flex items-baseline justify-between gap-6 py-4 border-y ${line}`}>
            <dt className={`text-manifest-sm ${lead}`}>Licence code</dt>
            <dd className={`text-body numeral text-right ${fsc.code ? (invert ? 'text-paper' : 'text-ink') : lead}`}>
              {/* Never invented: an FSC claim without the holder's own code is
                  one the buyer cannot verify. */}
              {fsc.code || 'On the certificate, quoted with each claim'}
            </dd>
          </div>
        </dl>

        {/* The licensed panel itself, unaltered. Its strapline — "Ask for our
            FSC-certified materials" — is FSC's own wording and happens to say
            exactly what the heading above it says. */}
        {mark && (
          <FscMark
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
