'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Collections', href: '/collections' },
    { label: 'About', href: '/#about' },
    { label: 'Factory', href: '/#factory' },
    { label: 'Journal', href: '/#journal' },
    { label: 'Contact', href: '/contact' },
  ];

  const isTransparent = transparent && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isTransparent ? 'nav-transparent' : 'nav-solid'
        }`}
      >
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <AppLogo
                size={32}
                className={isTransparent ? 'brightness-0 invert' : ''}
              />
              <span
                className={`font-sans font-semibold text-sm tracking-[0.15em] uppercase transition-colors duration-500 ${
                  isTransparent ? 'text-white' : 'text-foreground'
                }`}
              >
                Vardhman Impex
              </span>
            </Link>

            {/* Desktop Nav — center */}
            <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs font-medium tracking-[0.12em] uppercase transition-colors duration-300 ${
                    isTransparent
                      ? 'text-white/80 hover:text-white' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              <button
                aria-label="Search"
                className={`hidden lg:flex items-center justify-center w-9 h-9 transition-colors ${
                  isTransparent ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>

              <Link
                href="/contact"
                className={`hidden lg:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-[0.1em] uppercase btn-lift transition-all duration-300 ${
                  isTransparent
                    ? 'bg-white text-foreground hover:bg-secondary'
                    : 'bg-primary text-primary-foreground hover:bg-accent'
                }`}
              >
                Enquire
              </Link>

              {/* Mobile hamburger */}
              <button
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen(!menuOpen)}
                className={`lg:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center transition-colors ${
                  isTransparent ? 'text-white' : 'text-foreground'
                }`}
              >
                <span
                  className={`block w-5 h-px transition-all duration-300 bg-current ${
                    menuOpen ? 'rotate-45 translate-y-[5px]' : ''
                  }`}
                />
                <span
                  className={`block w-5 h-px transition-all duration-300 bg-current ${
                    menuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block w-5 h-px transition-all duration-300 bg-current ${
                    menuOpen ? '-rotate-45 -translate-y-[5px]' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-background transition-all duration-500 lg:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full pt-24 pb-12 px-8">
          <nav className="flex flex-col gap-8 mt-8">
            {navLinks.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-serif text-section-xl font-light text-foreground hover:text-accent transition-colors"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase btn-lift"
            >
              Enquire Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}