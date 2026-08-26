'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';
import AppImage from '@/components/ui/AppImage';
import { useReveal } from '@/components/ui/useReveal';
import { brand, img } from '@/lib/site';
import { whatsappUrl } from '@/lib/enquiry';
import { delay } from '@/lib/reveal';
import type { CatalogueKey } from '@/lib/imagery';

/** Three portrait plates, held long enough to actually be looked at. */
const PLATES: CatalogueKey[] = ['hero-mango-light', 'hero-starburst', 'hero-tall-chest'];
const HOLD = 7000;

/*
 * The hero is the one conversion point on the site with no form behind it, so the
 * thread has to open with its own provenance — otherwise the factory receives
 * "hi" from a number it cannot place. Composed once at module scope: the fields
 * are empty here, and `whatsappUrl` percent-encodes on every call.
 */
const WHATSAPP = whatsappUrl('Enquiry from vardhman-impex.com', []);

/** Inline prose link: underlined at rest, because colour alone is not a signal. */
const PROSE_LINK =
  'text-ink underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-clay hover:text-clay transition-colors duration-fast ease-out';

export default function HeroSection() {
  const ref = useReveal<HTMLElement>({ immediate: true });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  /*
   * Held in state rather than read inside the rotation effect, because the pause
   * control must not render when there is nothing rotating. Starts false so the
   * server sends no control and it appears on hydration — no layout shift, the
   * control is inside an absolutely positioned overlay.
   */
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /*
   * Keyed on `active`, not mounted once: the interval is re-armed every time the
   * plate changes, so a plate the visitor picked gets the full HOLD rather than
   * whatever was left of a cycle that started before they clicked. With `[]` a
   * click 6.5s into a cycle was overridden 500ms later, mid-crossfade.
   *
   * `paused` is WCAG 2.2.2, Level A: anything that moves or auto-updates for more
   * than five seconds needs a way to stop it. The three plate rules below look
   * like that mechanism and are not — picking a plate re-arms the timer rather
   * than stopping it — and they are `hidden lg:flex`, so a phone had no control
   * at all while the plates turned over indefinitely.
   */
  useEffect(() => {
    if (!motionOk || paused) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % PLATES.length), HOLD);
    return () => clearTimeout(id);
  }, [active, paused, motionOk]);

  return (
    <section ref={ref} className="reveal-now relative grain">
      <div className="grid lg:grid-cols-12 min-h-[100svh]">
        {/* ── Type column ──────────────────────────────────────────────── */}
        {/* `pt-20` below `lg`, not `pt-24`. The masthead is 65px, so 80px still
            clears it, and it gives back the 18px the provenance line costs when
            it wraps to two on a phone — this hero already runs 1.4x the viewport
            and every pixel above it is a pixel of photograph. */}
        <div className="lg:col-span-7 flex flex-col justify-between pt-20 pb-8 lg:pt-28 lg:pb-10 px-gutter">
          <div className="max-w-[46rem]">
            {/* The company's own name, in `<main>`, at the top.
                It appeared nowhere in the body of this page: eleven screens in
                which the only mentions of "Vardhman Impex" were a customer
                quoting it in a testimonial and the local part of an email
                address. The two brand statements were both chrome — masthead and
                footer. This line was already the page's provenance line, so the
                name is its subject rather than an addition to it. */}
            <p className="text-manifest text-clay veil" style={delay(80)}>
              {brand.name} · Est. {brand.established} · {brand.origin}
            </p>

            {/* Three lines, not two: each word wipes on its own beat, and the
                delays stay 100ms apart so the cadence reads as a list rather than
                a sentence being assembled.

                Two things here are for the readers who are not looking at it.

                `.wipe` is `display: block`, so the three words are three lines on
                screen — but there was no whitespace between the spans, and text
                extraction does not invent any. The accessible name of the site's
                most important heading was the single token `RawRealRemarkable`, and
                that is what a screen reader announced and what a crawler read. The
                `{' '}` separators cost nothing visually: whitespace between two
                block boxes collapses.

                The `sr-only` clause is there because the three words, spaced or
                not, say nothing about what this company makes or where. This is a
                furniture manufacturer whose h1 named no product, no material and no
                place. Every term below is already the plain subject of this page and
                of its title — it is the heading finally describing its own document,
                not a keyword list, and it reads as a sentence when spoken. */}
            <h1 className="font-serif text-mega font-light mt-5 lg:mt-6">
              <span className="wipe">
                <span className="wipe-inner" style={delay(160)}>
                  Raw
                </span>
              </span>{' '}
              <span className="wipe">
                <span className="wipe-inner" style={delay(260)}>
                  Real
                </span>
              </span>{' '}
              <span className="wipe">
                <span className="wipe-inner italic text-clay" style={delay(360)}>
                  Remarkable
                </span>
              </span>
              <span className="sr-only">
                {' '}
                — solid mango and reclaimed hardwood furniture, manufactured and exported from{' '}
                {brand.origin} since {brand.established}.
              </span>
            </h1>

            {/* The two nouns a buyer arrived searching for carry the links, so the
                browse path survives demoting it out of the button row. */}
            <p
              className="text-lead text-ink-soft max-w-measure mt-5 lg:mt-7 rise"
              style={delay(520)}
            >
              <Link href="/collections" className={PROSE_LINK}>
                Solid mango and reclaimed hardwood
              </Link>
              , cut, carved and finished on{' '}
              <Link href="/factory" className={PROSE_LINK}>
                our own floor in Boranada
              </Link>
              , then packed into containers bound for nine countries. Low minimums. Honest lead
              times. One set of hands from log to lorry.
            </p>

            {/* Two actions, not three: at 412px each of these labels takes a row of
                its own, and a third slab pushed the reply promise under the fold on
                a 730px-tall phone once the sticky mobile bar takes its 64px. The
                catalogue request is the deep conversion; WhatsApp is for the buyer
                who would rather talk than fill in a form. */}
            {/* `flex-col` below `sm`. Wrapped at content width these stacked at
                299 and 238px on a 390px phone, left-aligned with a ragged right
                edge — the same shape of fault as the craft page's close. */}
            <div
              className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-7 lg:mt-8 rise"
              style={delay(640)}
            >
              <Link href="/collections#access" className="btn btn-solid justify-center">
                Request catalogue access
                <Arrow />
              </Link>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost justify-center"
              >
                WhatsApp the factory
              </a>
            </div>

            {/* Directly under the buttons rather than beside them: the promise is
                what makes pressing either of them feel cheap, and it only does that
                work if it is read before the press, not after.

                The sentence is the one already quoted by the container plan, the
                trade-access form and every enquiry panel. Word for word on purpose —
                a buyer who meets two different figures believes neither. */}
            <p className="text-note text-muted mt-4 lg:mt-5 rise" style={delay(700)}>
              We reply within two working days. Or call{' '}
              <a
                href={`tel:${brand.phoneHref}`}
                className={`numeral press ${PROSE_LINK}`}
                aria-label={`Call ${brand.name} on ${brand.phone}`}
              >
                {brand.phone}
              </a>
              .
            </p>
          </div>

          {/* Plate index, set like a contact sheet. */}
          <div className="hidden lg:flex items-center gap-5 mt-8 rise" style={delay(760)}>
            {PLATES.map((plate, i) => (
              <button
                key={plate}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show plate ${i + 1}: ${img(plate).alt}`}
                aria-current={i === active}
                className="group flex items-center gap-2.5 py-3.5 tap"
              >
                {/* Rules alone, no numerals. The plate caption already reads
                    "Plate 01 / 03", and these three sat within a screen of the
                    collection card indices below — the same digits meaning two
                    different things. Scales rather than resizing: `width` is a
                    layout property and this re-runs every 7s for the life of the
                    page. The `aria-label` still names each plate. */}
                <span
                  className={`block h-px w-16 origin-left transition-[transform,background-color] duration-base ease-out ${
                    i === active
                      ? 'scale-x-100 bg-ink'
                      : 'scale-x-[0.45] bg-line-strong group-hover:bg-ink'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Plate column — bleeds to the right edge ───────────────────── */}
        <div className="lg:col-span-5 relative min-h-[62vh] lg:min-h-0 bg-paper-deep overflow-hidden">
          {PLATES.map((plate, i) => {
            const plateImg = img(plate);
            return (
              <div
                key={plate}
                aria-hidden={i !== active}
                className="absolute inset-0 transition-[opacity,filter] duration-crossfade ease-out-soft"
                style={{
                  opacity: i === active ? 1 : 0,
                  // A slight blur on the outgoing plate stops two sharp
                  // photographs reading as a double exposure mid-crossfade.
                  // `blur(0px)` not `none` — `filter` cannot interpolate to a keyword.
                  filter: i === active ? 'blur(0px)' : 'blur(4px)',
                }}
              >
                <AppImage
                  src={plateImg.src}
                  alt={plateImg.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  placeholder="blur"
                  blurDataURL={plateImg.blurDataURL}
                  /*
                   * Centre, and it has to be. `object-position` was tried here to
                   * lift the furniture into the 98px of plate that a phone shows
                   * above the sticky bar, and it cannot: the box is 390x523 (0.745)
                   * against a 0.725 source, so `cover` draws 390x538 and the whole
                   * vertical travel available is 15px. There is no crop that puts
                   * the piece in that strip.
                   *
                   * The real number is the type column: 669px of copy against 702px
                   * of usable first screen. Nothing about the image fixes that — see
                   * the note on the section.
                   */
                  className={`object-cover drift ${i === active ? 'shown' : ''}`}
                />
              </div>
            );
          })}

          {/*
           * Caption sits on the plate, bottom-left, like a printed credit — but on
           * its own ground now, not on the scrim.
           *
           * `text-paper/75` on `scrim-soft` measured 2.25:1 against the default
           * plate and 3.37:1 against the third, at 10px, where AA wants 4.5. The
           * scrim is only 16.5% ink this far up the gradient, and the real problem
           * is worse than any average: the string crosses a hard light/dark
           * boundary inside one photograph, so "Plate 01" read against a dark
           * blanket while "/ 03" disappeared into sunlit floor. No single scrim
           * value fixes a local failure. A chip does — `bg-ink/80` clears 10:1 over
           * the brightest pixel in any of the three frames.
           */}
          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8 scrim-soft pt-24 flex items-end justify-between gap-3">
            <p className="text-manifest-sm text-paper numeral bg-ink/80 px-2.5 py-1.5">
              Plate {String(active + 1).padStart(2, '0')} / {String(PLATES.length).padStart(2, '0')}
            </p>

            {motionOk && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                className="text-manifest-sm text-paper bg-ink/80 px-2.5 py-1.5 hover:bg-ink transition-colors duration-fast ease-out shrink-0"
              >
                {paused ? 'Play' : 'Pause'}
                <span className="sr-only"> the plate rotation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
