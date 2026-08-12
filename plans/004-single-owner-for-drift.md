# 004 — Give `.drift` a single owner

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: MEDIUM
- **Category**: Cohesion
- **Estimated scope**: 1 file, one-line change

## Problem

The `shown` class on the hero's `.drift` images has **two owners** that do not
know about each other.

React owns it declaratively, per active plate:

```tsx
// src/app/components/HeroSection.tsx:122 — current
className={`object-cover drift ${i === active ? 'shown' : ''}`}
```

And `useReveal` also claims `.drift`, adding the class imperatively:

```ts
// src/components/ui/useReveal.ts:5 — current
const SELECTOR = '.rise, .wipe-inner, .veil, .drift';
```

`HeroSection` calls `useReveal({ immediate: true })`, so on mount all three
plates get `shown` via `classList.add`. React then never reclaims it: the
`className` **prop string** for an inactive plate is `"object-cover drift "` on
every render — unchanged — so React never rewrites the attribute and never
strips the class the DOM already carries.

The visible consequence: all three plates begin their 14s scale at mount rather
than when they become active. Plate 02 appears at 7s with half its drift spent,
and plate 03 appears at 14s with the drift already finished — so the last plate
looks static, which is the opposite of the intent.

```css
/* src/styles/tailwind.css:275 — the affected animation */
.drift { transform: scale(1.02); transition: transform 14s linear; }
.drift.shown { transform: scale(1.11); }
```

## Target

`.drift` is the only reveal primitive driven by component state rather than by
scroll position, so it should not be in the shared selector at all. React is the
correct single owner.

```ts
/* target — src/components/ui/useReveal.ts */
const SELECTOR = '.rise, .wipe-inner, .veil';
```

Nothing else needs to change: `MotionProvider` never targeted `.drift` (its
`.motion-js` transition-suppression list is `.rise`, `.veil`, `.wipe-inner`
only, at `src/styles/tailwind.css:430`), so the CSS transition on `.drift`
survives and React's per-plate toggle drives it correctly.

## Repo conventions to follow

- `useReveal`'s doc comment enumerates which classes it manages; keep it
  truthful when the selector changes.
- The reveal classes and their contract are documented in
  `src/styles/tailwind.css` under the "Motion primitives" comment
  (`src/styles/tailwind.css:230`).

## Steps

1. In `src/components/ui/useReveal.ts`, change the `SELECTOR` constant on line 5
   from `'.rise, .wipe-inner, .veil, .drift'` to `'.rise, .wipe-inner, .veil'`.
2. Update the hook's JSDoc (lines 13–22) so the first line reads
   `Reveals `.rise` / `.wipe-inner` / `.veil` descendants once they scroll into
   view.` — dropping the `.drift` mention.
3. Add a short comment above `SELECTOR` recording why `.drift` is excluded:
   `// `.drift` is deliberately absent: it is driven by component state (the hero's active plate), not by scroll position, so React owns its `shown` class.`

## Boundaries

- Do NOT change `HeroSection.tsx` — its React-side toggle is the behaviour being
  preserved.
- Do NOT change the `.drift` CSS rules or its 14s duration (constant ambient
  motion on a hero is deliberate and correctly `linear`).
- Do NOT add `.drift` to the `.motion-js` suppression list.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0.
- **Feel check**: load `/` and leave the hero on screen for a full ~21s cycle:
  - Each plate should be visibly, slowly growing *while it is the active plate*.
    Before this change, plate 03 sat still.
  - Confirm in the console that only the active plate carries the class:
    ```js
    [...document.querySelectorAll('.drift')].map(e => e.classList.contains('shown'))
    // expected: exactly one `true`, e.g. [true, false, false]
    ```
    Before this change it returns `[true, true, true]`.
  - Click indicator 03 directly and confirm that plate starts drifting from
    near its resting scale, not from a finished state.
- **Done when**: the console check above shows exactly one `true`, and it
  follows whichever plate is active.
