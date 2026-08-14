# 020 — Stop `.drift` from never settling

- **Status**: DONE — with one addition the Target below did not anticipate. Halving
  the duration alone left each plate unwinding for the full 7s after it went
  inactive, so one plate was always mid-reverse and the "Done when" was not met.
  A `.drift:not(.shown) { transition: none }` rule was added so the reverse snaps
  while the plate is invisible behind the finished crossfade. Measured after:
  **2 of 3 plates idle at every sample** (was 0 of 3), peak scale 1.0636 against a
  declared 1.065 (the old CSS declared 1.11 and never passed ~1.065).
- **Commit**: `82fdc65`
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file, 2 lines

## Problem

The hero's ambient drift is a **14-second transition driven by a 7-second interval**,
so it never reaches either endpoint and never idles.

```css
/* src/styles/tailwind.css:399-408 — current */
  /* Slow ambient drift on hero stills. Disabled under reduced motion by the
     global rule above. */
  .drift {
    transform: scale(1.02);
    transition: transform 14s linear;
  }

  .drift.shown {
    transform: scale(1.11);
  }
```

```tsx
/* src/app/components/HeroSection.tsx:12, 20, 145 — current */
const HOLD = 7000;
    const id = setInterval(() => setActive((i) => (i + 1) % PLATES.length), HOLD);
                  className={`object-cover drift ${i === active ? 'shown' : ''}`}
```

`.drift` is a `transition`, not an `animation`, so removing `.shown` **reverses** it
rather than resetting it. Trace one plate: it gains `.shown` at t=0 and starts
climbing 1.02 → 1.11 over 14s. At t=7000 it loses `.shown` at roughly 1.065 and
begins a 14s descent back toward 1.02 — which would finish at t=21000, exactly when
it is reactivated.

Consequences:

1. **Two of three plates are mid-transform at every instant, for the life of the page.**
   The compositor never reaches idle, so the GPU stays clocked up indefinitely. On a
   phone that is battery cost for motion nobody is looking at.
2. **Roughly 12.6 of every 14 seconds animates a fully transparent element.** The
   outgoing plate's opacity transition is only 1400ms
   (`src/app/components/HeroSection.tsx:128`), so the remaining ~12.6s of reverse drift
   runs on an invisible image.
3. **The declared scale is never reached.** The effect tops out near 1.065 instead of
   1.11, so the CSS overstates the motion by about 2×.
4. The comment claims `.drift` is *"Disabled under reduced motion by the global rule
   above"*. It is not disabled — the global rule collapses its duration, so it snaps to
   `scale(1.11)` and holds there as a static crop. Harmless in effect, but the comment
   misdescribes the mechanism and should be corrected while we are here.

## Target

Match the transition duration to the hold, so a plate completes its travel in the time
it is actually on screen and is settled before it hands over.

```css
/* target — src/styles/tailwind.css */
  /*
   * Slow ambient drift on hero stills.
   *
   * 7s, matching HOLD in HeroSection: this is a transition, not an animation, so
   * dropping `.shown` reverses it rather than resetting. At 14s against a 7s hold no
   * plate ever reached either end — two of the three were mid-transform at every
   * instant for the life of the page, ~12.6s of each cycle ran on a fully transparent
   * image, and the declared 1.11 was never reached (it topped out near 1.065). Keep
   * this number in step with `HOLD` in src/app/components/HeroSection.tsx.
   *
   * The travel is reduced to match: 1.02 -> 1.065 is what was actually visible before,
   * so holding the same visual range keeps the hero looking unchanged while letting
   * the transform finish and the compositor go idle between cycles.
   *
   * Under reduced motion the global rule collapses the duration, so the image snaps to
   * its end scale and holds as a static crop — no motion, which is the intent.
   */
  .drift {
    transform: scale(1.02);
    transition: transform 7s linear;
  }

  .drift.shown {
    transform: scale(1.065);
  }
```

Two deliberate choices to be aware of:

- **Duration halved, not doubled.** Slowing the interval to 14s would also work
  arithmetically, but `HOLD = 7000` is a content decision — the comment at
  `src/app/components/HeroSection.tsx:10` says the plates are *"held long enough to
  actually be looked at"* — and doubling the hold changes the hero's pacing. The
  transition is the part that was wrong.
- **End scale reduced from 1.11 to 1.065.** This is not a visual change; 1.065 is what
  the effect was already reaching. Leaving it at 1.11 would make the drift visibly
  faster than it is today, which is a change nobody asked for.

## Repo conventions to follow

- `linear` for constant ambient motion, per the playbook's *"Constant motion (marquee,
  progress) → linear"*. Already correct; keep it.
- The file documents cross-file coupling explicitly where it exists — see
  `src/styles/tailwind.css:370-371`, *"Kept in step with `yPercent` in MotionProvider,
  which owns the same transform once GSAP loads."* The comment above follows that
  pattern for the `HOLD` coupling.
- `.drift` is deliberately excluded from `useReveal`'s selector
  (`src/components/ui/useReveal.ts:5-8`) because React owns its `shown` class. Do not
  change that.

## Steps

1. In `src/styles/tailwind.css`, replace lines 399-408 (the comment and both `.drift`
   rules) with the **Target** block.
2. Do not change `HOLD` or anything else in `src/app/components/HeroSection.tsx`.

## Boundaries

- Do NOT convert `.drift` to a `@keyframes` animation. A transition is what makes the
  handover reverse smoothly when a buyer clicks the plate index mid-cycle, and plan 023
  depends on that behaviour.
- Do NOT change `HOLD` in `HeroSection.tsx`.
- Do NOT add `will-change`. The comment at `src/styles/tailwind.css:419-423` records why
  it was removed from `.plate img` and the same reasoning applies.
- Do NOT add a reduced-motion override for `.drift`. The global rule's snap-and-hold is
  the desired outcome; the comment now says so accurately.
- Do NOT change the 1400ms crossfade on `HeroSection.tsx:128` (plan 022 owns that).
- Do NOT add new dependencies.
- If lines 399-408 do not match the **Problem** excerpt, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: `npm run dev`, open `http://localhost:4028` and leave the hero alone
  for a full minute.
  - The drift must look **the same as before this change**. That is the goal: this is a
    performance fix, not a visual one. If the zoom now reads as noticeably faster, the
    end scale was left at 1.11 — go back and set it to 1.065.
  - Settling check, the point of the plan. Run this in the console and watch it for
    ~20 seconds:
    ```js
    setInterval(() => console.log(
      [...document.querySelectorAll('.drift')].map(el =>
        getComputedStyle(el).transform.match(/matrix\(([\d.]+)/)?.[1]).join('  ')
    ), 1000);
    ```
    Before this change, two of the three numbers change every second, forever. After,
    each plate must reach a **stable** value and hold it until it next changes state —
    you should see the two inactive plates sitting still at `1.02`.
  - DevTools → More tools → Performance monitor. Leave the hero idle for 30s. CPU and
    GPU activity should drop to near-idle between transitions; before this change there
    is continuous compositor work.
  - Click through the three plate-index rules quickly. The images must not jump — the
    transition should retarget from wherever each scale had reached.
  - Toggle **Emulate prefers-reduced-motion: reduce** and reload: no zoom at all, and
    the plate must still be visible (it should sit at `scale(1.065)` as a static crop,
    not blank).
- **Done when**: the two inactive hero plates hold a constant `scale(1.02)` rather than
  drifting continuously, the visible motion is indistinguishable from before, and the
  performance monitor shows the compositor going idle between cycles.
