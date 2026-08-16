import type { CSSProperties } from 'react';

/**
 * A stagger step for a first-viewport entrance.
 *
 * Above the fold the entrance is a CSS animation that starts at first paint;
 * below it, the same element is a transition switched on by a `shown` class when
 * it scrolls into view. Both read `--reveal-delay`, so one number in the markup
 * drives whichever path runs and the cadence can never mean two different things.
 *
 * See `.reveal-now` and the `vi-rise` / `vi-veil` / `vi-wipe` keyframes in
 * `src/styles/tailwind.css`.
 *
 * Deliberately not exported from `useReveal` — that module is `'use client'`, and
 * the server components that set these delays could not call across the boundary.
 */
export const delay = (ms: number): CSSProperties =>
  ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;
