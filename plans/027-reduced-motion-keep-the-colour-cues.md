# 027 — Keep the colour and opacity cues under reduced motion

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Prerequisites**: **plan 011 must land first.** 011 fixes an unambiguous bug in the
  same media query; this plan is a judgement call layered on top, and mixing them would
  put the safe fix at the mercy of the debatable one.
- **Estimated scope**: 1 file, ~20 lines

## Problem

The reduced-motion reset is a single `*` selector, so it cannot distinguish motion from
feedback and removes both.

```css
/* src/styles/tailwind.css:138-142 — current (before plan 011) */
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
```

The playbook is explicit: *"Reduced motion means fewer and gentler animations, **not
zero** — keep transitions that aid comprehension, remove position changes,"* and its
own example keeps a fade while dropping movement.

What this rule destroys that contains **no movement at all**:

| What | Where | Cost to the reader |
|---|---|---|
| `.btn` colour inversion on hover | `src/styles/tailwind.css:505-508` + `:537, :548, :560` | Every button on the site flashes rather than resolving |
| 49 `transition-colors` hovers and focus borders | 21 files — the full list is in plan 014 | Includes **eight form focus borders**: `ContactSplit.tsx:67`, `PieceEnquiry.tsx:58`, `ExclusiveAccess.tsx:68`, `AccessCodeEntry.tsx:94`, `PrivateCatalogue.tsx:249` and `:270`, `PrivatePiece.tsx:61`, `ContainerPlan.tsx:217`. These are state indication on keyboard interaction with zero movement — the highest-value items lost |
| The masthead hairline appearing on scroll | `src/components/Header.tsx:45` | The only cue the header has separated from the page |
| `.veil` | `src/styles/tailwind.css:390-393` | Pure opacity, no transform anywhere in the primitive — the one motion class in this codebase that is already reduced-motion-safe as written, and the blanket rule kills it anyway. 9 elements |

Correctly dropped, and staying dropped: `.rise`'s translate (`:308`), `.wipe-inner`'s
translate (`:382`), `.drift`'s scale (`:402`), `.plate img`'s `scale(1.04)` (`:425`),
`.link-draw::after`'s `scaleX` (`:474`), the arrow's 4px `translate3d` (`:575`), the
hamburger's rotate (`Header.tsx:104`), the menu labels' `translate-y-full`
(`Header.tsx:141`), the plate indicator's `scale-x` (`HeroSection.tsx:109`).

## Target

Keep the blanket reset as the safety net, then re-assert duration on the declarations
that carry no movement. Add this **after** the existing block, inside the same media
query — it must come later in the cascade to win.

```css
/* target — src/styles/tailwind.css, appended inside @layer base after the block plan 011 edits */
  /*
   * Colour is not motion.
   *
   * The blanket reset above is the right default — it catches anything new without
   * anyone having to remember — but it cannot tell a 4px slide from a border turning
   * clay, so it removed both. Reduced motion means fewer and gentler animations, not
   * none: a focus border that crossfades and a button that resolves into its hover
   * state carry information and move nothing. Eight form focus borders were the real
   * loss here.
   *
   * Re-asserted narrowly and by hand. Anything with a transform in its transition list
   * is deliberately absent, and `.rise` and `.wipe-inner` stay snapped — see the note
   * in plans/027 for why that line is drawn there.
   */
  @media (prefers-reduced-motion: reduce) {
    .btn,
    [class*='transition-colors'] {
      transition-duration: var(--dur-fast) !important;
    }

    /* Pure opacity, no transform in the primitive at all. Shortened from
       --dur-slow: a 640ms fade is an entrance; 320ms is an acknowledgement. */
    .veil {
      transition-duration: var(--dur-base) !important;
    }
  }
```

`[class*='transition-colors']` is safe here: Tailwind's `transition-colors` covers only
`color`, `background-color`, `border-color`, `text-decoration-color`, `fill` and `stroke`
— no geometry — so re-enabling those durations cannot reintroduce movement.

