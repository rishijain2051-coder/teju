# 028 — Two changes I recommend declining

- **Status**: NOT RECOMMENDED — read before starting
- **Commit**: `82fdc65`
- **Severity**: LOW
- **Category**: Cohesion / purpose
- **Estimated scope**: A: 2 files, ~8 lines. B: 1 file, ~4 lines.

These two findings are real and were confirmed at their file:line. They are written up
because the audit was asked for in full, but each costs more than it returns and I would
leave both alone. Nothing else in `plans/` depends on either.

---

## A. Unify the CSS and GSAP reveal timings

### Problem

The three reveal primitives are implemented twice, with values roughly 10% apart, and the
divergence is undocumented.

| Primitive | CSS | GSAP |
|---|---|---|
| `.rise` | 640ms `cubic-bezier(0.16, 1, 0.3, 1)` (`src/styles/tailwind.css:309-311`) | 700ms `power3.out` (`src/components/motion/MotionProvider.tsx:87-88`, `:99-100`) |
| `.veil` | 640ms `cubic-bezier(0.22, 0.61, 0.36, 1)` (`:392`) | 600ms `power2.out` (`MotionProvider.tsx:109-110`) |
| `.wipe-inner` | 1000ms `cubic-bezier(0.16, 1, 0.3, 1)` (`:383`) | 900ms `power4.out` (`MotionProvider.tsx:138`) |

Neither path is dead. Every masthead that reveals with `immediate: true` —
`HeroSection.tsx:15`, `PageHeader.tsx:21`, `AccessCodeEntry.tsx:15`,
`PrivateCatalogue.tsx:59`, `CollectionsGrid.tsx:16`, plus `<Reveal immediate>` at
`journal/[slug]/page.tsx:50`, `[piece]/page.tsx:75`, `collections/page.tsx:40` — is
marked `.shown` at mount and therefore always uses the **CSS** values, while everything
scroll-revealed below it always uses the **GSAP** values.

So the site's signature editorial wipe runs at 1000ms in a page's masthead and 900ms two
sections down the same page. It is not one gesture, it is two nearly identical ones.

The transform *start* value is explicitly kept in sync and documented —
`src/styles/tailwind.css:370-371`, *"Kept in step with `yPercent` in MotionProvider, which
owns the same transform once GSAP loads."* The duration and curve divergence sitting
right beside that note is not mentioned anywhere.

### Why I would decline it

- The differences are ~6–10% in duration between two easing families that both decelerate
  hard. I could not tell them apart on the running site, and the audit could not establish
  that anyone can. That makes this a consistency argument, not a perceptual one.
- Fixing it means editing the handover between `useReveal`, `MotionProvider` and the
  `.motion-js` suppression rules. That is the exact machinery plans 001, 005 and 009 were
  all written to repair, and the failure mode is content stranded invisible — the worst
  bug this codebase has had, three times.
- The two systems are not equivalent in what they can express: GSAP applies a 60ms
  stagger across `[data-reveal-group]` (`MotionProvider.tsx:90`) that CSS cannot
  reproduce without per-element inline delays, which plan 021 is busy deleting for being
  inert. Making the values identical would not make the gestures identical.

### If you do it anyway

Move GSAP to the CSS values, not the reverse — the CSS path is the fallback that must work
without JavaScript, so it is the one whose numbers should be authoritative.

```js
/* MotionProvider.tsx — .rise, at :87-88 and :99-100 */
          duration: 0.64,
          ease: 'expo.out',   // closest GSAP equivalent to cubic-bezier(0.16, 1, 0.3, 1)
/* .veil, at :109-110 */
          duration: 0.64,
          ease: 'power2.out',
/* .wipe-inner, at :138 */
            duration: 1,
            ease: 'expo.out',
```

Then document the coupling in both files, next to the existing `yPercent` note.

**Verification if attempted**: the frame sampler from plan 005 is mandatory here, because
the failure mode looks like "the animation is just fast". Count distinct transform values
during a hero wipe; fewer than ~20 means the tween is being truncated. Then scroll every
route top to bottom with GSAP loaded and with the import blocked, and confirm
`[...document.querySelectorAll('.rise, .veil, .wipe-inner')].filter(el => parseFloat(getComputedStyle(el).opacity) < 0.99).length`
returns `0` in both cases.

---

## B. Shorten the private catalogue's control entrance

### Problem

The gated tool's controls animate in behind a 640ms reveal on every visit.

```jsx
/* src/app/collections/private/catalogue/components/PrivateCatalogue.tsx:176, 180, 187, 216 — current */
          <p className="text-manifest text-clay veil">Verified trade access</p>
          <p className="text-lead text-ink-soft max-w-measure mt-6 rise">
          <dl className="grid grid-cols-2 lg:grid-cols-4 … rise">
          <div className="mt-12 border-y border-line-strong rise">
```

`useReveal({ immediate: true })` at `:59` marks these `.shown` on a `setTimeout(0)`, so
they run the CSS path: `.rise` and `.veil` are both `--dur-slow`, 640ms. The playbook's
ceiling for UI is 300ms, and the frequency table's *"Rare / first-time … Can add delight"*
band does not apply to a tool a buyer opens repeatedly in a working session. The filter
tabs, search, sort and view toggle are this page's primary controls, and they fade in on
every load.

### Why I would decline it

- 640ms is the site's reveal tempo everywhere. Making one route quicker would make the
  gated catalogue feel like a different product from the site that leads to it — and the
  gate is deliberately dressed as continuous with the brand.
- The cost is one 640ms fade per page load, not per interaction. A buyer pays it when they
  arrive, and the controls are usable throughout: `.rise` only animates opacity and a
  1.75rem translate, so nothing is unclickable while it plays.
- It is a taste call about a route's character, not a defect. If it is wrong, it is wrong
  for the whole site's reveal tempo, which is a much larger conversation than one page.

### If you do it anyway

Add a modifier rather than changing the tokens, so only this route is affected:

```css
/* src/styles/tailwind.css, in the Motion primitives section */
  /* The gated catalogue is a tool, not a page: its controls should be present, not
     introduced. Same gesture, inside the UI budget. */
  .reveal-brisk .rise,
  .reveal-brisk .veil {
    transition-duration: var(--dur-base);
  }
```

and add `reveal-brisk` to the root `<div>` at `PrivateCatalogue.tsx:144`. Do **not** change
`--dur-slow`, and do not touch `MotionProvider`'s durations — everything on this route is
`immediate: true` and therefore on the CSS path already.

**Verification if attempted**: reload `/collections/private/catalogue` and confirm the
controls settle in ~320ms; then reload `/craft` and confirm its reveals are still 640ms.
Then re-read both pages back to back and judge honestly whether the catalogue now feels
like a different site. If it does, revert.
