'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  sub: string;
}

const stats: StatItem[] = [
  { value: 18, suffix: '+', label: 'Years', sub: 'In business since 2006' },
  { value: 9000, suffix: '', label: 'Sq.Mt. Factory', sub: 'State-of-the-art facility, Jodhpur' },
  { value: 1000, suffix: '+', label: 'Designs', sub: 'In our full catalogue' },
  { value: 9, suffix: '+', label: 'Countries', sub: 'Active export destinations' },
  { value: 150, suffix: '+', label: 'Craftspeople', sub: 'Employed in-house' },
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [start, target, duration]);
  return count;
}

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(stat.value, 2000, started);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col justify-between p-8 lg:p-10 border-r border-primary-foreground/10 last:border-r-0 fade-up"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div>
        <p className="font-serif text-5xl lg:text-6xl font-light text-primary-foreground stat-counter">
          {count.toLocaleString()}{stat.suffix}
        </p>
        <p className="font-serif text-xl text-primary-foreground/70 mt-2">{stat.label}</p>
      </div>
      <p className="text-xs font-mono text-primary-foreground/40 tracking-widest uppercase mt-6">{stat.sub}</p>
    </div>
  );
}

export default function TrustSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-revealed'); });
      },
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-primary">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="mb-16">
          <p className="fade-up text-xs font-mono text-primary-foreground/40 tracking-[0.2em] uppercase mb-4">
            By The Numbers
          </p>
          <h2 className="fade-up font-serif text-section-xl font-light text-primary-foreground" style={{ transitionDelay: '100ms' }}>
            Built at scale.<br />
            <span className="italic text-primary-foreground/50">Delivered with care.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 border border-primary-foreground/10">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}