`.btn`'s transition list does include `transform 160ms`, but `.btn:active { transform:
none }` is already overridden under reduced motion at `src/styles/tailwind.css:525-529`,
so there is no transform target to animate toward. Verify this in the feel check.

## Where the line is drawn, and why

`.rise` and `.wipe-inner` are **not** included, even though `.rise`'s opacity half would
qualify on the playbook's reading. Both carry a transform in the same declaration, so
keeping the fade means also forcing `transform: none` on them under reduced motion — and
that is the exact machinery plan 005 had to repair after the motion-layer handover
truncated the hero. The upside is a gentler fade on content that is already appearing
instantly; the downside risk is content stranded invisible, which is the worst failure
this codebase has had. Not worth it. If someone wants it later it should be its own plan
with its own frame-by-frame verification.

## Repo conventions to follow

- Reduced-motion overrides live next to what they modify, in `@layer base` for global
  rules and beside the utility for scoped ones — `.filter-swap` at `:342-346`,
  `.btn:active` at `:525-529`, `.marquee-track` at `:658-663`.
- Tokens only: `var(--dur-fast)`, `var(--dur-base)`.
- Every rule carries prose explaining why. The comment above is written to that standard.

## Steps

1. Confirm plan 011 has landed: `grep -c 'delay: 0s !important' src/styles/tailwind.css`
   must return `2`. If it returns `0`, **stop and run plan 011 first**.
2. In `src/styles/tailwind.css`, append the **Target** media query inside `@layer base`,
   immediately after the closing brace of the existing
   `@media (prefers-reduced-motion: reduce)` block.
3. Nothing else.

## Boundaries

- Do NOT modify the existing blanket reset. It stays exactly as plan 011 leaves it; this
  plan only adds a later, narrower rule.
- Do NOT add `.rise`, `.wipe-inner`, `.drift`, `.plate img`, `.link-draw` or any
  `transition-transform` / `transition-[…transform…]` selector to the new block.
- Do NOT add `transform: none` to anything.
- Do NOT remove `!important`. The blanket rule uses it, so the override needs it too.
- Do NOT widen the attribute selector to `[class*='transition']` — that would catch
  `transition-transform` and reintroduce movement.
- Do NOT add new dependencies.
- If the existing media query does not look like plan 011's output, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: `npm run dev`, then DevTools → Rendering → **Emulate CSS media feature
  prefers-reduced-motion: reduce**, and reload.
  - Tab through the form at `/contact`. Each focus border must **crossfade to clay over
    180ms**. Before this change it snaps.
  - Hover a `.btn`. The fill must invert smoothly. Then **press and hold it** — this is
    the check that matters: there must be **no scale**. If the button dips, the
    `.btn:active { transform: none }` override at `:525-529` is being defeated and this
    plan must be reverted.
  - Hover a card title and a footer link: colour crossfades.
  - Scroll the home page down 30px: the masthead hairline must fade in, not snap.
  - Now the negative checks. All of these must remain **instant, with no movement**:
    - a card image must not zoom on hover;
    - a `.link-draw` underline must not sweep — it appears at once;
    - a `.btn` arrow must not slide 4px;
    - the hero must paint complete in one frame (plan 011's behaviour, unchanged);
    - the hero plates must not drift.
  - Scroll the whole home page, `/craft` and `/factory` top to bottom. **Nothing may be
    left invisible.** Run
    `[...document.querySelectorAll('.rise, .veil, .wipe-inner')].filter(el => parseFloat(getComputedStyle(el).opacity) < 0.99).length`
    — it must return `0`.
  - Turn emulation **off** and reload. Every check must behave exactly as before this
    plan; the new rule is inert outside the media query.
- **Done when**: with reduced motion emulated, colour and focus feedback crossfades while
  every transform is still instant, no element anywhere is left below full opacity, and
  behaviour with emulation off is unchanged.
