'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

type FormState = 'idle' | 'loading' | 'success';

const contactDetails = [
{
  label: 'Address',
  value: 'G-769, Phase IV, Boranada Industrial Area\nJodhpur, Rajasthan 342005, India',
  icon:
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>

},
{
  label: 'Phone',
  value: '+91 93521 87266',
  href: 'tel:+919352187266',
  icon:
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>

},
{
  label: 'Email',
  value: 'rishi@vardhman-impex.com',
  href: 'mailto:rishi@vardhman-impex.com',
  icon:
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>

}];


export default function ContactSplit() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [form, setForm] = useState({
    company: '',
    country: '',
    website: '',
    email: '',
    businessType: '',
    message: ''
  });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {if (e.isIntersecting) e.target.classList.add('is-revealed');});
      },
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
  {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

const WHATSAPP_NUMBER = '919352187266'; // matches +91 93521 87266 shown on this page

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');

    const businessTypeLabels: Record<string, string> = {
      retailer: 'Furniture Retailer',
      'interior-designer': 'Interior Designer / Studio',
      hospitality: 'Hospitality Group',
      importer: 'Importer / Distributor',
      'private-label': 'Private Label Brand',
      other: 'Other',
    };

    const lines = [
      'New enquiry from vardhman-impex.com',
      '',
      `Company: ${form.company}`,
      `Country: ${form.country}`,
      `Website: ${form.website}`,
      `Email: ${form.email}`,
      `Business type: ${businessTypeLabels[form.businessType] || form.businessType}`,
      '',
      `Message: ${form.message}`,
    ];

    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');

    setFormState('success');
};

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-background">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Form */}
          <div className="fade-up">
            {formState === 'success' ?
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center border border-border p-12">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl font-light text-foreground mb-3">WhatsApp opened.</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Your enquiry details are ready to send in WhatsApp — just hit send there to reach us.
                </p>
              </div> :

            <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-serif text-2xl font-light text-foreground mb-8">Send an enquiry</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                { name: 'company', label: 'Company Name', type: 'text', placeholder: 'Your company' },
                { name: 'country', label: 'Country', type: 'text', placeholder: 'Country' }].
                map((f) =>
                <div key={f.name}>
                      <label className="block text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">
                        {f.label}
                      </label>
                      <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name as keyof typeof form]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    required
                    className="w-full px-4 py-3 bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors" />
                  
                    </div>
                )}
                </div>

                {[
              { name: 'website', label: 'Website', type: 'url', placeholder: 'https://yourcompany.com' },
              { name: 'email', label: 'Business Email', type: 'email', placeholder: 'you@company.com' }].
              map((f) =>
              <div key={f.name}>
                    <label className="block text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">
                      {f.label}
                    </label>
                    <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required
                  className="w-full px-4 py-3 bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors" />
                
                  </div>
              )}

                <div>
                  <label className="block text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">
                    Business Type
                  </label>
                  <select
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-colors appearance-none">
                  
                    <option value="" disabled>Select business type</option>
                    <option value="retailer">Furniture Retailer</option>
                    <option value="interior-designer">Interior Designer / Studio</option>
                    <option value="hospitality">Hospitality Group</option>
                    <option value="importer">Importer / Distributor</option>
                    <option value="private-label">Private Label Brand</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">
                    Message
                  </label>
                  <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you're looking for — product categories, quantities, timeline..."
                  rows={5}
                  className="w-full px-4 py-3 bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors resize-none" />
                
                </div>

                <button
                type="submit"
                disabled={formState === 'loading'}
                className="w-full py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.12em] uppercase btn-lift disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                
                  {formState === 'loading' ? 'Sending...' : 'Send Enquiry'}
                </button>
              </form>
            }
          </div>

          {/* Right: Factory photo + contact details */}
          <div className="fade-up" style={{ transitionDelay: '150ms' }}>
            <div className="relative overflow-hidden bg-secondary aspect-[4/3] mb-8">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_189793a64-1772521203451.png"
                alt="Craftsmen at work in Jodhpur furniture factory, dim warm light, wood shavings, focused artisans"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-white/60 text-xs font-mono tracking-widest uppercase">Boranada Industrial Area</p>
                <p className="text-white font-serif text-lg font-light">Jodhpur, Rajasthan</p>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-5">
              {contactDetails.map((detail) =>
              <div key={detail.label} className="flex items-start gap-4 py-4 border-b border-border">
                  <div className="flex-shrink-0 mt-0.5 text-accent">{detail.icon}</div>
                  <div>
                    <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">
                      {detail.label}
                    </p>
                    {detail.href ?
                  <a
                    href={detail.href}
                    className="text-sm text-foreground hover:text-accent transition-colors font-medium whitespace-pre-line">
                    
                        {detail.value}
                      </a> :

                  <p className="text-sm text-foreground font-medium whitespace-pre-line">{detail.value}</p>
                  }
                  </div>
                </div>
              )}
            </div>

            {/* GST / Trade info */}
            <div className="mt-6 p-5 bg-secondary border border-border">
              <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">Trade Information</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">GST Number</span>
                  <span className="text-xs font-mono text-foreground">08AFIPJ5024J1ZF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Business Type</span>
                  <span className="text-xs font-mono text-foreground">Exporter · Manufacturer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Annual Turnover</span>
                  <span className="text-xs font-mono text-foreground">₹150 Million+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mt-16 fade-up">
          <div className="relative w-full h-64 lg:h-80 bg-secondary border border-border overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-sm text-muted-foreground font-mono">G-769, Boranada Industrial Area, Jodhpur 342005</p>
              <a
                href="https://maps.google.com/?q=Boranada+Industrial+Area+Jodhpur+Rajasthan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-accent border-b border-accent pb-0.5 hover:opacity-70 transition-opacity">
                
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
