import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/ui/PageHeader';
import { brand } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What Vardhman Impex collects when you enquire, where it goes, what Google Analytics measures, and how to have any of it deleted. Written from the site’s own code.',
};

/*
 * Bumped by hand, not `new Date()`.
 *
 * A notice whose date moves on every deploy tells a reader nothing — the point of
 * the date is that it changed when the *practices* changed. Change it when the
 * clauses below change, and not otherwise.
 */
const UPDATED = '18 August 2026';

/*
 * The analytics clause is written flat, not behind `process.env.NEXT_PUBLIC_GA_ID`.
 *
 * Gating the prose on the same flag that loads the tag looked tidy and is the
 * wrong instinct for this one file: `NEXT_PUBLIC_*` is inlined at build time, so a
 * deploy that shipped before the key was set would serve a notice denying it
 * measures anything while measuring it. The measurement ID is configured, so the
 * honest thing is to say so unconditionally. If Google Analytics is ever removed
 * from the layout, clause 07 comes out of this file in the same commit.
 */
const META = [
  { key: 'Applies to', value: 'vardhman-impex.com' },
  { key: 'Collected via', value: 'Enquiry forms, analytics' },
  { key: 'Cookies', value: 'Analytics, and a trade gate' },
  { key: 'Last updated', value: UPDATED },
] as const;

const para = 'text-body text-ink-soft max-w-measure mt-4 first:mt-0';
const row = 'grid sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-1 py-4 border-t border-line';
const term = 'text-manifest-sm text-muted';
const def = 'text-body text-ink-soft';
const inline = 'link-draw text-ink tap';
/* For a literal from the code — a cookie name — rather than a label. `term` would
   be wrong here: it uppercases, and `VI_PRIVATE_ACCESS` is not the name of the
   cookie a reader would find in their browser. */
const literal = 'font-mono text-note text-ink break-all';

/*
 * One array, two renderings: the contents rail and the document itself. The rail
 * used to be the obvious thing to duplicate, and a duplicated heading is a
 * heading that will eventually disagree with the section it points at.
 */
interface Clause {
  id: string;
  title: string;
  body: React.ReactNode;
}

