# Animation plans

Two audits so far. Each plan is self-contained: exact file paths, current code, target
values, and a feel check.

- **Audit 1** — commit `bbab222`, plans 001–010, all landed.
- **Audit 2** — commit `82fdc65`, plans 011–028. **011–027 are landed**; 028 was written
  up and declined. The site grew from 12 routes to 46 between the two audits, including
  the whole gated trade catalogue, which audit 1 never saw.

---

## Audit 2 — commit `82fdc65`

Four of these are functional or dead-on-arrival, not polish: content that is invisible
(012), motion that has never run (013, 021), and a reduced-motion experience that is
worse than the animated one (011). None of them would fail a typecheck or a build.

| # | Title | Severity | Category | Status |
| --- | --- | --- | --- | --- |
| [011](011-reduced-motion-delays.md) | Reset transition and animation delays under reduced motion | **HIGH** | Accessibility | DONE |
| [012](012-contact-form-invisible-after-send-another.md) | Stop the contact form vanishing after "Send another" | **HIGH** | Interruptibility | DONE |
| [013](013-mobile-menu-never-animates.md) | Make the mobile menu actually animate | **HIGH** | Interruptibility | DONE |
| [014](014-interaction-tempo.md) | Bring every interaction transition into budget and onto the house curve | **HIGH** | Easing & duration | DONE |
| [015](015-grain-needs-a-positioned-host.md) | Give the four unpositioned grain sections their texture back | MEDIUM | Performance | DONE |
| [016](016-sort-should-not-replay-the-grid.md) | Stop a sort re-order replaying the whole grid | MEDIUM | Purpose & frequency | DONE |
| [017](017-container-planner-strobe.md) | Keep the container planner mounted, and dock it from the edge | MEDIUM | Interruptibility | DONE |
| [018](018-dossier-interruptible.md) | Make the trade dossier interruptible | MEDIUM | Interruptibility | DONE |
| [019](019-press-feedback-everywhere.md) | Give the remaining controls a press state | MEDIUM | Physicality | DONE |
| [020](020-drift-never-settles.md) | Stop `.drift` from never settling | MEDIUM | Performance | DONE |
| [027](027-reduced-motion-keep-the-colour-cues.md) | Keep the colour and opacity cues under reduced motion | MEDIUM | Accessibility | DONE |
| [021](021-delete-motion-that-never-runs.md) | Delete the motion that never runs | LOW | Cohesion | DONE |
| [022](022-stray-durations-onto-tokens.md) | Put the stray durations onto tokens | LOW | Cohesion & tokens | DONE |
| [023](023-carousel-yields-to-the-user.md) | Let a manual plate selection own the carousel | LOW | Purpose | DONE |
| [024](024-animate-the-sent-container-plan.md) | Animate the sent container plan | LOW | Missed opportunity | DONE |
| [025](025-acknowledge-access-granted.md) | Acknowledge access granted | LOW | Missed opportunity | DONE |
| [026](026-mark-the-capacity-threshold.md) | Mark the moment a plan outgrows one container | LOW | Missed opportunity | DONE |
| [028](028-two-changes-i-recommend-declining.md) | Two changes I recommend declining | LOW | Cohesion / purpose | **NOT RECOMMENDED** |

### Verified results

Measured on the running site, not just typechecked. `npm run type-check` and
`npm run lint` exit 0, `npm run build` produces 46 routes, all 46 Playwright tests
pass, and a 40-route sweep of the rendered HTML reports 0 problems.

| Check | Before | After |
| --- | --- | --- |
| Interactive colour transitions at 320ms (home page) | 69 | **9** — all four documented exceptions, 0 misses |
| Colour transitions on Tailwind's stock curve | 61 | **1** — the masthead hairline, excluded by plan 014 |
| Colour transitions at 180ms | 11 | **60** |
| Mobile overlay: distinct opacity values while opening | 1 (hard cut) | **9** |
| Mobile menu labels: distinct positions while opening | 1 (never moved) | **13**, first at 90ms, last at 240ms |
| Mobile menu: distinct opacity values while closing | 1 (hard cut) | **6**, all delays 0s |
| Focusable elements reachable behind the closed menu | 8 would be, without `hidden` | **0** (`inert`) |
| Hero plates idle rather than mid-transform | 0 of 3, permanently | **2 of 3**, at every sample |
| Hero drift peak scale | ~1.065 while declaring 1.11 | **1.0636** against a declared 1.065 |
| `.grain::after` containing block on `/craft` | initial containing block (viewport) | **the `#fsc` section itself** |
| Quantities surviving a catalogue sort | none — the remount cleared them | **preserved** |
| Open dossiers surviving a sort | 0 | **stay open** |
| Planner mounted through an edit that passes empty | no — it unmounted and replayed | **yes** |
| `main` padding-bottom during that edit | 192px → 12px → 192px | **192px throughout** |
| Dossier opacity 90ms into a close | n/a — it vanished | **0.038**, i.e. fading |
| Container fill at capacity | timber `rgb(185,138,82)`, no change | **clay-soft `rgb(192,103,74)`**, and reversible |
| `duration-crossfade` token resolves | n/a | **1.4s** |
| Arbitrary `duration-[…]` values in `src` | 1 | **0** |

