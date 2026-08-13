'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useReveal } from '@/components/ui/useReveal';
import { brand, facts } from '@/lib/site';
import {
  submitEnquiry,
  whatsappUrl,
  BUSINESS_TYPES,
  labelForBusinessType,
  type EnquiryField,
} from '@/lib/enquiry';

type FormState = 'idle' | 'sending' | 'success' | 'error';

const SUBJECT = 'Trade catalogue access request — vardhman-impex.com';

export default function ExclusiveAccess() {
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
  });

  const fields = (): EnquiryField[] => [
    { label: 'Company', value: form.company },
    { label: 'Country', value: form.country },
    { label: 'Website', value: form.website },
    { label: 'Email', value: form.email },
    { label: 'Business type', value: labelForBusinessType(form.businessType) },
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

    setState('error');
    setErrorMsg(result.error ?? 'Something went wrong.');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const field =
    'w-full bg-transparent border-b border-line-strong py-3 text-body text-ink placeholder:text-muted/70 focus:border-clay focus:outline-none transition-colors duration-base';

  return (
    <section ref={ref} id="access" className="bg-teal text-paper grain py-20 lg:py-32">
      <div className="shell relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Explanation */}
          <div className="lg:col-span-5">
            <p className="text-manifest text-timber rise">Trade access</p>
            <h2 className="font-serif text-display-sm font-light mt-6 rise" style={{ transitionDelay: '80ms' }}>
              The rest of the <span className="italic">catalogue</span>
            </h2>
            <p className="text-lead text-paper/70 mt-6 max-w-measure rise" style={{ transitionDelay: '160ms' }}>
              What is shown publicly is an introduction. The complete range of{' '}
              {facts.designs}+ designs — new arrivals, private-label options and
              container programmes — opens to verified business buyers.
            </p>

            <ul className="mt-10 rise" style={{ transitionDelay: '240ms' }}>
              {[
                'Full design catalogue with specifications',
                'Private-label and custom finish options',
                'Container planning and indicative pricing',
                'First sight of each season’s new work',
              ].map((line, i) => (
                <li key={line} className="flex gap-5 py-4 border-t border-line-invert">
                  <span className="text-manifest-sm text-timber numeral">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-body text-paper/80">{line}</span>
                </li>
              ))}
            </ul>

            <p className="text-manifest-sm text-paper/50 mt-8 rise">
              Already verified?{' '}
              <Link href="/collections/private" className="text-timber link-draw">
                Enter your access code
              </Link>
            </p>
          </div>

          {/* Form */}
          <div className="lg:col-span-6 lg:col-start-7">
            {state === 'success' ? (
              /* `filter-swap`, not `rise` — mounts on submit; see ContactSplit. */
              <div className="border border-line-invert p-8 lg:p-10 filter-swap">
                <p className="text-manifest text-timber">Request sent</p>
                <h3 className="font-serif text-title font-light mt-4">
                  We verify each trade account by hand.
                </h3>
                <p className="text-body text-paper/70 mt-4">
                  You&apos;ll hear back within two working days. Anything urgent, write to{' '}
                  <a href={`mailto:${brand.email}`} className="text-timber link-draw">
                    {brand.email}
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative rise" style={{ transitionDelay: '120ms' }}>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
                  <div className="sm:col-span-2">
                    <label htmlFor="company" className="text-manifest-sm text-paper/55">
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
                    <label htmlFor="country" className="text-manifest-sm text-paper/55">
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
                    <label htmlFor="businessType" className="text-manifest-sm text-paper/55">
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
                      <option value="" disabled className="bg-teal">
                        Select
                      </option>
                      {BUSINESS_TYPES.map((type) => (
                        <option key={type.value} value={type.value} className="bg-teal">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="email" className="text-manifest-sm text-paper/55">
                      Work email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      className={field}
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="text-manifest-sm text-paper/55">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="Optional"
                      className={field}
                    />
                  </div>
                </div>

                {/* Bots fill every input they find; nobody sees this one. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="access-ref">Reference</label>
                  <input
                    id="access-ref"
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
                    className="btn btn-invert disabled:opacity-60"
                  >
                    {state === 'sending' ? 'Sending…' : 'Request access'}
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
                    className="btn btn-invert"
                  >
                    Message on WhatsApp
                  </a>
                </div>

                {state === 'error' && (
                  <p role="alert" className="text-body text-timber mt-5 max-w-measure">
                    {errorMsg}
                  </p>
                )}

                <p className="text-manifest-sm text-paper/45 mt-6 max-w-measure leading-relaxed">
                  We use these details only to verify your business — no marketing lists.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
