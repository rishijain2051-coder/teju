import { type CatalogueKey } from './imagery';
import { collectionRecords, pieceRecords } from './generated/content';

/**
 * The catalogue: collections, pieces, and the trade figures derived from them.
 *
 * The records come from `content/`, edited at /keystatic and compiled into
 * `generated/content.ts` by `scripts/build-content.mjs`. That script is where
 * validation lives now — it checks every image key against the imagery manifest,
 * every collection name against the list below, every reference for uniqueness,
 * and every dimension string against the parser that computes CBM. A bad edit
 * fails `npm run build` with the offending file named, rather than rendering a
 * blank plate or a dash where a container count should be.
 *
 * So the casts below are narrowing, not hoping: the build step has already proved
 * the shape. Everything derived — slugs, packed volumes, the FSC claim — stays
 * here in code, because it is logic rather than content and nobody should be able
 * to edit it in a form.
 */

export type CollectionName =
  'Living' | 'Storage' | 'Dining' | 'Bedroom' | 'Hospitality' | 'Occasional';

/** URL-safe slug from a display name. Kept for both collections and pieces so
 *  a route never has to carry a second, hand-maintained list of identifiers. */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export interface Collection {
  index: string;
  slug: string;
  name: CollectionName;
  tagline: string;
  /** Size of the full range behind this collection, not the number shown. */
  range: string;
  image: CatalogueKey;
  href: string;
  /** The collection page opening. Two paragraphs, no more. */
  story: readonly [string, string];
  spec: readonly { key: string; value: string }[];
  /** Specified to drawing rather than ordered from a range. */
  bespoke?: true;
}

interface CollectionRecord {
  slug: string;
  index: string;
  name: string;
  tagline: string;
  range: string;
  image: string;
  story: readonly string[];
  spec: readonly { key: string; value: string }[];
  /* Absent rather than false on the five non-contract collections, so the
     generated literal is a union of shapes; widening once here beats narrowing
     at every access. */
  bespoke?: boolean;
}

/* Sorted by index, not by filename. The compiler emits entries in directory
   order, which is alphabetical — so without this the site opened with Bedroom. */
export const collections: Collection[] = (collectionRecords as readonly CollectionRecord[])
  .slice()
  .sort((a, b) => a.index.localeCompare(b.index))
  .map((record) => ({
    index: record.index,
    slug: record.slug,
    name: record.name as CollectionName,
    tagline: record.tagline,
    range: record.range,
    image: record.image as CatalogueKey,
    href: `/collections/${record.slug}`,
    story: [record.story[0], record.story[1]] as const,
    spec: record.spec.map((row) => ({ key: row.key, value: row.value })),
    ...(record.bespoke ? { bespoke: true as const } : {}),
  }));

export interface Piece {
  ref: string;
  slug: string;
  name: string;
  collection: CollectionName;
  material: string;
  finish: string;
  dimensions: string;
  image: CatalogueKey;
  /** One line of why this design is what it is. Card subtitle and page lead. */
  note: string;
  /** Set on recent work so the private catalogue can lead with new arrivals. */
  season?: string;
  /** Behind the trade access gate only. */
  private?: true;
}

/** The season currently flagged as new inside the private catalogue. */
export const currentSeason = 'Spring 2026';

interface PieceRecord {
  slug: string;
  ref: string;
  name: string;
  collection: string;
  material: string;
  finish: string;
  dimensions: string;
  image: string;
  note: string;
  season?: string;
  private?: boolean;
}

const collectionOrder = new Map(collections.map((c) => [c.name, c.index]));

/**
 * Grouped by collection, then by reference within it.
 *
 * The order is load-bearing: the home page shows `pieces.slice(0, 6)`, and the
 * grids read top to bottom. Directory order would have interleaved collections
 * alphabetically by design name, which reads as a shuffle.
 */
const allRecords: Piece[] = (pieceRecords as readonly PieceRecord[])
  .map((record) => ({
    ref: record.ref,
    slug: record.slug,
    name: record.name,
    collection: record.collection as CollectionName,
    material: record.material,
    finish: record.finish,
    dimensions: record.dimensions,
    image: record.image as CatalogueKey,
    note: record.note,
    ...(record.season ? { season: record.season } : {}),
    ...(record.private ? { private: true as const } : {}),
  }))
  .sort((a, b) => {
    const byCollection = (collectionOrder.get(a.collection) ?? '99').localeCompare(
      collectionOrder.get(b.collection) ?? '99'
    );
    return byCollection !== 0 ? byCollection : a.ref.localeCompare(b.ref);
  });

/**
 * Named for Rajasthan — Mehrangarh, Umaid, Marwar, the Thar. Every entry maps to
 * a design we have actually photographed; nothing here is a placeholder.
 */
export const pieces: Piece[] = allRecords.filter((piece) => !piece.private);