Two corrections were made to the plans while executing them, both recorded in the
plans themselves:

- **020** — halving the duration alone did not meet its own "Done when": each plate
  still unwound for 7s after going inactive, so one was always mid-reverse. A
  `.drift:not(.shown) { transition: none }` rule was added so the reverse snaps while
  the plate is invisible behind the finished crossfade.
- **014** — its console check claimed it should report `0`. It reports `9`, because
  `transitionProperty.includes('color')` also matches the exceptions' `border-color`,
  `color, transform` and `background-color` shorthands. The plan now says what the 9 are.

### Recommended order

Kept for the record; this is the order the plans were actually executed in.

**First — the four that change what the reader can actually see or use.**

1. **011** — reduced motion. Two lines, no judgement required, and every later plan's
   reduced-motion check assumes it has landed. Do this one first regardless of what else
   you do.
2. **012** — the contact form is a dead end after "Send another". One line.
3. **013** — the mobile menu has never animated. Needs `inert`, not just deleting
   `hidden`, or five links stay tabbable while the menu is closed.
4. **014** — the 320ms/stock-curve sweep. 52 token edits across 22 files; mechanical, and
   the single biggest change to how the site feels.

**Then the rest, cheapest-first within each group.**

5. **015** — four words. Four teal sections get their texture back.
6. **016** — one line. Sorting stops blinking 39 cards.
7. **020** — two lines. The hero stops animating forever.
8. **019** — press feedback. Folds into `.tap`, so six of the ten controls are fixed by
   the CSS change alone.
9. **018** — the dossier. Adds a `.disclose` primitive.
10. **017** — the container planner. **Two stages**; verify stage 1 before starting stage 2.
11. **027** — reduced-motion colour cues. Requires 011.
12. **021** — delete the dead motion. Run **after 014 and 019**, which both touch
    `TestimonialsSection.tsx:53`.
13. **022**, **023** — token cleanup and the carousel.
14. **024**, **025**, **026** — the three additive ones. Purely optional; nothing depends
    on them.
15. **028** — read it, then decline it. It exists for completeness.

### Dependencies

```
011 ──> 013        (013's reduced-motion check assumes 011's delay reset)
011 ──> 027        (hard prerequisite; 027 checks for it and stops if absent)
014 ──> 021        (both edit TestimonialsSection.tsx:53 — 021 removes what 014 rewrote)
019 ──> 021        (same line; 021 must keep the `tap` class 019 adds)
014 ──> 026        (026's fill-bar line reads duration-fast once 014 has landed)
020 ──> 023        (023 relies on .drift staying a transition, which 020 preserves)
```

`012`, `015`, `016`, `017`, `018`, `022`, `024`, `025` are independent of everything else.

Three plans touch `ContainerPlan.tsx` (017, 024, 026) and three touch `HeroSection.tsx`
(019, 022, 023), but each edits different lines. Run them in the order above and the diffs
will not collide.

### Notes

- **Plan 010 never took effect.** Audit 1 added the mobile-menu stagger and verified it by
  reading `transitionDelay` off the DOM — which is set whether or not a transition ever
  runs. Plan **013** explains why the `hidden` attribute meant it could not run, in either
  direction, for any user. The delays themselves are correct and are left alone.
- **The same bug class has now appeared three times.** A one-shot scroll reveal cannot own
  content that mounts later: plans 001 and 009 fixed it in the filtered grids and the
  success panels, and **012** fixes it on the contact form's return path. A repo-wide scan
  found 11 other `.rise` elements inside conditional branches; all are server-rendered
  conditionals that mount with the page, so 012 is the last live instance. If a fourth
  appears, the fix is `.filter-swap`, not `.rise`.
