'use client';

import React, { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

export default function CollectionsHero() {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative pt-20 lg:pt-24 min-h-[60vh] flex items-end overflow-hidden bg-primary">
      <div className="absolute inset-0">
        <AppImage
          src="https://img.rocket.new/generatedImages/rocket_gen_img_1d0547363-1772225338301.png"
          alt="Warm editorial interior with dark wood sideboard, pale linen sofa, afternoon light through tall windows, dim moody shadows"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 w-full">
        <p
          className={`text-xs font-mono text-primary-foreground/40 tracking-[0.2em] uppercase mb-4 transition-all duration-1000 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`
          }>
          
          VardhmanImpex
        </p>
        <h1
          className={`font-serif text-hero-xl font-light text-primary-foreground transition-all duration-1000 delay-200 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`
          }>
          
          Our Collections.
        </h1>
        <p
          className={`text-body-lg text-primary-foreground/50 mt-4 max-w-xl transition-all duration-1000 delay-400 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`
          }>
          
          Five categories. Over 1,000 designs. Crafted in Jodhpur, shipped worldwide.
        </p>
      </div>
    </section>);

}