/**
 * Shown only behind the trade access gate. The private range is the public
 * selection plus these, so a verified buyer genuinely sees roughly twice what
 * a visitor does rather than the same grid with a different heading.
 */
export const privateAdditions: Piece[] = allRecords.filter((piece) => piece.private);

/** Everything in the range — the private catalogue's view. */
export const allPieces: Piece[] = [...pieces, ...privateAdditions];

/* ── Lookups ─────────────────────────────────────────────────────────────── */

export const findCollection = (slug: string) =>
  collections.find((collection) => collection.slug === slug);

/**
 * The public product route. Private designs deliberately have no page of their
 * own — a route generated for them would be reachable without the access cookie
 * and would leak the gated range — so their detail opens inline inside the
 * private catalogue instead.
 */
export const pieceHref = (piece: Piece) =>
  `/collections/${slugify(piece.collection)}/${piece.slug}`;

export const piecesIn = (name: CollectionName, includePrivate = false) =>
  (includePrivate ? allPieces : pieces).filter((piece) => piece.collection === name);

export const findPiece = (collectionSlug: string, pieceSlug: string) => {
  const collection = findCollection(collectionSlug);
  if (!collection) return undefined;
  return allPieces.find(
    (piece) => piece.collection === collection.name && piece.slug === pieceSlug
  );
};

/** Same collection first, then anything else, never the piece itself. */
export const relatedTo = (piece: Piece, count = 3) => {
  const pool = piece.private ? allPieces : pieces;
  const sameCollection = pool.filter(
    (p) => p.ref !== piece.ref && p.collection === piece.collection
  );
  const rest = pool.filter((p) => p.ref !== piece.ref && p.collection !== piece.collection);
  return [...sameCollection, ...rest].slice(0, count);
};

/* ── Trade figures ───────────────────────────────────────────────────────── */

/** Packing allowance per face, in cm. Corner protection plus corrugate. */
const PACKING_CM = 3;

/** Practically loadable volume, not nominal internal volume. */
const CONTAINER_CBM = { twenty: 28, fortyHigh: 67 };

const parseDimensions = (value: string) => {
  let width = 0;
  let depth = 0;
  let height = 0;
  let diameter = 0;

  for (const part of value.replace(/\s*cm\s*$/i, '').split('×')) {
    const match = /^\s*([LWDHØ])\s*(\d+(?:\.\d+)?)\s*$/.exec(part);
    if (!match) return null;
    const measure = Number(match[2]);
    switch (match[1]) {
      case 'L':
      case 'W':
        width = measure;
        break;
      case 'D':
        depth = measure;
        break;
      case 'H':
        height = measure;
        break;
      case 'Ø':
        diameter = measure;
        break;
    }
  }

  if (diameter) {
    width = width || diameter;
    depth = depth || diameter;
  }
  return width && depth && height ? { width, depth, height } : null;
};

export interface Carton {
  /** Outer carton, in cm. */
  dims: string;
  cbm: number;
  per20: number;
  per40: number;
}

/**
 * Indicative packing figures, computed from the finished dimensions rather than
 * stored — so they can never drift out of step with the spec above. Every
 * surface that shows them says "indicative" and states the allowance, because
 * an approximate CBM a buyer can plan against beats a precise one they cannot
 * check.
 */
export const cartonFor = (piece: Piece): Carton | null => {
  const size = parseDimensions(piece.dimensions);
  if (!size) return null;

  const width = size.width + PACKING_CM * 2;
  const depth = size.depth + PACKING_CM * 2;
  const height = size.height + PACKING_CM * 2;
  const cbm = Math.round(((width * depth * height) / 1_000_000) * 100) / 100;

  return {
    dims: `${width} × ${depth} × ${height} cm`,
    cbm,
    per20: Math.floor(CONTAINER_CBM.twenty / cbm),
    per40: Math.floor(CONTAINER_CBM.fortyHigh / cbm),
  };
};

export const packingNote = `Outer carton allows ${PACKING_CM} cm per face. Container counts assume ${CONTAINER_CBM.twenty} CBM loadable in a 20 ft and ${CONTAINER_CBM.fortyHigh} CBM in a 40 ft high-cube, single design, no mixed stacking.`;

/**
 * Which FSC claim a design can be supplied under. Derived from the material so
 * it cannot contradict the spec: reclaimed stock carries a recycled claim,
 * plantation mango a forest-management one. Wording only — the certificate code
 * lives in `certification` and is printed alongside every claim.
 */
export const fscClaimFor = (piece: Piece) =>
  /reclaim/i.test(piece.material)
    ? {
        claim: 'FSC Recycled',
        detail: 'Reclaimed stock, supplied under a recycled-content claim on request.',
      }
    : {
        claim: 'FSC 100% / Mix',
        detail: 'Certified plantation mango available for this design on request.',
      };
