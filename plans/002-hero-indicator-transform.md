# 002 — Animate the hero plate indicator with transform, not width

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file, tiny

## Problem

The hero's plate indicator rules animate with `transition-all` on a `width`
change — two separate performance violations in one class list:

```tsx
// src/app/components/HeroSection.tsx:86 — current
<span
  className={`block h-px transition-all duration-base ease-out ${
    i === active ? 'w-14 bg-ink' : 'w-7 bg-line-strong group-hover:bg-ink'
  }`}
/>
```

1. `transition-all` animates every animatable property that happens to change,
   off the compositor, including ones never intended.
2. `width` is a layout property. Every frame triggers layout → paint →
   composite, where `transform` would run on the GPU alone.

It is in the hero, so it animates during the page's first impression, and it
re-runs on a 7s interval for the lifetime of the page.

## Target

Keep the element at its final width permanently and scale it horizontally from
its left edge, so only `transform` and `background-color` animate:

```tsx
/* target — src/app/components/HeroSection.tsx */
<span
  className={`block h-px w-14 origin-left transition-[transform,background-color] duration-base ease-out ${
    i === active ? 'scale-x-100 bg-ink' : 'scale-x-50 bg-line-strong group-hover:bg-ink'
  }`}
/>
```

`w-7` → `w-14` is exactly a 2× width change, so `scale-x-50` → `scale-x-100`
reproduces the current visual result precisely. `origin-left` makes it grow
rightward from the number, matching the present behaviour (the element is the
first child in a left-aligned flex row).

## Repo conventions to follow

- This file uses Tailwind utility strings with template-literal conditionals;
  keep that pattern rather than moving to CSS.
- Duration tokens are Tailwind aliases mapped in `tailwind.config.js:96`
  (`duration-base` = 320ms). Keep `duration-base` here — this is a discrete
  state indicator, not a hover, so it is outside plan 003's scope.
- Explicit property lists are the house style for transitions; exemplar:
  `transition-[border-color]` at `src/components/Header.tsx:60`.

## Steps

1. Open `src/app/components/HeroSection.tsx` and locate the `<span>` at line 86
   (inside the `PLATES.map` indicator buttons — it is the one with `h-px`).
2. Replace `transition-all` with `transition-[transform,background-color]`.
3. Add `w-14` and `origin-left` to the static part of the class string.
4. In the conditional, replace `w-14` with `scale-x-100` and `w-7` with
   `scale-x-50`. Leave the `bg-*` and `group-hover:bg-ink` classes as they are.
5. Change nothing else in the file.

## Boundaries

- Do NOT touch the sibling `<span>` at line 91 (the `01`/`02` numeral) — its
  `transition-colors` is already property-scoped and correct.
- Do NOT change the `aria-label` / `aria-current` attributes.
- Do NOT alter the crossfade at line 111 (that is plan 006).
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0. Then confirm the smell is gone:
  `grep -rn "transition-all" src/` returns no matches.
- **Feel check**: load `/`, and with the hero in view:
  - Click each indicator. The active bar is twice the length of the inactive
    ones and grows from its left edge — visually identical to before.
  - In DevTools → Performance, record while the 7s auto-advance fires. The
    indicator change must produce no *Layout* entries. Before this change it
    produced one per frame of the transition.
  - Hovering an inactive indicator still darkens it.
- **Done when**: no `transition-all` remains in `src/`, and the indicator
  transition shows zero layout thrash in a Performance recording.
