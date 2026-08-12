# 008 — Remove the dead inline stagger

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: LOW
- **Category**: Cohesion
- **Estimated scope**: 6 files, mechanical

## Problem

Stagger is implemented twice, and the inline copy is dead in the normal path.

Every grouped `.rise` carries a hand-computed `transitionDelay`:

```tsx
// src/app/components/FeaturedProducts.tsx:39 — current
<article
  key={piece.ref}
  className="group rise"
  style={{ transitionDelay: `${(i % 3) * 80}ms` }}
>
```

But once the motion layer loads, those transitions no longer exist:

```css
/* src/styles/tailwind.css:430 — current */
.motion-js .rise, .motion-js .veil, .motion-js .wipe-inner { transition: none; }
```

and GSAP supplies its own stagger instead:

```ts
// src/components/motion/MotionProvider.tsx:90 — current
gsap.to(items, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, … });
```

So the inline delays only ever apply in the fallback path — when GSAP failed to
load — and every value (60ms, 70ms, 80ms, 90ms, `i * 70`) is a slightly different
hand-rolled guess at the same idea. Five near-identical scales is exactly the
consolidation problem to remove.

## Target

Delete the inline `transitionDelay` props from grouped reveal items. GSAP's
`stagger: 0.07` remains the single definition; the fallback path reveals a group
flat, which is acceptable because it only runs when the motion layer is
unavailable, and a flat reveal is never *wrong* — only less refined.

```tsx
/* target — src/app/components/FeaturedProducts.tsx */
<article key={piece.ref} className="group rise">
```

## Repo conventions to follow

- Group containers are marked `data-reveal-group`; GSAP reads that attribute and
  staggers the `.rise` children inside it. Exemplar:
  `src/app/components/FeaturedProducts.tsx:35`.
- Leave `transitionDelay` in place on **ungrouped** reveals that are deliberately
  sequenced against each other rather than staggered as a set — specifically the
  hero (`src/app/components/HeroSection.tsx`) and `PageHeader`
  (`src/components/ui/PageHeader.tsx`). Those run through the immediate path,
  where after plan 005 the CSS transition genuinely does apply, and their delays
  are a composed sequence, not a mechanical index multiple.

## Steps

Remove the `style={{ transitionDelay: … }}` prop from the reveal item inside each
`data-reveal-group` container:

1. `src/app/components/FeaturedCollections.tsx:48` — the `<Link>` with
   `className={`group block rise ${SPANS[i]}`}`.
2. `src/app/components/FeaturedProducts.tsx:42` — the `<article className="group rise">`.
3. `src/app/components/WhyBrandsSection.tsx:55` — the `<li>` with `… border-t border-line-invert rise`.
4. `src/app/components/JournalSection.tsx:28` — the `<article className="group rise">`.
5. `src/app/components/TrustSection.tsx:56` — the `<div>` inside `Stat`
   (`… border-t border-line rise`); also drop the now-unused `index` prop from
   `Stat` and its call site at line 94 if nothing else uses it. Check first: if
   `index` is still referenced, leave the prop alone.
6. `src/app/collections/components/CollectionsGrid.tsx` and
   `src/app/collections/private/catalogue/components/PrivateCatalogue.tsx` — plan
   001 already removes these. If plan 001 has landed, skip them; if not, leave
   them to 001 to avoid a conflicting edit.

Where removing the prop leaves the map callback's `i` parameter unused, drop it
from the signature too (e.g. `.map((piece, i) =>` → `.map((piece) =>`), but only
if `i` is genuinely unreferenced in that callback.

## Boundaries

- Do NOT remove `data-reveal-group` from any container.
- Do NOT change GSAP's `stagger: 0.07` value.
- Do NOT touch the hero or `PageHeader` delays (see conventions above).
- Do NOT remove the `.rise` class itself from these elements.
- Do NOT add dependencies.
- If any of these files no longer contains a `transitionDelay`, that step is
  already done — skip it rather than inventing a change.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0 (this catches unused-parameter and
  prop-signature mistakes from the cleanup). `npm run build` succeeds.
  `grep -rn "transitionDelay" src/` should return matches **only** in
  `HeroSection.tsx` and `PageHeader.tsx`.
- **Feel check**: load `/` and scroll through every section:
  - Cards in the collections grid, the product grid, the capability list, the
    stats row and the journal row must still arrive one after another — the
    stagger now comes from GSAP.
  - The hero must still reveal as a composed sequence (eyebrow, then headline
    lines, then lead, then buttons).
  - Nothing may end up invisible; re-run the reveal check:
    ```js
    (() => { const a=[...document.querySelectorAll('.rise,.veil,.wipe-inner')];
      return { total:a.length,
               invisible:a.filter(e=>{const r=e.getBoundingClientRect();
                 return (r.width||r.height) && parseFloat(getComputedStyle(e).opacity)<0.9;}).length }; })()
    ```
    Expect `invisible: 0` after scrolling the page.
- **Done when**: `transitionDelay` survives only in the two sequenced components,
  every group still staggers visibly, and nothing is left hidden.
