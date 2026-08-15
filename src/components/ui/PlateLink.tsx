'use client';

import React, { useCallback, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * A link that carries its photograph across the navigation.
 *
 * Clicking a catalogue card morphs its plate into the plate at the top of the
 * page it opens: the photograph is continuous, so the two pages read as one
 * object being approached rather than two documents being swapped.
 *
 * Why this is hand-driven rather than `@view-transition { navigation: auto }`:
 * that rule only fires on a real document navigation, and the App Router does
 * soft navigations. Next 15.5 does expose `experimental.viewTransition`, but it
 * delegates to React's `<ViewTransition>`, which does not exist in the stable
 * React 19.0.3 this project is pinned to — moving the site to a React
 * experimental build to get a page transition would be a bad trade.
 *
 * Progressive enhancement, in three layers:
 *   1. No `startViewTransition` (Firefox today) — the click is not intercepted
 *      at all and `next/link` behaves exactly as it did before.
 *   2. Reduced motion — same, no transition is started.
 *   3. A navigation that stalls — the promise resolves on a timeout so the
 *      transition can never leave the page frozen mid-capture.
 */

/** Both sides of a morph share this one name. Never two on a page at once — see
 *  `claimPlate`, which clears every other before naming the clicked one. */
const ACTIVE = 'active';

interface PlateLinkProps extends Omit<React.ComponentProps<typeof Link>, 'onClick'> {
  children: React.ReactNode;
}

/**
 * Exactly one element may carry the shared name when the "old" snapshot is
 * taken, or the browser aborts the whole transition. Destination plates are
 * marked `active` server-side, so a page that is itself a destination (a product
 * page, which also lists related pieces) has to be neutralised before the card
 * that was clicked can claim the name.
 */
function claimPlate(link: HTMLElement) {
  document.querySelectorAll<HTMLElement>('[data-plate]').forEach((el) => {
    el.dataset.plate = 'idle';
  });
  const plate = link.querySelector<HTMLElement>('[data-plate]');
  if (plate) plate.dataset.plate = ACTIVE;
}

export default function PlateLink({ children, href, ...rest }: PlateLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const resolveRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const settle = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    resolveRef.current?.();
    resolveRef.current = null;
  }, []);

  /* The router gives no promise to await, so the pending flag is the signal that
     the destination has committed and the "new" snapshot can be taken. */
  useEffect(() => {
    if (!isPending) settle();
  }, [isPending, settle]);

  useEffect(() => () => settle(), [settle]);

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const modified =
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
      const supported = typeof document !== 'undefined' && 'startViewTransition' in document;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Any of these and the browser's own navigation is the right answer.
      if (modified || !supported || reduced) return;

      event.preventDefault();
      claimPlate(event.currentTarget);

      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            resolveRef.current = resolve;
            /* A stalled navigation must not hold the page under a frozen
               snapshot. 1.2s is far past a prerendered route and short enough
               that the fallback still reads as a page change. */
            timeoutRef.current = window.setTimeout(settle, 1200);
            startTransition(() => router.push(href.toString()));
          })
      );
    },
    [href, router, settle, startTransition]
  );

  return (
    <Link href={href} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
