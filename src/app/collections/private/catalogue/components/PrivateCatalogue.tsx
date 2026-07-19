'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';


interface Product {
  id: number;
  name: string;
  category: string;
  material: string;
  finish: string;
  dimensions: string;
  image: string;
  alt: string;
  tag?: string;
}

const PRIVATE_PRODUCTS: Product[] = [
{
  id: 1,
  name: 'Ashford Dining Table',
  category: 'Dining',
  material: 'Solid Sheesham',
  finish: 'Natural Wax',
  dimensions: 'W220 × D90 × H76 cm',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1757d12a8-1772224812716.png",
  alt: 'Solid sheesham wood dining table with natural wax finish in a bright Scandinavian dining room',
  tag: 'New Arrival'
},
{
  id: 2,
  name: 'Marlowe Lounge Chair',
  category: 'Living',
  material: 'Teak & Linen',
  finish: 'Oiled Teak',
  dimensions: 'W80 × D85 × H82 cm',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_11c8aa276-1772114143265.png",
  alt: 'Teak and linen lounge chair with oiled finish in a minimalist living room setting',
  tag: 'Bestseller'
},
{
  id: 3,
  name: 'Elara Sideboard',
  category: 'Storage',
  material: 'Mango Wood',
  finish: 'Smoked Oak',
  dimensions: 'W180 × D45 × H80 cm',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1fb99080d-1772521199264.png",
  alt: 'Mango wood sideboard with smoked oak finish and brass handles in a contemporary interior'
},
{
  id: 4,
  name: 'Croft Bed Frame',
  category: 'Bedroom',
  material: 'Solid Acacia',
  finish: 'Brushed Walnut',
  dimensions: 'W160 × D210 × H110 cm',
  image: "https://images.unsplash.com/photo-1718894071528-1108a094cc78",
  alt: 'Solid acacia wood bed frame with brushed walnut finish in a serene bedroom with linen bedding',
  tag: 'New Arrival'
},
{
  id: 5,
  name: 'Halton Coffee Table',
  category: 'Living',
  material: 'Reclaimed Teak',
  finish: 'Raw Natural',
  dimensions: 'W120 × D65 × H42 cm',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1afc48e9f-1772694647117.png",
  alt: 'Reclaimed teak coffee table with raw natural finish on a jute rug in a warm living space'
},
{
  id: 6,
  name: 'Pemberton Wardrobe',
  category: 'Storage',
  material: 'Solid Pine',
  finish: 'White Chalk',
  dimensions: 'W200 × D60 × H220 cm',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2bc1942-1767602380430.png",
  alt: 'Solid pine wardrobe with white chalk finish and iron handles in a Scandinavian bedroom'
},
{
  id: 7,
  name: 'Vega Bar Stool',
  category: 'Hospitality',
  material: 'Iron & Leather',
  finish: 'Matte Black',
  dimensions: 'W45 × D45 × H75 cm',
  image: "https://images.unsplash.com/photo-1627383838221-ab99b294c2e8",
  alt: 'Iron and leather bar stool with matte black finish at a marble kitchen island',
  tag: 'Hospitality'
},
{
  id: 8,
  name: 'Briar Bookshelf',
  category: 'Storage',
  material: 'Sheesham & Iron',
  finish: 'Antique Bronze',
  dimensions: 'W100 × D35 × H180 cm',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_13d7b897d-1772521200469.png",
  alt: 'Sheesham wood and iron bookshelf with antique bronze finish filled with books and plants'
},
{
  id: 9,
  name: 'Linden Bench',
  category: 'Bedroom',
  material: 'Solid Oak',
  finish: 'Honey Stain',
  dimensions: 'W140 × D40 × H48 cm',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d0f6148b-1784443738632.png",
  alt: 'Solid oak bedroom bench with honey stain finish at the foot of a linen-dressed bed'
},
{
  id: 10,
  name: 'Orion Dining Chair',
  category: 'Dining',
  material: 'Walnut & Fabric',
  finish: 'Dark Walnut',
  dimensions: 'W50 × D55 × H85 cm',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_13522c234-1772206595455.png",
  alt: 'Walnut and fabric dining chair with dark walnut finish around a round dining table',
  tag: 'Bestseller'
},
{
  id: 11,
  name: 'Strand Console',
  category: 'Living',
  material: 'Mango & Brass',
  finish: 'Ebony Stain',
  dimensions: 'W140 × D38 × H82 cm',
  image: "https://images.unsplash.com/photo-1723641877589-1c9b128c55e4",
  alt: 'Mango wood and brass console table with ebony stain finish in a hallway with art above'
},
{
  id: 12,
  name: 'Kova Outdoor Chair',
  category: 'Hospitality',
  material: 'Teak',
  finish: 'Weathered Grey',
  dimensions: 'W60 × D65 × H88 cm',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_183ae3748-1772218503423.png",
  alt: 'Teak outdoor chair with weathered grey finish on a stone terrace overlooking a garden',
  tag: 'Hospitality'
}];


