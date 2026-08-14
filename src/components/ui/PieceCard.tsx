import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import SpecList from '@/components/ui/SpecList';
import { img, pieceHref, type Piece } from '@/lib/site';

interface PieceCardProps {
  piece: Piece;
  sizes?: string;
  /** `.rise` is wrong inside a filtered grid — the observer has already fired. */
  reveal?: boolean;
  /** The one-line editorial note. Off in dense grids where the spec is enough. */
  showNote?: boolean;
  priority?: boolean;
  className?: string;
}

/**
 * The catalogue card. Four grids rendered their own near-identical copy of this
 * markup, which is how two of them ended up linking nowhere while the other two
 * linked to the collections index regardless of which piece was clicked.
 */
export default function PieceCard({
  piece,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  reveal = true,
  showNote = false,
  priority = false,
  className = '',
}: PieceCardProps) {
  const plate = img(piece.image);

  return (
    <article className={`group ${reveal ? 'rise' : ''} ${className}`}>
      <Link href={pieceHref(piece)} className="block">
        <div className="plate aspect-[4/3]">
          <AppImage
            src={plate.src}
            alt={plate.alt}
            fill
            sizes={sizes}
            placeholder="blur"
            blurDataURL={plate.blurDataURL}
            priority={priority}
            className="object-cover"
          />
        </div>

        <div className="pt-4 mt-4 border-t border-line group-hover:border-ink transition-colors duration-fast ease-out">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-title group-hover:text-clay transition-colors duration-fast ease-out">
              {piece.name}
            </h3>
            <span className="text-manifest-sm text-muted numeral shrink-0">{piece.ref}</span>
          </div>
          <p className="text-manifest-sm text-clay mt-2">{piece.collection}</p>

          {showNote && <p className="text-body text-muted mt-3 max-w-measure">{piece.note}</p>}

          <SpecList
            variant="inline"
            className="mt-3"
            rows={[
              { key: 'Material', value: piece.material },
              { key: 'Finish', value: piece.finish },
              { key: 'Dimensions', value: piece.dimensions },
            ]}
          />
        </div>
      </Link>
    </article>
  );
}
