# 017 — Keep the container planner mounted, and dock it from the edge

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: MEDIUM
- **Category**: Interruptibility + physicality
- **Estimated scope**: 2 files, ~25 lines. **Land in two stages** — see Steps.

## Problem

Three defects in one component. Read all three before starting; the fix for the
third is trivial and the fix for the first two is not.

### A. The planner strobes while a quantity is being edited

```jsx
/* src/app/collections/private/catalogue/components/ContainerPlan.tsx:46 — current */
  if (selection.rows.length === 0) return null;
```

```jsx
/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:117-125 — current, abridged */
  const setQuantity = useCallback((pieceRef: string, next: number) => {
    setQuantities((prev) => {
      if (next <= 0) {
        const { [pieceRef]: _drop, ...rest } = prev;
        return rest;
      }
      return { ...prev, [pieceRef]: next };
    });
  }, []);
```

The quantity input coerces an empty string to `0`
(`src/app/collections/private/catalogue/components/PrivatePiece.tsx:57-60`). So with
one design selected, a buyer correcting "12" to "20" — select-all-and-type, or
backspace first — produces an intermediate keystroke where `quantities` is empty.
The planner unmounts, then remounts on the next digit and replays its 260ms
keyframe from `opacity: 0`. Keyframes restart from zero; a transition would have
retargeted and held steady.

### B. 176px of page height snaps with it

```jsx
/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:141 — current */
  const planning = Object.keys(quantities).length > 0;
```
```jsx
/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:169-174 — current */
      <main
        id="main"
        /* No transition on the padding: animating it would reflow the whole
           page every frame, and the change happens below the fold anyway. */
        className={`flex-1 pt-12 lg:pt-16 ${planning ? 'pb-56 lg:pb-48' : 'pb-12 lg:pb-16'}`}
      >
```

`pb-56` is 14rem and `pb-12` is 3rem, so the same transient empty keystroke removes
~176px of page height instantly. If the buyer is scrolled near the bottom of the
page — which is exactly where the planner is — the viewport shifts under them. The
comment is right that the padding must not be *transitioned*; the defect is that it
changes at all mid-edit.

### C. A bar docked to the bottom edge enters by drifting up 8px

```jsx
/* src/app/collections/private/catalogue/components/ContainerPlan.tsx:139-142 — current */
    <aside
      aria-label="Container plan"
      className="sticky bottom-0 z-30 bg-ink text-paper border-t border-line-invert filter-swap"
    >
```

