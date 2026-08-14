# 026 — Mark the moment a plan outgrows one container

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 1 file, ~8 lines

## Problem

`ContainerPlan` exists to answer one question, stated in its own header comment:

> `src/app/collections/private/catalogue/components/ContainerPlan.tsx:19-24` —
> *"A buyer's real question is not 'what does this piece measure' but 'what fits in one
> container'…"*

Crossing that threshold is therefore the one event in the panel a buyer is actually
watching for. It is also the only visual event the panel refuses to acknowledge.

```jsx
/* src/app/collections/private/catalogue/components/ContainerPlan.tsx:186-204 — current */
            <div className="lg:col-span-3">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-manifest-sm text-paper/45">40 ft high-cube</p>
                <p className="text-manifest-sm text-paper numeral">
                  {Math.round(Math.min(forty, 1) * 100)}%
                  {forty > 1 && <span className="text-timber"> · ×{forty.toFixed(2)}</span>}
                </p>
              </div>
              {/* scaleX, not width: width animates layout, transform composites. */}
              <div className="h-1.5 bg-paper/15 mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-timber origin-left transition-transform duration-base ease-out"
                  style={{ transform: `scaleX(${Math.min(forty, 1)})` }}
                />
              </div>
              <p className="text-manifest-sm text-paper/45 mt-2 numeral">
                {twenty.toFixed(2)} × 20 ft equivalent
              </p>
            </div>
```

`Math.min(forty, 1)` means that once the plan fills one 40ft high-cube the bar **stops
moving forever**. The only signal that a second container is now required is the text
fragment `· ×2.34` appearing with no transition beside a percentage that is stuck at
100%. The bar — the element carrying the information — goes inert precisely when the
answer changes.

The `scaleX`-not-`width` choice and its comment are correct and stay.

## Target

Let the bar change **colour** when it saturates, and fade the overflow figure in. A
colour change is the right register here: it is state indication, not celebration, and
it costs nothing on a bar that has run out of room to move.

```jsx
/* target — replacing lines 189-199 */
                <p className="text-manifest-sm text-paper numeral">
                  {Math.round(Math.min(forty, 1) * 100)}%
                  {forty > 1 && (
                    /* Fades in rather than appearing: this is the answer to the
                       question the panel exists to ask, and it used to arrive as a
                       text fragment with no acknowledgement at all. */
                    <span className="text-timber filter-swap"> · ×{forty.toFixed(2)}</span>
                  )}
                </p>
              </div>
              {/* scaleX, not width: width animates layout, transform composites.
                  The fill also changes colour once the plan passes one container:
                  `Math.min` pins the transform at 1 from that point on, so colour is
                  the only channel left to carry the one state change a buyer is
                  actually watching for. Clay-soft rather than clay — this is a filled
                  bar on the ink ground, where `--clay` is too dark to read and
                  `--clay-soft` is documented as decorative-only, which is exactly what
                  a bar fill is. */}
              <div className="h-1.5 bg-paper/15 mt-2.5 overflow-hidden">
                <div
                  className={`h-full origin-left transition-[transform,background-color] duration-base ease-out ${
                    forty > 1 ? 'bg-clay-soft' : 'bg-timber'
                  }`}
                  style={{ transform: `scaleX(${Math.min(forty, 1)})` }}
                />
              </div>
```

Note the `transition-[transform,background-color]` shorthand replaces
`transition-transform` so the colour crossfades rather than snapping. `bg-clay-soft`
maps to `--clay-soft: #C0674A` (`tailwind.config.js:23-25`).

## Repo conventions to follow

- Palette discipline, `src/styles/tailwind.css:12-16` and `:31-36`: `--clay-soft` is
  labelled *"decorative only, never text on teal"*. A bar fill is decorative, not text,
  so this is a sanctioned use. `--timber` is the neutral data colour on dark grounds.
  Do not introduce red or amber — the palette has neither.
- The multi-property shorthand pattern `transition-[transform,background-color]` is
  already used at `src/app/components/HeroSection.tsx:109`. Follow that spelling.
- `.filter-swap` for content that mounts on a state change
  (`src/styles/tailwind.css:319-340`).
- Tokens only: `duration-base` + `ease-out`. If plan 014 has landed, this line will read
  `duration-fast` — keep whichever is there and do not revert it.

## Also considered and rejected

- **Counting the totals up as they change.** Quantities arrive by keystroke
  (`src/app/collections/private/catalogue/components/PrivatePiece.tsx:57-60`), so a
  per-digit count-up on Designs / Pieces / Volume would animate on every keypress —
  squarely a frequency violation. The totals teleporting is correct.
- **Letting the bar overflow past 100%.** It is a fixed-width meter; growing past its
  track means either clipping or a layout change.
- **A second bar segment for container two.** More structure than the moment warrants,
  and it would push the planner taller on a phone where it is already capped at `60vh`.

## Steps

1. In `src/app/collections/private/catalogue/components/ContainerPlan.tsx`, replace lines
   189-199 with the **Target** block.
2. Nothing else.

## Boundaries

- Do NOT change `Math.min(forty, 1)` in the `transform`. Removing the clamp overflows the
  track.
- Do NOT change the `{twenty.toFixed(2)} × 20 ft equivalent` line at `:201-203`.
- Do NOT add a pulse, a flash, a repeat animation, or anything on a loop. This bar is on
  screen for the whole session; recurring motion here would be a frequency violation
  regardless of how rare the crossing is.
- Do NOT introduce a colour outside the palette in `src/styles/tailwind.css:19-41`.
- Do NOT change the totals at `:163-183`.
- Do NOT add new dependencies.
- If lines 186-204 do not match the **Problem** excerpt, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: behind the gate at `/collections/private/catalogue`. If you cannot reach
  it, say so rather than guessing.
  - You need more than 67 CBM to cross the threshold. `Sanchore Glazed Hutch` (VI-1244) is
    1.32 CBM per piece, so **51 pieces** is 67.3 CBM — just over. Enter `50` first: the bar
    should be near-full and **timber**. Then change it to `51`: the fill must **crossfade
    to clay-soft** over 320ms and `· ×1.01` must fade up beside the percentage.
  - Go back to `50`. The bar must return to timber, crossfading — the state must be
    reversible, not a one-way latch.
  - Push it to `200` pieces. The bar must stay full and clay-soft, and only the `×`
    figure should change. No flicker.
  - Contrast check: with the bar clay-soft on the ink ground, confirm it is still clearly
    distinguishable from the `bg-paper/15` track behind it. If it reads as muddy, report
    it rather than substituting another colour.
  - In DevTools → Animations at 10% playback, cross the threshold and confirm the colour
    interpolates rather than snapping.
  - Toggle **Emulate prefers-reduced-motion: reduce** and cross the threshold: the colour
    change must still **happen**, just instantly. The information must not be lost — if
    the bar stays timber over capacity, that is a bug.
- **Done when**: crossing one container's worth of volume crossfades the fill to
  clay-soft and fades in the multiplier, the change reverses when volume drops back, and
  the colour still changes under reduced motion.
