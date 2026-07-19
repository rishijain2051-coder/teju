'use client';

import React, { useEffect, useState } from 'react';

export default function ContactHero() {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="pt-28 lg:pt-36 pb-16 lg:pb-20 bg-background border-b border-border">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <p
          className={`text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4 transition-all duration-1000 ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Get in Touch
        </p>
        <h1
          className={`font-serif text-hero-xl font-light text-foreground transition-all duration-1000 delay-200 ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Let&apos;s build something<br />
          <span className="italic text-muted-foreground">together.</span>
        </h1>
        <p
          className={`text-body-lg text-muted-foreground mt-6 max-w-xl transition-all duration-1000 delay-400 ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Whether you&apos;re a retailer, interior designer, or hospitality buyer — tell us what you&apos;re looking for.
        </p>
      </div>
    </section>
  );
}