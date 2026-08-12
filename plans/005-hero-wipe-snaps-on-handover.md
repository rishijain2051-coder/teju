# 005 — Stop the motion-layer handover from truncating the hero entrance

- **Status**: DONE
- **Commit**: bbab222
- **Severity**: HIGH
- **Category**: Interruptibility
- **Estimated scope**: 1 file, one rule

## Problem

The hero headline's masked wipe — the site's signature entrance — **does not
play**. It hard-cuts to its end position about 50ms in.

Three mechanisms race on load:

1. `HeroSection` calls `useReveal({ immediate: true })`, whose immediate path
   adds `shown` as soon as the component hydrates:
   ```ts
   // src/components/ui/useReveal.ts:43 — current
   const id = window.setTimeout(() => targets.forEach(show), 0);
   ```
2. `MotionProvider` resolves its dynamic imports slightly later and hands the
   reveal transitions to GSAP by disabling them in CSS:
   ```css
   /* src/styles/tailwind.css:430 — current */
   .motion-js .rise,
   .motion-js .veil,
   .motion-js .wipe-inner { transition: none; }
   ```
3. GSAP then deliberately skips anything already revealed, so it does not
   double-animate:
   ```ts
   // src/components/motion/MotionProvider.tsx:74 — current
   const fresh = (selector: string) =>
     gsap.utils.toArray<HTMLElement>(selector).filter((el) => !el.classList.contains('shown'));
   ```

The hero is `shown` before the handover, so GSAP passes it over — and the CSS
transition that was mid-flight is killed by rule (2). Nobody animates it.

Measured on `/` at commit bbab222, sampling `.wipe-inner` every frame from
navigation start:

| t (ms) | `motion-js` | `shown` | `transition-duration` | transform |
| --- | --- | --- | --- | --- |
| 48 | false | false | 1s | `translateY(183.5px)` |
| 884 | false | **true** | 1s | `translateY(183.5px)` — transition begins |
| 936 | **true** | true | **0s** | `translateY(0)` — snaps to end |

52ms of a 1000ms wipe. Same applies to the hero's `.rise` and `.veil` elements
and to every `PageHeader` (which also uses `immediate: true`), so all five
interior page headers hard-cut too.

## Target

`.motion-js` should suppress transitions only on elements GSAP is actually going
to animate — the ones that are **not** yet revealed. Elements already revealed by
the immediate path keep their CSS transition and finish it.

```css
/* target — src/styles/tailwind.css, replacing the rule at :430 */
/* Suppress only what GSAP is about to take over. An element already marked
   `shown` was revealed by useReveal's immediate path before the motion layer
   finished loading; GSAP's `fresh()` filter skips it, so it must keep its CSS
   transition or its entrance is killed mid-flight. */
.motion-js .rise:not(.shown),
.motion-js .veil:not(.shown),
.motion-js .wipe-inner:not(.shown) {
  transition: none;
}
```

This is safe in the other direction too: when GSAP finishes a tween it adds
`shown`, at which point the transition becomes live again — but GSAP has left the
element at its end state via inline styles, which take precedence over the class
rule, so nothing moves.

## Repo conventions to follow

- The rule lives in the "Motion layer handover" section of the
  `@layer utilities` block; keep it there and keep the surrounding comment
  style (a short prose note explaining *why*, as at
  `src/styles/tailwind.css:425`).
- Do not reach for `!important`; nothing here is fighting specificity.

## Steps

1. Open `src/styles/tailwind.css` and find the block beginning
   `.motion-js .rise,` (line 430).
2. Replace the three selectors with their `:not(.shown)` forms exactly as in
   **Target**, and replace the preceding comment with the one given there.
3. Change nothing else.

## Boundaries

- Do NOT change `useReveal.ts` — the immediate path exists so the hero is never
  blank in a backgrounded tab, and that behaviour must be preserved.
- Do NOT remove GSAP's `fresh()` filter in `MotionProvider.tsx`; without it,
  already-visible content would animate a second time.
- Do NOT change `.motion-js { scroll-behavior: auto; }` in the same section —
  that one is needed by Lenis.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run build` succeeds.
- **Feel check**: hard-reload `/` with the network throttled to *Fast 3G* (so the
  handover lands well inside the transition):
  - "Timber" and "that travels." must **wipe up from behind their mask**, taking
    about a second. Before this change they appear already in position.
  - The eyebrow fades and the lead paragraph and CTAs rise.
  - Load `/collections`, `/contact` and `/collections/private` — each page
    heading must wipe in rather than appear instantly.
  - Scroll down: sections further down the page must still be animated by GSAP
    with its stagger, and must not double-animate.
- **Done when**: re-running the frame sampler shows the transform interpolating
  across many frames instead of jumping in one. Paste in DevTools console
  immediately after a reload:
  ```js
  (() => {
    const el = document.querySelector('.wipe-inner');
    const seen = new Set();
    const t0 = performance.now();
    const tick = () => {
      seen.add(getComputedStyle(el).transform);
      if (performance.now() - t0 < 1600) requestAnimationFrame(tick);
      else console.log('distinct transforms:', seen.size);
    };
    requestAnimationFrame(tick);
  })()
  ```
  Expect **> 20** distinct transforms. Before this change it reports 2.
