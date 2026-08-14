# 019 — Give the remaining controls a press state

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: MEDIUM
- **Category**: Physicality
- **Estimated scope**: 2 files (1 CSS utility + `.tap` change), 10 call sites

## Problem

`.btn` has an exemplary press state — the playbook's exact prescription:

```css
/* src/styles/tailwind.css:519-529 — correct, unchanged by this plan */
  /* Deliberately not gated behind `hover: hover` — touch has no hover at all,
     so a press state is the only acknowledgement a tap ever gets. */
  .btn:active {
    transform: scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .btn:active {
      transform: none;
    }
  }
```

The problem is how few controls carry it. On the home page, 11 of 65 controls are
`.btn`. Most of the rest carry `.tap` instead, which is a **hit-area expander only** —
`position: relative` plus an inset `::before` (`src/styles/tailwind.css:450-458`). It
adds no visual acknowledgement whatsoever.

On touch there is no hover, so these controls currently respond to a tap with
nothing at all:

| Location | Control |
|---|---|
| `src/components/Header.tsx:101` | The mobile hamburger — the primary mobile nav control |
| `src/app/components/HeroSection.tsx:100` | The three hero plate-index buttons |
| `src/app/collections/components/CollectionsGrid.tsx:40` | Public filter tabs |
| `src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:131` | Shared `control` class — 7 filter tabs **and** the Gallery/Manifest toggle |
| `src/app/collections/private/catalogue/components/PrivatePiece.tsx:153` | The design name in a manifest row — a real `<button>` with `aria-expanded` |
| `src/app/collections/private/catalogue/components/PrivatePiece.tsx:181` | Manifest-view **Enquire** — fires a network request |
| `src/app/collections/private/catalogue/components/PrivatePiece.tsx:190` | WhatsApp icon link, 14px |
| `src/app/collections/private/catalogue/components/PrivatePiece.tsx:258` | The dossier expander trigger |
| `src/app/collections/private/catalogue/components/ContainerPlan.tsx:234` | **Clear** — wipes the whole selection, no confirm |
| `src/app/components/TestimonialsSection.tsx:53` | The buyer index — full-width `<button>`s |

The **Clear** case is the sharpest. It is destructive and irreversible, and its two
neighbours (`Send this plan` at `:224`, `CSV` at `:228`) both carry `.btn` and
therefore both have a press state. The one control that discards a buyer's work is
the one that gives no acknowledgement:

```jsx
/* src/app/collections/private/catalogue/components/ContainerPlan.tsx:231-237 — current */
              <button
                type="button"
                onClick={onClear}
                className="text-manifest-sm text-paper/50 hover:text-paper transition-colors duration-base px-2 py-3"
              >
                Clear
              </button>
```

The **Enquire** case invites double-taps: it fires a request and gives no feedback
until the label swaps to "Sending…".

## Target

Fold the press state into `.tap`. `.tap` is already on most of these controls, it
already sets `position: relative`, and its whole purpose is "this is a touch target"
— which is exactly the set that needs press feedback.

```css
/* target — src/styles/tailwind.css, replacing the .tap block at :449-458 */
  /*
   * Expands a control's clickable area to clear the 24px minimum target size
   * (WCAG 2.5.8) without changing layout, and acknowledges the press.
   *
   * An absolutely-positioned pseudo-element still belongs to its host's hit
   * area, even outside the host's box — so this buys height without adding
   * padding. That matters because most of these links also carry `.link-draw`,
   * whose underline is positioned from the bottom of the box: padding would
   * push the underline away from the text it belongs to.
   *
   * Use padding instead wherever controls stack vertically (the footer lists),
   * since expanding outward there would make neighbouring targets overlap.
   *
   * The press state is here rather than on each control because `.tap` already
   * marks the set that needs it: things a finger hits. On touch there is no hover,
   * so before this a tap on a filter tab, a dossier toggle or the planner's Clear
   * produced no acknowledgement at all. Same 0.97 and same 160ms as `.btn`, so a
   * press feels identical wherever it lands.
   */
  .tap {
    position: relative;
    transition: transform 160ms var(--ease-out);
  }

  .tap::before {
    content: '';
    position: absolute;
    inset: -0.85rem -0.4rem;
  }

  .tap:active {
    transform: scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .tap:active {
      transform: none;
    }
  }
```

Then add `tap` to the four controls in the table above that do not already have it:

