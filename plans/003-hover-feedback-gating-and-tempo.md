# 003 — Gate hover motion to real pointers and bring its tempo into budget

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: MEDIUM
- **Category**: Accessibility + Easing & duration
- **Estimated scope**: 1 file, small

Two findings merged: they rewrite the same four CSS blocks with the same
pattern, so splitting them would mean editing the same lines twice.

## Problem

**a) Nothing gates hover motion behind a real pointer.** `grep -rn "hover: hover" src/`
returns nothing. On a touchscreen, tapping a card fires a synthetic `:hover`
that never clears, so the product image **stays scaled up** after the tap:

```css
/* src/styles/tailwind.css:296 — current */
.group:hover .plate img,
.plate:hover img {
  transform: scale(1.04);
}
```

Same for the underline and the arrow nudge:

```css
/* src/styles/tailwind.css:320 — current */
.link-draw:hover::after,
.link-draw:focus-visible::after { transform: scaleX(1); transform-origin: left; }

/* src/styles/tailwind.css:384 — current */
.btn:hover svg,
.link-arrow:hover svg { transform: translate3d(0.25rem, 0, 0); }
```

**b) Hover borrows the editorial reveal tempo.** The duration scale was tuned
for scroll reveals and got reused for feedback:

```css
/* src/styles/tailwind.css:292 — current: 640ms on a card hover */
.plate img { transition: transform var(--dur-slow) var(--ease-out-soft); }

/* src/styles/tailwind.css:317, :338-340, :381 — current: 320ms */
.link-draw::after { transition: transform var(--dur-base) var(--ease-out); }
.btn { transition: background-color var(--dur-base) …, color …, border-color …; }
.btn svg, .link-arrow svg { transition: transform var(--dur-base) var(--ease-out); }
```

`--dur-slow` is 640ms (`src/styles/tailwind.css:70`) — more than **2×** the
300ms ceiling for UI motion, on the element a browsing visitor hovers most.
`--dur-base` is 320ms, marginally over. Hover is a tens-of-times-per-session
interaction; at this tempo the interface feels like it is lagging behind the
cursor.

## Target

Use the existing `--dur-fast` token (180ms, `src/styles/tailwind.css:68`) for all
hover and feedback transitions. Do **not** introduce a new duration token — a
third near-identical value is exactly the parallel-scale problem to avoid.

Keep the *transition* declarations ungated (so the property still animates back
out, and so `:focus-visible` keeps working), and gate only the **hover state
rules**:

```css
/* target — src/styles/tailwind.css */
.plate img {
  transition: transform var(--dur-fast) var(--ease-out);
  will-change: transform;
}

@media (hover: hover) and (pointer: fine) {
  .group:hover .plate img,
  .plate:hover img {
    transform: scale(1.04);
  }
}

.link-draw::after {
  /* … unchanged properties … */
  transition: transform var(--dur-fast) var(--ease-out);
}

/* focus-visible must stay ungated — keyboard users have no pointer */
.link-draw:focus-visible::after {
  transform: scaleX(1);
  transform-origin: left;
}

@media (hover: hover) and (pointer: fine) {
  .link-draw:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }
}

.btn {
  /* … unchanged properties … */
  transition:
    background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}

.btn svg,
.link-arrow svg {
  transition: transform var(--dur-fast) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .btn:hover svg,
  .link-arrow:hover svg {
    transform: translate3d(0.25rem, 0, 0);
  }
}
```

Note `.plate img` also drops `--ease-out-soft` for `--ease-out`: at 180ms the
softer curve reads as mush, and `--ease-out` is the house curve for UI.

The `.btn-solid:hover` / `.btn-ghost:hover` / `.btn-invert:hover` **colour**
rules stay ungated. A colour change on tap is harmless and even useful feedback;
only *movement* misleads on touch.

## Repo conventions to follow

- Tokens are CSS custom properties in `:root` at the top of
  `src/styles/tailwind.css`; reference them as `var(--dur-fast)`.
- All these rules live inside the single `@layer utilities { … }` block; keep
  them there and keep their current order in the file.
- The repo already scopes rules with a media query inside that layer — exemplar:
  the `prefers-reduced-motion` block at `src/styles/tailwind.css:473`.

## Steps

1. `src/styles/tailwind.css:292` — change `.plate img`'s transition to
   `transform var(--dur-fast) var(--ease-out)`. Keep `will-change: transform`.
2. Wrap the existing `.group:hover .plate img, .plate:hover img` rule (line 296)
   in `@media (hover: hover) and (pointer: fine) { … }`.
3. Line 317 — change `.link-draw::after`'s transition duration to
   `var(--dur-fast)`.
4. Split the combined rule at line 320: leave
   `.link-draw:focus-visible::after` ungated, and move `.link-draw:hover::after`
   into a `@media (hover: hover) and (pointer: fine)` block. Both keep
   `transform: scaleX(1); transform-origin: left;`.
5. Lines 338–340 — change all three `.btn` transition durations to
   `var(--dur-fast)`.
6. Line 381 — change the `.btn svg, .link-arrow svg` transition duration to
   `var(--dur-fast)`.
7. Wrap the `.btn:hover svg, .link-arrow:hover svg` rule (line 384) in
   `@media (hover: hover) and (pointer: fine) { … }`.

## Boundaries

- Do NOT change `--dur-fast`, `--dur-base` or `--dur-slow` themselves — other
  rules depend on them and the reveal tempo is deliberate.
- Do NOT add a new duration token.
- Do NOT gate the `.btn-*:hover` colour rules, and do NOT gate any
  `transition` declaration — only the hover *state* rules move inside the media
  query.
- Do NOT touch `.rise`, `.wipe-inner`, `.veil` or `.drift` — those are reveal
  primitives on a deliberately slower scale.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` succeeds. `grep -c "hover: hover" src/styles/tailwind.css`
  returns 3.
- **Feel check**, desktop: hover a collection card, a `link-draw` link and a
  button:
  - The image settles almost immediately rather than gliding for two-thirds of a
    second. In DevTools → Animations, set playback to 10% and confirm the scale
    completes in ~180ms of scaled time.
  - Tab to a `link-draw` link with the keyboard — the underline still draws.
    This is the regression to watch for in step 4.
- **Feel check**, touch: in DevTools device toolbar pick a phone preset, reload
  (device gates are evaluated at load), then tap a product card:
  - The image must **not** scale, and must not remain scaled after the tap.
  - Tapping a button still shows its colour change.
- **Done when**: no hover *movement* fires under touch emulation, keyboard focus
  still draws the underline, and every hover transition reads as 180ms.
