# 018 — Make the trade dossier interruptible

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 2 files, ~20 lines

## Problem

The per-piece dossier is a reversible toggle animated with a keyframe, which
restarts from zero every time it is retriggered.

```jsx
/* src/app/collections/private/catalogue/components/PrivatePiece.tsx:89-91 — current */
  return (
    <div className="bg-paper-warm border border-line p-5 lg:p-6 filter-swap">
      <p className="text-manifest-sm text-clay">Trade dossier · {piece.ref}</p>
```

Mounted conditionally in both views:

```jsx
/* src/app/collections/private/catalogue/components/PrivatePiece.tsx:198-204 — manifest view */
        {open && (
          <tr>
            <td colSpan={10} id={dossierId} className="pb-6">
              <Dossier piece={piece} />
            </td>
          </tr>
        )}

/* src/app/collections/private/catalogue/components/PrivatePiece.tsx:264-268 — gallery view */
        {open && (
          <div id={dossierId} className="mt-4">
            <Dossier piece={piece} />
          </div>
        )}
```

driven by a boolean in a map:

```tsx
/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:127-129 — current */
  const toggleDossier = useCallback((pieceRef: string) => {
    setOpenDossiers((prev) => ({ ...prev, [pieceRef]: !prev[pieceRef] }));
  }, []);
```

The playbook rule names this case explicitly: *"CSS transitions retarget from the
current state mid-animation; keyframes restart from zero. Anything triggered rapidly
or reversible mid-motion (toasts stacking, toggles, drags, **expand/collapse**) must
use transitions or springs."*

The rationale that justifies `.filter-swap` elsewhere does not cover this. It is
recorded at `src/styles/tailwind.css:319-326` and rests on the swap being *"one-way
and non-reversible; there is no in-flight state to retarget."* A dossier is a
boolean toggle bound to one button whose label flips between "Trade dossier" and
"Hide dossier" (`:260`). It is the definition of reversible.

**What you feel**: open a dossier, change your mind 100ms in, click again — it
vanishes instantly with no exit, and the content below jumps up. Click a third time
and the 260ms entrance replays from `opacity: 0` and 8px down instead of resuming.
Browsing a 39-row manifest by popping dossiers open and shut is a sequence of hard
jumps punctuated by fade-ins.

## Target

Keep the wrapper mounted and drive opacity with a transition on a `data-open`
attribute, so a mid-flight reversal retargets instead of restarting, and closing
fades instead of disappearing.

