# 013 — Make the mobile menu actually animate

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: **HIGH**
- **Category**: Interruptibility
- **Estimated scope**: 1 file, ~15 lines

## Problem

The mobile navigation overlay has a 320ms fade, a wipe-up per nav row and an
80/40ms stagger. **None of it has ever run**, in either direction, for any user.

```jsx
/* src/components/Header.tsx:118-148 — current */
      {/* Mobile overlay */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className={`fixed inset-0 z-40 bg-paper lg:hidden transition-opacity duration-base ease-out ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full pt-24 pb-10 px-gutter">
          <nav className="flex flex-col" aria-label="Mobile">
            {nav.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className="group flex items-baseline gap-5 py-5 border-b border-line overflow-hidden"
              >
                <span className="text-manifest-sm text-muted numeral">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Wipes up from behind its own row. Delays reset to 0 on close:
                    opening is a reveal, dismissing must feel instant. */}
                <span
                  className={`font-serif text-display-sm font-light group-hover:text-clay transition-[color,transform] duration-base ease-out ${
                    menuOpen ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  style={{ transitionDelay: menuOpen ? `${80 + i * 40}ms` : '0ms' }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
```

`hidden={!menuOpen}` resolves to the UA rule `[hidden] { display: none }`. No author
`display` declaration competes on this element below the `lg` breakpoint. React
removes `hidden` and swaps `opacity-0` → `opacity-100` (and `translate-y-full` →
`translate-y-0`) **in the same commit**, so the browser never paints a rendered
before-change style. CSS transitions do not start from a not-rendered before-change
style, and there is no `@starting-style` or `transition-behavior: allow-discrete`
anywhere in this repo (grepped: zero occurrences of either, and zero of `inert`).

Consequences:

- **Opening**: the full-screen overlay hard-cuts to `opacity: 1` with all five nav
  rows already at `translate-y-0`. The fade, the wipe and the stagger are skipped.
- **Closing**: `hidden` returns in the same commit, so the fade-out is dropped too.
  Hard cut both ways.

This also means plan 010 ("Stagger the mobile menu open") has never taken visible
effect. Its verification measured `transitionDelay` values present in the DOM —
which are set whether or not a transition runs — so the delays are genuinely
there and genuinely never used.

Additionally, the trigger itself has no press feedback and its icon morph is
symmetric:

```jsx
/* src/components/Header.tsx:96-113 — current */
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden flex flex-col justify-center gap-[5px] w-10 h-10 items-center -mr-2"
            >
```

On touch there is no hover, so tapping the primary mobile nav control currently
produces nothing at all until the overlay hard-cuts. (The icon's 320ms duration is
handled by plan 014; the missing press state on this button is handled by plan 019.
This plan only fixes the overlay's transitions.)

## Target

Replace the `hidden` attribute with `inert` plus a mounted flag, so the closed
state is still removed from the tab order and the accessibility tree, but the
element stays *rendered* — which is what lets a transition run.

`inert` is supported in all current browsers and is React 19's supported attribute
(React 19 passes `inert` through as a boolean). It makes the subtree unfocusable,
unclickable and hidden from assistive technology — the properties `hidden` was
providing here.

```jsx
/* target — src/components/Header.tsx, replacing lines 118-124 */
      {/*
        `inert`, not `hidden`. `hidden` resolves to `display: none`, and a
        transition cannot start from a not-rendered before-change style — React
        flips the attribute and the opacity class in the same commit, so the fade,
        the row wipe and the stagger below were all skipped and the overlay hard-cut
        in both directions. `inert` keeps the element rendered while still taking
        the whole subtree out of the tab order and the accessibility tree, which is
        the part `hidden` was actually needed for. `pointer-events-none` stays as
        belt-and-braces for the transparent frames.
      */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={`fixed inset-0 z-40 bg-paper lg:hidden transition-opacity duration-base ease-out ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
```

Everything inside the overlay stays exactly as written — the row wipe, the
`${80 + i * 40}ms` stagger and the documented reset-to-0-on-close are all correct
and will now actually play.

If `inert` turns out to fail typecheck on this React/TypeScript version, the
fallback is a two-frame mount rather than reverting to `hidden`:

```jsx
/* fallback only if `inert` does not typecheck — add beside the other effects */
  const [menuMounted, setMenuMounted] = useState(false);
  useEffect(() => {
    if (menuOpen) {
      /* One frame at the closed style before the open style is applied, so the
         transition has a before-change state to run from. */
      const id = requestAnimationFrame(() => setMenuMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMenuMounted(false);
  }, [menuOpen]);
```
…with `hidden={!menuOpen && !menuMounted}` and the visual classes driven by
`menuMounted` instead of `menuOpen`. Prefer `inert`; this is strictly the backup.

## Repo conventions to follow

- `src/components/Header.tsx` already holds four `useEffect`s for menu concerns
  (scroll listener `:14-19`, close-on-route-change `:22`, body scroll lock `:24-29`,
  Escape key `:31-38`). If the fallback is needed, add the new effect after the
  Escape handler and comment it in the same voice.
- Motion values come from tokens: `duration-base`/`ease-out` are already on this
  element and are correct for a drawer (the playbook's band for modals and drawers
  is 200–500ms). Do not change them here.
- The file explains non-obvious decisions in a comment above the JSX. The comment
  in **Target** is written to that standard; use it as given.

## Steps

1. In `src/components/Header.tsx`, replace lines 118-124 (the `{/* Mobile overlay */}`
   comment and the opening `<div>` through its `className` template literal) with the
   **Target** block above.
2. Run `npm run type-check`. If it reports an error on the `inert` prop, apply the
   fallback described in **Target** instead, and say so in your report.
3. Leave the entire contents of the overlay untouched.

## Boundaries

- Do NOT delete the `hidden` behaviour without replacing it. If both `hidden` and
  `inert` are absent, the five nav links and the "Enquire now" button stay in the
  tab order while the menu is closed — a keyboard user would tab into an invisible
  menu. That is a worse bug than the one being fixed.
- Do NOT remove `pointer-events-none`.
- Do NOT change `duration-base` or `ease-out` on line 122 or 140 — a drawer belongs
  in the 200–500ms band and 320ms is correct. Plan 014 explicitly excludes them.
- Do NOT touch the hamburger `<span>`s on lines 103-112 (plan 014) or add a press
  state to the button on line 96 (plan 019).
- Do NOT touch the body scroll lock on lines 24-29.
- Do NOT add new dependencies.
- If lines 118-124 do not match the **Problem** excerpt, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0. This is the gate that decides `inert` vs the
    fallback.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: `npm run dev`, then in DevTools use the device toolbar at 390px
  wide (or `resize_window` to the mobile preset) and reload so the `lg:hidden`
  gates apply.
  - Tap the hamburger. The overlay must **fade in over 320ms**, and the five nav
    labels must **wipe up from behind their own rules** in sequence. Before this
    change everything is in place on the first frame.
  - In DevTools → Animations, set playback to 10% and open the menu. You must see
    five separate label arrivals at 80/120/160/200/240ms, each rising from below its
    rule and being clipped by the row's `overflow-hidden` on the way.
  - Close the menu. The fade-out must play, and the labels must drop back with
    **no** stagger — all delays 0. That asymmetry is the intent recorded in the
    comment on lines 137-138 and is now observable for the first time.
  - Keyboard check, the important one: with the menu **closed**, press Tab
    repeatedly from the top of the page. Focus must never land on a mobile nav
    link, the "Enquire now" button, or the phone/email links inside the overlay.
  - With the menu **open**, Tab must reach all five links and the Enquire button.
  - Screen-reader spot check if available: with the menu closed, the overlay's
    contents must not be announced.
  - Toggle **Emulate prefers-reduced-motion: reduce** and open the menu: it should
    appear at once (durations collapse to 0.01ms) with no cascade — this depends on
    plan 011 having landed, so run 011 first.
- **Done when**: the overlay visibly fades and its labels visibly stagger on open,
  the close is a fast symmetric fade with no stagger, and Tab cannot reach anything
  inside the overlay while it is closed.
