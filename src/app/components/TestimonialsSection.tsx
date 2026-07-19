'use client';

import React, { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    quote: "Working with Vardhman Impex transformed our buying process. The consistency of quality across 3 containers was remarkable — every piece arrived exactly as specified. Their willingness to accommodate custom finishes is rare at this scale.",
    author: 'Matthias Brandt',
    title: 'Procurement Director',
    company: 'Haus & Raum GmbH',
    country: 'Germany',
    flag: '🇩🇪',
  },
  {
    quote: "We've sourced furniture from 12 different manufacturers across Asia. Vardhman is the only one that feels like a genuine long-term partner. Lead times are honest, communication is direct, and the finish quality consistently exceeds our buyer expectations.",
    author: 'Sarah Thornton',
    title: 'Head of Buying',
    company: 'Thornton Home Collective',
    country: 'United Kingdom',
    flag: '🇬🇧',
  },
  {
    quote: "Their hospitality range is exceptional. We furnished two boutique hotels with their custom programme — 340 pieces across both properties — and received zero complaints from guests about quality. The private label service was seamless.",
    author: 'Luca Ferrara',
    title: 'Operations Director',
    company: 'Ferrara Hospitality Group',
    country: 'Italy',
    flag: '🇮🇹',
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-revealed'); });
      },
      { threshold: 0.15 }
    );
    sectionRef?.current?.querySelectorAll('.fade-up')?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  const current = testimonials?.[active];

  return (
    <section ref={sectionRef} className="py-16 lg:py-32 bg-secondary">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="mb-16">
          <p className="fade-up text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">
            What Buyers Say
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
          {/* Quote */}
          <div className="lg:col-span-8 lg:pr-20 fade-up">
            <div className="mb-8">
              <svg width="48" height="32" viewBox="0 0 48 32" fill="none" className="text-muted opacity-50">
                <path d="M0 32V19.2C0 13.867 1.333 9.333 4 5.6 6.667 1.867 10.667 0 16 0v4.8C13.333 4.8 11.2 5.733 9.6 7.6 8 9.467 7.2 11.733 7.2 14.4H14.4V32H0ZM28.8 32V19.2C28.8 13.867 30.133 9.333 32.8 5.6 35.467 1.867 39.467 0 44.8 0v4.8c-2.667 0-4.8.933-6.4 2.8C36.8 9.467 36 11.733 36 14.4H43.2V32H28.8Z" fill="currentColor" />
              </svg>
            </div>

            <blockquote
              key={active}
              className="font-serif text-display font-light text-foreground leading-relaxed mb-10"
              style={{ animation: 'fadeIn 0.6s ease forwards' }}
            >
              {current?.quote}
            </blockquote>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                {current?.flag}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{current?.author}</p>
                <p className="text-xs text-muted-foreground">{current?.title}, {current?.company} · {current?.country}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-4 lg:pl-12 lg:border-l border-border flex flex-col justify-between">
            <div className="space-y-0">
              {testimonials?.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-full text-left py-5 border-b border-border transition-all duration-300 ${
                    i === active ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{t?.flag}</span>
                    <div>
                      <p className="font-medium text-sm text-foreground">{t?.author}</p>
                      <p className="text-xs text-muted-foreground">{t?.company}</p>
                    </div>
                    {i === active && (
                      <div className="ml-auto w-1 h-8 bg-accent" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
