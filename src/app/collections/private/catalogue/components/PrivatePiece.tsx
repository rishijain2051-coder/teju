'use client';

import React from 'react';
import AppImage from '@/components/ui/AppImage';
import { cartonFor, fscClaimFor, img, type Piece } from '@/lib/site';
import { whatsappUrl, type EnquiryField } from '@/lib/enquiry';

export type PieceState = 'sending' | 'sent' | 'error';

export const pieceFields = (piece: Piece): EnquiryField[] => [
  { label: 'Reference', value: piece.ref },
  { label: 'Piece', value: piece.name },
  { label: 'Collection', value: piece.collection },
  { label: 'Material', value: piece.material },
  { label: 'Finish', value: piece.finish },
  { label: 'Dimensions', value: piece.dimensions },
];

interface PrivatePieceProps {
  piece: Piece;
  view: 'gallery' | 'manifest';
  open: boolean;
  onToggle: () => void;
  state?: PieceState;
  onEnquire: () => void;
  quantity: number;
  onQuantity: (next: number) => void;
}

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.1 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9a11.4 11.4 0 0 1-4.5-4.3c-.9-1.6-.7-2.6-.5-3.1.2-.5.7-.9 1-1 .2 0 .4-.1.6 0 .2 0 .3 0 .5.4l.7 1.6c.1.2.1.4 0 .5l-.3.5-.3.3c-.1.1-.2.2 0 .5.2.3.6 1 1.3 1.6.8.7 1.4 1 1.7 1.1.2.1.4.1.5 0l.7-.8c.2-.2.3-.2.5-.1l1.5.8c.3.2.4.3.4.4.1.2 0 .7-.1 1.3Z" />
  </svg>
);

/** Trade quantity control. Deliberately not a number input: a spinner on a
 *  dense manifest row is unusable, and buyers type counts rather than nudge. */
function Quantity({
  value,
  onChange,
  pieceRef,
}: {
  value: number;
  onChange: (n: number) => void;
  /* Not named `ref`: React would claim it as an element ref rather than pass it
     through, and the accessible name would silently go missing. */
  pieceRef: string;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Quantity for {pieceRef}</span>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        value={value || ''}
        placeholder="0"
        onChange={(e) => {
          const next = Number(e.target.value.replace(/[^0-9]/g, ''));
          onChange(Number.isFinite(next) ? Math.min(next, 9999) : 0);
        }}
        className="w-16 bg-transparent border-b border-line-strong py-1.5 text-manifest-sm text-ink numeral text-center placeholder:text-muted/60 focus:border-clay focus:outline-none transition-colors duration-base"
      />
      <span className="text-manifest-sm text-muted">pcs</span>
    </label>
  );
}

