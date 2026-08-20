import React from 'react';

interface ArrowProps {
  className?: string;
  /**
   * Rendered edge in px. Read the note on the stroke below before changing it:
   * the weight was chosen against 13 rather than derived from it.
   */
  size?: number;
  /**
   * The one arrow on the site that points the other way — the way back off the
   * private-collections gate.
   *
   * Rotated with an inline transform rather than a `rotate-180` utility, and the
   * distinction is load-bearing. `.link-arrow:hover svg` sets
   * `transform: translate3d(0.25rem, 0, 0)`, and a utility class loses that
   * cascade: the back arrow would swing round to point forward on hover. An
   * inline style outranks the stylesheet, so the rotation holds and the nudge is
   * simply forfeited — which is the behaviour this link has always had.
   */
  back?: boolean;
}

/**
 * The arrow that trails a forward-moving label: buttons, section links, the
 * affordance on a card.
 *
 * There were twenty-three hand-cut copies of this markup, which is twenty-three
 * chances for the stroke weight, the box or the viewBox to drift apart — and the
 * site's icon rule is one stroke, one weight, everywhere. This is the kind of
 * drift that never shows up while you are making it: it shows up later, when two
 * of them land in the same fold and one reads a hair heavier than its neighbour.
 *
 * `strokeWidth` 1.75 at 13px is the established pair. The weight was set against
 * that box by eye, so `size` does not scale it — push the box much past 13 and
 * the same 1.75 starts to read wiry, pull it below and it reads drawn-on.
 *
 * `aria-hidden` is unconditional, and not a default worth exposing. This arrow
 * never travels alone; there is always a text label beside it already saying
 * where the link goes, so naming the arrow too would only add "graphic" to a
 * label that was complete without it.
 */
export default function Arrow({ className, size = 13, back = false }: ArrowProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      className={className}
      style={back ? { transform: 'rotate(180deg)' } : undefined}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
