'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useReveal } from '@/components/ui/useReveal';
import { brand, img } from '@/lib/site';
import {
  submitEnquiry,
  whatsappUrl,
  BUSINESS_TYPES,
  labelForBusinessType,
  type EnquiryField,
} from '@/lib/enquiry';

type FormState = 'idle' | 'sending' | 'success' | 'error';

const SUBJECT = 'New enquiry from vardhman-impex.com';

/*
 * Google's Maps URLs API: a plain link, no key and no SDK, resolved by Google
 * from the address string when the buyer follows it. Deliberately not an embed —
 * an iframe would hand Google the IP and user agent of every visitor who merely
 * opened this page, before anyone asked for a map, and cost a third-party frame
 * and its scripts on the route with the site's most important form on it.
 *
 * Built from `brand.address` rather than a pasted URL so a correction there
 * cannot leave the directions pointing at the previous works.
 */
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  [brand.address.line1, brand.address.line2, brand.address.country].join(', ')
)}`;

/** Matches the hero's prose links: underlined at rest, so colour is never the signal. */
const PROSE_LINK =
  'text-ink underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-clay hover:text-clay transition-colors duration-fast ease-out';

export default function ContactSplit() {
  const ref = useReveal<HTMLElement>();
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [form, setForm] = useState({
    company: '',
    country: '',
    website: '',
    email: '',
    businessType: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const fields = (): EnquiryField[] => [
    { label: 'Company', value: form.company },
    { label: 'Country', value: form.country },
    { label: 'Website', value: form.website },
    { label: 'Email', value: form.email },
    { label: 'Business type', value: labelForBusinessType(form.businessType) },
    { label: 'Message', value: form.message },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setErrorMsg('');

    const result = await submitEnquiry(SUBJECT, fields(), {
      email: form.email,
      honeypot,
    });

    if (result.ok) {
      setState('success');
      return;
    }

    // Never a silent failure: say what happened and leave WhatsApp reachable.
    setState('error');
    setErrorMsg(result.error ?? 'Something went wrong.');
  };

  const field =
    'w-full bg-transparent border-b border-line-strong py-3 text-body text-ink placeholder:text-muted/70 focus:border-clay focus:outline-none transition-colors duration-fast ease-out';
  const label = 'block text-manifest-sm text-muted mb-1';

  const plate = img('craft-round-table');

  return (
    <section ref={ref} className="pb-20 lg:pb-32">
      <div className="shell">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-7">
            {state === 'success' ? (
              /* `filter-swap`, not `rise`: this panel mounts on submit, long
                 after the scroll reveal was wired, so `.rise` would leave it
                 invisible. */
              <div className="border border-line-strong p-8 lg:p-10 filter-swap">
                <p className="text-manifest text-clay">Enquiry sent</p>
                <h2 className="text-title mt-4">
                  It&apos;s in our inbox. We reply within two working days.
                </h2>
                <div className="flex flex-wrap gap-3 mt-8">
                  <button type="button" onClick={() => setState('idle')} className="btn btn-solid">
                    Send another
                  </button>
                  {/* A destination, not a redirect. Sending does not navigate: the
                      panel stays put so a failure can never be mistaken for success
                      (tests/enquiry.spec.ts pins that), and /thank-you is offered
                      rather than forced. */}
                  <Link href="/thank-you" className="btn btn-ghost">
                    What happens next
                  </Link>
                </div>
              </div>
            ) : (
              /* `filter-swap`, not `rise`, for the same reason as the panel above:
                 clicking "Send another" mounts a fresh form long after the scroll
                 reveal was wired, so `.rise` would leave it at opacity 0 with
                 nothing left to reveal it. */
              <form onSubmit={handleSubmit} className="relative filter-swap">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
                  <div>
                    <label htmlFor="company" className={label}>
                      Company name
                    </label>
                    <input
                      id="company"
                      name="company"
                      required
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Registered business name"
                      className={field}
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className={label}>
                      Country
                    </label>
                    <input
                      id="country"
                      name="country"
                      required
                      value={form.country}
                      onChange={handleChange}
                      placeholder="Where you trade"
                      className={field}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={label}>
                      Business email
                    </label>
                    <input
                      id="email"
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
                    <label htmlFor="website" className={label}>
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="Optional"
                      className={field}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="businessType" className={label}>
                      Business type
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      required
                      value={form.businessType}
                      onChange={handleChange}
                      className={`${field} appearance-none`}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      {BUSINESS_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="message" className={label}>
                      What are you looking for?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Ranges, volumes, timelines. As much or as little as you have."
                      className={`${field} resize-none`}
                    />
                  </div>
                </div>

                {/* Bots fill every input they find; nobody sees this one. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="contact-ref">Reference</label>
                  <input
                    id="contact-ref"
                    name="ref"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Above the button, not below it: the promise only does its work
                    if it is read before the press. Same sentence as the hero, the
                    trade-access form and the container plan — a buyer who meets two
                    different figures believes neither. */}
                <p className="text-note text-muted mt-10 max-w-measure">
                  We reply within two working days.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={state === 'sending'}
                    className="btn btn-solid disabled:opacity-60"
                  >
                    {state === 'sending' ? 'Sending…' : 'Send enquiry'}
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
                    href={whatsappUrl(SUBJECT, fields())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                  >
                    Message on WhatsApp
                  </a>
                </div>

                {state === 'error' && (
                  <p role="alert" className="text-body text-clay mt-5 max-w-measure">
                    {errorMsg}
                  </p>
                )}

                <p className="text-note text-muted mt-6 max-w-measure">
                  Sent straight to {brand.email}. We use your details only to reply.{' '}
                  <Link href="/privacy" className="text-ink link-draw tap">
                    How we handle it
                  </Link>
                </p>
              </form>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="plate aspect-[4/3] rise">
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

            <dl className="mt-8 rise">
              <div className="py-5 border-t border-line">
                <dt className="text-manifest-sm text-muted">Works</dt>
                <dd className="mt-2">
                  {/* `<address>` so the postal address is machine-readable as one;
                      `not-italic` because the element's default italic fights every
                      other block of body copy on the page. */}
                  <address className="text-body text-ink not-italic leading-relaxed">
                    {brand.address.line1}
                    <br />
                    {brand.address.line2}
                    <br />
                    {brand.address.country}
                  </address>

                  <a
                    href={DIRECTIONS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-arrow tap inline-flex items-center gap-2.5 mt-5 text-manifest text-ink-soft hover:text-clay transition-colors duration-fast ease-out"
                  >
                    Get directions
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
                  </a>

                  {/* Said out loud rather than discovered on click: this is the one
                      control on the page that hands a visitor to a third party. */}
                  <p className="text-note text-muted mt-2">Opens Google Maps in a new tab.</p>
                </dd>
              </div>
              <div className="py-5 border-t border-line">
                <dt className="text-manifest-sm text-muted">Telephone</dt>
                <dd className="text-body mt-2">
                  <a href={`tel:${brand.phoneHref}`} className="text-ink link-draw numeral tap">
                    {brand.phone}
                  </a>
                </dd>
              </div>
              <div className="py-5 border-t border-line">
                <dt className="text-manifest-sm text-muted">Email</dt>
                <dd className="text-body mt-2">
                  <a href={`mailto:${brand.email}`} className="text-ink link-draw break-all tap">
                    {brand.email}
                  </a>
                </dd>
              </div>
              <div className="py-5 border-y border-line">
                <dt className="text-manifest-sm text-muted">Hours</dt>
                <dd className="text-body text-ink mt-2 numeral">Mon–Sat, 09:30–18:30 IST</dd>
              </div>
            </dl>

            {/* A buyer who reaches this column without a specification yet needs
                somewhere to go that is not the back button. */}
            <p className="text-body text-muted mt-8 rise">
              Nothing specific to ask for yet? The{' '}
              <Link href="/collections" className={PROSE_LINK}>
                public collections
              </Link>{' '}
              show the ranges and the finishes, and the rest of the catalogue — packed sizes, CBM,
              container counts — opens with{' '}
              <Link href="/collections#access" className={PROSE_LINK}>
                trade access
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
