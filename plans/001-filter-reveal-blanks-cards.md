# 001 — Stop category filtering from hiding cards permanently

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: HIGH
- **Category**: Interruptibility
- **Estimated scope**: 3 files, small

## Problem

Filtering the catalogue leaves product cards **permanently invisible**. This is a
functional bug, not a polish item — it hides products on the page whose entire
job is showing products.

Cards carry the `rise` class, which starts them hidden:

```css
/* src/styles/tailwind.css:236 — current */
.rise {
  opacity: 0;
  transform: translate3d(0, 1.75rem, 0);
  transition: opacity var(--dur-slow) var(--ease-out), transform var(--dur-slow) var(--ease-out);
}
.rise.shown { opacity: 1; transform: translate3d(0, 0, 0); }
```

`.shown` is added by exactly one of two one-shot systems, both wired at mount:

```tsx
// src/components/ui/useReveal.ts:29 — current (observer built once, in a mount effect)
useEffect(() => { /* … builds IntersectionObserver over existing nodes … */ }, [threshold, immediate]);
```

```tsx
// src/components/motion/MotionProvider.tsx:70 — current (ScrollTriggers created once)
const ctx = gsap.context(() => { /* … gsap.utils.toArray('.rise') … once: true … */ });
```

Neither knows about nodes created later. Filtering swaps the grid contents:

```tsx
// src/app/collections/components/CollectionsGrid.tsx:55 — current
<article key={piece.ref} className="group rise" style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
```

Because the `className` prop string never contains `shown`, React never writes
it and never reclaims it — surviving nodes keep the class, but freshly mounted
nodes have no ScrollTrigger, no observer, and no `.shown`. They stay at
`opacity: 0` forever.

Measured on `/collections` at commit bbab222:

| Action | Cards | Invisible |
| --- | --- | --- |
| initial (All) | 12 | 0 |
| click Living | 6 | 0 |
| click Storage | 3 | **3** |
| click Dining | 1 | **1** |
| click Bedroom | 1 | **1** |
| back to All | 12 | **12** |

The same defect exists in the private catalogue:

```tsx
// src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:116 — current
<article key={piece.ref} className="group rise" style={{ transitionDelay: `${(i % 3) * 60}ms` }}>
```

## Target

Filtered grids must not depend on a one-shot scroll reveal. The reveal belongs
to the *first* paint of the grid; after that, filtering is a content swap and
should animate as one, driven by React state.

Remove `rise` from the filtered cards and give the grid container a keyed
transition instead. `key` on the wrapper forces a remount per filter, so the
entrance replays every time without any observer involvement:

```tsx
/* target — src/app/collections/components/CollectionsGrid.tsx */
<div
  key={active}
  data-reveal-group
  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-12 filter-swap"
>
  {filtered.map((piece) => (
    <article key={piece.ref} className="group">
      …
    </article>
  ))}
</div>
```

```css
/* target — src/styles/tailwind.css, in @layer utilities */
.filter-swap {
  animation: filter-swap 260ms var(--ease-out) both;
}

@keyframes filter-swap {
  from { opacity: 0; transform: translate3d(0, 0.5rem, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .filter-swap { animation: none; }
}
```

260ms sits inside the sub-300ms UI budget: the filter tabs are a high-frequency
control, so this must feel instant, not like the 640ms editorial reveals.

Keyframes are acceptable here specifically because a filter click is a discrete,
non-reversible content swap — there is no mid-flight state to retarget.

## Repo conventions to follow

- Motion tokens live in `src/styles/tailwind.css` `:root` (`--ease-out`,
  `--dur-*`). Use the existing `var(--ease-out)`; do not add a new curve.
- Custom utilities go inside the `@layer utilities { … }` block in that file —
  see `.rise` at `src/styles/tailwind.css:236` as the placement exemplar.
- Reduced-motion overrides in this repo are written as a scoped
  `@media (prefers-reduced-motion: reduce)` block inside `@layer utilities`.
  Exemplar: `src/styles/tailwind.css:473` (the `.marquee-track` override).
- Keyframes used by utilities are declared in the same CSS file, not in
  `tailwind.config.js` (the config's `keyframes` block is only for `marquee`).

## Steps

1. In `src/styles/tailwind.css`, inside `@layer utilities`, add the
   `.filter-swap` rule, the `@keyframes filter-swap` block, and the
   reduced-motion override exactly as written in **Target**. Place them
   immediately after the `.rise` / `.rise.shown` rules.
2. In `src/app/collections/components/CollectionsGrid.tsx`:
   - Add `key={active}` and `filter-swap` to the grid `<div>` that currently has
     `data-reveal-group className="grid sm:grid-cols-2 …"` (line 51).
   - On the `<article>` at line 55, remove `rise` from `className` (leaving
     `"group"`) and delete the `style={{ transitionDelay: … }}` prop entirely.
3. In `src/app/collections/private/catalogue/components/PrivateCatalogue.tsx`,
   apply the identical two edits: `key={active}` + `filter-swap` on the grid
   `<div>` at line 112, and strip `rise` + `transitionDelay` from the
   `<article>` at line 116.
4. Leave the section-level `rise` elements on both pages (headers, lead
   paragraph, filter bar) untouched — those are genuine first-paint reveals and
   they work correctly.

## Boundaries

- Do NOT touch `src/components/ui/useReveal.ts` or
  `src/components/motion/MotionProvider.tsx`. The one-shot behaviour is correct
  for scroll reveals; this plan removes filtered content from their remit
  instead of making them re-scan the DOM.
- Do NOT remove `data-reveal-group` from the grid containers.
- Do NOT change any other component's `rise` usage.
- Do NOT add dependencies.
- If the line numbers no longer match, locate by the `filtered.map` call and the
  `aria-pressed` filter buttons; if the structure has changed materially, STOP
  and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0. `npm run build` succeeds.
- **Feel check**: load `/collections`, then click every filter tab in turn and
  finally back to **All**, confirming:
  - No card is ever blank. Every tab shows its full count of visible cards.
  - The grid fades/rises in as one group on each click — it does not stagger
    card-by-card (stagger on a high-frequency control reads as lag).
  - Clicking two tabs rapidly does not leave a half-faded grid.
  - In DevTools → Rendering, enable *Emulate prefers-reduced-motion*; the grid
    swaps instantly with no movement and still shows every card.
- **Done when**: this returns `invisible: 0` for every tab, including after
  returning to All:
  ```js
  // paste in DevTools console after clicking a tab
  (() => {
    const c = [...document.querySelectorAll('.grid article')];
    return { cards: c.length,
             invisible: c.filter(e => parseFloat(getComputedStyle(e).opacity) < 0.9).length };
  })()
  ```
