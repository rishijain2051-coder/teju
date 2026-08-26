import React from 'react';
import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';

interface SectionHeadProps {
  title: React.ReactNode;
  /** Optional trailing link, hidden on small screens where it crowds the rule. */
  href?: string;
  linkLabel?: string;
  /** On a dark ground the rule has to lighten. */
  invert?: boolean;
}

/**
 * The section masthead used across every page: a ruled heading. Eight sections
 * had hand-rolled copies of this markup, which is why three of them had drifted
 * to different rule colours and two had lost the optical offset that sits the
 * serif on the rule properly.
 *
 * That offset is `-mt-[0.17em]`, in em rather than px. It was `-mt-2`, tuned by
 * eye when this heading was 120px, where -8px put the cap-height 0.222em below
 * the rule. At 68px the same -8px leaves 0.287em and the heading sits visibly low
 * on its own rule; an em value holds the ratio at every step of the clamp. It
 * also settles a disagreement — journal/[slug] had reached for `-mt-1` doing the
 * same job at the same size.
 *
 * No section numbering. Every section used to open with 01 / 02 / 03, which
 * collided with the numbered sequences *inside* several of them — the home page
 * showed "01 The collections" directly above the card marked 01, and the factory
 * page put "03" above capability 03. Numerals now mean one thing on this site:
 * position in a sequence the reader actually needs to follow.
 *
 * `text-display-sm`, not `text-display`. This heading ran at the same 120px as an
 * interior page's h1, so on the craft page four headlines shared one size and the
 * page title had no more authority than "What we build with". Worse on the home
 * page, where the hero h1 is `text-mega` — 97px at 1440 — so its own section
 * headings were 23% larger than it. The scale is now monotonic: 120px for an
 * interior h1, 68px for a section, 28px for anything under it. Every hand-rolled
 * section h2 moved with this one, and the three h3s that had been sitting at
 * display-sm came down to `text-title` so no h3 outranks its parent.
 */
export default function SectionHead({ title, href, linkLabel, invert = false }: SectionHeadProps) {
  return (
    <header
      className="rule-label rise"
      style={invert ? { borderColor: 'var(--line-invert)' } : undefined}
    >
      <div className="flex-1">
        <h2 className="font-serif text-display-sm font-light -mt-[0.17em]">{title}</h2>
      </div>

      {href && linkLabel && (
        <Link
          href={href}
          className={`link-arrow tap hidden sm:inline-flex items-center gap-2.5 text-manifest transition-colors duration-fast ease-out ${
            invert ? 'text-paper/70 hover:text-sand' : 'text-ink-soft hover:text-clay'
          }`}
        >
          {linkLabel}
          <Arrow />
        </Link>
      )}
    </header>
  );
}
