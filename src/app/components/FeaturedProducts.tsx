'use client';

import React from 'react';
import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';
import PieceCard from '@/components/ui/PieceCard';
import SectionHead from '@/components/ui/SectionHead';
import { useReveal } from '@/components/ui/useReveal';
import { pieces } from '@/lib/site';

const SHOWN = 6;

export default function FeaturedProducts() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} id="pieces" className="py-20 lg:py-32 bg-paper-deep">
      <div className="shell">
        <SectionHead
          title={
            <>
              Selected <span className="italic">pieces</span>
            </>
          }
          href="/collections"
          linkLabel="Full catalogue"
        />

        <div
          data-reveal-group
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-12 lg:mt-16"
        >
          {pieces.slice(0, SHOWN).map((piece) => (
            <PieceCard key={piece.ref} piece={piece} />
          ))}
        </div>

        <div className="mt-14 sm:hidden rise">
          <Link href="/collections" className="btn btn-ghost w-full justify-center">
            Full catalogue
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
