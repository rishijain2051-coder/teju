import React from 'react';
import Link from 'next/link';
import type { Crumb } from '@/lib/schema';

interface BreadcrumbsProps {
  trail: Crumb[];
  /** Usually `veil`, so the trail arrives with the rest of the first fold. */
  className?: string;
}

/**
 * The visible trail, lifted out of the piece page so every route sets it the same
 * way and the same array can be handed to `breadcrumbSchema` — the visible trail
 * and the structured one cannot drift if there is only one of them.
 *
 * A crumb without an `href` is the page being read: no link, and no
 * `aria-current` either, because the enclosing `nav` is already labelled
 * Breadcrumb and the last item of a breadcrumb is the current page by definition.
 *
 * The separators are text rather than a CSS `::before`, and `aria-hidden`, so a
 * screen reader announces "Collections, Storage, VI-1533" instead of reading a
 * slash between each. Baseline-aligned rather than centred: the reference is set
 * in tabular numerals, which sit on a different centre from the words beside them.
 */
export default function Breadcrumbs({ trail, className }: BreadcrumbsProps): React.ReactElement {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-manifest-sm text-muted">
        {trail.map((crumb, at) => (
          <React.Fragment key={`${crumb.name}-${at}`}>
            {at > 0 && <li aria-hidden="true">/</li>}
            <li
              /* Tabular figures for anything carrying a number — the catalogue
                 references (VI-1533) are the reason this trail exists at all. */
              className={
                crumb.href ? undefined : `text-ink-soft${/\d/.test(crumb.name) ? ' numeral' : ''}`
              }
            >
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-clay transition-colors duration-fast ease-out tap"
                >
                  {crumb.name}
                </Link>
              ) : (
                crumb.name
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
