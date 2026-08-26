import React from 'react';
import Link from 'next/link';
import Wordmark from '@/components/ui/Wordmark';
import { brand, collections, facts, nav } from '@/lib/site';

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-paper border-t border-line-strong">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 lg:gap-8 lg:grid-cols-12">
          {/* Colophon */}
          <div className="lg:col-span-4">
            <Wordmark />
            <p className="text-body text-muted mt-5 max-w-[34ch]">
              Furniture manufacturer and exporter. Solid mango and reclaimed timber, made at
              Boranada since {brand.established}.
            </p>
            <address className="text-manifest-sm text-muted mt-6 not-italic leading-relaxed">
              {brand.address.line1}
              <br />
              {brand.address.line2}
              <br />
              {brand.address.country}
            </address>
          </div>

          {/* Footer links use padding rather than the .tap hit-area trick: they
              stack vertically, so expanding outward would overlap neighbours. */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h2 className="text-manifest-sm text-muted pb-3 border-b border-line">Navigate</h2>
            <ul className="mt-2 flex flex-col">
              {nav.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-body text-ink-soft hover:text-clay transition-colors duration-fast ease-out py-2 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-manifest-sm text-muted pb-3 border-b border-line">Collections</h2>
            <ul className="mt-2 flex flex-col">
              {collections.map((collection) => (
                <li key={collection.name}>
                  <Link
                    href={collection.href}
                    className="text-body text-ink-soft hover:text-clay transition-colors duration-fast ease-out py-2 inline-block"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-manifest-sm text-muted pb-3 border-b border-line">Enquiries</h2>
            <ul className="mt-2 flex flex-col">
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="text-body text-ink-soft hover:text-clay transition-colors duration-fast ease-out break-all py-2 inline-block"
                >
                  {brand.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${brand.phoneHref}`}
                  className="text-body text-ink-soft hover:text-clay transition-colors duration-fast ease-out numeral py-2 inline-block"
                >
                  {brand.phone}
                </a>
              </li>
            </ul>
            <Link href="/contact" className="btn btn-ghost mt-6 !py-3 !px-5">
              Enquire
            </Link>
          </div>
        </div>

        {/* Manifest footer line */}
        <div className="mt-14 pt-6 border-t border-line flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-5">
          {/* The privacy link belongs on the colophon line rather than in the
              Navigate column: it is a legal notice, not a place to go, and putting
              it beside the nav would give it the same weight as the collections.
              `.tap` for the hit area — this line is the smallest type on the page,
              and there is nothing above or below for the outward area to overlap. */}
          <p className="text-manifest-sm text-muted flex items-center gap-3">
            <span>
              © {YEAR} {brand.name}
            </span>
            <span aria-hidden="true">·</span>
            <Link
              href="/privacy"
              className="tap hover:text-ink transition-colors duration-fast ease-out"
            >
              Privacy
            </Link>
          </p>
          <p className="text-manifest-sm text-muted numeral">
            {brand.origin}, {brand.country} · Est. {brand.established} · {facts.countries}+ export
            markets
          </p>
        </div>
      </div>
    </footer>
  );
}