const CLAUSES: Clause[] = [
  {
    id: 'scope',
    title: 'What this covers',
    body: (
      <>
        <p className={para}>
          This notice covers vardhman-impex.com and the enquiries that reach {brand.name} through
          it. It is written from the site’s own code rather than from a template, so what follows is
          what the software actually does.
        </p>
        <p className={para}>
          This is a trade site. Everything it asks for is business contact information from people
          buying furniture wholesale, and it is not directed at children.
        </p>
        <dl className="mt-8">
          <div className={row}>
            <dt className={term}>Who holds it</dt>
            <dd className={def}>{brand.name}</dd>
          </div>
          <div className={row}>
            <dt className={term}>Where</dt>
            <dd className={def}>
              {brand.address.line1}
              <br />
              {brand.address.line2}
              <br />
              {brand.address.country}
            </dd>
          </div>
          <div className={`${row} border-b`}>
            <dt className={term}>Write to us</dt>
            <dd className={def}>
              <a href={`mailto:${brand.email}`} className={inline}>
                {brand.email}
              </a>
            </dd>
          </div>
        </dl>
      </>
    ),
  },
  {
    id: 'collected',
    title: 'What we collect',
    body: (
      <>
        <p className={para}>
          From you directly: only what you type into a form. There is no account on this site, no
          password and no payment, so none of those exist to be collected. Separately from anything
          you send us, Google Analytics measures the pages you read — that is clause 07, and it is
          kept apart from everything in this one.
        </p>
        <dl className="mt-8">
          <div className={row}>
            <dt className={term}>Contact form</dt>
            <dd className={def}>
              Company name, country, business email, website (optional), business type, and your
              message.
            </dd>
          </div>
          <div className={row}>
            <dt className={term}>A design’s panel</dt>
            <dd className={def}>
              Business email, quantity and an optional note — sent together with that design’s own
              reference, name, collection, material, finish and dimensions, so our reply never has
              to begin by asking which piece you meant.
            </dd>
          </div>
          <div className={row}>
            <dt className={term}>Catalogue request</dt>
            <dd className={def}>
              Company name, country, website, business email and business type.
            </dd>
          </div>
          <div className={`${row} border-b`}>
            <dt className={term}>Container planner</dt>
            <dd className={def}>
              Your email, the designs you selected, the quantities, and the volume they come to.
              Available only behind the trade gate.
            </dd>
          </div>
        </dl>
        <p className="text-body text-ink-soft max-w-measure mt-8">
          The server that receives a form also sees the IP address the request came from, as any web
          server does. What it does with that is in the next clause.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'What happens to it',
    body: (
      <>
        <p className={para}>
          It becomes an email. The form posts to our own endpoint, which escapes every value,
          truncates any single field at 4,000 characters and sends the result to{' '}
          <a href={`mailto:${brand.email}`} className={inline}>
            {brand.email}
          </a>
          . Your own address goes into the Reply-To header so that a reply comes straight back to
          you. That is the entire journey — there is no database behind this site, no CRM, and no
          third-party form service in the path.
        </p>
        <p className={para}>
          To stop a script emptying our mail quota, the endpoint counts requests per IP address in a
          sixty-second window. That count lives in the server’s memory for the length of the window
          and is never written to disk.
        </p>
        <p className={para}>
          We use what you send to answer you and to carry on the trade conversation that may follow.
          We do not use it for marketing — there is no mailing list on this site to add you to.
        </p>
      </>
    ),
  },
  {
    id: 'basis',
    title: 'Why we are allowed to hold it',
    body: (
      <>
        <p className={para}>
          For an enquiry, it is straightforward. You wrote to a business asking it to reply, and we
          process what you sent in order to do that. Where the GDPR or the UK GDPR applies to you,
          that is our legitimate interest in answering a business enquiry you began; where you go on
          to order, it is the performance of that contract. Either way you can ask us to stop, and
          clause 09 says how.
        </p>
        <p className={para}>
          For analytics, we are not going to claim more than is true. No consent is asked for and
          none is recorded, so nothing on this site rests on your having given it. That is a
          deliberate choice by the business rather than an oversight in the code, and it is the
          first of the things clause 11 says a lawyer should look at.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <>
        <p className={para}>
          Your enquiry stays in our mailbox. We have not set a fixed deletion schedule for it, and
          we would rather say so plainly than publish a number we do not keep to. Ask us to delete
          it and we delete the thread it lives in.
        </p>
        <p className={para}>
          Two things expire on their own: the trade access cookie described below, after eight
          hours, and the rate-limit count above, after sixty seconds. Three things run to somebody
          else’s schedule rather than ours — the server request logs our host keeps, the mailbox’s
          own storage, and whatever Google Analytics retains, which is set in the analytics account
          and not in this site.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies, and the absence of a banner',
    body: (
      <>
        <p className={para}>Two kinds, and it is worth being exact about which is which.</p>
        <dl className="mt-8">
          <div className={row}>
            <dt className={term}>Analytics</dt>
            <dd className={def}>
              Google Analytics sets its own cookies in your browser on every visit, to tell one
              visit apart from the next. Clause 07 describes what it measures with them.
            </dd>
          </div>
          <div className={`${row} border-b`}>
            <dt className={literal}>vi_private_access</dt>
            <dd className={def}>
              Set only if you hold a trade access code and enter it at the private catalogue gate.
              It contains an expiry timestamp and a signature over that timestamp — no name, no
              email, nothing that identifies you. HttpOnly, so no script can read it; SameSite=Lax;
              sent only over HTTPS in production; and it expires eight hours after it is issued, or
              the moment you sign out.
            </dd>
          </div>
        </dl>
        <p className="text-body text-ink-soft max-w-measure mt-8">
          Nothing else on this site writes a cookie, and nothing writes to your browser’s local
          storage.
        </p>
        <p className={para}>
          You have not been shown a cookie banner, and there is no consent mechanism anywhere on
          this site. We are telling you that rather than dressing it up: the analytics cookies are
          set when the page loads, not after you agree to anything, and there is no control here for
          you to refuse them with. What does work is your own browser — blocking third-party
          cookies, or any tracker-blocking extension or browser, stops Google Analytics on this site
          entirely, and the site itself carries on working without it.
        </p>
      </>
    ),
  },
  {
    id: 'analytics',
    title: 'Analytics',
    body: (
      <>
        <p className={para}>
          This site loads Google Analytics 4. At a general level it records which pages are visited
          and in what order, roughly where in the world the visit came from, the kind of device and
          browser used, and where the visit arrived from — a search result, another site, or a link
          typed directly.
        </p>
        <p className={para}>
          We read it to see which collections are being looked at and which journal notes are worth
          writing more of. We do not use it to identify anyone, we do not connect it to an enquiry,
          and the contents of a form are never sent to it.
        </p>
        <p className={para}>
          Google processes that data on its own terms as a third party, not as a silent extension of
          us, and it may be processed outside India — including in the United States. How long
          Google keeps it is set in the analytics account rather than in this site’s code, so this
          notice does not state a period it cannot verify.
        </p>
      </>
    ),
  },
  {
    id: 'others',
    title: 'Who else sees it',
    body: (
      <>
        <p className={para}>
          Four, each because of something the site actually does. Beyond them there is no
          advertising network, no lead broker, no CRM, no chat widget and no third-party form
          service — there is no code in this site that could reach one.
        </p>
        <dl className="mt-8">
          <div className={row}>
            <dt className={term}>Google Workspace</dt>
            <dd className={def}>
              Our email. The forms send through an authenticated SMTP account on it, so an enquiry
              is stored on Google’s systems from the moment it arrives, and stays there in the
              mailbox.
            </dd>
          </div>
          <div className={row}>
            <dt className={term}>Google Analytics</dt>
            <dd className={def}>
              A separate Google product, described in the clause above. It never receives the
              contents of an enquiry.
            </dd>
          </div>
          <div className={row}>
            {/* Named from what production actually answers, not from the repo's
                deploy config, which is stale: `package.json` still carries
                `@netlify/plugin-nextjs` and the README still says Netlify, but
                www.vardhman-impex.com responds `Server: Vercel` with an
                `X-Vercel-Id` from the bom1 region, and the domain's DNS points at
                Vercel's IPs. A privacy notice has to name the processor that holds
                the data, so it follows the wire and not the manifest. If the site
                is ever moved, this row moves with it. */}
            <dt className={term}>Vercel</dt>
            <dd className={def}>
              Serves this site. It sees the requests that reach it, including your IP address, in
              the ordinary course of delivering pages.
            </dd>
          </div>
          <div className={`${row} border-b`}>
            <dt className={term}>Meta</dt>
            <dd className={def}>
              Only if you press a WhatsApp button. That opens a chat in your own WhatsApp, on Meta’s
              service and under Meta’s terms. We never send anything to WhatsApp on your behalf.
            </dd>
          </div>
        </dl>
        <p className="text-body text-ink-soft max-w-measure mt-8">
          We are an Indian exporter with buyers in Europe, the United Kingdom and elsewhere, and
          these are global services: your data may be processed outside India, including in the
          United States.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Your choices, and deletion',
    body: (
      <>
        <p className={para}>
          Write to{' '}
          <a href={`mailto:${brand.email}`} className={inline}>
            {brand.email}
          </a>{' '}
          and ask. In practice that means one of four things: a copy of what you sent us, a
          correction to it, deletion of it, or an instruction to stop writing to you.
        </p>
        <p className={para}>
          We need to be able to tell that the enquiry is yours, which for a business address is
          usually just a reply from it. We answer these on the same schedule as everything else —
          within two working days. You can also reach us by post at the works, or by telephone on{' '}
          <a href={`tel:${brand.phoneHref}`} className={`${inline} numeral`}>
            {brand.phone}
          </a>
          .
        </p>
        <p className={para}>
          Analytics is the one thing we cannot switch off for you, because it is not held under your
          name for us to find — clause 06 is honest about that, and the control that does work is in
          your own browser.
        </p>
        <p className={para}>
          Depending on where you are, the law may also give you the right to complain to a data
          protection authority. Nothing here is meant to stand between you and that.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this notice',
    body: (
      <p className={para}>
        When the practices described here change, this notice changes with them and the date at the
        top of the page moves. We do not keep an archive of previous versions.
      </p>
    ),
  },
  {
    id: 'review',
    title: 'One thing to know about this page',
    body: (
      <>
        <p className={para}>
          This notice was written by reading the site’s code, so it is an accurate description of
          what the software does. It is not legal advice, and it has not been reviewed by a lawyer.
        </p>
        <p className={para}>
          Before it is relied on as a compliance document, {brand.name} should have it checked
          against the law that applies to its buyers — the GDPR in Europe, the UK GDPR, India’s
          Digital Personal Data Protection Act — and add whatever that review requires. The obvious
          place to start is the one this page has already been plain about: analytics cookies are
          set without asking, and several of those regimes expect them to be asked about first.
        </p>
        <p className={para}>
          We would rather say that here than let a template imply an assurance nobody has given.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHeader
          eyebrow="Privacy"
          title="What we do with what you send us."
          lead="Short version: an enquiry becomes an email to one mailbox and nothing else, Google Analytics counts which pages get read, and there is no cookie banner — we would rather tell you that than pretend otherwise. The long version is below, clause by clause."
          meta={META}
        />

        {/*
         * No `.rise` and no `<Reveal>` anywhere in this document, which is
         * deliberate and the one exception on the site.
         *
         * Every other page earns its entrance because you arrive at the top of it
         * and read downward. A privacy notice is arrived at sideways — from a
         * footer link, from a search result, from Ctrl-F — and a clause that is at
         * opacity 0 until it is scrolled past is a clause the browser's find, the
         * print stylesheet and a screen reader's document outline all disagree
         * about. It is also, at this length, an affectation: fading a legal
         * document into view paragraph by paragraph is the opposite of letting
         * someone read it.
         */}
        <section className="pb-20 lg:pb-28">
          <div className="shell">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-8">
              {/* Sticky at 7rem: the masthead is fixed and 5rem tall on desktop,
                  so anything above that sits underneath it. */}
              <nav
                aria-label="On this page"
                className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start"
              >
                <p className="text-manifest-sm text-muted pb-3 border-b border-line-strong">
                  On this page
                </p>
                {/* Wrapped into an index line on a phone, a column from lg.
                    Eleven clauses stacked vertically is ~500px of jump links
                    before the document starts, which is a screen and a half of a
                    390px viewport spent on a table of contents. `py-3` keeps each
                    target at 45px either way — `.tap` is wrong here, because its
                    outward hit area would overlap the neighbour above. */}
                <ol className="flex flex-wrap gap-x-6 lg:block mt-1">
                  {CLAUSES.map((clause, i) => (
                    <li key={clause.id}>
                      <a
                        href={`#${clause.id}`}
                        className="flex items-baseline gap-2.5 py-3 text-note text-ink-soft hover:text-clay transition-colors duration-fast ease-out"
                      >
                        <span className="text-manifest-sm text-muted numeral shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {clause.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="lg:col-span-8 lg:col-start-5">
                {CLAUSES.map((clause, i) => (
                  /* `scroll-mt` clears the fixed masthead — 4rem on a phone,
                     5rem from lg — or an anchor lands with its own heading
                     hidden behind the bar. */
                  <section
                    key={clause.id}
                    id={clause.id}
                    className="scroll-mt-24 lg:scroll-mt-28 mt-14 lg:mt-16 first:mt-0"
                  >
                    <h2 className="text-title flex items-baseline gap-4">
                      <span className="text-manifest-sm text-muted numeral shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{clause.title}</span>
                    </h2>
                    <div className="mt-5">{clause.body}</div>
                  </section>
                ))}

                <div className="rule mt-16 pt-6">
                  <p className="text-manifest-sm text-muted">
                    Last updated {UPDATED} ·{' '}
                    <Link
                      href="/contact"
                      className="link-draw text-ink tap hover:text-clay transition-colors duration-fast ease-out"
                    >
                      Enquiries
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
