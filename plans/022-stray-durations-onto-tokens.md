# 022 — Put the stray durations onto tokens

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 4 files, ~6 lines

## Problem

The site has four motion tokens (`src/styles/tailwind.css:64-71`, surfaced as Tailwind
utilities at `tailwind.config.js:92-103`). Three declarations bypass them, giving the
reveal scale invisible extra steps that exist only inside one class list each.

### A. Two clickable-image hovers, two different wrong values

```tsx
/* src/components/ui/AppImage.tsx:69 — current */
  if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-200');

/* src/components/ui/AppLogo.tsx:31 — current */
  if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
```

`duration-200` is a 20ms-off near-duplicate of `--dur-fast: 180ms`. The second has no
duration and no easing at all, so it lands on Tailwind's stock 150ms
`cubic-bezier(0.4, 0, 0.2, 1)` — the only Material-style curve in a codebase whose
three curves are all custom. Two near-identical hovers, three different timings
between them and the rest of the site.

**In mitigation**: no call site anywhere in `src` passes `onClick` to either component,
so both branches are currently unreachable. They are worth fixing anyway because they
are the template the next person copies when they do need a clickable image.

### B. The longest transition on the site is an arbitrary value

```jsx
/* src/app/components/HeroSection.tsx:128 — current */
                className="absolute inset-0 transition-[opacity,filter] duration-[1400ms] ease-out-soft"
```

1400ms is 40% past `--dur-reveal: 1000ms`, the longest token. The curve is tokenised;
the duration is not. The comments at `:131-134` document the blur and the
`blur(0px)`-not-`none` trick but never the 1400. So the hero — the most-looked-at
surface on the site — carries the only motion value that cannot be found in `:root`.

## Target

### A. Both onto `--dur-fast` and the house curve

```tsx
/* target — src/components/ui/AppImage.tsx:69 */
  if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-fast ease-out');

/* target — src/components/ui/AppLogo.tsx:31 */
  if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity duration-fast ease-out');
```

### B. Give the crossfade a token rather than retuning it

Do **not** change 1400ms to 1000ms. The plate crossfade is deliberately slower than a
reveal, and dropping it 40% is a visual change nobody asked for. Add the fifth step to
the scale instead, so it is discoverable where the other four are.

```css
/* target — src/styles/tailwind.css, in the :root motion block after --dur-reveal */
  --dur-reveal: 1000ms;
  /* The hero plate crossfade only. Longer than a reveal on purpose: two large
     photographs dissolving into each other need time to stop reading as a cut, and
     the outgoing plate is blurred on the way out to mask the double exposure. Lives
     here rather than as an arbitrary value in one class list, so the whole motion
     scale is visible in one place. */
  --dur-crossfade: 1400ms;
```

```js
/* target — tailwind.config.js, transitionDuration */
      transitionDuration: {
        fast: '180ms',
        base: '320ms',
        slow: '640ms',
        reveal: '1000ms',
        crossfade: '1400ms',
      },
```

```jsx
/* target — src/app/components/HeroSection.tsx:128 */
                className="absolute inset-0 transition-[opacity,filter] duration-crossfade ease-out-soft"
```

## Also found, deliberately NOT changed

`src/app/components/TrustSection.tsx:12` and `:28`:

```tsx
function useCountUp(target: number, active: boolean, duration = 1600) {
    const eased = 1 - Math.pow(1 - t, 3); // ease-out
```

This is a fifth duration and a fourth easing implementation, so it fits the pattern —
but a stat count-up is content animation, not a UI transition, and 1600ms is tuned to
how long five figures take to read. Forcing it onto `--dur-reveal` would speed it up
40% for no benefit, and expressing a JS cubic as a CSS custom property is not possible.
Leaving it. If you disagree, the change is one default parameter — but it is a taste
call, not a defect, and it is out of scope here.

## Repo conventions to follow

- All motion values live in the `:root` block at `src/styles/tailwind.css:64-71`, under
  the comment *"Motion — enters ease out, never in. Exits may ease in."* New tokens go
  there and are mirrored into `tailwind.config.js`.
- `tailwind.config.js:98-103` is the single `transitionDuration` map; add the key there,
  in scale order.
- Every token that needs justification gets a prose comment. `--dur-crossfade` needs one
  because a fifth step in a four-step scale looks like a mistake without it.

## Steps

1. `src/components/ui/AppImage.tsx:69` — replace `duration-200` with
   `duration-fast ease-out`.
2. `src/components/ui/AppLogo.tsx:31` — append ` duration-fast ease-out` to the
   `transition-opacity` string.
3. `src/styles/tailwind.css` — add the commented `--dur-crossfade: 1400ms;` immediately
   after `--dur-reveal: 1000ms;` (line 71).
4. `tailwind.config.js` — add `crossfade: '1400ms',` after `reveal: '1000ms',` in
   `transitionDuration`.
5. `src/app/components/HeroSection.tsx:128` — replace `duration-[1400ms]` with
   `duration-crossfade`.
6. Confirm no arbitrary durations remain:
   `grep -rn 'duration-\[' src --include=*.tsx` — no output.

## Boundaries

- Do NOT change 1400ms to any other number. The token exists to name the existing value,
  not to retune it.
- Do NOT change `src/app/components/TrustSection.tsx` — see the section above.
- Do NOT change `transform 160ms var(--ease-out)` on `.btn`
  (`src/styles/tailwind.css:509`). It is a hand-typed value but it is the playbook's own
  prescribed press-feedback figure, and plan 019 matches it deliberately.
- Do NOT change the GSAP durations in `src/components/motion/MotionProvider.tsx`. They
  are a separate system; unifying them is plan 028, which recommends against it.
- Do NOT remove the `hover:opacity-*` values or gate them behind a pointer query — both
  branches are unreachable dead code, and adding machinery to dead code is worse than
  leaving it.
- Do NOT add new dependencies.
- If a cited line does not match, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes. **The build is the real gate here**: if
    `duration-crossfade` were not registered in the config, Tailwind would emit no rule
    and the class would silently do nothing, so confirm the next check too.
  - `grep -rn 'duration-\[' src --include=*.tsx` — no output.
- **Feel check**: `npm run dev`, open `http://localhost:4028`.
  - The token check that matters. Run this in the console:
    ```js
    getComputedStyle(document.querySelector('[class*="duration-crossfade"]')).transitionDuration
    ```
    It must report `1.4s, 1.4s`. If it reports `0s`, the Tailwind key is missing and the
    hero crossfade is now instant — a regression, not a fix.
  - Watch the hero for two full 7-second cycles. The plate dissolve must look
    **identical to before**: a slow blurred crossfade, no hard cut, no visible speed
    change.
  - Click through the three plate-index rules. Each crossfade must still take about a
    second and a half.
- **Done when**: `duration-crossfade` resolves to `1.4s` on the hero plates, the hero
  looks unchanged, and no arbitrary `duration-[…]` value remains in `src`.
