import React from 'react';
import Link from 'next/link';

interface SectionHeadProps {
  /** Filed-document numbering. Two digits, set in the manifest face. Omitted on
   *  sections that are not part of a page's sequence, like "related pieces". */
  index?: string;
  title: React.ReactNode;
  /** Optional trailing link, hidden on small screens where it crowds the rule. */
  href?: string;
  linkLabel?: string;
  /** On a dark ground the rule and the numeral both have to lighten. */
  invert?: boolean;
}

/**
 * The section masthead used across every page: a numbered rule with the heading
 * hung off it. Eight sections had hand-rolled copies of this markup, which is
 * why three of them had drifted to different rule colours and two had lost the
 * optical `-mt-2` that sits the serif on the rule properly.
 */
export default function SectionHead({
  index,
  title,
  href,
  linkLabel,
  invert = false,
}: SectionHeadProps) {
  return (
    <header
      className="rule-label rise"
      style={invert ? { borderColor: 'var(--line-invert)' } : undefined}
    >
      {index && (
        <span className={`text-manifest-sm numeral ${invert ? 'text-paper/45' : 'text-muted'}`}>
          {index}
        </span>
      )}
      <div className="flex-1">
        <h2 className="font-serif text-display font-light -mt-2">{title}</h2>
      </div>

      {href && linkLabel && (
        <Link
          href={href}
          className={`link-arrow tap hidden sm:inline-flex items-center gap-2.5 text-manifest transition-colors duration-base ${
            invert ? 'text-paper/70 hover:text-timber' : 'text-ink-soft hover:text-clay'
          }`}
        >
          {linkLabel}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </header>
  );
}
