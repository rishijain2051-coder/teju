# 012 — Stop the contact form vanishing after "Send another"

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: **HIGH**
- **Category**: Interruptibility
- **Estimated scope**: 1 file, 1 line

## Problem

The contact form carries `.rise`. `.rise` starts at `opacity: 0` and is switched on
by adding `.shown`, which only ever happens from a one-shot observer wired at
mount. So a form that mounts *later* is never revealed.

```jsx
/* src/app/contact/components/ContactSplit.tsx:78-96 — current */
            {state === 'success' ? (
              /* `filter-swap`, not `rise`: this panel mounts on submit, long
                 after the scroll reveal was wired, so `.rise` would leave it
                 invisible. */
              <div className="border border-line-strong p-8 lg:p-10 filter-swap">
                <p className="text-manifest text-clay">Enquiry sent</p>
                <h2 className="text-title mt-4">
                  It&apos;s in our inbox. We reply within two working days.
                </h2>
                <button
                  type="button"
                  onClick={() => setState('idle')}
                  className="btn btn-ghost mt-8"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative rise">
```

The comment on lines 79-81 documents this exact hazard for the success panel. The
branch 15 lines below reintroduces it on the return path.

The chain, verified:

1. `useReveal<HTMLElement>()` is called with no arguments
   (`src/app/contact/components/ContactSplit.tsx:20`), so `threshold = 0.12` and
   `immediate = false` — both stable primitives.
2. `useReveal` snapshots its targets once inside a `useEffect` with deps
   `[threshold, immediate]` and unobserves each element after firing
   (`src/components/ui/useReveal.ts:37-38`, `:91`). It never re-runs.
3. `MotionProvider` rebuilds triggers on `[ready, pathname]`
   (`src/components/motion/MotionProvider.tsx:178`). Clicking a button changes
   neither.
4. Submitting unmounts the `<form>`. Clicking **Send another** mounts a *brand new*
   `<form class="relative rise">` with no `.shown` and nothing watching it.
5. `.rise { opacity: 0 }` (`src/styles/tailwind.css:306-312`). The form is invisible
   permanently.

With GSAP loaded it is worse: `.motion-js .rise:not(.shown) { transition: none }`
(`src/styles/tailwind.css:635-639`) strips the transition too, so there is not even
a delayed fade. Under reduced motion the global `transition-duration: 0.01ms` rule
does not restore opacity either.

**What the user sees**: submit an enquiry, read "Enquiry sent", click "Send
another", and the panel is replaced by roughly a form's height of blank space. The
only recovery is a page reload. This is the site's primary conversion route.

This is the same root cause as plans 001 and 009. A repo-wide scan for other
`.rise` elements inside conditional branches returned 11 candidates; all the
others are server-rendered conditionals (`{collection.bespoke && …}`,
`{block.pull && …}`) that mount with the page, so this is the only live instance.

## Target

```jsx
/* target — src/app/contact/components/ContactSplit.tsx */
            ) : (
              /* `filter-swap`, not `rise`, for the same reason as the panel above:
                 clicking "Send another" mounts a fresh form long after the scroll
                 reveal was wired, so `.rise` would leave it at opacity 0 with
                 nothing left to reveal it. */
              <form onSubmit={handleSubmit} className="relative filter-swap">
```

`.filter-swap` (`src/styles/tailwind.css:327-340`) is a 260ms `@keyframes` with
`both` fill, so it animates from `opacity: 0` / `translate3d(0, 0.5rem, 0)` to its
end state and holds there regardless of when the element mounts. It needs no
observer. It is the established pattern for state-swapped content in this codebase.

## Repo conventions to follow

- Exemplar, three lines up in the same file: `src/app/contact/components/ContactSplit.tsx:82`
  — `className="border border-line-strong p-8 lg:p-10 filter-swap"`, with the
  comment explaining the choice.
- Two more exemplars: `src/components/ui/PieceEnquiry.tsx:65` and
  `src/app/collections/components/ExclusiveAccess.tsx:121`.
- The codebase comments the *reason* a motion class was chosen wherever `.rise`
  would have been the obvious pick. Add the comment above; do not just swap the
  class silently, or the next person will swap it back.

## Steps

1. In `src/app/contact/components/ContactSplit.tsx`, replace line 96
   (`<form onSubmit={handleSubmit} className="relative rise">`) with the four-line
   **Target** block above — the comment plus the `filter-swap` form tag.
2. Nothing else. The `relative` class is load-bearing (the form has an absolutely
   positioned honeypot); keep it.

## Boundaries

- Do NOT touch `src/components/ui/useReveal.ts` or
  `src/components/motion/MotionProvider.tsx`. The two-system reveal architecture is
  sound; this is a bug at its boundary, and the fix belongs at the call site.
- Do NOT change the success panel on line 82 — it is already correct.
- Do NOT change any other `.rise` in any other file.
- Do NOT restructure the ternary or lift the form into its own component.
- Do NOT add new dependencies.
- If line 96 does not read exactly `<form onSubmit={handleSubmit} className="relative rise">`
  (drift since `82fdc65`), STOP and report instead of improvising.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: this path needs SMTP to be unconfigured or configured; either
  works, because the reset button appears on success only. To reach it without a
  mailbox, run `npm run dev`, open `http://localhost:4028/contact`, and in the
  browser console force the state by submitting a valid form — or temporarily
  observe the panel via React DevTools. Then:
  - Click **Send another**. The form must reappear, fading up over 260ms from 8px
    below. Before this change it does not appear at all.
  - In DevTools, select the `<form>` and confirm its computed `opacity` is `1`.
    Before this change it is `0`.
  - Do it three times in a row. Each return must render the form.
  - In the Animations panel, set playback to 10% and click **Send another**: the
    form should rise and fade, not simply exist.
  - Toggle **Emulate prefers-reduced-motion: reduce** in the Rendering panel and
    click **Send another** again: `.filter-swap` has an explicit
    `animation: none` override (`src/styles/tailwind.css:342-346`), so the form must
    appear **instantly and fully opaque** — not invisible.
- **Done when**: submitting the contact form and clicking "Send another" returns a
  visible, usable form, with GSAP loaded, with GSAP blocked (throttle the network
  and reload), and with reduced motion emulated.
