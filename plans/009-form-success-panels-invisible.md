# 009 — Make the form success panels visible

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: HIGH
- **Category**: Interruptibility
- **Estimated scope**: 2 files, tiny

Same root cause as plan 001 — a one-shot scroll reveal owning content that mounts
later — but on the conversion path, and in different files.

## Problem

After submitting either enquiry form, the confirmation panel is **invisible**. The
form disappears and is replaced by empty space.

Both success panels carry `rise`, which starts at `opacity: 0`:

```tsx
// src/app/contact/components/ContactSplit.tsx:56 — current
<div className="border border-line-strong p-8 lg:p-10 rise">
  <p className="text-manifest text-clay">Enquiry composed</p>
  …
```

```tsx
// src/app/collections/components/ExclusiveAccess.tsx:? — current (the state === 'success' branch)
<div className="border border-line-invert p-8 lg:p-10 rise">
  <p className="text-manifest text-timber">Request composed</p>
  …
```

These mount only when `state` flips to `'success'`, long after both reveal
systems finished wiring themselves at page load. Nothing adds `shown`.

Measured on `/contact` at commit bbab222, after filling and submitting the form:

```json
{ "found": true, "opacity": "0", "transform": "matrix(1, 0, 0, 1, 0, 28)",
  "hasShown": false, "visibleToUser": false }
```

The visitor has just been sent to WhatsApp in a new tab; they return to what
looks like a form that vanished. This is the worst possible place on the site for
a blank panel.

## Target

A confirmation is a state change in response to a deliberate action, not a
scroll reveal. It should animate on mount, driven by CSS alone, with no observer
involved. Reuse the `.filter-swap` animation introduced by plan 001 — it is
exactly the same need (content swapped in by state) at exactly the right tempo:

```tsx
/* target — src/app/contact/components/ContactSplit.tsx */
<div className="border border-line-strong p-8 lg:p-10 filter-swap">
```

```tsx
/* target — src/app/collections/components/ExclusiveAccess.tsx */
<div className="border border-line-invert p-8 lg:p-10 filter-swap">
```

If plan 001 has not landed, add this to `src/styles/tailwind.css` inside
`@layer utilities` first — it is the same rule that plan specifies, so the two
must not diverge:

```css
.filter-swap { animation: filter-swap 260ms var(--ease-out) both; }

@keyframes filter-swap {
  from { opacity: 0; transform: translate3d(0, 0.5rem, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .filter-swap { animation: none; }
}
```

Keyframes are correct here rather than a transition: this is a one-way,
non-reversible mount, so there is no in-flight state to retarget.

## Repo conventions to follow

- Both forms already use the same `state === 'success' ? … : …` branch shape;
  change only the `className` on the success wrapper.
- `.filter-swap` is defined once in `src/styles/tailwind.css` and shared. Do not
  create a second near-identical class.

## Steps

1. If `.filter-swap` does not yet exist in `src/styles/tailwind.css`, add the
   rule, keyframes and reduced-motion override shown in **Target**, placed
   immediately after the `.rise` / `.rise.shown` rules (around line 244).
2. In `src/app/contact/components/ContactSplit.tsx`, on the success branch's
   wrapper `<div>`, replace `rise` with `filter-swap`.
3. In `src/app/collections/components/ExclusiveAccess.tsx`, on the success
   branch's wrapper `<div>`, replace `rise` with `filter-swap`.
4. Leave the `<form>` branches in both files unchanged — the forms are present at
   page load and their `rise` works correctly.

## Boundaries

- Do NOT change any form logic, field, validation or the `sendEnquiry` call.
- Do NOT remove `rise` from the `<form>` wrappers.
- Do NOT touch `useReveal.ts` or `MotionProvider.tsx`.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0. `npm run build` succeeds.
- **Feel check**: on `/contact`, fill every required field and submit (a WhatsApp
  tab will open — close it and return):
  - The confirmation panel must be **visible**, and must rise in over ~260ms
    rather than appearing pre-positioned or not at all.
  - "Send another" returns to the form; submitting again must show the
    confirmation again (it remounts, so the animation should replay).
  - Repeat on `/collections` for the trade-access form in the teal section.
  - Enable *Emulate prefers-reduced-motion* and confirm the panel appears
    instantly and fully opaque, with no movement.
- **Done when**: after submitting either form, this reports `opacity: "1"`:
  ```js
  (() => { const p = [...document.querySelectorAll('div')].find(e =>
      (e.textContent||'').startsWith('Enquiry composed') || (e.textContent||'').startsWith('Request composed'));
    return p ? { opacity: getComputedStyle(p).opacity } : 'not found'; })()
  ```
