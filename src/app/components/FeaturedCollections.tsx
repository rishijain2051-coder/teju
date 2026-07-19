'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const collections = [
{
  name: 'Dining',
  tagline: 'Tables that gather people.',
  image: "https://images.unsplash.com/photo-1721044167947-d21a6d625f7a",
  alt: 'Sunlit dining room with long dark oak table, eight upholstered chairs, warm afternoon light',
  count: '40+ pieces',
  href: '/collections'
},
{
  name: 'Living',
  tagline: 'Where comfort meets craft.',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_158cf5bb6-1772063868995.png",
  alt: 'Airy living room with low wooden sideboard, linen sofa, natural light, pale walls',
  count: '55+ pieces',
  href: '/collections'
},
{
  name: 'Storage',
  tagline: 'Functional. Beautiful. Enduring.',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_18b2a76b9-1768167743304.png",
  alt: 'Minimalist storage cabinet in dark walnut against white wall, clean shadows, still composition',
  count: '35+ pieces',
  href: '/collections'
},
{
  name: 'Bedroom',
  tagline: 'Rest in considered design.',
  image: "https://images.unsplash.com/photo-1718894071528-1108a094cc78",
  alt: 'Serene bedroom with dark wood bed frame, white linen, bedside lamps, dim warm light',
  count: '30+ pieces',
  href: '/collections'
},
{
  name: 'Hospitality',
  tagline: 'Contract-grade. Hotel-ready.',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_15a678729-1772242516483.png",
  alt: 'Boutique hotel lobby with bespoke wooden furniture, dim atmospheric lighting, dark tones',
  count: 'Custom programs',
  href: '/collections'
}];


export default function FeaturedCollections() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = sectionRef?.current?.querySelectorAll('.fade-up, .reveal-mask-inner');
    elements?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="collections" className="py-24 lg:py-32 bg-background">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div ref={headingRef} className="mb-16 lg:mb-20">
          <p className="fade-up text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">
            Our Collections
          </p>
          <h2 className="font-serif text-section-xl font-light text-foreground fade-up" style={{ transitionDelay: '100ms' }}>
            Furniture for every space.
          </h2>
        </div>

        {/* BENTO GRID AUDIT:
           Array has 5 cards: [Dining, Living, Storage, Bedroom, Hospitality]
           Row 1: [col-1-2: Dining cs-2 rs-1] [col-3: Living cs-1 rs-2]
           Row 2: [col-1: Storage cs-1 rs-1] [col-2: (gap)] [col-3: Living continued]
           Row 3: [col-1: Bedroom cs-1 rs-1] [col-2-3: Hospitality cs-2 rs-1]
           Placed 5/5 cards ✓
          */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Row 1: Dining (col-span-2) + Living (row-span-2) */}
          <div className="lg:col-span-2 collection-card group relative overflow-hidden bg-secondary cursor-pointer h-[55vw] lg:h-[480px]">
            <AppImage
              src={collections?.[0]?.image}
              alt={collections?.[0]?.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover collection-card-img" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 lg:p-10 z-10 w-full">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2">{collections?.[0]?.count}</p>
                  <h3 className="font-serif text-4xl lg:text-5xl font-light text-white group-hover:-translate-y-1 transition-transform duration-500">
                    {collections?.[0]?.name}
                  </h3>
                  <p className="text-white/60 text-sm mt-1 group-hover:text-white/80 transition-colors">{collections?.[0]?.tagline}</p>
                </div>
                <Link
                  href={collections?.[0]?.href}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-foreground text-xs font-medium tracking-widest uppercase">
                  
                  View
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Living — row-span-2 */}
          <div className="lg:row-span-2 collection-card group relative overflow-hidden bg-secondary cursor-pointer h-[55vw] lg:h-full lg:min-h-[980px]">
            <AppImage
              src={collections?.[1]?.image}
              alt={collections?.[1]?.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover collection-card-img" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 lg:p-10 z-10 w-full">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2">{collections?.[1]?.count}</p>
                  <h3 className="font-serif text-4xl lg:text-5xl font-light text-white group-hover:-translate-y-1 transition-transform duration-500">
                    {collections?.[1]?.name}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">{collections?.[1]?.tagline}</p>
                </div>
                <Link
                  href={collections?.[1]?.href}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-foreground text-xs font-medium tracking-widest uppercase">
                  
                  View
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Storage */}
          <div className="collection-card group relative overflow-hidden bg-secondary cursor-pointer h-[55vw] lg:h-[480px]">
            <AppImage
              src={collections?.[2]?.image}
              alt={collections?.[2]?.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover collection-card-img" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 z-10 w-full">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2">{collections?.[2]?.count}</p>
                  <h3 className="font-serif text-4xl font-light text-white group-hover:-translate-y-1 transition-transform duration-500">
                    {collections?.[2]?.name}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">{collections?.[2]?.tagline}</p>
                </div>
                <Link
                  href={collections?.[2]?.href}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-500 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-foreground text-xs font-medium tracking-widest uppercase">
                  
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* Row 3: Bedroom */}
          <div className="collection-card group relative overflow-hidden bg-secondary cursor-pointer h-[55vw] lg:h-[400px]">
            <AppImage
              src={collections?.[3]?.image}
              alt={collections?.[3]?.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover collection-card-img" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 z-10 w-full">
              <p className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2">{collections?.[3]?.count}</p>
              <h3 className="font-serif text-4xl font-light text-white group-hover:-translate-y-1 transition-transform duration-500">
                {collections?.[3]?.name}
              </h3>
              <p className="text-white/60 text-sm mt-1">{collections?.[3]?.tagline}</p>
            </div>
          </div>

          {/* Hospitality — col-span-2 */}
          <div className="lg:col-span-2 collection-card group relative overflow-hidden bg-secondary cursor-pointer h-[55vw] lg:h-[400px]">
            <AppImage
              src={collections?.[4]?.image}
              alt={collections?.[4]?.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover collection-card-img" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 lg:p-10 z-10 w-full">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2">{collections?.[4]?.count}</p>
                  <h3 className="font-serif text-4xl lg:text-5xl font-light text-white group-hover:-translate-y-1 transition-transform duration-500">
                    {collections?.[4]?.name}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">{collections?.[4]?.tagline}</p>
                </div>
                <Link
                  href={collections?.[4]?.href}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-500 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-foreground text-xs font-medium tracking-widest uppercase">
                  
                  View Collection
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center fade-up">
          <Link
            href="/collections"
            className="inline-flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b border-muted hover:border-foreground pb-0.5 transition-all duration-300 tracking-wide">
            
            View all collections
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-6 text-xs text-muted-foreground/70 tracking-wide">
            Looking for our complete collection of 1,000+ designs?{' '}
            <Link href="/collections#access" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
              Verified trade buyers receive exclusive access.
            </Link>
          </p>
        </div>
      </div>
    </section>);

}