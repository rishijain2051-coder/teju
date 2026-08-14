# 024 — Animate the sent container plan

- **Status**: TODO
- **Commit**: `82fdc65`
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 1 file, 2 lines

## Problem

Sending a costed container plan is the deepest conversion on the site. It currently
resolves as a single-frame content replacement inside a bar fixed to the bottom of the
viewport.

```jsx
/* src/app/collections/private/catalogue/components/ContainerPlan.tsx:146-159 — current */
        {state === 'sent' ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-manifest text-timber">Plan sent</p>
              <p className="text-body text-paper/70 mt-1">
                {selection.rows.length} designs, {selection.units} pieces,{' '}
                <span className="numeral">{cbm.toFixed(2)} CBM</span>. We reply within two working
                days with a quotation and a loading plan.
              </p>
            </div>
            <button type="button" onClick={onClear} className="btn btn-invert shrink-0">
              Start a new plan
            </button>
          </div>
        ) : (
```

The planner's entire interior — three totals, the fill bar, the email field and four
controls — is replaced by a two-line panel in one frame. The `.filter-swap` on the
`<aside>` at `:141` cannot help: it already ran when the bar first docked, and a CSS
animation does not replay on an element React never re-inserts.

Every other success panel in the codebase carries an entrance, each with a comment
explaining the choice — `src/components/ui/PieceEnquiry.tsx:65`,
`src/app/contact/components/ContactSplit.tsx:82`,
`src/app/collections/components/ExclusiveAccess.tsx:121`. This is the one that does not,
and it is the most important of the four.

The playbook's grounds: *"State changes that teleport (content swaps, layout jumps)
where a brief transition would prevent a jarring change"*, and *"Rare, high-emotion
moments (first-run, success, celebration) rendered with none of the delight budget
they're allowed."* Sending a plan happens once per order enquiry — comfortably inside
the *"Rare / first-time … Can add delight"* frequency band.

Restraint applies. This is a crisp editorial tool for a furniture exporter, not a
consumer app: the right treatment is the house entrance the other three panels use, not
a flourish.

## Target

Put `.filter-swap` on the panel that actually mounts, and comment it in the same voice
as its three siblings.

```jsx
/* target — src/app/collections/private/catalogue/components/ContainerPlan.tsx:146-147 */
        {state === 'sent' ? (
          /* `filter-swap` on this panel rather than relying on the one on the <aside>:
             that animation ran when the bar first docked and cannot replay, because
             React never re-inserts the aside. Without it the planner's whole interior
             is replaced in a single frame, in a bar pinned to the bottom of the
             viewport — the deepest conversion on the site reading as a glitch. */
          <div className="flex flex-wrap items-center justify-between gap-4 filter-swap">
```

`.filter-swap` (`src/styles/tailwind.css:327-340`) is a 260ms `@keyframes` with `both`
fill, entering from `opacity: 0` / `translate3d(0, 0.5rem, 0)`. It is the correct
primitive here for the reason the utility's own comment gives: a submit is one-way and
non-reversible, so there is no in-flight state to retarget.

## Repo conventions to follow

- Exemplar: `src/app/contact/components/ContactSplit.tsx:79-82` — the comment then the
  class. Match that shape.
- `.filter-swap` for one-way state swaps; `.rise` is wrong here for the reason recorded
  at `src/styles/tailwind.css:319-326` and demonstrated by plan 012.
- No new duration or curve — `.filter-swap` carries its own, and 260ms is inside the UI
  budget.

## Steps

1. In `src/app/collections/private/catalogue/components/ContainerPlan.tsx`, insert the
   comment above line 147 and append ` filter-swap` to that `<div>`'s class list, per
   **Target**.
2. Nothing else.

## Boundaries

- Do NOT add a scale, a bounce, a checkmark animation or a colour flash. The house
  entrance is the whole change. Nothing in this design system bounces.
- Do NOT touch the `<aside>` at `:141`. If plan 017 has landed, that element now carries
  a docked transform transition instead of `.filter-swap`, and this plan is unaffected
  either way.
- Do NOT add an entrance to the `state === 'error'` branch at `:241` — an error should
  arrive immediately, and it already has `role="alert"`.
- Do NOT change the copy, the totals, or `onClear`.
- Do NOT add new dependencies.
- If lines 146-147 do not match the **Problem** excerpt, STOP and report.

## Verification

- **Mechanical**:
  - `npm run type-check` — exits 0.
  - `npm run lint` — exits 0.
  - `npm run build` — exits 0, 46 routes.
- **Feel check**: behind the gate at `/collections/private/catalogue`, with SMTP
  configured in `.env.local` so the send can succeed. If SMTP is unavailable the send
  returns 503 and you will only reach the error branch — in that case say so in your
  report and do not mark this plan done.
  - Enter a quantity, type an email, click **Send this plan**. The confirmation must
    **fade up over 260ms from 8px below**, not appear instantly.
  - In DevTools → Animations at 10% playback, send again and confirm exactly one
    `filter-swap` entry is recorded, on the inner panel.
  - Click **Start a new plan**, then send a second plan. The entrance must play again —
    a fresh mount each time.
  - Watch the bottom edge of the viewport while it happens: the bar's height changes as
    the interior swaps, and that will still be instant. The fade is what stops the swap
    reading as a repaint glitch.
  - Toggle **Emulate prefers-reduced-motion: reduce** and send: `.filter-swap` has an
    explicit `animation: none` override (`src/styles/tailwind.css:342-346`), so the panel
    must appear instantly and **fully opaque**. If it is invisible, stop — that is worse
    than the problem being fixed.
- **Done when**: the sent confirmation fades up on every send, replays after "Start a new
  plan", and is instantly visible under reduced motion.
