'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

type Category = 'All' | 'Dining' | 'Living' | 'Storage' | 'Bedroom' | 'Hospitality';

interface CollectionItem {
  id: number;
  name: string;
  category: Exclude<Category, 'All'>;
  description: string;
  pieces: string;
  image: string;
  alt: string;
  highlight: string;
}

const collections: CollectionItem[] = [
{
  id: 1,
  name: 'Jupiter Iron Works',
  category: 'Living',
  description: 'Industrial meets warm — iron frames with solid mango wood surfaces. Designed for loft living and commercial spaces.',
  pieces: '40 pieces',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_13ea07da3-1776709679264.png",
  alt: 'Industrial living room with iron-frame furniture, dark metal and warm wood, loft apartment, dramatic shadows',
  highlight: 'Iron & Mango Wood'
},
{
  id: 2,
  name: 'Colonial Blanc',
  category: 'Dining',
  description: 'White-washed mango wood with turned legs and carved details. Colonial heritage reimagined for modern dining rooms.',
  pieces: '35 pieces',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_13830666a-1777157510764.png",
  alt: 'Bright dining room with white-washed wooden table and turned-leg chairs, colonial style, natural light',
  highlight: 'White-washed Mango'
},
{
  id: 3,
  name: 'Timber Haus Noir',
  category: 'Storage',
  description: 'Dark ebony-stained sheesham with minimal hardware. Statement storage for confident interiors.',
  pieces: '28 pieces',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_18b2a76b9-1768167743304.png",
  alt: 'Dark ebony storage cabinet against white wall, minimal brass hardware, dramatic side lighting',
  highlight: 'Ebony Sheesham'
},
{
  id: 4,
  name: 'Sierra White',
  category: 'Bedroom',
  description: 'Bleached oak with linen upholstery. Serene bedroom furniture for boutique hotels and private residences.',
  pieces: '22 pieces',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_155b1b932-1772062602535.png",
  alt: 'Serene bedroom with bleached wood bed frame, white linen, minimal nightstands, soft morning light',
  highlight: 'Bleached Oak'
},
{
  id: 5,
  name: 'Boranada Contract',
  category: 'Hospitality',
  description: 'Contract-grade furniture engineered for high-traffic hotel, restaurant, and resort environments.',
  pieces: 'Custom programme',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_15a678729-1772242516483.png",
  alt: 'Boutique hotel lobby with bespoke wooden furniture, warm atmospheric lighting, contract-grade finish',
  highlight: 'Contract Grade'
},
{
  id: 6,
  name: 'Ranthambore Rustic',
  category: 'Dining',
  description: 'Reclaimed teak with live-edge detailing. Each piece is unique, celebrating the natural character of aged timber.',
  pieces: '18 pieces',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_103962ae6-1772160941816.png",
  alt: 'Rustic dining table with live-edge reclaimed teak top, hairpin legs, warm studio light',
  highlight: 'Reclaimed Teak'
},
{
  id: 7,
  name: 'Mehrangarh Modern',
  category: 'Living',
  description: 'Clean-lined solid sheesham with a warm honey finish. Contemporary Indian craftsmanship for European living rooms.',
  pieces: '45 pieces',
  image: "https://images.unsplash.com/photo-1581209410127-8211e90da024",
  alt: 'Modern living room with honey-finish sheesham sideboard and coffee table, minimal styling, warm light',
  highlight: 'Honey Sheesham'
},
{
  id: 8,
  name: 'Kumbhalgarh Dark',
  category: 'Bedroom',
  description: 'Dramatic dark walnut stain on solid mango. For master bedrooms that make a statement.',
  pieces: '20 pieces',
  image: "https://images.unsplash.com/photo-1721394749084-1f30ead0ef77",
  alt: 'Dark dramatic bedroom with walnut-stained furniture, moody lighting, deep shadows, luxurious atmosphere',
  highlight: 'Dark Walnut'
}];


const categories: Category[] = ['All', 'Dining', 'Living', 'Storage', 'Bedroom', 'Hospitality'];

export default function CollectionsGrid() {
  const [active, setActive] = useState<Category>('All');
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

  const filtered = active === 'All' ? collections : collections.filter((c) => c.category === active);

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-background">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        {/* Filter tabs */}
        <div className="fade-up flex flex-wrap gap-2 mb-12 border-b border-border pb-6">
          {categories.map((cat) =>
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 text-xs font-medium tracking-[0.1em] uppercase transition-all duration-300 ${
            active === cat ?
            'bg-primary text-primary-foreground' :
            'text-muted-foreground hover:text-foreground border border-border hover:border-foreground'}`
            }>
            
              {cat}
            </button>
          )}
        </div>

        {/* BENTO GRID AUDIT (All filter state — 8 cards):
           Array: [JupiterIronWorks, ColonialBlanc, TimberHausNoir, SierraWhite, BornadaContract, RanthamborRustic, MehrangarhModern, KumbhalgarhDark]
           Layout: 2-col grid, all equal
           Row 1: [col-1: JupiterIronWorks] [col-2: ColonialBlanc]
           Row 2: [col-1: TimberHausNoir] [col-2: SierraWhite]
           Row 3: [col-1: BornadaContract] [col-2: RanthamborRustic]
           Row 4: [col-1: MehrangarhModern] [col-2: KumbhalgarhDark]
           Placed 8/8 ✓
          */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {filtered.map((item, i) =>
          <div
            key={item.id}
            className="fade-up group collection-card relative overflow-hidden bg-secondary cursor-pointer"
            style={{ transitionDelay: `${i % 2 * 100}ms` }}>
            
              <div className="relative aspect-[16/10] overflow-hidden">
                <AppImage
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover collection-card-img" />
              
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Hover CTA */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-foreground text-xs font-medium tracking-widest uppercase">
                  
                    Enquire
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="p-6 lg:p-8 bg-background border border-border border-t-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-accent tracking-widest uppercase">{item.category}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{item.pieces}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-light text-foreground">{item.name}</h3>
                  </div>
                  <span className="flex-shrink-0 text-xs font-mono text-muted-foreground border border-border px-2 py-1 mt-1">
                    {item.highlight}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}