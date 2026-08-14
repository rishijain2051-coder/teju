# 023 — Let a manual plate selection own the carousel

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: LOW
- **Category**: Purpose (motion overriding a user action)
- **Estimated scope**: 1 file, 2 lines

## Problem

The hero's autoplay timer is never reset when the visitor picks a plate, so the
carousel overrides a deliberate choice.

```tsx
/* src/app/components/HeroSection.tsx:12, 18-22 — current */
const HOLD = 7000;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % PLATES.length), HOLD);
    return () => clearInterval(id);
  }, []);
```

```jsx
/* src/app/components/HeroSection.tsx:94-97 — current, the manual control */
              <button
                key={plate}
                type="button"
                onClick={() => setActive(i)}
```

The dependency array is `[]`, so one interval is created at mount and keeps its own
schedule for the life of the page regardless of what the user does. Click a plate 6.5
seconds into a cycle and the carousel advances past it 500ms later — mid-crossfade,
since the crossfade itself runs 1400ms (`:128`).

The crossfade is a CSS transition, so it retargets correctly rather than restarting —
that part is right. The defect is purely that the timer does not yield. From the
visitor's side the control feels contested: you asked for plate 1 and got plate 2.

## Target

Depend on `active`. The effect then tears down and re-arms its interval whenever the
active plate changes — from a click *or* from an auto-advance — so every plate gets a
full `HOLD` on screen and a manual choice is never cut short.

```tsx
/* target — src/app/components/HeroSection.tsx:18-22 */
  /*
   * Keyed on `active`, not mounted once: the interval is re-armed every time the
   * plate changes, so a plate the visitor picked gets the full HOLD rather than
   * whatever was left of a cycle that started before they clicked. With `[]` a
   * click 6.5s into a cycle was overridden 500ms later, mid-crossfade.
   */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % PLATES.length), HOLD);
    return () => clearTimeout(id);
  }, [active]);
```

`setTimeout` rather than `setInterval`: with `active` in the deps the effect re-runs
after every change anyway, so a repeating timer would be torn down before it ever
repeated. A single timeout says what is actually happening.

## Also found, deliberately NOT changed

```jsx
/* src/app/components/HeroSection.tsx:153-155 */
            <p className="text-manifest-sm text-paper/75 numeral">
              Plate {String(active + 1).padStart(2, '0')} / {String(PLATES.length).padStart(2, '0')}
            </p>
```

The caption flips instantly at the start of the 1400ms crossfade, so for over a second
it names a plate that is still mostly transparent. Arguably a desync — but the caption
labels *which plate is selected*, not which is fully painted, and after a click it is
the only immediate confirmation the visitor gets that their press registered. Delaying
or crossfading it would make the control feel less responsive, not more. Leaving it.

## Repo conventions to follow

- `HOLD` at `src/app/components/HeroSection.tsx:12` is the single source for the plate
  timing, with its rationale at `:10` (*"Three portrait plates, held long enough to
  actually be looked at."*). Keep using it; do not inline 7000.
- The reduced-motion guard on the first line of the effect must stay — it is what stops
  the carousel advancing at all for a reader who asked for less motion.
- Non-obvious decisions get a prose comment at the decision. The comment in **Target**
  is written to that standard.

## Steps

1. In `src/app/components/HeroSection.tsx`, replace the `useEffect` at lines 18-22 with
   the **Target** block.
2. Nothing else.

## Boundaries

- Do NOT change `HOLD`.
- Do NOT remove the `prefers-reduced-motion` early return.
- Do NOT add pause-on-hover or pause-on-focus. It is a reasonable idea and it is a
  different change; adding it here would make this plan's one-line effect impossible to
  review in isolation.
- Do NOT touch the caption at `:153-155` — see above.
- Do NOT touch the crossfade at `:128` (plan 022) or the `.drift` timings
  (plan 020).
- Do NOT convert the timer to a ref-based scheduler or add a library.
- Do NOT add new dependencies.
- If lines 18-22 do not match the **Problem** excerpt, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0. The `react-hooks/exhaustive-deps` rule is active via
    `next/core-web-vitals`; `[active]` must satisfy it without a suppression comment. If
    it asks for more deps, STOP and report rather than adding an eslint-disable.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: `npm run dev`, open `http://localhost:4028` on a viewport at least
  1024px wide — the plate index is `hidden lg:flex`.
  - Wait about 6 seconds after a plate change, then click a *different* plate. It must
    stay on screen for a full 7 seconds. Before this change it is replaced within a
    second, mid-crossfade.
  - Click the *same* plate that is already active. Nothing should visibly happen, and the
    timer should not reset — `setActive(i)` with the current `i` is a no-op, so `active`
    does not change and the effect does not re-run. Confirm the next auto-advance still
    arrives on the original schedule.
  - Click through all three plates in quick succession. Each click must take effect
    immediately, and the carousel must resume 7 seconds after the last one.
  - Leave the hero alone for 30 seconds. Auto-advance must still cycle every 7 seconds —
    this plan must not stop the carousel.
  - Check for a leak: in the console, click a plate ten times, then leave the page for a
    minute. There must be exactly one pending timer — the plate must advance once per 7s,
    not in bursts. (If it accelerates, the cleanup is not firing.)
  - Toggle **Emulate prefers-reduced-motion: reduce** and reload: the carousel must not
    advance at all, and the plate index must still switch plates when clicked.
- **Done when**: a clicked plate always gets a full 7 seconds, auto-advance still runs on
  its own, no timers accumulate, and reduced motion still disables autoplay entirely.
