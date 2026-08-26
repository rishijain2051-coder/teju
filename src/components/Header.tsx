'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Wordmark from '@/components/ui/Wordmark';
import { brand, nav } from '@/lib/site';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Shared by both navs. The mobile panel had no `aria-current` at all, so the
     page a reader was on was announced identically to the five they were not —
     on the surface where the whole navigation is that panel. */
  const isCurrent = (href: string) =>
    href === '/collections' ? pathname.startsWith('/collections') : pathname === href;

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

  /*
   * Focus containment.
   *
   * The panel already behaves as a modal in every respect but one: it covers the
   * viewport opaquely, locks body scroll, and closes on Escape. What it did not do
   * was hold focus — `inert` takes the panel out of the tab order while it is
   * closed, but nothing took the page *behind* it out while it is open. Tabbing
   * past the last nav link walked into a document nobody can see, with the focus
   * ring somewhere off-panel.
   *
   * The ring is [toggle, ...panel] rather than the panel alone, because the control
   * that closes this lives in the header, outside it — trap the panel by itself and
   * the close button becomes unreachable by keyboard. In DOM order the toggle comes
   * first, so this is also the order a reader would tab through anyway; the only
   * thing added is the wrap at each end.
   *
   * Focus returns to the toggle on close, and only if it would otherwise be lost:
   * on a route change React closes the menu while focus is still on the link that
   * caused it, which `inert` then drops to `<body>`.
   */
  useEffect(() => {
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!menuOpen || !panel || !toggle) return;

    const focusables = () => [
      toggle,
      ...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ];

    focusables()[1]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const ring = focusables();
      const at = ring.indexOf(document.activeElement as HTMLElement);
      if (at === -1) return;
      const next = e.shiftKey ? at - 1 : at + 1;
      if (next < 0 || next >= ring.length) {
        e.preventDefault();
        ring[e.shiftKey ? ring.length - 1 : 0].focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const active = document.activeElement;
      if (active === document.body || active === null || panel.contains(active)) toggle.focus();
    };
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
          <Link href="/" className="flex items-center shrink-0 group py-2">
            <Wordmark />
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-9" aria-label="Primary">
            {nav.map((link) => {
              const active = isCurrent(link.href);
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
              ref={toggleRef}
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
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
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
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
                aria-current={isCurrent(link.href) ? 'page' : undefined}
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
            {/* `py-2`, not `.tap`: these two stack, and the outward hit area would
                have them overlapping. At 12px the line box is 18px, which is under
                the 24px minimum on the one surface where the whole navigation is
                thumb-driven — and with `gap-1.5` between them, six pixels apart.
                Padding lifts each to 34px and keeps them separate, which is what
                the footer's link columns already do for the same reason. */}
            <div className="mt-6 flex flex-col">
              <a
                href={`tel:${brand.phoneHref}`}
                className="text-manifest-sm text-muted numeral py-2 press"
              >
                {brand.phone}
              </a>
              <a href={`mailto:${brand.email}`} className="text-manifest-sm text-muted py-2 press">
                {brand.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
