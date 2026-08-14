# 014 — Bring every interaction transition into budget and onto the house curve

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: **HIGH**
- **Category**: Easing & duration
- **Estimated scope**: 22 files, 52 single-token edits

## Problem

Every hover and focus response on the site runs at **320ms on Tailwind's stock
`cubic-bezier(0.4, 0, 0.2, 1)`**, while the house's own button does the same job at
180ms on `--ease-out`.

Two defects in one declaration:

1. **320ms is over the UI ceiling.** The playbook's budget is *"UI animations stay
   under 300ms"*, with hover and press feedback in the 100–160ms band. `--dur-base`
   is `320ms` (`src/styles/tailwind.css:69`).
2. **No easing utility is passed, so the curve is Tailwind's default.** That curve
   is symmetric slow-in/slow-out; on a hover response the slow front end delays the
   exact moment the user is watching. The repo has three custom curves wired up as
   `ease-out` / `ease-out-soft` / `ease-inout` (`tailwind.config.js:92-96`) and none
   of them is used on a single colour transition.

Measured on the running home page: **69 interactive elements** transition colour at
`0.32s`, and **61 of those use `cubic-bezier(0.4, …)`** rather than the house
`cubic-bezier(0.16, 1, 0.3, 1)`. Source count: **49 occurrences of
`transition-colors duration-base` across 21 files.**

```jsx
/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:131 — current */
  const control = 'text-manifest py-2 transition-colors duration-base tap disabled:opacity-40';
```
That one string is shared by the seven filter tabs *and* the gallery/manifest view
toggle — the two most-used controls in the gated trade tool.

```jsx
/* src/app/collections/private/catalogue/components/PrivatePiece.tsx:61 — current */
        className="w-16 bg-transparent border-b border-line-strong py-1.5 text-manifest-sm text-ink numeral text-center placeholder:text-muted/60 focus:border-clay focus:outline-none transition-colors duration-base"
```
The quantity field's focus border, ×39 rows.

Compare what the house already does for exactly these jobs:

```css
/* src/styles/tailwind.css:505-509 — the exemplar, correct */
    transition:
      background-color var(--dur-fast) var(--ease-out),
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out),
      transform 160ms var(--ease-out);
```

Two more over-budget cases in the same family:

