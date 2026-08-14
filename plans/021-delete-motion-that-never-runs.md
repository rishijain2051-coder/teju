# 021 — Delete the motion that never runs

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: LOW
- **Category**: Cohesion
- **Prerequisites**: run **after** plans 014 and 019 — all three touch
  `TestimonialsSection.tsx:53`
- **Estimated scope**: 5 files, 12 deletions

## Problem

Three kinds of declaration that look like working motion and do nothing. Each one
misleads the next person to read the file: editing the numbers appears to have no
effect, so they assume something else is broken.

### A. `data-reveal-group` on containers with no `.rise` children

```jsx
/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:312-315 — current */
            <div
              key={gridKey}
              data-reveal-group
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-8 filter-swap"
            >

/* src/app/collections/components/CollectionsGrid.tsx:61-65 — current */
        <div
          key={active}
          data-reveal-group
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-12 filter-swap"
        >
```

GSAP's group handler selects `group.querySelectorAll('.rise')` and returns
immediately when the list is empty (`src/components/motion/MotionProvider.tsx:80-82`).
Neither of these containers has a `.rise` descendant — `PrivatePiece`'s roots carry no
reveal class at all, and `CollectionsGrid` passes `reveal={false}` to every `PieceCard`
(`CollectionsGrid.tsx:67`), which is documented at `PieceCard.tsx:10` and correct. So
the attribute buys nothing on either.

Both grids get a single container-level `.filter-swap` instead, which is the right
call — a 20-to-39 card cascade on a filter tab would be a frequency violation, and
`src/styles/tailwind.css:319-326` records that reasoning. The attribute is simply
left over and now reads as an intention that silently fails.

### B. Inline `transitionDelay` on elements GSAP owns

```jsx
/* src/app/components/ContactCTA.tsx:25, 33, 39, 62 — current */
              <span className="wipe-inner italic" style={{ transitionDelay: '110ms' }}>
            style={{ transitionDelay: '260ms' }}
            <div className="flex flex-wrap gap-3 mt-10 rise" style={{ transitionDelay: '340ms' }}>
            style={{ transitionDelay: '420ms' }}
```

`ContactCTA` calls `useReveal<HTMLElement>()` with no `immediate`
(`src/app/components/ContactCTA.tsx:10`), so GSAP owns these elements once it loads.
GSAP tweens ignore CSS `transition-delay` entirely, and
`.motion-js .rise:not(.shown) { transition: none }`
(`src/styles/tailwind.css:635-639`) strips the transition outright. The authored
110/260/340/420ms cadence therefore only ever runs in the IntersectionObserver
fallback — a failed dynamic import.

