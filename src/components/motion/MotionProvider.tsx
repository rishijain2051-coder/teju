'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Pulled from the dynamic imports so `gsap.utils.toArray<HTMLElement>()` keeps
// its generic; typing these as `any` silently disables it.
type Gsap = (typeof import('gsap'))['gsap'];
type ScrollTriggerStatic = (typeof import('gsap/ScrollTrigger'))['ScrollTrigger'];

interface GsapBundle {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerStatic;
}

/**
 * The motion layer: GSAP ScrollTrigger for scroll reveals and parallax.
 *
 * GSAP is dynamically imported so it stays out of the initial bundle, and it is
 * never fetched at all when the reader has asked for reduced motion — in that
 * case `useReveal`'s IntersectionObserver fallback keeps everything visible.
 *
 * Two effects, deliberately: the library loads once, but the triggers are rebuilt
 * on **every route change**. This component lives in the root layout, so it does
 * not remount between pages; when it built its triggers only once, a client-side
 * navigation left the new page's elements at `opacity: 0` with `.motion-js`
 * already set — so `useReveal` stood down and nothing revealed them. Navigating
 * to /contact and pressing Back left 43 of 52 elements invisible.
 */
export default function MotionProvider() {
  const pathname = usePathname();
  const bundle = useRef<GsapBundle | null>(null);
  const [ready, setReady] = useState(false);

  // ── Load GSAP once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;

    (async () => {
      try {
        const [gsapMod, stMod] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
        if (disposed) return;

        const gsap = (gsapMod.gsap ?? gsapMod.default) as Gsap;
        const ScrollTrigger = (stMod.ScrollTrigger ?? stMod.default) as ScrollTriggerStatic;
        gsap.registerPlugin(ScrollTrigger);

        bundle.current = { gsap, ScrollTrigger };

        // Hands the reveal transitions to GSAP. Scoped to `:not(.shown)` in CSS
        // so anything already revealed keeps its own transition.
        document.documentElement.classList.add('motion-js');
        setReady(true);
      } catch {
        // Motion is an enhancement; the observer fallback stands.
      }
    })();

    return () => {
      disposed = true;
    };
  }, []);

  // ── Rebuild triggers for the current route ────────────────────────────────
  useEffect(() => {
    if (!ready || !bundle.current) return;
    const { gsap, ScrollTrigger } = bundle.current;

    const ctx = gsap.context(() => {
      // Anything already revealed — the hero and page headings, which reveal
      // immediately so they are never blank — is left alone so it is never
      // animated twice.
      const fresh = (selector: string) =>
        gsap.utils.toArray<HTMLElement>(selector).filter((el) => !el.classList.contains('shown'));

      gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
        const items = gsap.utils
          .toArray<HTMLElement>(group.querySelectorAll('.rise'))
          .filter((el) => !el.classList.contains('shown'));
        if (items.length === 0) return;

        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: group, start: 'top 88%', once: true },
          onComplete: () => items.forEach((el) => el.classList.add('shown')),
        });
      });

      fresh('.rise:not([data-reveal-group] .rise)').forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 94%', once: true },
          onComplete: () => el.classList.add('shown'),
        });
      });

      fresh('.veil').forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 94%', once: true },
          onComplete: () => el.classList.add('shown'),
        });
      });

      /*
       * A wipe starts fully outside its clipping parent, so the parent is the
       * trigger — the child itself never intersects anything.
       *
       * `fromTo` with an explicit start, rather than `gsap.to({ yPercent: 0 })`:
       * the CSS start state is `translate3d(0, 105%, 0)`, which the browser
       * computes to pixels. GSAP therefore reads y=115.91px with yPercent=0, so
       * tweening yPercent to 0 moves nothing — while still writing an inline
       * transform that outranks `.wipe-inner.shown`. The text stayed pinned
       * 115.91px down its mask forever. Declaring the start state hands the
       * whole transform to GSAP.
       */
      fresh('.wipe-inner').forEach((el) => {
        gsap.fromTo(
          el,
          // Matches `.wipe-inner`'s CSS start offset. It clears the inner's own
          // height plus the descender allowance `.wipe` pads itself with; at the
          // old 105% the tails sat visible in that allowance on the first frame.
          { yPercent: 135, y: 0 },
          {
            yPercent: 0,
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: 'top 94%',
              once: true,
            },
            onComplete: () => el.classList.add('shown'),
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -5 },
          {
            yPercent: 5,
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

    // Images settle late and move every trigger position with them.
    const refresh = () => ScrollTrigger.refresh();
    const timer = window.setTimeout(refresh, 400);
    window.addEventListener('load', refresh);
    ScrollTrigger.refresh();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, [ready, pathname]);

  return null;
}
