'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { type Piece } from '@/lib/site';
import { submitEnquiry, whatsappUrl, type EnquiryField } from '@/lib/enquiry';

type FormState = 'idle' | 'sending' | 'success' | 'error';

/** The design's own specification travels with every message, so a reply never
 *  has to begin by asking which piece the buyer meant. */
const pieceFields = (piece: Piece): EnquiryField[] => [
  { label: 'Reference', value: piece.ref },
  { label: 'Piece', value: piece.name },
  { label: 'Collection', value: piece.collection },
  { label: 'Material', value: piece.material },
  { label: 'Finish', value: piece.finish },
  { label: 'Dimensions', value: piece.dimensions },
];

export default function PieceEnquiry({ piece }: { piece: Piece }) {
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [form, setForm] = useState({ email: '', quantity: '', message: '' });

  const subject = `Enquiry: ${piece.ref} ${piece.name}`;

  const fields = (): EnquiryField[] => [
    ...pieceFields(piece),
    { label: 'Email', value: form.email },
    { label: 'Quantity', value: form.quantity },
    { label: 'Message', value: form.message },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setErrorMsg('');

    const result = await submitEnquiry(subject, fields(), {
      email: form.email,
      honeypot,
    });

    if (result.ok) {
      setState('success');
      return;
    }

    setState('error');
    setErrorMsg(result.error ?? 'Something went wrong.');
  };

  const field =
    'w-full bg-transparent border-b border-line-strong py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-clay focus:outline-none transition-colors duration-fast ease-out';
  const label = 'block text-manifest-sm text-muted mb-1';

  if (state === 'success') {
    /*
     * Confirmed in place, not at /thank-you.
     *
     * A redirect would buy an analytics URL and cost the two things that matter
     * more here. The buyer's context is the reason they enquired — the
     * photograph, the dimensions, the finish — and a full navigation throws all
     * of it away at the moment they are most likely to want the next design.
     * That next design is the loop below, and it is the highest-value behaviour
     * on a catalogue page: three enquiries in a row, without leaving the range.
     *
     * /thank-you exists as a real destination and is linked from here, so anyone
     * who wants the reply commitment, the telephone and the onward routes can
     * have them — by choosing to, rather than by being sent there.
     *
     * `filter-swap`, not `rise`: this panel mounts on submit, long after the
     * scroll reveal was wired, so `.rise` would leave it invisible.
     */
    return (
      <div className="border border-line-strong p-6 lg:p-8 filter-swap">
        <p className="text-manifest text-clay">Enquiry sent</p>
        <h3 className="text-title mt-3">
          {piece.ref} is with us. We reply within two working days.
        </h3>
        <div className="flex flex-wrap gap-3 mt-6">
          <button type="button" onClick={() => setState('idle')} className="btn btn-solid">
            Enquire on something else
          </button>
          <Link href="/thank-you" className="btn btn-ghost">
            What happens next
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
        <div className="sm:col-span-2">
          <label htmlFor="piece-email" className={label}>
            Business email
          </label>
          <input
            id="piece-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="piece-quantity" className={label}>
            Quantity
          </label>
          <input
            id="piece-quantity"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Optional"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="piece-message" className={label}>
            Anything specific
          </label>
          <input
            id="piece-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Finish, timeline, market"
            className={field}
          />
        </div>
      </div>

      {/* Bots fill every input they find; nobody sees this one. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="piece-ref-field">Reference</label>
        <input
          id="piece-ref-field"
          name="ref"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-7">
        <button
          type="submit"
          disabled={state === 'sending'}
          className="btn btn-solid disabled:opacity-60"
        >
          {state === 'sending' ? 'Sending…' : `Enquire on ${piece.ref}`}
          {state !== 'sending' && (
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
          )}
        </button>

        <a
          href={whatsappUrl(subject, pieceFields(piece))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.1 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9a11.4 11.4 0 0 1-4.5-4.3c-.9-1.6-.7-2.6-.5-3.1.2-.5.7-.9 1-1 .2 0 .4-.1.6 0 .2 0 .3 0 .5.4l.7 1.6c.1.2.1.4 0 .5l-.3.5-.3.3c-.1.1-.2.2 0 .5.2.3.6 1 1.3 1.6.8.7 1.4 1 1.7 1.1.2.1.4.1.5 0l.7-.8c.2-.2.3-.2.5-.1l1.5.8c.3.2.4.3.4.4.1.2 0 .7-.1 1.3Z" />
          </svg>
          WhatsApp
        </a>
      </div>

      {state === 'error' && (
        <p role="alert" className="text-body text-clay mt-4 max-w-measure">
          {errorMsg}
        </p>
      )}

      {/* The same line the contact form carries, for the same reason: the one
          thing a buyer wants to know before typing a business address is where
          it goes. */}
      <p className="text-note text-muted mt-5 max-w-measure">
        Sent straight to a person, used only to reply.{' '}
        <Link href="/privacy" className="link-draw text-ink tap">
          How we handle it
        </Link>
        .
      </p>
    </form>
  );
}
