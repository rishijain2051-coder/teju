'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

interface Product {
  id: number;
  name: string;
  collection: string;
  material: string;
  dimensions: string;
  finish: string;
  image1: string;
  image2: string;
  alt1: string;
  alt2: string;
}

const products: Product[] = [
{
  id: 1,
  name: 'Ranthambore Dining Table',
  collection: 'Dining',
  material: 'Solid Mango Wood',
  dimensions: 'L240 × W90 × H76 cm',
  finish: 'Dark Walnut',
  image1: "https://images.unsplash.com/photo-1645500178026-f8b69fe83055",
  image2: "https://images.unsplash.com/photo-1645500178026-f8b69fe83055",
  alt1: 'Long dark wood dining table, overhead view, warm studio lighting, clean background',
  alt2: 'Side profile of solid mango wood dining table showing grain detail and tapered legs'
},
{
  id: 2,
  name: 'Mehrangarh Sideboard',
  collection: 'Living',
  material: 'Solid Sheesham',
  dimensions: 'L180 × W45 × H80 cm',
  finish: 'Natural Teak',
  image1: "https://img.rocket.new/generatedImages/rocket_gen_img_15db82677-1768583655802.png",
  image2: "https://img.rocket.new/generatedImages/rocket_gen_img_15db82677-1768583655802.png",
  alt1: 'Solid wood sideboard with three drawers against white wall, natural light',
  alt2: 'Close-up of sideboard hardware and wood grain detail, warm tones'
},
{
  id: 3,
  name: 'Thar Lounge Chair',
  collection: 'Living',
  material: 'Teak & Linen',
  dimensions: 'W75 × D85 × H85 cm',
  finish: 'Bleached Oak',
  image1: "https://img.rocket.new/generatedImages/rocket_gen_img_11c8aa276-1772114143265.png",
  image2: "https://img.rocket.new/generatedImages/rocket_gen_img_11c8aa276-1772114143265.png",
  alt1: 'Lounge chair with pale wood frame and natural linen cushion, minimal studio setting',
  alt2: 'Three-quarter view of lounge chair showing joinery detail and cushion profile'
},
{
  id: 4,
  name: 'Umaid Almirah',
  collection: 'Storage',
  material: 'Solid Mango Wood',
  dimensions: 'W120 × D50 × H200 cm',
  finish: 'Ebony Stain',
  image1: "https://img.rocket.new/generatedImages/rocket_gen_img_18b2a76b9-1768167743304.png",
  image2: "https://img.rocket.new/generatedImages/rocket_gen_img_18b2a76b9-1768167743304.png",
  alt1: 'Tall dark wood armoire with two doors and carved handles, white studio backdrop',
  alt2: 'Open almirah showing interior shelving and drawer configuration'
},
{
  id: 5,
  name: 'Bishnoi Bed Frame',
  collection: 'Bedroom',
  material: 'Solid Sheesham',
  dimensions: 'King: 200 × 200 cm',
  finish: 'Antique Walnut',
  image1: "https://img.rocket.new/generatedImages/rocket_gen_img_177447d41-1776988137586.png",
  image2: "https://img.rocket.new/generatedImages/rocket_gen_img_177447d41-1776988137586.png",
  alt1: 'Dark walnut bed frame with upholstered headboard, white linen, minimal bedroom',
  alt2: 'Detail of bed frame headboard carving and leg joinery'
},
{
  id: 6,
  name: 'Jodhpur Bar Cabinet',
  collection: 'Living',
  material: 'Mango & Iron',
  dimensions: 'W100 × D45 × H120 cm',
  finish: 'Gunmetal & Oak',
  image1: "https://img.rocket.new/generatedImages/rocket_gen_img_1506f3d4f-1768299866724.png",
  image2: "https://img.rocket.new/generatedImages/rocket_gen_img_1506f3d4f-1768299866724.png",
  alt1: 'Industrial bar cabinet with iron frame and wood shelves, dark background',
  alt2: 'Bar cabinet detail showing iron hardware and wood grain contrast'
},
{
  id: 7,
  name: 'Rajwada TV Console',
  collection: 'Living',
  material: 'Solid Mango Wood',
  dimensions: 'L180 × W45 × H55 cm',
  finish: 'Washed Grey',
  image1: "https://images.unsplash.com/photo-1697457053997-555dfc117cf1",
  image2: "https://images.unsplash.com/photo-1697457053997-555dfc117cf1",
  alt1: 'Low TV console in washed grey finish, minimal living room, warm light',
  alt2: 'TV console side view showing tapered legs and drawer handles'
},
{
  id: 8,
  name: 'Sardar Coffee Table',
  collection: 'Living',
  material: 'Reclaimed Teak',
  dimensions: 'L120 × W60 × H42 cm',
  finish: 'Natural Reclaimed',
  image1: "https://img.rocket.new/generatedImages/rocket_gen_img_1f6b80ad7-1772510338017.png",
  image2: "https://img.rocket.new/generatedImages/rocket_gen_img_1f6b80ad7-1772510338017.png",
  alt1: 'Reclaimed teak coffee table, low profile, textured surface, airy room',
  alt2: 'Top-down view of coffee table showing natural wood grain and reclaimed character marks'
},
{
  id: 9,
  name: 'Mandore Dining Chair',
  collection: 'Dining',
  material: 'Solid Mango & Rattan',
  dimensions: 'W50 × D55 × H88 cm',
  finish: 'Honey Oak',
  image1: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3660779-1772104238044.png",
  image2: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3660779-1772104238044.png",
  alt1: 'Dining chair with rattan back panel and solid wood frame, honey oak finish',
  alt2: 'Set of four dining chairs around a table, natural light, airy dining room'
},
{
  id: 10,
  name: 'Kumbhalgarh Wardrobe',
  collection: 'Storage',
  material: 'Solid Sheesham',
  dimensions: 'W200 × D60 × H220 cm',
  finish: 'Ebony & Brass',
  image1: "https://img.rocket.new/generatedImages/rocket_gen_img_1de896b5d-1764849462634.png",
  image2: "https://img.rocket.new/generatedImages/rocket_gen_img_1de896b5d-1764849462634.png",
  alt1: 'Large dark wardrobe with brass handles against white wall, tall proportions',
  alt2: 'Wardrobe interior showing hanging rail, shelves and drawer system'
},
{
  id: 11,
  name: 'Nagaur Bookcase',
  collection: 'Storage',
  material: 'Solid Mango Wood',
  dimensions: 'W120 × D35 × H180 cm',
  finish: 'Cerused Oak',
  image1: "https://img.rocket.new/generatedImages/rocket_gen_img_1e8aca294-1779456295251.png",
  image2: "https://img.rocket.new/generatedImages/rocket_gen_img_1e8aca294-1779456295251.png",
  alt1: 'Open bookcase with five shelves, cerused oak finish, books and objects styled',
  alt2: 'Bookcase side profile showing shelf depth and back panel detail'
},
{
  id: 12,
  name: 'Pali Nightstand',
  collection: 'Bedroom',
  material: 'Solid Mango Wood',
  dimensions: 'W50 × D40 × H55 cm',
  finish: 'Smoke & Iron',
  image1: "https://images.unsplash.com/photo-1630835016331-1a9b60581820",
  image2: "https://images.unsplash.com/photo-1630835016331-1a9b60581820",
  alt1: 'Bedside table with iron frame and wooden drawer, beside dark bed frame, lamp on top',
  alt2: 'Nightstand detail showing iron hairpin legs and mango wood drawer front'
}];


