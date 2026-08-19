'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cartonFor, packingNote, type Piece } from '@/lib/site';
import { submitEnquiry, whatsappUrl, type EnquiryField } from '@/lib/enquiry';

/** Practically loadable volume, matching the figures `cartonFor` assumes. */
const LOADABLE = { twenty: 28, fortyHigh: 67 };

interface ContainerPlanProps {
  pieces: Piece[];
  quantities: Record<string, number>;
  onClear: () => void;
}

type SendState = 'idle' | 'sending' | 'sent' | 'error';

/**
 * The container planner — the thing the public catalogue has no equivalent of.
 *
 * A buyer's real question is not "what does this piece measure" but "what fits
 * in one container", and answering it used to mean an email and a two-day wait.
 * Volumes are computed from the same `cartonFor` the dossiers use, so the total
 * here can never disagree with the rows above it.
 */
export default function ContainerPlan({ pieces, quantities, onClear }: ContainerPlanProps) {
  const [state, setState] = useState<SendState>('idle');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selection = useMemo(() => {
    const rows = pieces
      .filter((piece) => (quantities[piece.ref] ?? 0) > 0)
      .map((piece) => {
        const qty = quantities[piece.ref];
        const carton = cartonFor(piece);
        return { piece, qty, cbm: carton ? carton.cbm * qty : 0, carton };
      });

    const units = rows.reduce((sum, row) => sum + row.qty, 0);
    const cbm = rows.reduce((sum, row) => sum + row.cbm, 0);

    return { rows, units, cbm };
  }, [pieces, quantities]);

  /* One frame at the undocked transform before the docked one is applied, so the
     transition has a before-change state to run from. Without this the bar is
     already at translateY(0) on its first painted frame and the rise is skipped —
     the same trap the mobile overlay fell into (see plans/013). */
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDocked(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* Not `return null` on an empty selection: that unmounted the bar on the empty
     keystroke of an ordinary edit and replayed its entrance on the next one. The
     bar stays mounted and reads zeros; `onClear` is the way to dismiss it. */
  const engaged = Object.keys(quantities).length > 0;
  if (!engaged) return null;

  const cbm = Math.round(selection.cbm * 100) / 100;
  const twenty = cbm / LOADABLE.twenty;
  const forty = cbm / LOADABLE.fortyHigh;

  const fields = (): EnquiryField[] => [
    { label: 'Selection', value: `${selection.rows.length} designs, ${selection.units} pieces` },
    { label: 'Indicative volume', value: `${cbm.toFixed(2)} CBM` },
    {
      label: 'Container',
      value: `${twenty.toFixed(2)} × 20 ft, or ${forty.toFixed(2)} × 40 ft HQ`,
    },
    ...selection.rows.map((row) => ({
      label: row.piece.ref,
      value: `${row.qty} × ${row.piece.name} (${row.piece.collection}) · ${row.cbm.toFixed(2)} CBM`,
    })),
    { label: 'Email', value: email },
  ];

  const handleSend = async () => {
    setState('sending');
    setErrorMsg('');

    const result = await submitEnquiry(
      `Private catalogue container plan · ${selection.units} pieces`,
      fields(),
      { email }
    );

    if (result.ok) {
      setState('sent');
      return;
    }
    setState('error');
    setErrorMsg(result.error ?? 'Something went wrong.');
  };

  /** A working document rather than a download for its own sake: this is the
   *  file a buyer pastes into their own purchase order. */
  const exportCsv = () => {
    const header = [
      'Reference',
      'Design',
      'Collection',
      'Material',
      'Finish',
      'Finished size (cm)',
      'Outer carton (cm)',
      'CBM per piece',
      'Quantity',
      'Total CBM',
    ];

    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const rows = selection.rows.map((row) =>
      [
        row.piece.ref,
        row.piece.name,
        row.piece.collection,
        row.piece.material,
        row.piece.finish,
        row.piece.dimensions,
        row.carton?.dims ?? '',
        row.carton ? row.carton.cbm.toFixed(2) : '',
        String(row.qty),
        row.cbm.toFixed(2),
      ]
        .map(escape)
        .join(',')
    );

    const totals = ['', '', '', '', '', '', '', '', String(selection.units), cbm.toFixed(2)]
      .map(escape)
      .join(',');

    const csv = [header.map(escape).join(','), ...rows, totals].join('\r\n');

    /* Leading BOM, written as an escape rather than a literal: Excel needs it to
       read the file as UTF-8 (without it, "×" and "—" arrive as mojibake), and as
       an invisible character in source it was one stray editor save away from
       vanishing silently. */
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vardhman-impex-selection.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside
      aria-label="Container plan"
      data-docked={docked ? '' : undefined}
      /*
       * `translateY(100%)` -> `0`, not `.filter-swap`. This bar is flush with the
       * bottom of the viewport, so it should arrive from the edge it docks to
       * rather than drift up 8px from a position it is already fully visible in.
       * A transition, not a keyframe: the bar's visibility is reversible, and a
       * keyframe restarts from zero every time it is retriggered.
       */
      className="sticky bottom-0 z-30 bg-ink text-paper border-t border-line-invert translate-y-full data-[docked]:translate-y-0 transition-transform duration-base ease-out"
    >
      {/* Capped and scrollable: stacked on a phone this bar is tall enough to
          swallow the screen it is meant to summarise. */}
      <div className="shell py-5 max-h-[60vh] overflow-y-auto">
        {state === 'sent' ? (
          /* `filter-swap` on this panel rather than relying on the one on the <aside>:
             that animation ran when the bar first docked and cannot replay, because
             React never re-inserts the aside. Without it the planner's whole interior
             is replaced in a single frame, in a bar pinned to the bottom of the
             viewport — the deepest conversion on the site reading as a glitch. */
          <div className="flex flex-wrap items-center justify-between gap-4 filter-swap">
            <div>
              <p className="text-manifest text-timber">Plan sent</p>
              <p className="text-body text-paper/70 mt-1">
                {selection.rows.length} designs, {selection.units} pieces,{' '}
                <span className="numeral">{cbm.toFixed(2)} CBM</span>. We reply within two working
                days with a quotation and a loading plan.
              </p>
            </div>
            <button type="button" onClick={onClear} className="btn btn-invert shrink-0">
              Start a new plan
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-x-8 gap-y-5 items-end">
            {/* Running totals */}
            <dl className="lg:col-span-5 grid grid-cols-3 gap-x-6">
              <div>
                <dt className="text-manifest-sm text-paper/55">Designs</dt>
                <dd className="text-[1.75rem] leading-none font-normal tracking-tight numeral mt-1.5">
                  {selection.rows.length}
                </dd>
              </div>
              <div>
                <dt className="text-manifest-sm text-paper/55">Pieces</dt>
                <dd className="text-[1.75rem] leading-none font-normal tracking-tight numeral mt-1.5">
                  {selection.units}
                </dd>
              </div>
              <div>
                <dt className="text-manifest-sm text-paper/55">Volume</dt>
                <dd className="text-[1.75rem] leading-none font-normal tracking-tight numeral mt-1.5">
                  {cbm.toFixed(2)}
                  <span className="text-manifest-sm text-timber ml-1.5">CBM</span>
                </dd>
              </div>
            </dl>

            {/* Container fill, as a bar rather than a sentence. */}
            <div className="lg:col-span-3">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-manifest-sm text-paper/55">40 ft high-cube</p>
                <p className="text-manifest-sm text-paper numeral">
                  {Math.round(Math.min(forty, 1) * 100)}%
                  {forty > 1 && (
                    /* Fades in rather than appearing: this is the answer to the
                       question the panel exists to ask, and it used to arrive as a
                       text fragment with no acknowledgement at all. */
                    <span className="text-timber filter-swap"> · ×{forty.toFixed(2)}</span>
                  )}
                </p>
              </div>
              {/* scaleX, not width: width animates layout, transform composites.
                  The fill also changes colour once the plan passes one container:
                  `Math.min` pins the transform at 1 from that point on, so colour is
                  the only channel left to carry the one state change a buyer is
                  actually watching for. Clay-soft rather than clay — this is a filled
                  bar on the ink ground, where `--clay` is too dark to read and
                  `--clay-soft` is documented as decorative-only, which is exactly what
                  a bar fill is. */}
              <div className="h-1.5 bg-paper/15 mt-2.5 overflow-hidden">
                <div
                  className={`h-full origin-left transition-[transform,background-color] duration-fast ease-out ${
                    forty > 1 ? 'bg-clay-soft' : 'bg-timber'
                  }`}
                  style={{ transform: `scaleX(${Math.min(forty, 1)})` }}
                />
              </div>
              <p className="text-manifest-sm text-paper/55 mt-2 numeral">
                {twenty.toFixed(2)} × 20 ft equivalent
              </p>
            </div>

            {/* Actions. Wrapping freely left "Clear" stranded on a line of its
                own beneath CSV on a phone, so below `sm` the send button takes the
                full width and the two secondary controls share the row under it. */}
            <div className="lg:col-span-4 flex flex-wrap items-end gap-3">
              <label className="w-full sm:flex-1 sm:min-w-[12rem]">
                <span className="block text-manifest-sm text-paper/55 mb-1">Your email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-transparent border-b border-line-invert py-2 text-body text-paper placeholder:text-paper/55 focus:border-timber focus:outline-none transition-colors duration-fast ease-out"
                />
              </label>
              <button
                type="button"
                onClick={handleSend}
                disabled={state === 'sending' || !email.includes('@')}
                className="btn btn-invert justify-center flex-1 sm:flex-none disabled:opacity-50"
              >
                {state === 'sending' ? 'Sending…' : 'Send this plan'}
              </button>
              <button type="button" onClick={exportCsv} className="btn btn-invert justify-center">
                CSV
              </button>
              <button
                type="button"
                onClick={onClear}
                className="text-manifest-sm text-paper/50 hover:text-paper transition-colors duration-fast ease-out px-2 py-3 tap"
              >
                Clear
              </button>
            </div>

            <div className="lg:col-span-12">
              {state === 'error' && (
                <p role="alert" className="text-body text-timber mb-2">
                  {errorMsg}{' '}
                  <a
                    href={whatsappUrl(
                      `Private catalogue container plan · ${selection.units} pieces`,
                      fields()
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw press"
                  >
                    Send it on WhatsApp instead
                  </a>
                  .
                </p>
              )}
              <p className="text-note text-paper/55">Indicative. {packingNote}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
