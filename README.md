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
| Content | Keystatic, git-backed, compiled to TypeScript at build time |
| Tests | Playwright |

Seven runtime dependencies: `next`, `react`, `react-dom`, `gsap`, `nodemailer`,
and the two `@keystatic/*` packages, whose JavaScript is confined to the
`/keystatic` route segment. Keep it that lean — the last audit removed six
packages that nothing imported, one of which was costing 80 kB of JavaScript on
every page.

### `postcss` and `sharp` are pinned twice, on purpose

Both appear in `devDependencies` **and** in `overrides`, at the same version.
That is not a redundancy to tidy up.

Next.js hard-pins `postcss` to an exact `8.4.31` and declares `sharp` as
`^0.34.3`. Bumping only the `devDependencies` entry leaves Next resolving its own
nested copy of each, so `npm audit` keeps reporting them and the fix looks applied
when it is not — `npm audit` even suggests upgrading Next, which does not move
either one. The `overrides` entries are what actually collapse the tree to a
single version. Raise both together, and re-run `npm audit` to confirm the tree
deduped rather than trusting the version in `package.json`.

`sharp` is worth the care: `images.remotePatterns` in `next.config.mjs` allows
four third-party hosts, so the image optimiser feeds bytes it did not author to
libvips at request time — not just at build time.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill it in, see below
npm run dev                  # http://localhost:4028
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 4028. The editor is at `/keystatic` |
| `npm run content` | Compiles `content/` into typed TypeScript, validating as it goes |
| `npm run images` | Reconciles `src/lib/imagery.ts` with the photographs on disk |
| `npm run images:check` | Same, read-only — reports drift and writes nothing |
| `npm run build` | Production build. Runs `content` first. **Type errors and lint errors fail it** |
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
content/              the editable content — one JSON file per entry
  collections/        6 · pieces/ 39 · journal/ 4 · brand.json
scripts/
  build-content.mjs   compiles and validates content/ → src/lib/generated/
src/
  app/                  routes; each page composes section components
    api/                enquiry mail, access verify, logout, keystatic
    collections/        index, [collection], [collection]/[piece], private/
    craft/ factory/ journal/ contact/
    keystatic/          the editor UI, dev only
    error.tsx           route-level error boundary
    global-error.tsx    catches faults in the root layout itself
  components/           Header, Footer, motion provider, shared ui/
  lib/                  content readers and all business logic
    generated/          compiled from content/ — never hand-edit
  middleware.ts         the trade gate — MUST stay in src/, see below
  styles/tailwind.css   design tokens and every utility class
