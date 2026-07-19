'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const slides = [
{
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_169e3ead9-1772203363221.png",
  alt: 'Warm-lit European dining room, dark oak table, linen chairs, afternoon sunlight streaming through tall windows'
},
{
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_1e37f53ab-1772064545604.png",
  alt: 'Minimal Scandinavian living room, pale wood sideboard, soft grey sofa, floor-to-ceiling windows, overcast daylight'
},
{
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_177447d41-1776988137586.png",
  alt: 'Contemporary bedroom with dark walnut bed frame, white linen, bedside tables, warm ambient lighting'
}];


const heroStats = [
{ value: '18+', label: 'Years Experience' },
{ value: '9,000', label: 'Sq.Mt. Factory' },
{ value: 'Low', label: 'MOQ' }];


export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [titleRevealed, setTitleRevealed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTitleRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden grain-overlay">
      {/* Carousel */}
      {slides.map((slide, i) =>
      <div key={i} className={`carousel-slide-item ${i === currentSlide ? 'active' : ''}`}>
          <AppImage
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover ken-burns ${i === currentSlide ? 'active' : ''}`}
          unoptimized={false} />
        
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center items-center min-h-screen px-6 lg:px-12 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow */}
          <div
            className={`reveal-mask mb-8 ${titleRevealed ? 'is-revealed' : ''}`}
            style={{ transitionDelay: '0ms' }}>
            
            <p className="text-white/60 text-xs font-mono tracking-[0.25em] uppercase">
              Jodhpur, India · Est. 2006
            </p>
          </div>

          {/* Main headline */}
          <h1 className="font-serif text-hero-xl font-light text-white leading-none mb-6">
            <span className="reveal-mask block">
              <span
                className={`reveal-mask-inner block ${titleRevealed ? 'is-revealed' : ''}`}
                style={{ transitionDelay: '200ms' }}>
                
                Timeless Furniture.
              </span>
            </span>
            <span className="reveal-mask block">
              <span
                className={`reveal-mask-inner block italic text-white/80 ${titleRevealed ? 'is-revealed' : ''}`}
                style={{ transitionDelay: '400ms' }}>
                
                Crafted for
              </span>
            </span>
            <span className="reveal-mask block">
              <span
                className={`reveal-mask-inner block ${titleRevealed ? 'is-revealed' : ''}`}
                style={{ transitionDelay: '600ms' }}>
                
                Modern Spaces.
              </span>
            </span>
          </h1>

          {/* Sub */}
          <div
            className={`fade-up mb-12 ${titleRevealed ? 'is-revealed' : ''}`}
            style={{ transitionDelay: '900ms' }}>
            
            <p className="text-white/60 text-sm font-mono tracking-[0.15em] uppercase">
              Designed in India. Trusted by furniture retailers worldwide.
            </p>
          </div>

          {/* CTAs */}
          <div
            className={`fade-up flex flex-col sm:flex-row gap-4 justify-center ${titleRevealed ? 'is-revealed' : ''}`}
            style={{ transitionDelay: '1100ms' }}>
            
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-foreground text-xs font-medium tracking-[0.12em] uppercase btn-lift">
              
              Explore Collection
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/50 text-white text-xs font-medium tracking-[0.12em] uppercase btn-lift hover:bg-white/10 transition-colors">
              
              Become a Partner
            </Link>
          </div>
        </div>

        {/* Bottom stats */}
        <div
          className={`fade-up absolute bottom-10 left-0 right-0 px-6 lg:px-12 ${titleRevealed ? 'is-revealed' : ''}`}
          style={{ transitionDelay: '1300ms' }}>
          
          <div className="max-w-8xl mx-auto flex justify-between items-end">
            {heroStats.map((stat, i) =>
            <div key={i} className="text-center flex-1">
                <p className="font-serif text-3xl lg:text-4xl font-light text-white stat-counter">
                  {stat.value}
                </p>
                <p className="text-white/50 text-xs font-mono tracking-widest uppercase mt-1">
                  {stat.label}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/40">
            <div className="w-px h-12 bg-white/20 relative overflow-hidden">
              <div className="absolute top-0 w-full h-1/2 bg-white/60 animate-[scrollIndicator_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 right-8 z-20 flex gap-2">
        {slides.map((_, i) =>
        <button
          key={i}
          onClick={() => setCurrentSlide(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={`h-px transition-all duration-500 ${
          i === currentSlide ? 'w-8 bg-white' : 'w-4 bg-white/30'}`
          } />

        )}
      </div>
    </section>);

}