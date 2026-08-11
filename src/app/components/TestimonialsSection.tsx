'use client';

import React, { useState } from 'react';
import { useReveal } from '@/components/ui/useReveal';
import { testimonials } from '@/lib/site';

export default function TestimonialsSection() {
  const ref = useReveal<HTMLElement>();
  const [active, setActive] = useState(0);
  const current = testimonials[active];

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-paper-deep">
      <div className="shell">
        <header className="flex items-baseline gap-5 rise">
          <span className="text-manifest-sm text-muted numeral">05</span>
          <h2 className="font-serif text-display font-light">
            From the <span className="italic">buyers</span>
          </h2>
        </header>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-12 lg:mt-20">
          <div className="lg:col-span-8">
            <blockquote className="rise">
              <p className="font-serif text-display-sm font-light italic text-ink leading-[1.18]">
                &ldquo;{current.quote}&rdquo;
              </p>
              <footer className="mt-10 pt-6 border-t border-line-strong">
                <p className="font-serif text-title font-light not-italic">{current.author}</p>
                <p className="text-manifest text-muted mt-2">
                  {current.title} — {current.company}
                </p>
                <p className="text-manifest-sm text-clay mt-1.5">{current.country}</p>
              </footer>
            </blockquote>
          </div>

          {/* Index of buyers */}
          <div className="lg:col-span-4 lg:pl-8 rise">
            <p className="text-manifest-sm text-muted pb-4 border-b border-line-strong">
              {String(testimonials.length).padStart(2, '0')} references
            </p>
            <ul>
              {testimonials.map((entry, i) => (
                <li key={entry.author}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={i === active}
                    className="group w-full text-left flex items-baseline gap-4 py-5 border-b border-line transition-colors duration-base"
                  >
                    <span
                      className={`text-manifest-sm numeral transition-colors duration-base ${
                        i === active ? 'text-clay' : 'text-muted'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block font-serif text-lead transition-colors duration-base ${
                          i === active ? 'text-ink' : 'text-muted group-hover:text-ink'
                        }`}
                      >
                        {entry.company}
                      </span>
                      <span className="block text-manifest-sm text-muted mt-1">
                        {entry.country}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