- **A second dead-motion class:** inline `transitionDelay` on an element GSAP owns is
  inert, because `.motion-js .rise:not(.shown)` strips the transition and GSAP ignores CSS
  delays. Nine such declarations remain (plan **021**). The distinguishing test is whether
  the component reveals with `immediate: true` — if it does, the delay is live and must be
  left alone. 21 are live.
- **Verification gap to close.** `node_modules` was mid-rewrite during this audit (a
  concurrent `next` 15.5.23 bump), so the gated catalogue could not be exercised live.
  Plans 016, 017, 018, 019, 024 and 026 are confirmed from source; their feel checks say
  explicitly not to mark them done on mechanical checks alone.
- **Audited and found correct** — do not "fix" these: zero `transition: all`, zero
  `ease-in`, zero animated layout properties, zero standing `will-change`, zero CSS
  variables driving child transforms, one parallax element per route at most, blur well
  under the 20px ceiling, no focus state gated behind a hover query, every hover
  *transform* gated behind `(hover: hover) and (pointer: fine)`, and JS-side reduced-motion
  handling that is genuinely thorough — GSAP is never even fetched. The gaps this audit
  found are all on the CSS side or at the boundaries between the two reveal systems.

---

## Audit 1 — commit `bbab222`

Three of these were functional bugs rather than polish — content present in the DOM but
invisible to the reader (001, 005, 009). They were found by measuring the running page,
not by reading the source.

| # | Title | Severity | Category | Status |
| --- | --- | --- | --- | --- |
| [001](001-filter-reveal-blanks-cards.md) | Stop category filtering from hiding cards permanently | **HIGH** | Interruptibility | DONE |
| [002](002-hero-indicator-transform.md) | Animate the hero plate indicator with transform, not width | **HIGH** | Performance | DONE |
| [003](003-hover-feedback-gating-and-tempo.md) | Gate hover motion to real pointers and bring its tempo into budget | MEDIUM | Accessibility + duration | DONE |
| [004](004-single-owner-for-drift.md) | Give `.drift` a single owner | MEDIUM | Cohesion | DONE |
| [005](005-hero-wipe-snaps-on-handover.md) | Stop the motion-layer handover from truncating the hero entrance | **HIGH** | Interruptibility | DONE |
| [006](006-press-feedback.md) | Give buttons a press state | MEDIUM | Physicality | DONE |
| [007](007-blur-mask-hero-crossfade.md) | Blur-mask the hero plate crossfade | LOW | Cohesion | DONE |
| [008](008-remove-duplicated-stagger.md) | Remove the dead inline stagger | LOW | Cohesion | DONE |
| [009](009-form-success-panels-invisible.md) | Make the form success panels visible | **HIGH** | Interruptibility | DONE |
| [010](010-stagger-the-mobile-menu.md) | Stagger the mobile menu open | LOW | Missed opportunity | DONE — **but see plan 013** |

### Verified results

| Check | Before | After |
| --- | --- | --- |
| Catalogue cards invisible after filtering (back to All) | 12 of 12 | **0** |
| Contact confirmation panel opacity after submit | `0` | **`1`** |
| Distinct hero wipe transforms per load | 2 (a snap) | **94** |
| `transition-all` occurrences in `src/` | 1 | **0** |
| `.drift` elements claiming `shown` | 3 of 3 | **1 of 3** |
| Hover-gate media queries | 0 | **3** |
| Card hover duration | 640ms | **180ms** |
| Mobile menu item delays on open | none | **80/120/160/200/240ms** ⚠️ |
| Mobile menu item delays on close | n/a | **all 0s** ⚠️ |
| Reveal elements left invisible under reduced motion | 0 | **0** (unchanged) |
| Hover movement fired on a coarse pointer | yes | **no** |

⚠️ Those two rows measured the presence of the delay values in the DOM, not the
transitions running. Audit 2 established that the `hidden` attribute prevents any
transition on that overlay from starting, so the stagger has never been visible. See
plan **013**.

`npx tsc --noEmit` exits 0 and `npm run build` produced 12 static routes at a 210 kB first
load. (At `82fdc65` the site builds 46 routes at 102 kB shared / 138 kB on the home page.)