`.filter-swap` enters from `translate3d(0, 0.5rem, 0)`
(`src/styles/tailwind.css:331-340`) — a fixed 8px offset written for content swapped
*inside* a page. This bar is flush against the bottom of the viewport and has an
obvious origin to arrive from. The playbook names the tool: *"`translate`
percentages (`translateY(100%)` = element's own height) … no hardcoded pixel
offsets."* `src/components/Header.tsx:141` already uses `translate-y-full` for
exactly this in this repo.

## Target

### Stage 1 — dock from the edge (safe, self-contained)

Drop `filter-swap` and drive the entrance from a mounted flag, so the bar rises its
own full height from the bottom edge.

```jsx
/* target — ContainerPlan.tsx, replacing the aside opening tag */
    <aside
      aria-label="Container plan"
      data-docked={docked ? '' : undefined}
      /*
       * `translateY(100%)` -> `0`, not `.filter-swap`. This bar is flush with the
       * bottom of the viewport, so it should arrive from the edge it docks to
       * rather than drift up 8px from a position it is already fully visible in.
       * A transition, not a keyframe: the bar's visibility is reversible, and a
       * keyframe restarts from zero every time it is retriggered.
       */
      className="sticky bottom-0 z-30 bg-ink text-paper border-t border-line-invert translate-y-full data-[docked]:translate-y-0 transition-transform duration-base ease-out"
    >
```

with, above the `return`:

```tsx
  /* One frame at the undocked transform before the docked one is applied, so the
     transition has a before-change state to run from. Without this the bar is
     already at translateY(0) on its first painted frame and the rise is skipped —
     the same trap the mobile overlay fell into (see plans/013). */
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDocked(true));
    return () => cancelAnimationFrame(id);
  }, []);
```

`data-[docked]:` requires no config change — Tailwind 3 supports arbitrary data
attribute variants out of the box.

### Stage 2 — stop the strobe

Keep zero-valued refs in state so `planning` does not flicker, and let the planner
stay docked once engaged until it is explicitly cleared.

```tsx
/* target — PrivateCatalogue.tsx, replacing setQuantity */
  /*
   * A ref set to 0 is kept, not deleted. Deleting it made `planning` false on the
   * intermediate keystroke of any edit that passes through empty — backspacing
   * "12" to type "20" — which unmounted the planner and snapped 176px of page
   * padding away under a buyer who was scrolled to the bottom of the page looking
   * at it. `ContainerPlan` already filters on `> 0`, so a zero entry contributes
   * nothing to the totals. `onClear` resets the whole object, which is the one
   * deliberate way back to no selection.
   */
  const setQuantity = useCallback((pieceRef: string, next: number) => {
    setQuantities((prev) => ({ ...prev, [pieceRef]: Math.max(0, next) }));
  }, []);
```

```tsx
/* target — PrivateCatalogue.tsx, replacing `planning` */
  /* Any entry at all, including zeros, so the reserved space does not thrash
     while a quantity is being edited. */
  const planning = Object.values(quantities).length > 0;
```

and in `ContainerPlan.tsx`, replace the early return so the bar survives a
transient empty selection:

```tsx
/* target — ContainerPlan.tsx, replacing `if (selection.rows.length === 0) return null;` */
  /* Not `return null` on an empty selection: that unmounted the bar on the empty
     keystroke of an ordinary edit and replayed its entrance on the next one. The
     bar stays mounted and reads zeros; `onClear` is the way to dismiss it. */
  const engaged = Object.keys(quantities).length > 0;
  if (!engaged) return null;
```

## Repo conventions to follow

- Tokens only: `duration-base` (320ms) and `ease-out` (`var(--ease-out)`). 320ms is
  the right band here — the playbook puts drawers at 200–500ms, and this bar is a
  drawer.
- `translate-y-full` percentage travel, exemplar `src/components/Header.tsx:141`.
- Every non-obvious decision gets a prose comment at the decision. All four comments
  above are written to that standard; use them as given.
- `useCallback` for state setters passed to 39 children, as the file already does.

## Steps

1. **Stage 1 only.** In `ContainerPlan.tsx`: add `useEffect` to the existing React
   import if absent, add the `docked` state and effect above the `return`, and replace
   the `<aside>` opening tag (lines 139-142) with the Stage 1 target.
2. Verify Stage 1 by the feel checks marked **(S1)** below. Do not continue until the
   rise is visibly working.
3. **Stage 2.** In `PrivateCatalogue.tsx`: replace `setQuantity` (lines 117-125) and
   the `planning` line (141) with their targets.
4. In `ContainerPlan.tsx`: replace line 46 with the Stage 2 target.
5. Verify by the checks marked **(S2)**.

## Boundaries

- Do NOT transition the `<main>` padding on `PrivateCatalogue.tsx:173`. The comment
  there is correct — animating it reflows the page every frame. Stage 2 makes it stop
  changing mid-edit; it must still change instantly when it changes.
- Do NOT change `.filter-swap` in `src/styles/tailwind.css`. Six other places use it
  correctly.
- Do NOT change the `selection` `useMemo` (`ContainerPlan.tsx:31-44`) or the `> 0`
  filter inside it — that filter is what makes zero entries harmless.
- Do NOT change `onClear`, the CSV export, or the send handler.
- Do NOT change the fill bar on line 197 (plan 014 owns its duration).
- Do NOT add new dependencies.
- If `setQuantity`, `planning` or the `<aside>` tag do not match the **Problem**
  excerpts, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: behind the gate at `/collections/private/catalogue`. Set
  `ACCESS_CODES` and a 32+ character `ACCESS_SECRET` in `.env.local` if needed. If you
  cannot reach the page, say so — do not mark this done on mechanical checks alone.
  - **(S1)** Type `1` into any quantity. The bar must **slide up from the bottom edge**
    over 320ms, not appear and nudge. In DevTools → Animations at 10% playback you
    should see it travel its own full height.
  - **(S1)** Confirm the first appearance animates at all — if it is instantly in
    place, the `requestAnimationFrame` frame is missing and the transition is being
    skipped.
  - **(S2)** With exactly one design selected at `12`, select the field contents and
    type `20`. The bar must **stay put and stay steady** the whole time. Before this
    change it disappears and re-rises between the two values.
  - **(S2)** Same, but backspace `12` to empty, pause a second, then type `20`. The bar
    must remain docked showing zeros, and the page must not jump.
  - **(S2)** Scroll to the bottom of the page first, then do the same edit. Nothing in
    the viewport may shift. This is the defect that matters most.
  - **(S2)** Click **Clear**. The bar must go away, and the page padding may snap — that
    is the one deliberate dismissal.
  - **(S2)** Re-engage after clearing: type a quantity again and confirm the rise
    plays a second time.
  - Toggle **Emulate prefers-reduced-motion: reduce** and type a quantity: the bar must
    appear instantly and fully in place, never stuck at `translateY(100%)`. Verify its
    computed `transform` is `none` or identity. **If it is stuck off-screen, stop —
    that is a worse bug than the one being fixed.**
- **Done when**: editing a quantity through an empty value never moves the bar or the
  page, the bar rises from the bottom edge on first engagement and after a clear, and
  reduced motion leaves it docked and visible.
