'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
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
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
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
          <Link href="/" className="flex items-center gap-3 shrink-0 group py-2">
            <AppLogo size={30} />
            <span className="font-serif text-[1.15rem] lg:text-[1.35rem] leading-none tracking-tight">
              Vardhman Impex
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
                  className={`text-manifest link-draw tap transition-colors duration-fast ease-out ${
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
              className="hidden xl:block text-manifest-sm text-muted hover:text-ink transition-colors duration-fast ease-out numeral tap"
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
              className="lg:hidden flex flex-col justify-center gap-[5px] w-10 h-10 items-center -mr-2 tap"
            >
              <span
                className={`block w-6 h-px bg-ink transition-transform duration-fast ease-out ${
                  menuOpen ? 'translate-y-[3px] rotate-45' : ''
                }`}
              />
              <span
                className={`block w-6 h-px bg-ink transition-transform duration-fast ease-out ${
                  menuOpen ? '-translate-y-[3px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/*
        `inert`, not `hidden`. `hidden` resolves to `display: none`, and a
        transition cannot start from a not-rendered before-change style — React
        flips the attribute and the opacity class in the same commit, so the fade,
        the row wipe and the stagger below were all skipped and the overlay hard-cut
        in both directions. `inert` keeps the element rendered while still taking
        the whole subtree out of the tab order and the accessibility tree, which is
        the part `hidden` was actually needed for. `pointer-events-none` stays as
        belt-and-braces for the transparent frames.
      */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
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
                className="group flex items-baseline gap-5 py-5 border-b border-line overflow-hidden"
              >
                <span className="text-manifest-sm text-muted numeral">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Wipes up from behind its own row. Delays reset to 0 on close:
                    opening is a reveal, dismissing must feel instant. */}
                <span
                  className={`font-serif text-display-sm font-light group-hover:text-clay transition-[color,transform] duration-base ease-out ${
                    menuOpen ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  style={{ transitionDelay: menuOpen ? `${80 + i * 40}ms` : '0ms' }}
                >
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
