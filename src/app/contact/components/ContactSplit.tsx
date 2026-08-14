'use client';

import React, { useState } from 'react';
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
    'w-full bg-transparent border-b border-line-strong py-3 text-body text-ink placeholder:text-muted/70 focus:border-clay focus:outline-none transition-colors duration-base';
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
                <button
                  type="button"
                  onClick={() => setState('idle')}
                  className="btn btn-ghost mt-8"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative rise">
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

                <div className="flex flex-wrap items-center gap-3 mt-10">
                  <button
                    type="submit"
                    disabled={state === 'sending'}
                    className="btn btn-solid disabled:opacity-60"
                  >
                    {state === 'sending' ? 'Sending…' : 'Send enquiry'}
                    {state !== 'sending' && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
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
                  Sent straight to {brand.email}. We use your details only to reply.
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
                <dd className="text-body text-ink mt-2 leading-relaxed">
                  {brand.address.line1}
                  <br />
                  {brand.address.line2}
                  <br />
                  {brand.address.country}
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
                <dd className="text-body text-ink mt-2 numeral">
                  Mon–Sat, 09:30–18:30 IST
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
