'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

const capabilities = [
{ label: '18 Years Experience', sub: 'Established 2006, Jodhpur' },
{ label: '9,000 Sq.Mt. Facility', sub: 'State-of-the-art manufacturing' },
{ label: 'FSC Wood Available', sub: 'Certified sustainable sourcing' },
{ label: 'In-house Manufacturing', sub: 'Full control from wood to finish' },
{ label: 'Low MOQ', sub: 'Flexible order quantities' },
{ label: 'Worldwide Export', sub: '9+ countries served' }];


export default function WhyBrandsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(capabilities.length).fill(false));

  useEffect(() => {
    const itemObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setVisibleItems((prev) => {
              const next = [...prev];
              next[index] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const items = sectionRef.current?.querySelectorAll('[data-index]');
    items?.forEach((el) => itemObserver.observe(el));

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('is-revealed');
        });
      },
      { threshold: 0.15 }
    );
    sectionRef.current?.querySelectorAll('.fade-up').forEach((el) => fadeObserver.observe(el));

    return () => {
      itemObserver.disconnect();
      fadeObserver.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} id="factory" className="py-16 lg:py-32 bg-secondary">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Factory imagery */}
          <div className="relative">
            <div className="relative overflow-hidden bg-muted aspect-[4/5]">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_187e6aae7-1766968372689.png"
                alt="Craftsmen in a Jodhpur furniture workshop, dim factory lighting, wood shavings on floor, natural timber stacked"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-background p-6 shadow-xl">
              <p className="font-serif text-3xl font-light text-foreground">1,000+</p>
              <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mt-1">Designs in Catalogue</p>
            </div>
            {/* Second image offset */}
            <div className="absolute -top-6 -left-6 w-32 h-32 overflow-hidden hidden lg:block">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_1ca4d61b2-1772059505480.png"
                alt="Close-up of hand-polished wooden furniture surface, warm grain texture, craftsman's hands"
                fill
                sizes="128px"
                className="object-cover grayscale" />
              
            </div>
          </div>

          {/* Right: Capabilities list */}
          <div className="flex flex-col justify-center">
            <p className="fade-up text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">
              Why Brands Work With Us
            </p>
            <h2 className="fade-up font-serif text-section-xl font-light text-foreground mb-12" style={{ transitionDelay: '100ms' }}>
              We don&apos;t build furniture.<br />
              <span className="italic text-muted-foreground">We build long-term partnerships.</span>
            </h2>

            <div className="space-y-0">
              {capabilities.map((cap, i) =>
              <div
                key={i}
                data-index={i}
                className={`flex items-start gap-6 py-5 border-b border-border transition-all duration-700 ${
                visibleItems[i] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`
                }
                style={{ transitionDelay: `${i * 100}ms` }}>
                
                  <span className="font-mono text-xs text-muted-foreground mt-1 w-6 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <p className="font-serif text-xl font-light text-foreground">{cap.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{cap.sub}</p>
                  </div>
                  <svg
                  className="w-4 h-4 text-accent mt-1 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5">
                  
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}
