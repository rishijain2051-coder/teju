'use client';

import React, { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function ExclusiveAccess() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [form, setForm] = useState({
    company: '',
    country: '',
    website: '',
    email: '',
    businessType: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');
    // Mock submission — backend integration point
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section className="py-24 lg:py-32 bg-secondary border-t border-border">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Explanation */}
          <div>
            <p className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">
              The Public Collection
            </p>
            <h2 className="font-serif text-section-xl font-light text-foreground mb-6">
              Explore a curated selection<br />
              <span className="italic text-muted-foreground">of our designs.</span>
            </h2>
            <p className="text-body-lg text-muted-foreground mb-6">
              What you see here is a carefully chosen introduction to our work. Our complete catalogue of 1,000+ designs — including new arrivals, private label options, and container programmes — is shared exclusively with verified business buyers.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Verified retailers, interior designers, and hospitality buyers receive exclusive access after a quick enquiry. Our team reviews all applications within 2 business days.
            </p>

            {/* Lock illustration */}
            <div className="flex items-center gap-6 p-6 border border-border bg-background">
              <div className="flex-shrink-0">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <p className="font-serif text-lg font-light text-foreground">Trade buyers only</p>
                <p className="text-sm text-muted-foreground mt-0.5">Retailers, designers, hospitality groups, and importers welcome.</p>
              </div>
            </div>

            {/* Already have a code */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Already have an access code?</p>
              <a
                href="/collections/private"
                className="inline-flex items-center gap-2 text-xs font-mono text-accent tracking-widest uppercase hover:underline underline-offset-4 transition-colors"
              >
                Enter private catalogue →
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {formState === 'success' ? (
              <div className="border border-border bg-background p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl font-light text-foreground mb-3">Request received.</h3>
                <p className="text-sm text-muted-foreground">
                  Our team will review your details and send catalogue access credentials to your email within 2 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-6">
                  <h3 className="font-serif text-xl font-light text-foreground">Request catalogue access</h3>
                  <p className="text-sm text-muted-foreground mt-2">Looking for our complete collection of 1,000+ designs? Submit your details below.</p>
                </div>

                {[
                  { name: 'company', label: 'Company Name', type: 'text', placeholder: 'Your company name' },
                  { name: 'country', label: 'Country', type: 'text', placeholder: 'Country of operation' },
                  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://yourcompany.com' },
                  { name: 'email', label: 'Business Email', type: 'email', placeholder: 'you@company.com' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required
                      className="w-full px-4 py-3 bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={form.businessType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-colors appearance-none"
                  >
                    <option value="" disabled>Select your business type</option>
                    <option value="retailer">Furniture Retailer</option>
                    <option value="interior-designer">Interior Designer / Studio</option>
                    <option value="hospitality">Hospitality Group</option>
                    <option value="importer">Importer / Distributor</option>
                    <option value="private-label">Private Label Brand</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formState === 'loading'}
                    className="w-full py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.12em] uppercase btn-lift disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {formState === 'loading' ? 'Submitting...' : 'Enquire for Full Access'}
                  </button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    We review all applications within 2 business days.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}