function Dossier({ piece }: { piece: Piece }) {
  const carton = cartonFor(piece);
  const fsc = fscClaimFor(piece);

  const rows: { key: string; value: string }[] = [
    { key: 'Finished', value: piece.dimensions },
    ...(carton
      ? [
          { key: 'Outer carton', value: carton.dims },
          { key: 'Volume', value: `${carton.cbm.toFixed(2)} CBM` },
          { key: 'Per 20 ft', value: `${carton.per20} pcs` },
          { key: 'Per 40 ft HQ', value: `${carton.per40} pcs` },
        ]
      : []),
    { key: 'Minimum', value: 'From 2 pieces' },
    { key: 'Lead time', value: '45–60 days' },
    { key: 'Private label', value: 'Available' },
    { key: 'Custom finish', value: 'House range, or matched to your sample' },
    { key: fsc.claim, value: 'On request' },
  ];

  return (
    <div className="bg-paper-warm border border-line p-5 lg:p-6 filter-swap">
      <p className="text-manifest-sm text-clay">Trade dossier — {piece.ref}</p>

      <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-4">
        {rows.map((row) => (
          <div key={row.key} className="flex items-baseline justify-between gap-4 py-2 border-t border-line">
            <dt className="text-manifest-sm text-muted">{row.key}</dt>
            <dd className="text-manifest-sm text-ink numeral text-right">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-manifest-sm text-muted mt-4 max-w-measure leading-relaxed">
        {piece.note}
      </p>
    </div>
  );
}

/**
 * One design, in either of the private catalogue's two views.
 *
 * Both views share this component because the dossier, the enquiry state and the
 * quantity control have to behave identically in each — kept as two components
 * they drifted, and the manifest row lost the FSC line entirely.
 */
export default function PrivatePiece({
  piece,
  view,
  open,
  onToggle,
  state,
  onEnquire,
  quantity,
  onQuantity,
}: PrivatePieceProps) {
  const carton = cartonFor(piece);
  const dossierId = `dossier-${piece.slug}`;

  const enquiryLabel =
    state === 'sending'
      ? 'Sending…'
      : state === 'sent'
        ? 'Enquiry sent'
        : state === 'error'
          ? 'Failed — retry'
          : 'Enquire';

  if (view === 'manifest') {
    return (
      <>
        <tr className="border-t border-line align-top">
          <td className="py-3 pr-4 text-manifest-sm text-ink numeral whitespace-nowrap">
            {piece.ref}
            {piece.season && <span className="block text-clay mt-1">New</span>}
          </td>
          <td className="py-3 pr-4">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={dossierId}
              className="text-left font-serif text-[1.05rem] leading-snug text-ink hover:text-clay transition-colors duration-base"
            >
              {piece.name}
            </button>
          </td>
          <td className="py-3 pr-4 text-manifest-sm text-muted whitespace-nowrap">{piece.collection}</td>
          <td className="py-3 pr-4 text-manifest-sm text-ink-soft">{piece.material}</td>
          <td className="py-3 pr-4 text-manifest-sm text-ink-soft">{piece.finish}</td>
          <td className="py-3 pr-4 text-manifest-sm text-ink-soft numeral whitespace-nowrap">
            {piece.dimensions}
          </td>
          <td className="py-3 pr-4 text-manifest-sm text-ink numeral whitespace-nowrap">
            {carton ? carton.cbm.toFixed(2) : '—'}
          </td>
          <td className="py-3 pr-4 text-manifest-sm text-muted numeral whitespace-nowrap">
            {carton ? `${carton.per20} / ${carton.per40}` : '—'}
          </td>
          <td className="py-3 pr-4">
            <Quantity value={quantity} onChange={onQuantity} pieceRef={piece.ref} />
          </td>
          <td className="py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEnquire}
                disabled={state === 'sending'}
                className="text-manifest-sm text-clay hover:text-ink transition-colors duration-base disabled:opacity-60 whitespace-nowrap tap"
              >
                {enquiryLabel}
              </button>
              <a
                href={whatsappUrl(`Private catalogue enquiry — ${piece.name}`, pieceFields(piece))}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Message on WhatsApp about ${piece.name}`}
                className="text-muted hover:text-ink transition-colors duration-base tap"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </td>
        </tr>

        {open && (
          <tr>
            <td colSpan={10} id={dossierId} className="pb-6">
              <Dossier piece={piece} />
            </td>
          </tr>
        )}
      </>
    );
  }

  const plate = img(piece.image);

  return (
    <article className="group flex flex-col">
      <div className="plate aspect-[4/3] relative">
        <AppImage
          src={plate.src}
          alt={plate.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={plate.blurDataURL}
          className="object-cover"
        />
        {piece.season && (
          <span className="absolute top-0 left-0 bg-clay text-paper text-manifest-sm px-3 py-1.5">
            New — {piece.season}
          </span>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-line flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-title font-light">{piece.name}</h2>
          <span className="text-manifest-sm text-muted numeral shrink-0">{piece.ref}</span>
        </div>
        <p className="text-manifest-sm text-clay mt-2">{piece.collection}</p>

        <dl className="mt-3 space-y-1">
          {[
            ['Material', piece.material],
            ['Finish', piece.finish],
            ['Dimensions', piece.dimensions],
            ['Volume', carton ? `${carton.cbm.toFixed(2)} CBM · ${carton.per40}/40ft` : '—'],
          ].map(([key, value]) => (
            <div key={key} className="flex gap-3">
              <dt className="text-manifest-sm text-muted w-24 shrink-0">{key}</dt>
              <dd className="text-manifest-sm text-ink-soft numeral">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-line">
          <Quantity value={quantity} onChange={onQuantity} pieceRef={piece.ref} />
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={dossierId}
            className="text-manifest-sm text-muted hover:text-ink transition-colors duration-base tap"
          >
            {open ? 'Hide dossier' : 'Trade dossier'}
          </button>
        </div>

        {open && (
          <div id={dossierId} className="mt-4">
            <Dossier piece={piece} />
          </div>
        )}

        {/* Pushed to the bottom so buttons line up across a ragged row. */}
        <div className="flex gap-2 mt-auto pt-5">
          <button
            type="button"
            onClick={onEnquire}
            disabled={state === 'sending'}
            className="btn btn-ghost !py-2.5 !px-4 flex-1 justify-center disabled:opacity-60"
          >
            {state ? enquiryLabel : `Enquire on ${piece.ref}`}
          </button>
          <a
            href={whatsappUrl(`Private catalogue enquiry — ${piece.name}`, pieceFields(piece))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Message on WhatsApp about ${piece.name}`}
            title="Message on WhatsApp"
            className="btn btn-ghost !py-2.5 !px-3"
          >
            <WhatsAppIcon />
          </a>
        </div>
      </div>
    </article>
  );
}
