'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReveal } from '@/components/ui/useReveal';
import { stats } from '@/lib/site';

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
      </div>
    </section>
  );
}