```jsx
/* src/components/Header.tsx:104 and :109 — current */
                className={`block w-6 h-px bg-ink transition-transform duration-base ease-out ${
                  menuOpen ? 'translate-y-[3px] rotate-45' : ''
```
The hamburger bars morphing to an X are *press feedback on a button*, not a drawer.
Budget 100–160ms; currently 320ms, and symmetric in both directions.

```jsx
/* src/app/collections/private/catalogue/components/ContainerPlan.tsx:197 — current */
                  className="h-full bg-timber origin-left transition-transform duration-base ease-out"
                  style={{ transform: `scaleX(${Math.min(forty, 1)})` }}
```
The container-fill bar. The numeral above it (`:190`) updates instantly on every
keystroke while the bar takes 320ms to catch up, so the bar visibly trails the
number it represents.

## Target

Two mechanical substitutions.

**A. All 49 colour transitions** — add the token duration *and* the house curve:

```
FROM:  transition-colors duration-base
TO:    transition-colors duration-fast ease-out
```

`duration-fast` = `180ms` (`tailwind.config.js:99`), `ease-out` =
`var(--ease-out)` = `cubic-bezier(0.16, 1, 0.3, 1)` (`tailwind.config.js:93`). Note
that the config's `out` key **overrides** Tailwind's built-in `ease-out`, so the
utility resolves to the house curve — verified on the running page.

**B. Three transform transitions** — duration only, the curve is already correct:

```
src/components/Header.tsx:104   transition-transform duration-base ease-out  ->  transition-transform duration-fast ease-out
src/components/Header.tsx:109   transition-transform duration-base ease-out  ->  transition-transform duration-fast ease-out
src/app/collections/private/catalogue/components/ContainerPlan.tsx:197
                                transition-transform duration-base ease-out  ->  transition-transform duration-fast ease-out
```

The 21 files carrying case A:

```
src/app/collections/[collection]/[piece]/page.tsx
src/app/collections/[collection]/page.tsx
src/app/collections/components/CollectionsGrid.tsx
src/app/collections/components/ExclusiveAccess.tsx
src/app/collections/page.tsx
src/app/collections/private/catalogue/components/ContainerPlan.tsx
src/app/collections/private/catalogue/components/PrivateCatalogue.tsx
src/app/collections/private/catalogue/components/PrivatePiece.tsx
src/app/collections/private/components/AccessCodeEntry.tsx
src/app/components/FeaturedCollections.tsx
src/app/components/JournalSection.tsx
src/app/components/TestimonialsSection.tsx
src/app/contact/components/ContactSplit.tsx
src/app/journal/[slug]/page.tsx
src/app/journal/page.tsx
src/app/not-found.tsx
src/components/Footer.tsx
src/components/Header.tsx
src/components/ui/PieceCard.tsx
src/components/ui/PieceEnquiry.tsx
src/components/ui/SectionHead.tsx
```

## Repo conventions to follow

- Durations and curves come from the four tokens in `src/styles/tailwind.css:64-71`,
  surfaced as Tailwind utilities in `tailwind.config.js:92-103`. Never hand-write a
  millisecond value in a component.
- `--dur-fast` is the house value for hover, focus and press response. Exemplars:
  `.btn` (`src/styles/tailwind.css:505-509`), `.plate img` (`:425`), `.link-draw::after`
  (`:476`), `.btn svg` (`:569`). All four use `var(--dur-fast)` with `var(--ease-out)`.
- The comment at `src/styles/tailwind.css:416-418` already states the principle in
  this codebase's own words: *"Hover and press feedback run on --dur-fast, not the
  reveal scale. A card hover at --dur-slow (640ms) is over twice the UI budget and
  reads as lag."* This plan finishes applying that rule to the JSX.

## Steps

1. Across the 21 files listed above, replace every occurrence of the exact string
   `transition-colors duration-base` with `transition-colors duration-fast ease-out`.
   There are 49. This is a literal substring replacement and is safe inside template
   literals and shared string constants alike.
2. In `src/components/Header.tsx`, on lines 104 and 109, change `duration-base` to
   `duration-fast`. Leave `transition-transform` and `ease-out` as they are.
3. In `src/app/collections/private/catalogue/components/ContainerPlan.tsx` line 197,
   change `duration-base` to `duration-fast`. Leave the rest of the class list and
   the inline `style` alone.
4. Verify the count: `grep -rc 'transition-colors duration-base' src` must return
   nothing, and `grep -rho 'transition-colors duration-fast ease-out' src --include=*.tsx | wc -l`
   must return `49`.

## Boundaries

Four `duration-base` uses are **deliberately out of scope**. Do not touch them:

- `src/components/Header.tsx:45` — `transition-[border-color] duration-base` on the
  masthead. A scroll-driven state cue, not hover feedback; the slower fade is right.
- `src/components/Header.tsx:122` — `transition-opacity duration-base` on the mobile
  overlay. A drawer; the playbook's band for drawers is 200–500ms.
- `src/components/Header.tsx:140` — `transition-[color,transform] duration-base` on
  the mobile nav labels. The transform half is drawer motion in the same 200–500ms
  band, and the overlay is `lg:hidden` so the colour half is touch-only.
- `src/app/components/HeroSection.tsx:109` — the plate indicator. It is a state
  indicator paced against a 1400ms crossfade; dropping it to 180ms would make the
  rule snap well ahead of the photograph it describes.

Also:

- Do NOT change `src/styles/tailwind.css`. Every value there is already correct.
- Do NOT change any `duration-slow`, `duration-reveal`, or GSAP duration.
- Do NOT add `ease-out` to the three `transition-transform` lines — they have it.
- Do NOT reformat, reorder or reflow any class list beyond the token substitution.
  Prettier runs as an ESLint rule and a reflow will produce a large, unreviewable diff.
- Do NOT add new dependencies.
- If the occurrence count in step 4 is not 49, STOP and report the actual number
  rather than hunting for the difference.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0 (this also proves no class list was mangled).
  - `npm run build` — exits 0, 46 routes.
  - `grep -rn 'transition-colors duration-base' src` — no output.
  - `grep -rn 'duration-base' src --include=*.tsx` — exactly 4 hits, all four from
    the **Boundaries** list.
- **Feel check**: `npm run dev`, open `http://localhost:4028`.
  - Run this in the console. **It reports 9, not 0** — `transitionProperty.includes('color')`
    also matches the four documented exceptions, whose shorthands contain
    `border-color`, `color, transform` and `background-color`. The 9 are: 1 masthead
    (`Header.tsx:45`), 5 mobile nav labels (`Header.tsx:149`) and 3 hero plate rules
    (`HeroSection.tsx:109`). Anything beyond those 9 is a miss:
    ```js
    [...document.querySelectorAll('*')].filter(el => {
      const cs = getComputedStyle(el);
      return cs.transitionProperty.includes('color')
        && cs.transitionDuration.split(',')[0].trim() === '0.32s';
    }).map(el => el.tagName + ' ' + getComputedStyle(el).transitionProperty)
    ```
    Measured after landing: 9, all four exceptions, zero misses. Colour transitions
    at `0.18s`: 60. Elements still on Tailwind's stock curve: 1 — the masthead
    hairline, which carries no easing utility and is excluded above.
  - Hover a collection card title and a footer link. The colour change must feel
    like it starts the instant the pointer lands. Before this change it eases in
    from a slow start over nearly a third of a second.
  - Hover a `.btn` and then a card title in the same pass. They must now feel like
    the same gesture; before, the button was visibly quicker than everything around it.
  - Tab through the contact form at `/contact`. Each focus border must snap to clay.
  - At 390px wide, tap the hamburger and watch the bars form the X — it should read
    as immediate acknowledgement, not a slow morph. (The overlay's own fade stays at
    320ms; that contrast is intended.)
  - Behind the gate, type a quantity and watch the 40ft fill bar: it should now move
    with the numeral rather than trailing it. If you cannot reach the gated page,
    say so in your report rather than guessing.
- **Done when**: no element on any page transitions a colour at 320ms, every colour
  transition uses `cubic-bezier(0.16, 1, 0.3, 1)`, exactly the four documented
  exceptions still use `duration-base`, and `npm run build` is clean.
