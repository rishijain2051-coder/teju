# 011 — Reset transition and animation delays under reduced motion

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: **HIGH**
- **Category**: Accessibility
- **Estimated scope**: 1 file, 2 lines

## Problem

The reduced-motion block collapses durations but never resets the delays, so every
hand-authored stagger is still honoured in full — at `opacity: 0`.

```css
/* src/styles/tailwind.css:133-144 — current */
  /* Honour the OS setting. The previous build animated regardless. */
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
```

`0.01ms` is a *nonzero* duration, so a transition is still generated and its
`transition-delay` still applies. Under reduced motion `useReveal` marks every
target `.shown` on a `setTimeout(…, 0)` (`src/components/ui/useReveal.ts:44-50`)
and GSAP is never fetched at all (`src/components/motion/MotionProvider.tsx:37`),
so the CSS path is the only path. Each element therefore waits out its inline
delay while invisible, then snaps in over 0.01ms.

There are **30 inline `transitionDelay` declarations across 9 files**. The home
page hero alone is seven of them:

```jsx
/* src/app/components/HeroSection.tsx:30, 39, 44, 49, 57, 66, 91 — current */
<p className="text-manifest text-clay veil" style={{ transitionDelay: '80ms' }}>
<span className="wipe-inner" style={{ transitionDelay: '160ms' }}>Raw</span>
<span className="wipe-inner" style={{ transitionDelay: '260ms' }}>Real</span>
<span className="wipe-inner italic text-clay" style={{ transitionDelay: '360ms' }}>Remarkable</span>
<p className="text-lead … rise" style={{ transitionDelay: '520ms' }}>
<div className="flex flex-wrap gap-3 mt-7 lg:mt-8 rise" style={{ transitionDelay: '640ms' }}>
<div className="hidden lg:flex items-center gap-5 mt-8 rise" style={{ transitionDelay: '760ms' }}>
```

So a reader who has asked their OS for *less* motion gets **seven discrete hard
pops spread over 760ms** instead of a page that simply appears. It is worse than
the animated version, which at least moves continuously.

The `.wipe-inner` cases are the most serious. `.wipe` sets `overflow: hidden` and
`.wipe-inner` starts at `translate3d(0, 135%, 0)` (`src/styles/tailwind.css:360-384`),
so the three words of the `<h1>` are **clipped completely out of view** — not
faded, absent — for 160ms, 260ms and 360ms respectively.

`src/components/ui/PageHeader.tsx:30, 39, 46, 54` carries four more, and
`PageHeader` renders on every route that has one, so this affects the whole site.
`src/app/collections/[collection]/page.tsx:88` is unbounded — `${i * 90}ms` over a
collection story, so a six-paragraph story delays its last line 450ms.

## Target

Add the two missing longhands to the block that already exists. Nothing else in
the file changes.

```css
/* target — src/styles/tailwind.css */
  /*
   * Honour the OS setting. The previous build animated regardless.
   *
   * The delays are reset alongside the durations, not left to run. `0.01ms` is a
   * nonzero duration, so a transition is still generated and its delay is still
   * honoured — which meant a reduced-motion reader waited out the full authored
   * stagger at `opacity: 0` and then got a hard pop. On the hero that was seven
   * pops over 760ms, and the `.wipe-inner` words sat clipped entirely outside
   * their mask while they waited. Zeroing the delay is what turns "no animation"
   * into an instant paint rather than a slow flicker.
   */
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      transition-delay: 0s !important;
      scroll-behavior: auto !important;
    }
  }
```

## Repo conventions to follow

- Motion tokens and every utility live in `src/styles/tailwind.css`. This block is
  in `@layer base` and is the single global reduced-motion reset; keep it there
  rather than adding a second one.
- The file documents *why* a rule exists, in prose, above the rule. Match that —
  the comment above is written to that standard and should be used as given.
- Targeted reduced-motion overrides that need `animation: none` or
  `transform: none` live beside the utility they modify, e.g.
  `src/styles/tailwind.css:342-346` (`.filter-swap`), `:525-529` (`.btn:active`),
  `:658-663` (`.marquee-track`). Do not add anything of that kind in this plan.

## Steps

1. In `src/styles/tailwind.css`, replace the comment on line 133 and the
   `@media (prefers-reduced-motion: reduce)` block on lines 134-144 with the
   **Target** block above, verbatim.
2. Nothing else. Do not touch any inline `transitionDelay` in any component — the
   delays are correct on the normal path and this plan only stops them applying
   when the reader has asked for reduced motion. (Plan 021 removes the *inert*
   subset of them for a different reason.)

## Boundaries

- Do NOT touch any `.tsx` file.
- Do NOT remove or change the existing `animation-duration`,
  `animation-iteration-count`, `transition-duration` or `scroll-behavior` lines —
  only add the two new longhands.
- Do NOT change `0.01ms` to `0s`. A truly zero duration suppresses `transitionend`
  events; the `0.01ms` idiom is deliberate and is what the rest of the ecosystem
  uses.
- Do NOT add `transform: none` or try to preserve opacity fades here. Keeping the
  colour and opacity cues under reduced motion is a separate, more debatable
  change — that is plan 027.
- Do NOT add new dependencies.
- If the block does not look like the **Problem** excerpt (drift since `82fdc65`),
  STOP and report instead of improvising.

## Verification

- **Mechanical**:
  - `npm run lint` — exits 0. `src/styles/tailwind.css` is not in
    `.eslintrc.json`'s `ignorePatterns`, so a malformed rule will be caught.
  - `npm run build` — exits 0, 46 routes.
  - `grep -c 'delay: 0s !important' src/styles/tailwind.css` returns `2`.
- **Feel check**: run `npm run dev`, open `http://localhost:4028`, then in Chrome
  DevTools → ⋮ → More tools → Rendering, set **Emulate CSS media feature
  prefers-reduced-motion** to `reduce`, and hard-reload.
  - The hero must paint **complete in one frame** — eyebrow, all three headline
    words, lead paragraph, both buttons and the plate index together. Before this
    change they arrive as seven separate pops.
  - Specifically confirm "Raw", "Real" and "Remarkable" are all present in the
    first painted frame. Previously they were clipped outside their masks for up
    to 360ms.
  - Navigate to `/craft` and `/factory` (both use `PageHeader`) and confirm the
    same: no visible cascade.
  - Turn the emulation back **off** and reload: the normal 80/160/260/360/520/640/760ms
    cadence must be unchanged. This plan must not alter the default experience.
- **Done when**: with `prefers-reduced-motion: reduce` emulated, no element on the
  home page or any `PageHeader` route appears later than the frame the page paints
  in, and with emulation off the hero cadence is byte-identical to before.
