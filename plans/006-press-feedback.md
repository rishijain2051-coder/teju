# 006 — Give buttons a press state

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: MEDIUM
- **Category**: Physicality
- **Estimated scope**: 1 file, small

## Problem

Nothing in the codebase has a press state — `grep -rn ":active" src/` returns no
CSS matches. Every call to action relies entirely on hover:

```css
/* src/styles/tailwind.css:327 — current, abridged */
.btn {
  /* … */
  transition:
    background-color var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}
```

On a touch device there is no hover, so tapping "View the collections", "Send
enquiry" or "Enter" gives **no acknowledgement at all** until the next page
paints. On a slow connection that is a second or more of a visitor wondering
whether the tap registered — on a site whose primary conversion path is a form.

## Target

A subtle inward press on the shared `.btn` class, using the value from the
playbook — `scale(0.97)` with a 160ms ease-out:

```css
/* target — src/styles/tailwind.css, immediately after the .btn rule */
.btn {
  /* … existing properties … */
  transition:
    background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    transform 160ms var(--ease-out);
}

.btn:active {
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .btn:active {
    transform: none;
  }
}
```

Press feedback is deliberately **not** gated behind `@media (hover: hover)` — touch
is precisely where it matters most.

`transform` is listed explicitly rather than folded into a shorthand, and 160ms
is the top of the 100–160ms press-feedback band: slow enough to be felt, fast
enough that release feels instant.

## Repo conventions to follow

- Note that plan 003 changes the three `.btn` colour transitions from
  `var(--dur-base)` to `var(--dur-fast)`. The **Target** above already shows the
  post-003 state. If 003 has not landed yet, keep whatever duration is currently
  there and only append the `transform 160ms var(--ease-out)` entry.
- Reduced-motion overrides go in a scoped `@media` block inside
  `@layer utilities`; exemplar at `src/styles/tailwind.css:473`.
- `.btn` is the single shared button class across every page — there is no
  per-component button styling to update.

## Steps

1. In `src/styles/tailwind.css`, append `transform 160ms var(--ease-out)` to the
   `.btn` transition list (line 337–340).
2. Directly after the `.btn` rule's closing brace, add the `.btn:active` rule
   from **Target**.
3. Add the `@media (prefers-reduced-motion: reduce)` override for `.btn:active`
   immediately after it.

## Boundaries

- Do NOT add press states to nav links, filter tabs or the hero plate indicators
  in this plan — `.btn` covers every primary action and keeping the change to one
  class keeps it reviewable.
- Do NOT gate `:active` behind a hover media query.
- Do NOT add a lift, a shadow, or a colour change on press; the house style is a
  flat slab and `scale` alone is the intended feedback.
- Do NOT change the `.btn` padding, border or typography.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` succeeds.
- **Feel check**, desktop: press and hold "View the collections" on `/`:
  - The button scales inward slightly and holds while the mouse is down, then
    returns on release. The movement should be barely perceptible — if it reads
    as a bounce or a jump, the value is wrong.
  - In DevTools → Animations at 10% playback, confirm the press completes in
    ~160ms of scaled time.
- **Feel check**, touch: in the device toolbar, tap the button and confirm the
  press registers visually before navigation begins.
- **Reduced motion**: enable *Emulate prefers-reduced-motion* and confirm
  pressing produces no scale, while the colour change still occurs.
- **Done when**: every `.btn` on `/`, `/collections`, `/contact` and
  `/collections/private` presses inward on pointer-down and releases cleanly,
  with no scale under reduced motion.
