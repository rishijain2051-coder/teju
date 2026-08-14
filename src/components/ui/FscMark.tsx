import React from 'react';
import { certification } from '@/lib/works';

const { fsc } = certification;

/**
 * The licensed FSC trademarks, served exactly as FSC issued them.
 *
 * Clause 9.4 of the licence agreement makes any amendment, derivative work or
 * edit of the licensed materials a breach — so these are plain `<img>` tags
 * pointing at byte-identical SVGs in /public. No recolouring to the site
 * palette, no cropping the strapline off the promotional panel, and no Next
 * image pipeline that might re-encode them.
 *
 * `ground="dark"` matters rather than being a nicety: the artwork is green on
 * transparent, and on the teal sections the strapline under the panel is very
 * nearly invisible. On a dark ground the mark is set on a light card, which is
 * placement rather than modification.
 */

const MARKS = {
  /** Promotional panel: tree, wordmark, fsc.org, licence code, and FSC's own
   *  "Ask for our FSC-certified materials" strapline. */
  panel: {
    src: '/assets/fsc/fsc-c229285-portrait-white-green.svg',
    width: 300,
    height: 490,
    alt: `FSC certified, licence code ${fsc.code}. Ask for our FSC-certified materials.`,
  },
  /** The tree alone, for placements where the panel is too tall. */
  tree: {
    src: '/assets/fsc/fsc-tree-white-green.svg',
    width: 360,
    height: 400,
    alt: 'FSC · Forest Stewardship Council',
  },
} as const;

interface FscMarkProps {
  variant?: keyof typeof MARKS;
  /** Rendered height in px. Kept above the point where the code stops being
   *  readable — an illegible licence code is the same as no licence code. */
  height?: number;
  ground?: 'light' | 'dark';
  className?: string;
}

const MIN_HEIGHT = { panel: 180, tree: 56 };

export default function FscMark({
  variant = 'panel',
  height,
  ground = 'light',
  className = '',
}: FscMarkProps) {
  const mark = MARKS[variant];
  const drawn = Math.max(height ?? MIN_HEIGHT[variant], MIN_HEIGHT[variant]);
  const width = Math.round((mark.width / mark.height) * drawn);

  const image = (
    <img
      src={mark.src}
      alt={mark.alt}
      width={width}
      height={drawn}
      /* Intrinsic ratio is fixed by the artwork; never let a flex parent squash it. */
      style={{ width, height: drawn }}
      className="block shrink-0"
    />
  );

  if (ground === 'dark') {
    return (
      <div className={`inline-block bg-paper-warm p-5 ${className}`}>{image}</div>
    );
  }

  return <div className={`inline-block ${className}`}>{image}</div>;
}
