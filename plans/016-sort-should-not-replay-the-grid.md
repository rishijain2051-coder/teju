# 016 — Stop a sort re-order replaying the whole grid

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: MEDIUM
- **Category**: Purpose & frequency
- **Estimated scope**: 1 file, 1 line

## Problem

`sort` is part of the React `key` on the private catalogue's grid, so changing the
sort order remounts all 39 designs and replays a full entrance animation.

```jsx
/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:133-136 — current */
  /* Keyed on the coarse filters only. Including the search query would remount
     every plate on each keystroke — the animation is for a deliberate change of
     view, not for typing. */
  const gridKey = `${filter}-${sort}-${onlyNew}-${view}`;
```

Consumed twice:

```jsx
/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:312-315 — current */
            <div
              key={gridKey}
              data-reveal-group
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-8 filter-swap"
            >

/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:332 — current */
            <div key={gridKey} className="overflow-x-auto mt-8 filter-swap">
```

The playbook's frequency rule is *"Tens of times/day (hover effects, list
navigation) → Remove or drastically reduce"*, and the sort control is worse than
that suggests: it is a native `<select>`, and on a closed select in Windows Chrome
and Firefox **each arrow keypress fires `change`**. Arrowing from Reference to
Newest is three remounts and three restarted 260ms keyframes over a 39-row table.

A sort is also the one control here with no spatial story to tell. Filtering
changes *which* items exist, and the view toggle changes *how* they are rendered —
both are genuine content swaps that a fade explains. Re-ordering the same 39 items
in place explains nothing; it just flickers.

The comment on lines 133-135 already establishes the principle — *"the animation is
for a deliberate change of view, not for typing"* — and applies it to `query`.
`sort` belongs on the same side of that line.

## Target

```jsx
/* target — src/app/collections/private/catalogue/components/PrivateCatalogue.tsx */
  /* Keyed on the coarse filters only. Including the search query would remount
     every plate on each keystroke — the animation is for a deliberate change of
     view, not for typing. `sort` is out for the same reason and one more: a
     re-order is the same items in a new sequence, so there is nothing for an
     entrance to explain, and a closed native <select> fires `change` on every
     arrow keypress — three restarted keyframes over 39 rows to get from Reference
     to Newest. `filter` and `view` stay: those genuinely change what is on screen. */
  const gridKey = `${filter}-${onlyNew}-${view}`;
```

React will reconcile the re-ordered children in place. Each `PrivatePiece` is keyed
on `piece.ref` (`:319`), so the DOM nodes move rather than being destroyed — which
also means open dossiers and typed quantities survive a sort, where today they are
wiped.

## Repo conventions to follow

- The decision and its reasoning live in the comment directly above `gridKey`. Extend
  that comment rather than adding a new one elsewhere — the file's convention is one
  prose block per non-obvious decision, at the decision.
- Children are keyed on stable identity (`piece.ref` at `:319`), which is what makes
  removing the container key safe.

## Steps

1. In `src/app/collections/private/catalogue/components/PrivateCatalogue.tsx`, replace
   lines 133-136 (the comment and the `gridKey` assignment) with the **Target** block.
2. Nothing else. Both `key={gridKey}` usages stay as they are — they just no longer
   change when `sort` does.

## Boundaries

- Do NOT remove `key={gridKey}` from either container. The filter and view paths still
  need the remount; that is what makes `.filter-swap` replay for them.
- Do NOT remove `filter`, `onlyNew` or `view` from the key.
- Do NOT add `query` to the key.
- Do NOT change the sort logic in the `useMemo` at `:87-97`.
- Do NOT change `.filter-swap` in `src/styles/tailwind.css`.
- Do NOT add new dependencies.
- If lines 133-136 do not match the **Problem** excerpt, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: this page is behind the access gate. Sign in at
  `/collections/private` with a code from `ACCESS_CODES` in `.env.local`, or set
  `ACCESS_CODES=dev-code` and `ACCESS_SECRET` to any 32+ character string in
  `.env.local` first. If you cannot reach the page, say so in your report rather than
  guessing — do not mark this plan done on the mechanical checks alone.
  - Change **Sort** from Reference to Name. The cards must **re-order without fading**.
    Before this change the whole grid blinks.
  - Focus the Sort select, then press the Down arrow three times quickly. There must
    be no flicker at all. Before, that is three restarted animations.
  - Now change a **filter tab**. The grid *must still* fade up over 260ms — this plan
    must not remove that.
  - Toggle **Gallery / Manifest**. That must still fade too.
  - Type a quantity into a card, then change the sort. The quantity must survive.
    Before this change the remount cleared the inputs.
  - Open a **Trade dossier**, then change the sort. It must stay open.
  - In DevTools → Animations, change the sort and confirm **no** `filter-swap` entry
    is recorded; then change a filter and confirm exactly one is.
- **Done when**: sorting re-orders silently and preserves quantities and open
  dossiers, while filtering and view-switching still play their 260ms entrance.
