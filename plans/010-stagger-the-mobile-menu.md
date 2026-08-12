# 010 — Stagger the mobile menu open

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 1 file, small

## Problem

The mobile menu is the only full-screen transition on the site, and it is a flat
opacity fade — the overlay and all five nav items appear together as one block:

```tsx
// src/components/Header.tsx:135 — current
<div
  id="mobile-menu"
  hidden={!menuOpen}
  className={`fixed inset-0 z-40 bg-paper lg:hidden transition-opacity duration-base ease-out ${
    menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`}
>
```

The items themselves have no entrance at all:

```tsx
// src/components/Header.tsx:145 — current
<Link
  key={link.label}
  href={link.href}
  className="group flex items-baseline gap-5 py-5 border-b border-line"
>
```

The site already owns a masked-wipe primitive used for every page headline, and
these items are large `text-display-sm` serif — exactly the type that primitive
exists for. Opening the menu is an occasional, deliberate action, so it is allowed
a proper entrance.

## Target

Keep the overlay fade as the backdrop, and wipe each nav item up from behind its
own row, staggered 40ms apart. Drive it from `menuOpen` so it replays on every
open and reverses cleanly on close:

```tsx
/* target — src/components/Header.tsx, inside the nav map */
<Link
  key={link.label}
  href={link.href}
  className="group flex items-baseline gap-5 py-5 border-b border-line overflow-hidden"
>
  <span className="text-manifest-sm text-muted numeral">
    {String(i + 1).padStart(2, '0')}
  </span>
  <span
    className={`font-serif text-display-sm font-light group-hover:text-clay transition-[color,transform] duration-base ease-out ${
      menuOpen ? 'translate-y-0' : 'translate-y-full'
    }`}
    style={{ transitionDelay: menuOpen ? `${80 + i * 40}ms` : '0ms' }}
  >
    {link.label}
  </span>
</Link>
```

- `overflow-hidden` on the row makes it the mask.
- `translate-y-full` is the element's own height, so no pixel value is hardcoded.
- The 80ms base delay lets the overlay fade establish before the items move.
- Delays reset to `0ms` on close so the menu dismisses immediately — a deliberate
  asymmetry: opening is a reveal, closing must feel instant.

The existing `.wipe` / `.wipe-inner` CSS classes are **not** reused here on
purpose: those are owned by `useReveal` and GSAP, and this element's state is
driven by React. Reusing them would recreate the two-owners defect that plan 004
fixes.

## Repo conventions to follow

- `Header.tsx` is already a client component driving classes from `menuOpen`
  state; keep that pattern.
- Tailwind arbitrary-value transitions with an explicit property list are the
  house style — exemplar `transition-[border-color]` at
  `src/components/Header.tsx:60`.
- `duration-base` (320ms) is the right scale for an occasional full-screen
  transition; do not use the hover tempo here.
- Reduced motion is handled globally at `src/styles/tailwind.css:127`, which
  collapses transition durations — the items will appear in place with no
  movement. No extra handling needed.

## Steps

1. In `src/components/Header.tsx`, in the mobile overlay's `nav` map (around line
   143), add `overflow-hidden` to the `<Link>`'s className.
2. Wrap nothing else, but on the inner label `<span>` (the one with
   `font-serif text-display-sm`), add `transition-[color,transform] duration-base ease-out`
   and the conditional `translate-y-0` / `translate-y-full`.
3. Add the `style={{ transitionDelay: menuOpen ? `${80 + i * 40}ms` : '0ms' }}` prop
   to that same `<span>`.
4. Confirm the map callback exposes `i` — it already does
   (`nav.map((link, i) => …)`). If not, add it.

## Boundaries

- Do NOT change the overlay's own fade, its `hidden` attribute, or the
  `pointer-events-none` handling — those control focus and hit-testing.
- Do NOT touch the hamburger button, the `Escape` handler, the body-scroll lock,
  or the `lockScroll` call.
- Do NOT use the `.wipe` / `.wipe-inner` classes here.
- Do NOT add a stagger to the closing direction.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0.
- **Feel check**: in DevTools device toolbar at a phone width, open the menu:
  - The five items wipe up from their rows one after another, not all at once.
    Total sequence should read as brisk — roughly 80ms + 4×40ms before the last
    item starts.
  - Items are clipped by their row while travelling — no text should be visible
    below its border line mid-animation.
  - Close the menu: it must dismiss immediately with no reverse stagger.
  - Open and close rapidly several times: no item should be left mid-travel or
    stuck off-screen.
  - Tab through the open menu — focus order and the visible focus ring are
    unaffected.
- **Reduced motion**: enable *Emulate prefers-reduced-motion*, open the menu, and
  confirm all items are immediately in place and legible.
- **Done when**: items enter in sequence on open, dismiss instantly on close, and
  rapid toggling never leaves an item displaced.
