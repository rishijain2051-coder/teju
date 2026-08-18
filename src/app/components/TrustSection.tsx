'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useReveal } from '@/components/ui/useReveal';
import { stats } from '@/lib/site';

/** Matches the hero's prose links: underlined at rest, so colour is never the signal. */
const PROSE_LINK =
  'text-ink underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-clay hover:text-clay transition-colors duration-fast ease-out';

/**
 * Counts up once the tile is in view. Under reduced motion it simply presents
 * the final figure — the previous implementation animated regardless, and also
 * left a requestAnimationFrame loop running after unmount.
 */
function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      setValue(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function Stat({ stat }: { stat: (typeof stats)[number] }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const value = useCountUp(stat.value, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col justify-between py-8 lg:py-10 border-t border-line rise"
    >
      <p className="font-serif text-display-sm font-light numeral leading-none">
        {value.toLocaleString('en-IN')}
        <span className="text-clay">{stat.suffix}</span>
      </p>
      <div className="mt-6">
        <p className="text-manifest text-ink">{stat.label}</p>
        <p className="text-body text-muted mt-1.5">{stat.detail}</p>
      </div>
    </div>
  );
}

export default function TrustSection() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="py-20 lg:py-32">
      <div className="shell">
        <header className="flex items-baseline gap-5 rise">
          <h2 className="font-serif text-display font-light">
            By the <span className="italic">numbers</span>
          </h2>
        </header>

        <div
          data-reveal-group
          className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 lg:gap-x-8 mt-12 lg:mt-16"
        >
          {stats.map((stat) => (
            <Stat key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Figures are a claim; this is where a buyer goes to test it. Prose in a
            section footer rather than another row of buttons — the page already
            asks twice above this point and once below it. */}
        <p className="text-body text-muted max-w-measure mt-12 lg:mt-16 rise">
          Every one of those figures is somewhere you can check. The{' '}
          <Link href="/craft" className={PROSE_LINK}>
            eight stages a piece passes through
          </Link>{' '}
          are set out one by one, the{' '}
          <Link href="/factory" className={PROSE_LINK}>
            floor they run on
          </Link>{' '}
          is mapped with its order timeline and export terms, and the{' '}
          <Link href="/journal" className={PROSE_LINK}>
            journal
          </Link>{' '}
          keeps notes on what the order book is actually saying.
        </p>
      </div>
    </section>
  );
}
