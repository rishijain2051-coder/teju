'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { lockScroll } from '@/components/motion/scroll';
import { brand, nav } from '@/lib/site';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on route change, and lock the page behind the open overlay.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    // Lenis drives scrolling itself, so overflow alone will not hold the page.
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    lockScroll(menuOpen);
    return () => {
      document.body.style.overflow = '';
      lockScroll(false);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      {/* Opaque, not translucent: the masthead crosses a teal section and a
          near-black one, and a see-through bar made the nav unreadable on both. */}
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-paper transition-[border-color] duration-base ${
          scrolled ? 'border-b border-line' : 'border-b border-transparent'
        }`}
      >
        <div className="shell-wide flex items-center justify-between h-16 lg:h-20">
          {/* Masthead */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <AppLogo size={30} />
            <span className="font-serif text-[1.15rem] lg:text-[1.35rem] leading-none tracking-tight">
              Vardhman <span className="italic">Impex</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-9" aria-label="Primary">
            {nav.map((link) => {
              const active =
                link.href === '/collections'
                  ? pathname.startsWith('/collections')
                  : pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`text-manifest link-draw transition-colors duration-base ${
                    active ? 'text-clay' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5">
            <a
              href={`tel:${brand.phoneHref}`}
              className="hidden xl:block text-manifest-sm text-muted hover:text-ink transition-colors duration-base numeral"
            >
              {brand.phone}
            </a>
            {/* Wrapped rather than given `hidden` directly: `.btn` sets its own
                display, which lands in the same cascade layer as Tailwind's
                `hidden` and would win. */}
            <span className="hidden lg:block">
              <Link href="/contact" className="btn btn-solid !py-3 !px-6">
                Enquire
              </Link>
            </span>

            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden flex flex-col justify-center gap-[5px] w-10 h-10 items-center -mr-2"
            >
              <span
                className={`block w-6 h-px bg-ink transition-transform duration-base ease-out ${
                  menuOpen ? 'translate-y-[3px] rotate-45' : ''
                }`}
              />
              <span
                className={`block w-6 h-px bg-ink transition-transform duration-base ease-out ${
                  menuOpen ? '-translate-y-[3px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className={`fixed inset-0 z-40 bg-paper lg:hidden transition-opacity duration-base ease-out ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full pt-24 pb-10 px-gutter">
          <nav className="flex flex-col" aria-label="Mobile">
            {nav.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className="group flex items-baseline gap-5 py-5 border-b border-line"
              >
                <span className="text-manifest-sm text-muted numeral">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-serif text-display-sm font-light group-hover:text-clay transition-colors duration-base">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-10">
            <Link href="/contact" className="btn btn-solid w-full justify-center">
              Enquire now
            </Link>
            <div className="mt-8 flex flex-col gap-1.5">
              <a href={`tel:${brand.phoneHref}`} className="text-manifest-sm text-muted numeral">
                {brand.phone}
              </a>
              <a href={`mailto:${brand.email}`} className="text-manifest-sm text-muted">
                {brand.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
