# 015 — Give the four unpositioned grain sections their texture back

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: MEDIUM
- **Category**: Performance (compositing) — with a visual defect attached
- **Estimated scope**: 4 files, 4 words

## Problem

`.grain::after` is `position: absolute; inset: 0`, so it needs a positioned
ancestor. Four of the seven `.grain` hosts do not have one.

```css
/* src/styles/tailwind.css:581-599 — the utility, unchanged by this plan */
  .grain::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,…");
    transform: translateZ(0);
    backface-visibility: hidden;
  }
```

Hosts missing `relative`:

```jsx
/* src/app/collections/components/ExclusiveAccess.tsx:71 — current */
    <section ref={ref} id="access" className="bg-teal text-paper grain py-20 lg:py-32">

/* src/app/collections/private/catalogue/components/PrivateProgramme.tsx:87 — current */
      <section className="py-20 lg:py-28 bg-teal text-paper grain">

/* src/app/craft/page.tsx:161 — current */
          <section id="fsc" className="py-20 lg:py-32 bg-teal text-paper grain">

/* src/app/factory/page.tsx:179 — current */
          <section className="py-20 lg:py-32 bg-teal text-paper grain">
```

Hosts that are correct, for comparison: `src/app/components/HeroSection.tsx:25`,
`src/app/components/WhyBrandsSection.tsx:14`, `src/app/components/ContactCTA.tsx:14`
— all three carry `relative`.

There is no positioned ancestor on the path to `<body>` for any of the four:
`src/app/layout.tsx:87` is `<body className="bg-paper text-ink antialiased">`, the
page `<main>` elements are unstyled for position, and `Reveal` renders a bare
`<div>` (`src/components/ui/Reveal.tsx:27`). So the pseudo-element resolves against
the **initial containing block** — a viewport-sized box anchored at the document
origin.

Two consequences:

1. **The texture is missing from four teal sections.** The whole point of `.grain`
   is stated at `src/styles/tailwind.css:580`: *"A whisper of grain so flat colour
   fields read as paper, not as #hex."* Four of the site's flat teal fields do not
   get it.
2. **Four wasted compositor layers.** `transform: translateZ(0)` promotes each one,
   so there are four rasterised, viewport-sized noise layers painted where nothing
   needs them, stacked at `z-index: 1` near the top of the document. The comment at
   `src/styles/tailwind.css:589-596` justifies the promotion on the basis that
   *"Three grain sections cost three static layers"* — that accounting is only true
   for the three hosts that are actually positioned.

Each of the four already has a sibling `<div className="shell relative z-10">`
(`ExclusiveAccess.tsx:72`, `PrivateProgramme.tsx:88`, `craft/page.tsx:162`,
`factory/page.tsx:180`), which shows the section-scoped layering was the intent.

## Target

Add `relative` to each of the four hosts, matching how the three correct hosts are
written.

```jsx
/* target */
    <section ref={ref} id="access" className="relative bg-teal text-paper grain py-20 lg:py-32">
      <section className="relative py-20 lg:py-28 bg-teal text-paper grain">
          <section id="fsc" className="relative py-20 lg:py-32 bg-teal text-paper grain">
          <section className="relative py-20 lg:py-32 bg-teal text-paper grain">
```

## Repo conventions to follow

- Exemplar: `src/app/components/WhyBrandsSection.tsx:14` —
  `className="relative bg-teal text-paper grain py-20 lg:py-32"`. Identical section
  type, identical palette, `relative` first in the list.
- Keep `relative` at the front of the class list, as all three correct hosts do.

## Steps

1. `src/app/collections/components/ExclusiveAccess.tsx:71` — insert `relative ` at
   the start of the `className` value.
2. `src/app/collections/private/catalogue/components/PrivateProgramme.tsx:87` — same.
3. `src/app/craft/page.tsx:161` — same.
4. `src/app/factory/page.tsx:179` — same.
5. Do not add `overflow-hidden`. Only `ContactCTA.tsx:14` has it, because it hosts a
   parallax image that would otherwise bleed; these four have no parallax child.

## Boundaries

- Do NOT change `src/styles/tailwind.css`. The utility is correct.
- Do NOT add `relative` to any other element, and do NOT add `overflow-hidden`,
  `isolate`, or a `z-index` to these four sections.
- Do NOT touch the `shell relative z-10` children.
- Do NOT add new dependencies.
- If any of the four `className` strings does not match the **Problem** excerpt,
  STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
  - `grep -rn 'grain' src --include=*.tsx | grep -v relative` — the only remaining
    hit should be the prose comment in `src/app/keystatic/layout.tsx`.
- **Feel check**: `npm run dev`, then visit `/craft` and `/factory` and scroll to the
  teal FSC / certification sections.
  - The teal field must now carry a faint texture, matching the teal section on the
    home page (`WhyBrandsSection`). Compare the two side by side in two tabs — before
    this change the home-page one is textured and these are flat.
  - Zoom to 400% on the teal field to make the 0.035-opacity noise obvious.
  - In DevTools, select the `<section>` and confirm `::after` is listed with a
    bounding box matching the section, not the viewport. Hovering the `::after` entry
    in the Elements panel should highlight the section's own area.
  - Load `/craft` and scroll to the very top: there must be no faint noise rectangle
    over the page header. That stray layer is what the misplacement was producing.
  - Layer check: DevTools → More tools → Layers. On `/craft` you should see one
    promoted grain layer sized to the FSC section, not a viewport-sized one.
- **Done when**: all four teal sections show grain within their own bounds, no noise
  layer appears over the top of any page, and the Layers panel shows each grain layer
  matching its section's geometry.
