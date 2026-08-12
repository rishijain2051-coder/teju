# Animation plans

Produced by an `improve-animations` audit at commit `bbab222`. Each plan is
self-contained: exact file paths, current code, target values, and a feel check.

Three of these are functional bugs rather than polish — content that is present in
the DOM but invisible to the reader (001, 005, 009). They were found by measuring
the running page, not by reading the source, and none of them would show up in a
typecheck or a build.

## Plans

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
| [010](010-stagger-the-mobile-menu.md) | Stagger the mobile menu open | LOW | Missed opportunity | DONE |

## Verified results

All ten landed and were measured on the running site, not just typechecked.

| Check | Before | After |
| --- | --- | --- |
| Catalogue cards invisible after filtering (back to All) | 12 of 12 | **0** |
| Contact confirmation panel opacity after submit | `0` | **`1`** |
| Distinct hero wipe transforms per load | 2 (a snap) | **94** |
| `transition-all` occurrences in `src/` | 1 | **0** |
| `.drift` elements claiming `shown` | 3 of 3 | **1 of 3** |
| Hover-gate media queries | 0 | **3** |
| Card hover duration | 640ms | **180ms** |
| Mobile menu item delays on open | none | **80/120/160/200/240ms** |
| Mobile menu item delays on close | n/a | **all 0s** |
| Reveal elements left invisible under reduced motion | 0 | **0** (unchanged) |
| Hover movement fired on a coarse pointer | yes | **no** |

`npx tsc --noEmit` exits 0 and `npm run build` produces 12 static routes at a
210 kB first load, unchanged.

## Recommended order

Run the four correctness fixes first — they change what the reader can actually
see:

1. **001** — invisible catalogue cards. Introduces the shared `.filter-swap`
   utility that 009 also uses.
2. **009** — invisible form confirmations. Depends on `.filter-swap` from 001.
3. **005** — hero and every page heading hard-cutting instead of animating.
4. **002** — `transition-all` on a `width`, in the hero.

Then the feel work:

5. **003** — hover gating and tempo. Touches the same `.btn` transition list as
   006, so land it first.
6. **006** — press feedback. Its **Target** assumes 003's `var(--dur-fast)`
   durations; if run before 003, keep the existing durations and only append the
   `transform` entry.
7. **004** — single owner for `.drift`. Independent.
8. **007** — hero crossfade blur. Independent.
9. **008** — remove the dead inline stagger. Run **after** 001, which already
   strips the delays from the two filtered grids.
10. **010** — mobile menu stagger. Independent; purely additive.

## Dependencies

```
001 ──> 009        (009 uses the .filter-swap utility 001 adds)
001 ──> 008        (001 removes two of the transitionDelay props 008 targets)
003 ──> 006        (both edit the .btn transition list)
```

005, 002, 004, 007 and 010 are independent of everything else.

## Notes

- Plans 001 and 009 share a root cause: a one-shot scroll reveal cannot own
  content that mounts later. If a third dynamically-mounted `.rise` appears in
  future, it will have the same bug — the fix pattern is `.filter-swap`, not
  `.rise`.
- 005 is subtle and easy to regress. Its verification includes a frame sampler
  because the failure mode looks like "the animation is just fast".
- No plan changes `useReveal.ts` or `MotionProvider.tsx` behaviour except 004's
  one-line selector change. The two-system reveal architecture is sound; the bugs
  are all at its boundaries.
