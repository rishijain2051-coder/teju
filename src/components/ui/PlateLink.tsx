'use client';

import React, { useCallback } from 'react';

/**
 * A link that carries its photograph across the navigation.
 *
 * Clicking a catalogue card morphs its plate into the plate at the top of the
 * page it opens, so the photograph is continuous and the two pages read as one
 * object being approached rather than two documents being swapped.
 *
 * This is a plain anchor on purpose, and the transition is the browser's.
 *
 * The first build of this drove `document.startViewTransition` by hand around
 * `router.push`, because `@view-transition { navigation: auto }` only fires on a
 * real document navigation and the App Router soft-navigates. It worked, and it
 * was slow in a way no amount of easing could fix: `startViewTransition` holds
 * the page on the outgoing snapshot until the new DOM exists, and the same
 * navigation that takes ~30ms on its own took ~870ms inside that hold. The
 * scheduler was not starved — a frozen document runs *more* timer callbacks, not
 * fewer — so there was nothing to tune. Measured against it, a full document
 * navigation to these prerendered pages is 26ms to DOMContentLoaded and 39ms to
 * load, and the browser runs the morph itself with no promise to resolve, no
 * timeout to guard, and no frozen frame at all.
 *
 * So the client-side router is given up for these five links, and the platform
 * does the work. Everything else on the site still soft-navigates through
 * `next/link`; `navigation: auto` only applies to real document loads, so those
 * are untouched.
 *
 * Two things elsewhere finish the job. `COMPOSE_FIRST_FOLD` in the root layout
 * marks the destination's opening copy as revealed before the incoming snapshot
 * is taken, so the photograph lands on a written page rather than an empty one
 * that then fades its own text in — the same double-entrance defect the plate
 * itself had. And speculation rules there prefetch these targets on hover, which
 * is invisible on localhost and is most of the wait on a real connection.
 *
 * Degrades in one step: a browser without cross-document view transitions
 * (Firefox today) simply navigates, which is what it did before any of this.
 * Reduced motion is handled in CSS, where the transition's animations are
 * switched off but the navigation still happens.
 */

interface PlateLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export default function PlateLink({ children, href, onClick, ...rest }: PlateLinkProps) {
  /*
   * Exactly one element may carry the shared name when the outgoing snapshot is
   * taken, or the browser abandons the transition. Destination plates are marked
   * `active` server-side, so a page that is itself a destination — a product page,
   * which also lists related pieces — already has one named before you click a
   * card. Clear them all, then name the one being opened.
   */
  const claim = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      /*
       * Only for a click that actually navigates this document. A middle-click or
       * a Cmd/Ctrl/Shift click opens the target somewhere else and leaves this page
       * exactly where it was — but the handler still ran, so it cleared the marker
       * off the real destination plate and named a card that is not going anywhere.
       * On a product page, which is itself a morph destination *and* lists related
       * pieces, opening a related design in a new tab quietly stripped the shared
       * name from the plate at the top of the page you were still reading.
       */
      const elsewhere =
        event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (!elsewhere) {
        document.querySelectorAll<HTMLElement>('[data-plate]').forEach((el) => {
          el.dataset.plate = 'idle';
        });
        const plate = event.currentTarget.querySelector<HTMLElement>('[data-plate]');
        if (plate) plate.dataset.plate = 'active';
      }
      onClick?.(event);
    },
    [onClick]
  );

  /* `data-morph` is what the speculation rules in the root layout match on, so
     the destination is fetched on hover rather than on click. */
  return (
    <a href={href} data-morph="" onClick={claim} {...rest}>
      {children}
    </a>
  );
}
