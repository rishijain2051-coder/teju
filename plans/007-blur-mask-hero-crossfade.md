# 007 — Blur-mask the hero plate crossfade

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: LOW
- **Category**: Cohesion
- **Estimated scope**: 1 file, tiny

## Problem

The hero rotates three stacked photographs with a plain opacity crossfade:

```tsx
// src/app/components/HeroSection.tsx:108 — current
<div
  key={plate}
  aria-hidden={i !== active}
  className="absolute inset-0 transition-opacity duration-[1400ms] ease-out-soft"
  style={{ opacity: i === active ? 1 : 0 }}
>
```

For 1400ms, two different interiors are composited on top of each other at
partial opacity. Because both are detailed photographs — furniture edges, window
frames, rug patterns — the midpoint reads as a visible double exposure rather
than as one image becoming another.

## Target

Add a small blur to the outgoing and incoming layers during the transition. Blur
destroys the high-frequency detail that makes the overlap legible as two
pictures, so the crossfade reads as a dissolve:

```tsx
/* target — src/app/components/HeroSection.tsx */
<div
  key={plate}
  aria-hidden={i !== active}
  className="absolute inset-0 transition-[opacity,filter] duration-[1400ms] ease-out-soft"
  style={{
    opacity: i === active ? 1 : 0,
    filter: i === active ? 'blur(0px)' : 'blur(4px)',
  }}
>
```

4px is deliberately well under the 20px ceiling for transition-time blur — this
runs on a full-bleed image and heavy blur is expensive, especially in Safari.
`blur(0px)` rather than `none` is required: `filter` cannot interpolate between
the keyword `none` and a function, so `none` would make it snap.

## Repo conventions to follow

- Explicit transition property lists are the house style; exemplar
  `transition-[border-color]` at `src/components/Header.tsx:60`.
- The plate opacity is already driven by inline `style` from React state; keep
  `filter` in the same object rather than introducing a class.
- Reduced motion needs no special handling here: the global rule at
  `src/styles/tailwind.css:127` collapses transition duration, so the plate swap
  becomes an instant cut, which is the correct reduced-motion behaviour.

## Steps

1. In `src/app/components/HeroSection.tsx`, on the plate wrapper `<div>` at line
   108, change `transition-opacity` to `transition-[opacity,filter]`.
2. Extend the inline `style` object with
   `filter: i === active ? 'blur(0px)' : 'blur(4px)'`.
3. Change nothing else — in particular leave the `AppImage` child and its
   `drift` class alone.

## Boundaries

- Do NOT increase the blur beyond 4px.
- Do NOT change the 1400ms duration; a slow ambient hero crossfade is deliberate
  and is exempt from the sub-300ms UI budget.
- Do NOT apply blur to the `AppImage` itself — it must sit on the wrapper so the
  blur and the opacity animate together on one layer.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0.
- **Feel check**: load `/` and watch one full plate change (7s interval), or
  click between indicators:
  - At the midpoint the frame should read as one soft image, not two sharp images
    overlaid. Compare by temporarily setting the blur to `blur(0px)` on both
    branches to see the double exposure it replaces.
  - The incoming plate must arrive fully sharp — confirm no residual blur once
    settled (`filter: blur(0px)` in computed styles for the active plate).
  - In DevTools → Performance, record a plate change and confirm no dropped
    frames from the blur. If frames drop on a low-end device profile, reduce to
    2px rather than removing.
- **Done when**: the active plate computes to `blur(0px)`, inactive plates to
  `blur(4px)`, and the midpoint of a crossfade no longer shows two distinguishable
  photographs.
