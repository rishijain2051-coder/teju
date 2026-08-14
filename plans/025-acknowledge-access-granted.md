# 025 — Acknowledge access granted

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 1 file, ~12 lines

## Problem

The gate rewards a wrong code with feedback and a right one with a freeze followed by a
hard cut.

```tsx
/* src/app/collections/private/components/AccessCodeEntry.tsx:11, 20-45 — current, abridged */
type EntryState = 'idle' | 'loading' | 'error';

    setState('loading');
    …
      if (res.ok) {
        router.push('/collections/private/catalogue');
        return;
      }

      setState('error');
      setErrorMsg('That code was not recognised. Check it and try again.');
```

On success the component never leaves `loading`. The button keeps reading "Checking…"
(`:110`) until the RSC payload for the catalogue arrives and the page replaces itself.
The accepted code is never confirmed.

Compare the failure path, which is well served: `aria-invalid` is set, the border turns
clay, and an error appears with `role="alert"` (`:87-88`, `:94-96`, `:99-103`).

The playbook's grounds: *"Rare, high-emotion moments (first-run, success, celebration)
rendered with none of the delight budget they're allowed"*, and the frequency table's
*"Rare / first-time … Can add delight."* A buyer passes this gate once. The whole page
is dressed as an invitation, and it is the single most ceremonial threshold in the
product.

## Target

Add a `granted` state that occupies the wait that already exists. **No artificial
delay** — `router.push` still fires immediately; the confirmation fills the dead time
spent fetching the catalogue rather than adding to it.

```tsx
/* target — src/app/collections/private/components/AccessCodeEntry.tsx:11 */
type EntryState = 'idle' | 'loading' | 'granted' | 'error';
```

```tsx
/* target — replacing the success branch at :34-37 */
      if (res.ok) {
        /*
         * Acknowledge before navigating, but do not delay the navigation. The push
         * still fires on this tick; fetching the catalogue's payload already takes
         * a beat, and the confirmation occupies that beat instead of leaving the
         * button reading "Checking…" until the page cuts away. A buyer crosses this
         * threshold once, so it is worth the twelve lines — and worth nothing more
         * than this: the range behind the gate is the reward, not an animation.
         */
        setState('granted');
        router.push('/collections/private/catalogue');
        return;
      }
```

The field's border confirms, mirroring how the error state uses it:

```jsx
/* target — replacing the conditional class at :94-96 */
              className={`w-full bg-transparent border-b py-3.5 mt-1 text-title font-serif font-light text-ink placeholder:text-muted/60 placeholder:font-sans placeholder:text-base focus:outline-none transition-colors duration-base ${
                state === 'error'
                  ? 'border-clay'
                  : state === 'granted'
                    ? 'border-ink'
                    : 'border-line-strong focus:border-clay'
              }`}
```

And the button says what happened:

```jsx
/* target — replacing the label at :110 */
              {state === 'loading' ? 'Checking…' : state === 'granted' ? 'Access granted' : 'Enter'}
```

```jsx
/* target — the disabled and arrow conditions at :107 and :111 */
              disabled={state === 'loading' || state === 'granted' || !code.trim()}
…
              {state !== 'loading' && state !== 'granted' && (
```

Add a confirmation line beside the error slot, so the two outcomes are structurally
parallel:

```jsx
/* target — inserted after the error block at :103 */
            {state === 'granted' && (
              <p className="text-manifest-sm text-ink mt-3 filter-swap">
                Code accepted. Opening the full range…
              </p>
            )}
```

That is the whole change: a border that settles from clay-focus to ink, a label that
confirms, and one line of type that fades up over 260ms. No scale, no checkmark, no
bounce.

## Repo conventions to follow

- The error path is the structural exemplar: a conditional class on the field plus a
  short `<p>` beneath it. Mirror its shape so the two outcomes read as a pair.
- `.filter-swap` for content that mounts on a state change —
  `src/styles/tailwind.css:319-340`, and the exemplars at
  `src/components/ui/PieceEnquiry.tsx:65` and
  `src/app/collections/components/ExclusiveAccess.tsx:121`.
- Palette discipline, documented at `src/styles/tailwind.css:12-16`: on paper, `--ink` is
  the confirmation colour and `--clay` is the action/error colour. Do not introduce a
  green — this palette has none, deliberately.
- `state === 'error'` resets to `idle` on input (`:91`). `granted` deliberately has no
  such reset: the navigation is already in flight.

## Steps

1. Add `'granted'` to the `EntryState` union on line 11.
2. Replace the success branch at lines 34-37 with the **Target** version.
3. Replace the field's conditional `className` at lines 94-96.
4. Insert the `granted` confirmation `<p>` after the error block that ends at line 103.
5. Update the button's `disabled` prop (line 107), its label (line 110) and the arrow's
   render condition (line 111).

## Boundaries

- Do NOT add a `setTimeout` before `router.push`. Delaying a buyer's entry to make room
  for an animation is the opposite of the point.
- Do NOT add a full-screen transition, a curtain wipe, or a scale on the panel.
- Do NOT introduce a new colour. Use `--ink` for confirmation; the palette has no green
  and adding one would break the documented contrast table.
- Do NOT change `/api/verify-access`, the cookie handling, or `src/lib/access.ts`.
- Do NOT change the error copy or remove `role="alert"`.
- Do NOT make `granted` resettable on input.
- Do NOT add new dependencies.
- If the cited lines do not match the **Problem** excerpt, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0. The widened `EntryState` union means any unhandled
    branch fails here.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
  - `npx playwright test tests/access-gate.spec.ts` — **all 14 must still pass.**
    `tests/access-gate.spec.ts:105-116` asserts the URL reaches the catalogue and
    `:93-103` asserts a wrong code shows `p#code-error` and sets no cookie. This plan
    must not disturb either.
- **Feel check**: set `ACCESS_CODES=dev-code` and a 32+ character `ACCESS_SECRET` in
  `.env.local`, then `npm run dev` and open `/collections/private`.
  - Enter `dev-code` and submit. You must see the button change to **"Access granted"**
    and the line "Code accepted. Opening the full range…" fade up, then the catalogue.
  - Throttle the network to Slow 3G in DevTools and submit again. The confirmation
    should now be clearly readable for a second or more — this is the dead time it is
    filling. Confirm it never feels like the app has stalled.
  - With the network **unthrottled**, confirm the navigation is not measurably slower
    than before. If it is, a delay has crept in; remove it.
  - Enter a wrong code. The error path must be unchanged: clay border, `role="alert"`
    message, button back to "Enter", and typing must clear the error.
  - Submit a wrong code, then a right one in the same session. The clay border must give
    way to ink.
  - Toggle **Emulate prefers-reduced-motion: reduce** and submit a valid code: the
    confirmation line must appear **instantly and fully opaque**, not invisible.
  - Keyboard only: Tab to the field, type, press Enter. Same behaviour.
- **Done when**: a valid code visibly confirms before the page changes, navigation is no
  slower than before, the error path is untouched, and all 14 access-gate tests pass.
