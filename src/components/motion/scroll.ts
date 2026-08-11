import type Lenis from 'lenis';

/**
 * Module-level handle on the Lenis instance.
 *
 * Lenis drives scrolling itself, so `document.body.style.overflow = 'hidden'`
 * no longer stops the page — the mobile menu has to stop Lenis directly.
 */
let instance: Lenis | null = null;

export function registerLenis(next: Lenis | null): void {
  instance = next;
}

export function lockScroll(locked: boolean): void {
  if (!instance) return;
  if (locked) instance.stop();
  else instance.start();
}

/** Smooth-scrolls to a same-page target. Falls back to native behaviour. */
export function scrollToTarget(target: string): void {
  if (instance) {
    instance.scrollTo(target, { offset: -80 });
    return;
  }
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}
