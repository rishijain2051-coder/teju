import React from 'react';

interface SpecListProps {
  rows: readonly { key: string; value: string }[];
  /** Ruled rows read as a spec sheet; inline rows sit inside a card. */
  variant?: 'ruled' | 'inline';
  invert?: boolean;
  className?: string;
}

/**
 * Key/value pairs set as a specification sheet. The `numeral` face on values is
 * the point: dimensions, volumes and lead times line up in a column when the
 * figures are tabular, and look like a ransom note when they are not.
 */
export default function SpecList({
  rows,
  variant = 'ruled',
  invert = false,
  className = '',
}: SpecListProps) {
  const line = invert ? 'border-line-invert' : 'border-line';
  const label = invert ? 'text-paper/55' : 'text-muted';
  const value = invert ? 'text-paper' : 'text-ink';

  if (variant === 'inline') {
    return (
      <dl className={`space-y-1 ${className}`}>
        {rows.map((row) => (
          <div key={row.key} className="flex gap-3">
            <dt className={`text-manifest-sm w-28 lg:w-24 shrink-0 ${label}`}>{row.key}</dt>
            <dd
              className={`text-manifest-sm numeral ${invert ? 'text-paper/80' : 'text-ink-soft'}`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className={className}>
      {rows.map((row) => (
        <div
          key={row.key}
          className={`flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-4 border-t ${line}`}
        >
          <dt className={`text-manifest-sm ${label}`}>{row.key}</dt>
          <dd className={`text-body numeral text-right ${value}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
