'use client';

import { useEffect } from 'react';
import { registerLenis } from './scroll';

/**
 * The motion layer: Lenis for scrolling, GSAP ScrollTrigger for reveals and
 * parallax.
 *
 * Both libraries are dynamically imported so they stay out of the initial
 * bundle — nothing here is needed to render or read the page. If the import
 * fails, or the reader has asked for reduced motion, this does nothing at all
 * and `useReveal`'s IntersectionObserver fallback keeps the content visible.
 */
export default function MotionProvider() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;
    const teardown: Array<() => void> = [];

    (async () => {
      try {
        const [{ default: Lenis }, gsapMod, stMod] = await Promise.all([
          import('lenis'),
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        if (disposed) return;

        const gsap = gsapMod.gsap ?? gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
        gsap.registerPlugin(ScrollTrigger);

        // Hands the reveal transitions to GSAP and disables CSS smooth-scroll,
        // which fights Lenis.
        const root = document.documentElement;
        root.classList.add('motion-js');
        teardown.push(() => root.classList.remove('motion-js'));

        // ── Lenis ───────────────────────────────────────────────────────────
        const lenis = new Lenis({
          duration: 1.05,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.6,
        });
        registerLenis(lenis);

        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        teardown.push(() => {
          gsap.ticker.remove(tick);
          lenis.destroy();
          registerLenis(null);
        });

        // ── Reveals ─────────────────────────────────────────────────────────
        const ctx = gsap.context(() => {
          // Anything already revealed (the hero, which shows immediately) is
          // left alone so it is never animated twice.
          const fresh = (selector: string) =>
            gsap.utils
              .toArray<HTMLElement>(selector)
              .filter((el) => !el.classList.contains('shown'));

          gsap.utils
            .toArray<HTMLElement>('[data-reveal-group]')
            .forEach((group) => {
              const items = gsap.utils
                .toArray<HTMLElement>(group.querySelectorAll('.rise'))
                .filter((el) => !el.classList.contains('shown'));
              if (items.length === 0) return;

              gsap.to(items, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                stagger: 0.07,
                scrollTrigger: { trigger: group, start: 'top 85%', once: true },
                onComplete: () => items.forEach((el) => el.classList.add('shown')),
              });
            });

          fresh('.rise:not([data-reveal-group] .rise)').forEach((el) => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 92%', once: true },
              onComplete: () => el.classList.add('shown'),
            });
          });

          fresh('.veil').forEach((el) => {
            gsap.to(el, {
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 92%', once: true },
              onComplete: () => el.classList.add('shown'),
            });
          });

          // A wipe starts fully outside its clipping parent, so the parent is
          // the trigger — the child itself never intersects.
          fresh('.wipe-inner').forEach((el) => {
            gsap.to(el, {
              yPercent: 0,
              duration: 1.1,
              ease: 'power4.out',
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: 'top 92%',
                once: true,
              },
              onComplete: () => el.classList.add('shown'),
            });
          });

          // ── Parallax ──────────────────────────────────────────────────────
          gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
            gsap.fromTo(
              el,
              { yPercent: -6 },
              {
                yPercent: 6,
                ease: 'none',
                scrollTrigger: {
                  trigger: el.parentElement ?? el,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                },
              }
            );
          });
        });

        teardown.push(() => ctx.revert());

        // Images settle late and shift every trigger position with them.
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener('load', refresh);
        teardown.push(() => window.removeEventListener('load', refresh));
        ScrollTrigger.refresh();
      } catch {
        // Motion is an enhancement. The IntersectionObserver fallback stands.
      }
    })();

    return () => {
      disposed = true;
      teardown.forEach((fn) => fn());
    };
  }, []);

  return null;
}