Same pattern: `src/app/collections/components/ExclusiveAccess.tsx:79, 85, 92, 136`
(80/160/240/120ms) and `src/app/collections/[collection]/page.tsx:88`
(`transitionDelay: \`${i * 90}ms\``, which is also outside the playbook's 30–80ms
stagger band, while GSAP's own `stagger: 0.06` sits at 60ms).

**Nine dead declarations.** Do not confuse these with the live ones: the 21 inline
delays in `HeroSection.tsx`, `PageHeader.tsx`, `AccessCodeEntry.tsx`,
`journal/[slug]/page.tsx` and `[piece]/page.tsx` are on components that reveal with
`immediate: true`, so those elements are marked `.shown` at mount, GSAP's `fresh()`
filter skips them, the CSS transition survives, and their delays work. Leave every one
of those alone.

This is the same bug class as plan 008, in files 008 did not cover.

### C. A `transition-colors` on an element whose colours never change

```jsx
/* src/app/components/TestimonialsSection.tsx:53 — current */
                    className="group w-full text-left flex items-baseline gap-4 py-5 border-b border-line transition-colors duration-base"
```

The `<button>` has no `hover:` variant, no `aria-current` variant and no state that
changes any of its own colours. Every colour change lives on its child spans
(`:56`, `:64`), each of which declares its own transition. This declaration animates
nothing.

## Target

Delete all twelve. No replacements.

- Remove the `data-reveal-group` line from both containers in A.
- Remove the nine `style={{ transitionDelay: … }}` props in B. Where the prop is the
  only thing on its line, remove the line; where the element becomes a single short
  line, let Prettier reflow it (run `npm run lint:fix`).
- On `TestimonialsSection.tsx:53`, remove the transition utilities from the class list,
  leaving:
  ```jsx
  className="group w-full text-left flex items-baseline gap-4 py-5 border-b border-line"
  ```

**Note on C**: depending on whether plans 014 and 019 have landed, that class list may
read `transition-colors duration-fast ease-out` and may end with ` tap`. Remove
whichever transition form you find; **keep `tap` if it is there** — plan 019 adds it
deliberately for the press state.

## Repo conventions to follow

- `data-reveal-group` belongs only on containers that actually hold `.rise` children.
  22 other usages in the codebase are correct — e.g.
  `src/app/components/FeaturedProducts.tsx:29`, `src/app/craft/page.tsx:95` — and give a
  real 60ms GSAP stagger. Use those as the reference for what the attribute means.
- Inline `transitionDelay` is legitimate **only** on components that reveal with
  `immediate: true`. `src/app/components/HeroSection.tsx:15` plus its delays at
  `:30, 39, 44, 49, 57, 66, 91` is the exemplar of the correct pattern.
- Prettier runs as an ESLint rule; use `npm run lint:fix` after deleting props rather
  than hand-reflowing JSX.

## Steps

1. `src/app/collections/private/catalogue/components/PrivateCatalogue.tsx` — delete line
   314 (`data-reveal-group`).
2. `src/app/collections/components/CollectionsGrid.tsx` — delete line 63
   (`data-reveal-group`).
3. `src/app/components/ContactCTA.tsx` — delete the `transitionDelay` props at lines 25,
   33, 39 and 62.
4. `src/app/collections/components/ExclusiveAccess.tsx` — delete the `transitionDelay`
   props at lines 79, 85, 92 and 136.
5. `src/app/collections/[collection]/page.tsx` — delete the `transitionDelay` prop at
   line 88. If the surrounding `style` object then has no other keys, remove the whole
   `style` prop; if it has others, keep them.
6. `src/app/components/TestimonialsSection.tsx:53` — remove the transition utilities per
   the note in **Target**.
7. Run `npm run lint:fix`, then `npm run lint` to confirm clean.
8. Count: `grep -rc 'transitionDelay' src --include=*.tsx` must total **21**, and
   `grep -rc 'data-reveal-group' src --include=*.tsx` must total **22**.

## Boundaries

- Do NOT remove `transitionDelay` from `HeroSection.tsx`, `PageHeader.tsx`,
  `AccessCodeEntry.tsx`, `journal/[slug]/page.tsx` or
  `collections/[collection]/[piece]/page.tsx`. Those 21 are live and correct.
- Do NOT remove `data-reveal-group` from any of the other 22 sites.
- Do NOT remove `.filter-swap` from either grid in A — it is the entrance those grids
  actually use.
- Do NOT remove `key={gridKey}` or `key={active}`.
- Do NOT try to make the dead delays work by switching those components to
  `immediate: true`. They are below the fold; revealing them at mount would burn their
  entrance unseen.
- Do NOT remove the child transitions on `TestimonialsSection.tsx:56` and `:64`.
- Do NOT add new dependencies.
- If a cited line does not contain what **Problem** shows, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
  - The two counts in step 8 come out at 21 and 22.
- **Feel check**: `npm run dev`. Every check here is a *negative* — nothing should look
  different, because nothing being removed was doing anything.
  - Home page: scroll to the dark "Let's build something lasting." section. Its entrance
    must look exactly as it did before — GSAP was already driving it.
  - `/collections`: scroll to the teal "access" section, and use the filter tabs. Both
    must behave as before.
  - Open any collection page and scroll through the story paragraphs. Unchanged.
  - Behind the gate, change a filter and confirm the grid still fades as one block.
  - The one check that proves the deletions were safe: throttle the network to Offline
    in DevTools *after* first paint and reload with cache disabled so the GSAP dynamic
    import fails, then scroll the home page. The observer fallback must still reveal
    everything — content must never be left invisible. The cadence will now be flat
    rather than staggered in that fallback, which is the accepted cost of the deletion.
  - Sanity check with GSAP working: `document.querySelectorAll('[data-reveal-group]').length`
    should be 1 on the home page and the elements inside it should still stagger.
- **Done when**: all twelve declarations are gone, no page looks different with GSAP
  loaded, and no content is invisible with GSAP blocked.
