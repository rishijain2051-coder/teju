# Vardhman Impex

Marketing and trade-catalogue site for **Vardhman Impex** — a furniture manufacturer
and exporter in Jodhpur, Rajasthan, making solid mango and reclaimed hardwood
casegoods and shipping them to nine markets.

The site has two audiences. Visitors see the public catalogue, the craft and
factory story, and the enquiry forms. Verified trade buyers get a second,
larger catalogue behind an access gate, with the packed volumes and container
figures a buyer needs to plan an order.

Live: <https://vardhman-impex.com>

---

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3 over CSS custom properties |
| Motion | GSAP + ScrollTrigger, dynamically imported |
| Mail | Nodemailer over SMTP |
| Tests | Playwright |

Five runtime dependencies: `next`, `react`, `react-dom`, `gsap`, `nodemailer`.
Keep it that way — the last audit removed six packages that nothing imported,
one of which was costing 80 kB of JavaScript on every page.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill it in, see below
npm run dev                  # http://localhost:4028
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 4028 |
| `npm run build` | Production build. **Type errors and lint errors fail it** |
| `npm run type-check` | `tsc --noEmit` on its own |
| `npm run lint` / `lint:fix` | ESLint, including Prettier formatting |
| `npm test` | Playwright suite (starts its own server) |
| `npm run test:ui` | Playwright in watch mode with the inspector |

## Environment

Everything lives in `.env.local`, which is gitignored. `.env.example` documents
each key. Three groups:

- **`NEXT_PUBLIC_SITE_URL`** — canonical URLs, sitemap, Open Graph.
- **`SMTP_*` and `MAIL_FROM`** — the enquiry mailer. Leave blank and
  `/api/enquiry` returns a clear 503 rather than silently dropping a lead;
  visitors are pointed at WhatsApp instead.
- **`ACCESS_CODES` and `ACCESS_SECRET`** — the trade gate. Codes are
  comma-separated and compared server-side only. `ACCESS_SECRET` signs the
  session cookie and must be at least 32 characters; without it the gate denies
  everyone, which is the safe direction.

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## How it is put together

```
src/
  app/                  routes; each page composes section components
    api/                enquiry mail, access verify, logout
    collections/        index, [collection], [collection]/[piece], private/
    craft/ factory/ journal/ contact/
    error.tsx           route-level error boundary
    global-error.tsx    catches faults in the root layout itself
  components/           Header, Footer, motion provider, shared ui/
  lib/                  all content and all business logic
  middleware.ts         the trade gate — MUST stay in src/, see below
  styles/tailwind.css   design tokens and every utility class
```

### Content lives in `src/lib`

There is no CMS. Content is typed TypeScript, which is what makes the whole site
statically generated and impossible to break with a bad edit:

- **`site.ts`** — brand facts, address, nav, capabilities, stats, testimonials.
  The single source of truth: the address appears on six surfaces and is written
  once. Re-exports everything below, so `@/lib/site` is the only import you need.
- **`catalogue.ts`** — collections and pieces. Carton size, CBM and container
  counts are *computed* from each piece's finished dimensions rather than stored,
  so they can never drift out of step with the spec beside them.
- **`journal.ts`** — articles, including their bodies.
- **`works.ts`** — the craft stages, factory floor, export markets, and the FSC
  certification data.
- **`imagery.ts`** — generated. Do not hand-edit; run `scripts/process-images.mjs`.

Files carry a `FIGURES TO CONFIRM WITH THE WORKS` header where the numbers were
written to be plausible rather than verified. Correct those in place.

### The design system

`src/styles/tailwind.css` holds the palette, the type scale and every utility.
Two rules worth knowing before you edit type:

- **Fraunces owns the display roles only** (`text-mega`, `text-display`,
  `text-display-sm`). DM Sans owns `text-title` and everything below. The serif
  reads as character at 100px and as a wobble at 24px.
- **The manifest faces are larger on phones, not smaller.** They carry form
  labels, dimensions and the works address, so legibility is the base and the
  tight editorial setting is the `lg` override.

### Motion

`MotionProvider` dynamically imports GSAP and rebuilds ScrollTriggers on every
route change — it lives in the root layout and does not remount, so building
triggers once left client-side navigations with invisible content.
`useReveal` is the fallback for when GSAP never arrives or reduced motion is
requested. Markup only has to carry `.rise`, `.veil` or `.wipe-inner`.

## The trade gate

`src/middleware.ts` guards `/collections/private/catalogue`.

> **It must stay in `src/`.** Next.js looks for middleware beside the app
> directory. This file sat at the project root for months, which meant it was
> never compiled — zero middleware entries in the manifest — and the private
> catalogue answered 200 to anyone with the URL. There is no warning and no build
> error when this is wrong. If you move it, check
> `.next/server/middleware-manifest.json` has a non-empty `middleware` key.

The cookie is an HMAC-SHA256 signature over its own 8-hour expiry, signed with
`ACCESS_SECRET` via Web Crypto (middleware runs on the Edge runtime, where
`node:crypto` is unavailable). Rotating the secret signs every issued session out
at once. `tests/access-gate.spec.ts` covers the forgery paths.

## FSC trademarks

The certification body allows **ten promotional placements** before each further
use needs prior approval, so ten is a budget rather than a note.

`fscPlacements` in `src/lib/works.ts` is the register. `FscMark` will not compile
without a registered placement id, and the count is typed against the limit — an
eleventh entry fails the typecheck. Currently three of ten are used.

One entry means **one page**. A mark inside a route template is not one
placement: `[collection]` builds six pages and `[piece]` builds twenty, so a
single component there would spend the budget several times over. The header and
footer carry no mark for the same reason.

Audit the real count in the built output:

```bash
grep -roh 'data-fsc-placement=' .next/server/app --include=*.html | wc -l
```

The artwork in `public/assets/fsc/` is served as plain `<img>` on purpose.
Clause 9.4 of the licence makes any amendment of the licensed materials a breach,
so it must not pass through `next/image`, which re-encodes.

## Tests and CI

`tests/` holds two Playwright specs, run against a **production build** rather
than `next dev` — dev mode re-evaluates route handler modules between requests,
which resets the enquiry rate limiter's in-memory window and made a working
limiter look broken.

`playwright.config.ts` pins a test access code and secret and **blanks every SMTP
variable**, so the suite physically cannot reach a real mailbox. Next.js does not
overwrite variables already present in `process.env`, so those blanks beat
`.env.local`.

- `tests/access-gate.spec.ts` — every forgery path: no cookie, the old literal
  `granted`, an unsigned payload, a wrong signature, a signature from the wrong
  secret, an expired token. Plus sign-in, sign-out and the sitemap exclusion.
- `tests/enquiry.spec.ts` — validation, the honeypot, the rate limiter, and the
  contract that matters most: an undeliverable lead is refused loudly, never
  accepted and dropped.

`.github/workflows/ci.yml` runs typecheck, lint, build and the suite on every
push and pull request. Two assertions beyond the obvious:

- **Middleware compiled to a non-empty manifest.** The gate only exists if Next
  actually compiled it, and it fails silently when the file is misplaced.
- **FSC placements are within the licence.** Counted in the rendered HTML.

## Deployment

Netlify, via `@netlify/plugin-nextjs`. Set every key from `.env.example` in the
host's environment — particularly `ACCESS_SECRET`, which should differ from your
local value.

`plans/` holds the engineering notes for past changes, with before-and-after
measurements. It is internal and safe to read but not part of the build.