```jsx
/* src/components/Header.tsx:101 */
              className="lg:hidden flex flex-col justify-center gap-[5px] w-10 h-10 items-center -mr-2 tap"

/* src/app/components/HeroSection.tsx:100 */
                className="group flex items-center gap-2.5 py-3.5 tap"

/* src/app/collections/private/catalogue/components/PrivatePiece.tsx:153 — append ` tap` */
/* src/app/collections/private/catalogue/components/ContainerPlan.tsx:234 — append ` tap` */
/* src/app/components/TestimonialsSection.tsx:53 — append ` tap` */
```

The other six already carry `.tap` and gain the press state for free from the CSS
change alone.

**Careful with the hamburger and the hero buttons**: both already set their own box
size (`w-10 h-10`, `py-3.5`), so `.tap::before`'s `inset: -0.85rem -0.4rem` will
extend their hit area further. That is harmless for the hamburger (it sits at the end
of a row with `-mr-2`) and for the hero index (the three buttons are `gap-5` = 20px
apart, and `-0.4rem` each side is 6.4px, so they do not overlap). Verify both in the
feel check.

## Repo conventions to follow

- Exemplar for the press values: `.btn` at `src/styles/tailwind.css:509` and `:519-529`
  — `transform 160ms var(--ease-out)` and `scale(0.97)`, ungated for touch, with a
  reduced-motion escape. Use the same numbers so a press feels the same everywhere.
- The reduced-motion escape hatch belongs immediately after the rule it neutralises,
  as `.btn:active` does.
- `.tap` is appended at the end of a class list wherever it appears today. Follow that.

## Steps

1. In `src/styles/tailwind.css`, replace the `.tap` comment and both rules (lines
   437-458) with the **Target** block.
2. Add `tap` to the end of the `className` on `src/components/Header.tsx:101`.
3. Add `tap` to the end of the `className` on `src/app/components/HeroSection.tsx:100`.
4. Add `tap` to the end of the `className` on
   `src/app/collections/private/catalogue/components/PrivatePiece.tsx:153`.
5. Add `tap` to the end of the `className` on
   `src/app/collections/private/catalogue/components/ContainerPlan.tsx:234`.
6. Add `tap` to the end of the `className` on
   `src/app/components/TestimonialsSection.tsx:53`.
7. Count: `grep -rho '\btap\b' src --include=*.tsx | wc -l` should increase by exactly 5.

## Boundaries

- Do NOT add `tap` to `src/app/collections/private/catalogue/components/PrivatePiece.tsx:190`
  (the WhatsApp icon) — it already has it.
- Do NOT add `.tap` to anything inside the footer's stacked link lists. The comment in
  the utility explains why: expanding outward there makes neighbouring targets overlap.
  Those links use padding on purpose.
- Do NOT add a press state to `.link-draw`. Its acknowledgement is the underline, and
  scaling text mid-underline-draw looks broken.
- Do NOT change `.btn`.
- Do NOT gate `.tap:active` behind `@media (hover: hover)`. The whole point is that
  touch has no hover — that reasoning is already recorded at `src/styles/tailwind.css:519-520`.
- Do NOT touch `src/app/global-error.tsx`. It replaces the root layout, so the
  stylesheet is unavailable there and inline styles cannot express `:active`.
- Do NOT add new dependencies.
- If the `.tap` block does not match the **Problem**/current excerpt, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: `npm run dev`.
  - On the home page, press and hold a hero plate-index rule. It must dip to 97% and
    spring back on release. Compare directly with pressing "View the collections" —
    they must feel identical.
  - Switch to the device toolbar at 390px and reload. Press and hold the hamburger: it
    must dip. Before this change a tap on it produced nothing until the overlay cut in.
  - `/collections`: press and hold a filter tab. It must dip. Tap an **already active**
    tab — before this change that produced no response at all.
  - Behind the gate: press and hold **Clear** in the planner. It must dip like its `CSV`
    and `Send this plan` neighbours. Then press and hold **Enquire** in a manifest row.
    If you cannot reach the gated page, say so.
  - Hit-area regression check, the one thing that can go wrong: on the home page hero,
    click in the 20px gap *between* two plate-index rules. It must not activate either
    button. Then at 390px, confirm the hamburger's expanded hit area does not overlap
    the "Enquire" link to its left — tap just left of the hamburger and confirm you get
    the link, not the menu.
  - In DevTools → Animations at 10% playback, press a filter tab and confirm the scale
    runs 160ms, matching `.btn`.
  - Toggle **Emulate prefers-reduced-motion: reduce** and press a filter tab: no scale
    at all, but the colour change must still happen.
- **Done when**: every control in the ten-row table dips 3% on press with the same
  160ms curve as `.btn`, no two controls' hit areas overlap, and reduced motion removes
  the scale while keeping the colour response.