**The row's height change stays instantaneous, deliberately.** Animating it would
mean animating `height` or `max-height`, which the playbook forbids (*"`width`/`height`/
`margin`/`padding`/`top`/`left` trigger layout + paint + composite"*), and this
codebase already takes the same position for the same reason at
`src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:171-172`. The
fix here is to stop the *fade* stuttering, not to animate the layout.

Add a shared utility beside the other motion primitives:

```css
/* target — src/styles/tailwind.css, immediately after the .filter-swap block (line 346) */
  /*
   * For content that toggles rather than swaps: a dossier, a disclosure. A
   * transition, not `.filter-swap`'s keyframe — reverse a keyframe mid-flight and
   * it restarts from zero, so a buyer who opens a dossier and closes it again gets
   * the entrance replayed from the beginning rather than resumed from where it was.
   *
   * Only opacity moves. The height change is instantaneous on purpose: animating it
   * would mean animating a layout property on a `<tr>` inside a 39-row table, which
   * costs layout + paint + composite on every frame for the whole table.
   */
  .disclose {
    opacity: 0;
    transition: opacity var(--dur-fast) var(--ease-out);
  }

  .disclose[data-open] {
    opacity: 1;
  }
```

Then render the dossier wrapper always, and gate it on the attribute:

```jsx
/* target — PrivatePiece.tsx:198-204, manifest view */
        {mounted && (
          <tr>
            <td colSpan={10} id={dossierId} className="pb-6">
              <Dossier piece={piece} open={open} />
            </td>
          </tr>
        )}

/* target — PrivatePiece.tsx:264-268, gallery view */
        {mounted && (
          <div id={dossierId} className="mt-4">
            <Dossier piece={piece} open={open} />
          </div>
        )}
```

```tsx
/* target — PrivatePiece.tsx, Dossier signature and root */
function Dossier({ piece, open }: { piece: Piece; open: boolean }) {
  …
  return (
    <div
      data-open={open ? '' : undefined}
      className="bg-paper-warm border border-line p-5 lg:p-6 disclose"
    >
```

`mounted` keeps the wrapper in the tree for one extra beat after `open` goes false so
the fade-out can play:

```tsx
/* target — PrivatePiece.tsx, inside the component, above the view branches */
  /* Held one transition beyond `open` so the close fades instead of disappearing.
     180ms matches `--dur-fast`, which is what `.disclose` transitions on. */
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const id = window.setTimeout(() => setMounted(false), 180);
    return () => window.clearTimeout(id);
  }, [open]);
```

## Repo conventions to follow

- New motion utilities go in the `@layer utilities` "Motion primitives" section of
  `src/styles/tailwind.css` (lines 304-408), each with a prose comment explaining why
  it exists and why the alternative was rejected. `.filter-swap` at `:319-346` is the
  exemplar to imitate in both placement and voice.
- Durations and curves from tokens only — `var(--dur-fast)`, `var(--ease-out)`.
- Reduced motion: `.filter-swap` carries an explicit override at `:342-346`. `.disclose`
  needs none — it is pure opacity, and the global rule at `:138-142` collapses its
  duration, which is the correct outcome for a fade.

## Steps

1. In `src/styles/tailwind.css`, insert the `.disclose` block from **Target** directly
   after the closing brace of the `.filter-swap` reduced-motion override (after line 346).
2. In `src/app/collections/private/catalogue/components/PrivatePiece.tsx`, add
   `useState` and `useEffect` to the React import if not already present.
3. Add the `mounted` state and effect from **Target** inside the `PrivatePiece`
   component, above the `if (view === 'manifest')` branch.
4. Change the `Dossier` signature to accept `open` and replace its root `<div>` opening
   tag with the **Target** version (`data-open`, `.disclose` instead of `filter-swap`).
5. Replace both `{open && (` conditionals (lines 198 and 264) with `{mounted && (`, and
   pass `open={open}` to both `<Dossier>` calls.
6. Leave `toggleDossier` in `PrivateCatalogue.tsx` alone — the boolean map is fine.

## Boundaries

- Do NOT animate `height`, `max-height`, `grid-template-rows`, `padding` or `margin`.
  The instantaneous height change is the accepted trade, documented in the `.disclose`
  comment.
- Do NOT change `.filter-swap` or remove it from anywhere else. Six other sites use it
  correctly for one-way swaps.
- Do NOT change the `aria-expanded` / `aria-controls` wiring on the toggle buttons
  (`:151-152`, `:256-257`). `aria-expanded` must keep tracking `open`, not `mounted`.
- Do NOT add an exit animation to the `<tr>` itself — a table row cannot be reliably
  transformed across browsers.
- Do NOT change the dossier's contents, the `rows` array, or `cartonFor`.
- Do NOT add new dependencies.
- If any excerpt in **Problem** does not match, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0. `Dossier`'s new required `open` prop means a missed
    call site fails here.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: behind the gate at `/collections/private/catalogue`. If you cannot
  reach it, say so rather than guessing.
  - **Gallery view**: click "Trade dossier". It must fade in over 180ms.
  - Click "Hide dossier". It must **fade out**, not vanish. Before this change there is
    no exit at all.
  - The interruption test: click open, and click again after roughly 100ms. The panel
    must fade back down **from wherever its opacity had reached**, not jump to full and
    then restart. In DevTools → Animations at 10% playback, retrigger mid-flight and
    confirm the opacity value moves continuously and never resets to 0.
  - **Manifest view**: same three checks. Watch the rows *below* the expanded one — the
    height change will still be instant, and that is expected; what must not happen is
    a fade restarting from zero.
  - Open three dossiers in the manifest view, then close the middle one. Only that
    panel may fade; the other two must not flicker.
  - Keyboard: Tab to the toggle, press Enter twice quickly. Same retarget behaviour.
  - Screen-reader/attribute check: with the panel closed, `aria-expanded` on the button
    must read `false` immediately, even during the 180ms fade-out.
  - Toggle **Emulate prefers-reduced-motion: reduce**: opening and closing must be
    instant, and the panel must never be left at `opacity: 0` while mounted.
- **Done when**: a dossier fades both directions, a mid-flight reversal retargets
  rather than restarting, `aria-expanded` stays truthful, and nothing is left invisible
  under reduced motion.
