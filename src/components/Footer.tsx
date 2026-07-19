import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary">
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-0">
          {/* Left: Brand */}
          <div className="flex flex-col gap-6 max-w-xs">
            <div className="flex items-center gap-3">
              <AppLogo size={28} className="brightness-0 invert" />
              <span className="font-sans font-semibold text-sm tracking-[0.15em] uppercase text-primary-foreground">
                Vardhman Impex
              </span>
            </div>
            <p className="text-sm text-primary-foreground/50 leading-relaxed">
              Crafting export-grade furniture from Jodhpur, India since 2006.
            </p>
            <p className="text-xs text-primary-foreground/40 font-mono">
              G-769, Phase IV, Boranada Ind. Area<br />
              Jodhpur, Rajasthan 342005, India
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex flex-col sm:flex-row gap-12">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono uppercase tracking-widest text-primary-foreground/40">Navigate</span>
              <nav className="flex flex-col gap-3">
                {[
                  { label: 'Collections', href: '/collections' },
                  { label: 'About', href: '/#about' },
                  { label: 'Factory', href: '/#factory' },
                  { label: 'Contact', href: '/contact' },
                ]?.map((link) => (
                  <Link
                    key={link?.label}
                    href={link?.href}
                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-medium"
                  >
                    {link?.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono uppercase tracking-widest text-primary-foreground/40">Collections</span>
              <nav className="flex flex-col gap-3">
                {['Dining', 'Living', 'Storage', 'Bedroom', 'Hospitality']?.map((col) => (
                  <Link
                    key={col}
                    href="/collections"
                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-medium"
                  >
                    {col}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Right: Contact + Social */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-primary-foreground/40">Get in Touch</span>
              <a href="mailto:rishi@vardhman-impex.com" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                rishi@vardhman-impex.com
              </a>
              <a href="tel:+919352187266" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                +91 93521 87266
              </a>
            </div>
            <div className="flex gap-4">
              {['LinkedIn', 'Instagram']?.map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs font-medium uppercase tracking-widest text-primary-foreground/40 hover:text-primary-foreground transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-primary-foreground/30 font-mono">
            © 2026 Vardhman Impex. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}