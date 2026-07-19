'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function ContactCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {if (e.isIntersecting) e.target.classList.add('is-revealed');});
      },
      { threshold: 0.2 }
    );
    sectionRef?.current?.querySelectorAll('.fade-up')?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-primary py-24 lg:py-40">
      {/* Background image */}
      <div className="absolute inset-0 opacity-20">
        <AppImage
          src="https://img.rocket.new/generatedImages/rocket_gen_img_129cc7bf0-1776264026770.png"
          alt="Factory floor, dim atmospheric lighting, craftsmen at work, dark shadows"
          fill
          sizes="100vw"
          className="object-cover" />
        
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/60" />

      <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl">
          <p className="fade-up text-xs font-mono text-primary-foreground/40 tracking-[0.2em] uppercase mb-6">
            Start a Conversation
          </p>
          <h2 className="fade-up font-serif text-section-xl font-light text-primary-foreground mb-8" style={{ transitionDelay: '150ms' }}>
            Let&apos;s build something<br />
            <span className="italic text-primary-foreground/60">together.</span>
          </h2>
          <p className="fade-up text-body-lg text-primary-foreground/60 mb-6 max-w-lg" style={{ transitionDelay: '250ms' }}>
            Whether you&apos;re a retailer, interior designer, or hospitality buyer — we&apos;re ready to discuss your requirements.
          </p>
          <p className="fade-up text-sm text-primary-foreground/40 mb-10 max-w-lg italic" style={{ transitionDelay: '300ms' }}>
            Looking for our complete collection of 1,000+ designs? Verified trade buyers receive exclusive catalogue access after a quick enquiry.
          </p>
          <div className="fade-up flex flex-col sm:flex-row gap-4" style={{ transitionDelay: '350ms' }}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-foreground text-xs font-medium tracking-[0.12em] uppercase btn-lift">
              
              Get in Touch
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-8 py-4 border border-primary-foreground/30 text-primary-foreground text-xs font-medium tracking-[0.12em] uppercase btn-lift hover:bg-primary-foreground/10 transition-colors">
              
              Browse Collections
            </Link>
          </div>
        </div>
      </div>
    </section>);

}