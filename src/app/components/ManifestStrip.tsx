import React from 'react';
import { manifest } from '@/lib/site';

/**
 * The export facts as a running manifest — the band that sets the whole site's
 * register. Duplicated once so the marquee loops seamlessly at -50%; the copy
 * is hidden from assistive tech so the facts are only announced once.
 */
export default function ManifestStrip() {
  const row = (
    <ul className="flex shrink-0 items-center">
      {manifest.map((entry) => (
        <li key={entry.key} className="flex items-center whitespace-nowrap">
          <span className="text-manifest text-paper/55">{entry.key}</span>
          <span className="text-manifest text-paper ml-3">{entry.value}</span>
          <span className="mx-8 h-3 w-px bg-paper/20" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <section
      className="bg-ink overflow-hidden border-y border-line-invert"
      aria-label="Export details"
    >
      <div className="flex w-max animate-marquee marquee-track py-4">
        {row}
        <div aria-hidden="true" className="flex">
          {row}
        </div>
      </div>
    </section>
  );
}