export default function FeaturedProducts() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('is-revealed');
        });
      },
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const activeProduct = products.find((p) => p.id === quickViewId);

  return (
    <section ref={sectionRef} id="products" className="py-16 lg:py-32 bg-background">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-16 gap-6">
          <div>
            <p className="fade-up text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">
              Selected Work
            </p>
            <h2 className="fade-up font-serif text-section-xl font-light text-foreground" style={{ transitionDelay: '100ms' }}>
              Featured Products.
            </h2>
          </div>
          <p className="fade-up text-sm text-muted-foreground max-w-xs" style={{ transitionDelay: '200ms' }}>
            A curated selection from our public catalogue. Our complete range of 1,000+ designs is available exclusively to verified retailers, interior designers, and hospitality buyers.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.slice(0, 6).map((product, i) =>
          <div
            key={product.id}
            className="fade-up group product-card-hover cursor-pointer"
            style={{ transitionDelay: `${i % 3 * 80}ms` }}
            onMouseEnter={() => setHoveredId(product.id)}
            onMouseLeave={() => setHoveredId(null)}>
            
              {/* Image */}
              <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
                <AppImage
                src={hoveredId === product.id ? product.image2 : product.image1}
                alt={hoveredId === product.id ? product.alt2 : product.alt1}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-all duration-700" />
              
                {/* Quick view overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-end justify-center pb-6">
                  <button
                  onClick={() => setQuickViewId(product.id)}
                  className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400 px-6 py-2.5 bg-white text-foreground text-xs font-medium tracking-widest uppercase">
                  
                    Quick View
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="pt-4 pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-1">
                      {product.collection}
                    </p>
                    <h3 className="font-serif text-lg font-light text-foreground leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{product.material}</p>
                  </div>
                  <button
                  onClick={() => setQuickViewId(product.id)}
                  aria-label={`Enquire about ${product.name}`}
                  className="flex-shrink-0 mt-1 text-muted-foreground hover:text-accent transition-colors">
                  
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View catalogue CTA */}
        <div className="mt-16 text-center fade-up">
          <div className="inline-block border border-border p-8 lg:p-12 max-w-lg w-full">
            <p className="font-serif text-2xl font-light text-foreground mb-3">
              See the complete catalogue.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Our full range of 1,000+ designs is available exclusively to verified business buyers.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-xs font-medium tracking-widest uppercase btn-lift">
              
              Request Catalogue Access
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {activeProduct &&
      <div
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 lg:p-12"
        onClick={() => setQuickViewId(null)}>
        
          <div
          className="bg-background max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
          
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative aspect-square bg-secondary">
                <AppImage
                src={activeProduct.image1}
                alt={activeProduct.alt1}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover" />
              
              </div>
              <div className="p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">
                        {activeProduct.collection}
                      </p>
                      <h3 className="font-serif text-2xl font-light text-foreground">
                        {activeProduct.name}
                      </h3>
                    </div>
                    <button
                    onClick={() => setQuickViewId(null)}
                    aria-label="Close"
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4 border-t border-border pt-6">
                    {[
                  { label: 'Material', value: activeProduct.material },
                  { label: 'Dimensions', value: activeProduct.dimensions },
                  { label: 'Finish', value: activeProduct.finish }].
                  map((spec) =>
                  <div key={spec.label} className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{spec.label}</span>
                        <span className="text-sm text-foreground font-medium">{spec.value}</span>
                      </div>
                  )}
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground text-xs font-medium tracking-widest uppercase btn-lift">
                  
                    Enquire About This Piece
                  </Link>
                  <p className="text-center text-xs text-muted-foreground">No pricing displayed — trade enquiries only.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </section>);

}