const CATEGORIES = ['All', 'Dining', 'Living', 'Storage', 'Bedroom', 'Hospitality'];

export default function PrivateCatalogue() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [enquiredId, setEnquiredId] = useState<number | null>(null);
  const handleSignOut = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/collections/private');
};

  const WHATSAPP_NUMBER = '919352187266';

const handleEnquire = (product: Product) => {
    const text = encodeURIComponent(
      `Hi, I'm enquiring about "${product.name}" from the private catalogue.\n` +
      `Category: ${product.category}\nMaterial: ${product.material}\nFinish: ${product.finish}\nDimensions: ${product.dimensions}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
    setEnquiredId(product.id);
};

  const filtered =
  activeCategory === 'All' ?
  PRIVATE_PRODUCTS :
  PRIVATE_PRODUCTS.filter((p) => p.category === activeCategory);


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-8xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-3">
            <AppLogo size={28} />
            <span className="font-sans font-semibold text-xs tracking-[0.15em] uppercase text-foreground">
              Vardhman Impex
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-accent tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Private Access
            </span>
            <span className="hidden sm:block text-border mx-3">|</span>
            <button
              onClick={handleSignOut}
              className="text-xs font-mono text-muted-foreground tracking-widest uppercase hover:text-foreground transition-colors">
              
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page intro */}
      <section className="py-16 lg:py-20 border-b border-border">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <p className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">
            Private Catalogue — Trade Buyers Only
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h1 className="font-serif text-section-xl font-light text-foreground">
              The Complete<br />
              <span className="italic text-muted-foreground">Collection</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm lg:text-right leading-relaxed">
              1,000+ designs across dining, living, storage, bedroom, and hospitality. All available for OEM, private label, and container programmes.
            </p>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <div className="sticky top-[64px] lg:top-[80px] z-40 bg-background border-b border-border">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-4">
            {CATEGORIES.map((cat) =>
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all ${
              activeCategory === cat ?
              'bg-primary text-primary-foreground' :
              'text-muted-foreground hover:text-foreground border border-transparent hover:border-border'}`
              }>
              
                {cat}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((product) =>
            <article key={product.id} className="group">
                {/* Image */}
                <div className="relative overflow-hidden bg-secondary aspect-[4/5] mb-4">
                  {product.tag &&
                <span className="absolute top-3 left-3 z-10 px-2 py-1 bg-background text-xs font-mono text-foreground tracking-widest uppercase">
                      {product.tag}
                    </span>
                }
                  <img
                  src={product.image}
                  alt={product.alt}
                  className="w-full h-full object-cover collection-card-img" />
                
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-background/95">
                    <button
                    onClick={() => setEnquiredId(product.id)}
                    className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-mono tracking-widest uppercase btn-lift">
                    
                      {enquiredId === product.id ? '✓ Enquiry sent' : 'Enquire'}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg font-light text-foreground leading-tight">
                      {product.name}
                    </h3>
                    <span className="flex-shrink-0 text-xs font-mono text-muted-foreground tracking-widest uppercase mt-0.5">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{product.material} · {product.finish}</p>
                  <p className="text-xs font-mono text-muted-foreground/70">{product.dimensions}</p>
                </div>
              </article>
            )}
          </div>

          {/* Load more hint */}
          <div className="mt-16 pt-12 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filtered.length} of 1,000+ designs in this category.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-xs font-medium tracking-[0.12em] uppercase btn-lift">
              
              Request Full Catalogue PDF
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 lg:px-12 py-8">
        <div className="max-w-8xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © Vardhman Impex. This catalogue is confidential and for trade buyers only.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="text-xs font-mono text-muted-foreground tracking-widest uppercase hover:text-foreground transition-colors">
              Contact
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs font-mono text-muted-foreground tracking-widest uppercase hover:text-foreground transition-colors">
              
              Sign out
            </button>
          </div>
        </div>
      </footer>
    </div>);

}
