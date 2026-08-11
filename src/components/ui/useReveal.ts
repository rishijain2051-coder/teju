'use client';

import { useEffect, useRef } from 'react';

const SELECTOR = '.rise, .wipe-inner, .veil, .drift';

interface RevealOptions {
  threshold?: number;
  /** Reveal immediately on mount instead of waiting to scroll into view. */
  immediate?: boolean;
}

/**
 * Reveals `.rise` / `.wipe-inner` / `.veil` / `.drift` descendants once they
 * scroll into view.
 *
 * Every section used to hand-roll its own IntersectionObserver — a dozen near
 * identical copies, none of which checked `prefers-reduced-motion`, so content
 * animated in regardless of the OS setting. This is the single implementation:
 * it unobserves after firing, and when reduced motion is requested it simply
 * shows everything on mount so nothing is ever stuck invisible.
 */
export function useReveal<T extends HTMLElement = HTMLElement>({
  threshold = 0.12,
  immediate = false,
}: RevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR));
    if (root.matches(SELECTOR)) targets.push(root);
    if (targets.length === 0) return;

    const show = (el: Element) => el.classList.add('shown');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || immediate) {
      // A task's delay lets the browser paint the pre-transition state first, so
      // this still reads as an entrance rather than a hard cut. Deliberately not
      // requestAnimationFrame: rAF never fires while a tab is backgrounded, which
      // would leave the hero blank until the tab was focused.
      const id = window.setTimeout(() => targets.forEach(show), 0);
      return () => window.clearTimeout(id);
    }

    /*
     * GSAP owns scroll reveals when the motion layer loads, but it arrives on a
     * dynamic import. Wait briefly: if `motion-js` appears, stand down; if the
     * import failed or was never reached, run the observer so content is still
     * guaranteed to appear.
     */
    let io: IntersectionObserver | null = null;
    const handoff = window.setTimeout(() => {
      if (document.documentElement.classList.contains('motion-js')) return;
      io = start();
    }, 400);

    return () => {
      window.clearTimeout(handoff);
      io?.disconnect();
    };

    function start(): IntersectionObserver {
      /*
       * A `.wipe-inner` starts translated 105% down, fully outside its
       * `overflow: hidden` parent. IntersectionObserver clips a target's rect
       * by its ancestors' overflow, so such an element reports zero
       * intersection forever and could never reveal itself. Watch the unclipped
       * parent and apply the class to the child.
       */
      const applyFor = new Map<Element, Element[]>();
      for (const el of targets) {
        const watch = el.classList.contains('wipe-inner') ? el.parentElement ?? el : el;
        const list = applyFor.get(watch);
        if (list) list.push(el);
        else applyFor.set(watch, [el]);
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            applyFor.get(entry.target)?.forEach(show);
            observer.unobserve(entry.target);
          }
        },
        { threshold, rootMargin: '0px 0px -8% 0px' }
      );

      applyFor.forEach((_, watch) => observer.observe(watch));
      return observer;
    }
  }, [threshold, immediate]);

  return ref;
}