```

### `src/lib` is where content becomes logic

Each module reads the compiled records and derives everything the pages need:

- **`site.ts`** — brand facts, address, nav, capabilities, stats, testimonials.
  The single source of truth: the address appears on six surfaces and is written
  once. Re-exports everything below, so `@/lib/site` is the only import you need.
- **`catalogue.ts`** — collections and pieces. Carton size, CBM and container
  counts are *computed* from each piece's finished dimensions rather than stored,
  so they can never drift out of step with the spec beside them. Slugs and the
  FSC claim wording are derived the same way.
- **`journal.ts`** — articles, ordered by an explicit list rather than by parsing
  the human-written dates.
- **`works.ts`** — the craft stages, factory floor, export markets, and the FSC
  certification data. **Deliberately not editable in the CMS**: these claims
  carry licence and legal constraints, so they change through code review.
- **`imagery.ts`** — the photograph manifest. Generated; see below.

`works.ts` carries a `FIGURES TO CONFIRM WITH THE WORKS` header where numbers were
written to be plausible rather than verified. Correct those in place.

## The CMS

Run `npm run dev` and open **<http://localhost:4028/keystatic>**. Keystatic in
local mode, so edits are written straight to `content/` as JSON on your own disk
and committed like any other change. The editor route returns 404 in production —
storage is local, so a deployed editor could not save anything, and shipping an
authoring UI that silently fails is worse than not shipping one. Keystatic's own
route handler does the same for `/api/keystatic/*` outside development, so a
production deploy exposes no read or write path either.

| Editable at `/keystatic` | Not editable |
|---|---|
| Collections, pieces, journal entries, company details | Derived figures (CBM, container counts, slugs), FSC claims and the placement register, capabilities, testimonials |

**The filename is the URL.** `content/pieces/mehrangarh-sideboard.json` becomes
`/collections/living/mehrangarh-sideboard`. Renaming an entry changes its
address — the schema derives the slug from the filename rather than from the
display name so that editing a title cannot silently break a link a buyer has.

### Why there is a compile step

`npm run content` reads `content/`, validates it, and writes
`src/lib/generated/content.ts`. `prebuild` runs it, so a stale generated file
cannot ship. Three reasons it is a build step rather than a runtime read:

1. The data modules are imported by client components. Reading files at module
   scope would put `node:fs` in the browser bundle.
2. An async reader would mean threading content through every component as props,
   for content that never changes between requests.
3. **It is the only place a bad edit can be caught.** Validation lives in
   `scripts/build-content.mjs`, and nothing is written if anything fails:

```
Content is not valid — 2 problems:

  content/pieces/thar-vitrine.json: "image" is "col-vitrine", which is not a
    catalogue key. Run npm run images, or pick an existing photograph.
  content/pieces/luni-side-table.json: "dimensions" ("45 x 55") cannot be parsed,
    so the packed volume and container counts would be blank. Use
    L160 × D40 × H80 cm, W90 × D40 × H180 cm, or Ø45 × H55 cm.
```

It checks every image key against the imagery manifest, every collection name
against the six the site knows, every reference for uniqueness across the whole
catalogue, every dimension string against the parser that computes CBM, and the
brand fields that go into `tel:` and `mailto:` links. A mistyped image key used to
render a blank plate in production; now it fails the build, by filename.

### Adding a photograph

The image field in the editor is a dropdown over the photographs that exist, not
a free-text field, so a piece can never reference a picture that isn't there. To
add to that list:

1. Export a WebP into `public/assets/images/catalogue/`. **Name it by group** —
   `hero-`, `col-`, `craft-` or `pr-` — because the prefix is what assigns it one.
2. Run `npm run images`. It will refuse, naming the file: a photograph with no alt
   text is an accessibility defect that is easy to ship and hard to notice.
3. Add the entry to `src/lib/imagery.ts` with the key, the group and a sentence
   describing the picture. Leave the measurements out.
4. Run `npm run images` again. It fills in `src`, `width`, `height` and the blur
   placeholder from the file itself.

The split is deliberate: measurements are recomputed every run, so a re-export at
a new size can never leave the site laying out against stale dimensions, while the
alt text and the curated order are read back from the existing file and preserved.
`--reblur` regenerates every placeholder; it is opt-in because the current ones
were encoded by an older tool and re-encoding all 45 would churn the diff for no
visible change.

### Moving the editor to GitHub mode

Local mode needs a checkout and a dev server. To let someone edit from a browser
and open a pull request instead, install the
[Keystatic GitHub app](https://keystatic.com/docs/github-mode) on this repository,
then in `keystatic.config.ts` swap:

```ts
storage: { kind: 'github', repo: 'rishijain2051-coder/teju' },
```

and add `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` and
`KEYSTATIC_SECRET` to the environment. The 404 guard in
`src/app/keystatic/[[...params]]/page.tsx` has to come off at the same time —
that guard is what makes local mode safe to deploy.

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
- **`src/lib/generated/` matches `content/`.** Recompiled and diffed, so an edit
  committed without running `npm run content` fails the check instead of leaving
  the site rendering the previous copy.
- **`src/lib/imagery.ts` matches the photographs on disk.** `npm run images:check`.

## Deployment

Vercel. `www.vardhman-impex.com` answers `Server: Vercel` with an `X-Vercel-Id`
from the `bom1` region, and the domain's DNS points at Vercel (`216.198.79.1` at
the apex, `vercel-dns-017.com` for `www`).

`@netlify/plugin-nextjs` is still in `dependencies` and this section used to name
Netlify. Nothing reads either — there is no `netlify.toml` — but the stale entry is
worth removing, and it has already misled once: the privacy notice has to name the
host that holds visitor request logs, and it named Netlify off the back of this
line before the wire was checked.

Set every key from `.env.example` in the host's environment — particularly
`ACCESS_SECRET`, which should differ from your local value, and which the gate
rejects below 32 characters. Vercel's dashboard stores values **literally**: quotes
that `.env.local` would strip become part of the value, which is the likeliest way
a correct access code gets refused.

`plans/` holds the engineering notes for past changes, with before-and-after
measurements. It is internal and safe to read but not part of the build.
