'use client';

import React, { useEffect, useRef } from 'react';

import AppImage from '@/components/ui/AppImage';

const articles = [
{
  title: 'The Enduring Appeal of Solid Mango Wood',
  category: 'Wood Stories',
  date: 'June 2026',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_129ba475e-1772127483713.png",
  alt: 'Close-up of mango wood grain, warm amber tones, natural light, workshop surface',
  excerpt: 'Why the most overlooked hardwood in Indian furniture is quietly becoming the material of choice for European buyers.'
},
{
  title: 'Inside the Factory: From Timber to Container',
  category: 'Behind the Factory',
  date: 'May 2026',
  image: "https://images.unsplash.com/photo-1611572041532-4afaca6339d1",
  alt: 'Craftsman sanding a wooden chair leg, sawdust in air, warm workshop light, Jodhpur factory',
  excerpt: 'A rare look at how a piece moves from raw timber to a finished, export-ready container in Boranada.'
},
{
  title: 'Furniture Trends Shaping European Retail in 2026',
  category: 'Furniture Trends',
  date: 'April 2026',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_158cf5bb6-1772063868995.png",
  alt: 'Minimal European living room with warm wood furniture, pale linen, soft afternoon light',
  excerpt: 'Wabi-sabi finishes, reclaimed materials, and the return of the sideboard — what buyers are ordering for 2027.'
}];


export default function JournalSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {if (e.isIntersecting) e.target.classList.add('is-revealed');});
      },
      { threshold: 0.1 }
    );
    sectionRef?.current?.querySelectorAll('.fade-up')?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="journal" className="py-16 lg:py-32 bg-background border-t border-border">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-16 gap-6">
          <div>
            <p className="fade-up text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">
              Journal
            </p>
            <h2 className="fade-up font-serif text-section-xl font-light text-foreground" style={{ transitionDelay: '100ms' }}>
              From the workshop.
            </h2>
          </div>
          <p className="fade-up text-sm text-muted-foreground" style={{ transitionDelay: '200ms' }}>
            Stories about wood, craft, and the business of furniture.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {articles?.map((article, i) =>
          <article
            key={i}
            className="fade-up group cursor-pointer"
            style={{ transitionDelay: `${i * 100}ms` }}>
            
              <div className="relative overflow-hidden bg-secondary aspect-[16/10] mb-6">
                <AppImage
                src={article?.image}
                alt={article?.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover collection-card-img" />
              
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-accent tracking-widest uppercase">
                    {article?.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{article?.date}</span>
                </div>
                <h3 className="font-serif text-xl font-light text-foreground mb-3 leading-snug group-hover:text-accent transition-colors duration-300">
                  {article?.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {article?.excerpt}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-foreground border-b border-transparent group-hover:border-foreground pb-0.5 transition-all duration-300">
                  Read more
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>);

}
