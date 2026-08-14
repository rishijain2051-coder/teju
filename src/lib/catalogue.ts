import { type CatalogueKey } from './imagery';

/**
 * The catalogue: collections, pieces, and the trade figures derived from them.
 *
 * Split out of site.ts once collections and pieces each grew a page of their
 * own — a route needs to look a record up by slug, and that lookup belongs
 * next to the data rather than in the page. site.ts re-exports all of it, so
 * `import { pieces } from '@/lib/site'` still works.
 *
 * FIGURES TO CONFIRM WITH THE WORKS: dimensions, finishes and the editorial
 * notes below are written to be plausible for each photographed design. Correct
 * anything that differs from the real spec sheet — every page reads from here,
 * so a fix in this file fixes the whole site.
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

const COLLECTIONS = [
  {
    index: '01',
    name: 'Living',
    tagline: 'Sideboards, consoles, and the pieces a room is built around.',
    range: '55 designs',
    image: 'col-living',
    story: [
      'The living room is where a buyer’s taste is on show, so it is where a range earns or loses its reputation. Sideboards, consoles and bar cabinets carry more surface area than anything else we make, which means a finish has nowhere to hide.',
      'Everything here is built on a framed carcass in solid mango or reclaimed hardwood: no veneered board, no edge banding. The fronts are where the work goes: chevron, parquet, fretwork and carved relief, all cut and laid on our own benches.',
    ],
    spec: [
      { key: 'Timber', value: 'Solid mango, reclaimed hardwood' },
      { key: 'Typical height', value: '75–120 cm' },
      { key: 'Finishes', value: 'Natural, waxed, washed, painted' },
      { key: 'Lead time', value: '45–60 days' },
    ],
  },
  {
    index: '02',
    name: 'Storage',
    tagline: 'Vitrines, almirahs, and cabinets that hold their line.',
    range: '35 designs',
    image: 'col-storage',
    story: [
      'Tall pieces are the hardest thing to get right. A two-metre cabinet has to stay square through a sea container, arrive with its doors still aligned, and hold that alignment in a climate nothing like the one it was built in.',
      'So the carcasses are framed rather than slab-built, doors hang on adjustable hinges, and anything glazed has its panes beaded in rather than siliconed. Vitrines can ship glass-out and be glazed on arrival if that suits your warehouse better.',
    ],
    spec: [
      { key: 'Timber', value: 'Solid mango, mango & iron' },
      { key: 'Typical height', value: '140–200 cm' },
      { key: 'Glazing', value: '4 mm toughened, beaded in' },
      { key: 'Lead time', value: '45–60 days' },
    ],
  },
  {
    index: '03',
    name: 'Dining',
    tagline: 'Dressers and servers for the room that gathers people.',
    range: '40 designs',
    image: 'col-dining',
    story: [
      'Dining pieces get looked at for the length of a meal, which is longer than most furniture is ever studied. The patterned fronts in this collection (parquet, tile, checkerboard) are here because they hold up to that kind of attention.',
      'Tile work is painted and fired in Jodhpur, then set into a rebate so it finishes flush with the frame. Parquet fronts are laid piece by piece and sanded as a single face, which is the only way the joints disappear.',
    ],
    spec: [
      { key: 'Timber', value: 'Solid mango, mango & ceramic' },
      { key: 'Pattern work', value: 'Parquet, painted tile, checker' },
      { key: 'Typical length', value: '150–190 cm' },
      { key: 'Lead time', value: '45–60 days' },
    ],
  },
  {
    index: '04',
    name: 'Bedroom',
    tagline: 'Chests and nightstands in quiet, considered timber.',
    range: '30 designs',
    image: 'col-bedroom',
    story: [
      'Bedroom furniture is judged by its drawers. Everything else can be right, and one drawer that drops or binds still comes back as a complaint, so this is the collection where the fitting bench does the most work.',
      'Runners are wooden and waxed rather than metal-slid, and every drawer is fitted to its own opening and numbered to it. The finishes run quieter here: whitewash thinned to let the grain through, natural matt, pale stains.',
    ],
    spec: [
      { key: 'Timber', value: 'Solid mango' },
      { key: 'Drawers', value: 'Fitted wooden runners, waxed' },
      { key: 'Finishes', value: 'Whitewash, natural matt, pale' },
      { key: 'Lead time', value: '45–60 days' },
    ],
  },
  {
    index: '05',
    name: 'Hospitality',
    tagline: 'Contract-grade programmes, specified and repeatable.',
    range: 'To specification',
    image: 'col-hospitality',
    bespoke: true,
    story: [
      'This is not a range you order from. Contract work starts with your drawings or ours, moves through one sample the specifier signs off, and only then goes near the production floor.',
      'What changes for a public room is the specification, not the look: thicker tops, welded frames rather than bolted, footrails and edges rated for traffic, and finishes chosen to be repairable in place rather than replaced. We have furnished boutique properties at three hundred pieces and up.',
    ],
    spec: [
      { key: 'Programme', value: 'Specified to drawing' },
      { key: 'Sampling', value: 'One approval sample, pre-production' },
      { key: 'Volume', value: 'From 50 pieces' },
      { key: 'Lead time', value: '60–90 days from sign-off' },
    ],
  },
  {
    index: '06',
    name: 'Occasional',
    tagline: 'Coffee tables, side tables, and the smaller commissions.',
    range: '25 designs',
    image: 'col-occasional',
    story: [
      'The smaller commissions: mirrors, side tables, long shallow consoles. They are what a buyer adds to load a container properly, and they are also where we try something before it reaches a full range.',
      'Because they are small, proportionally more of each one is handwork: a stone top cut to size here, a frame pieced from offcuts kept back off the floor. Variation across a run is higher, and on one or two designs that is the entire point.',
    ],
    spec: [
      { key: 'Timber', value: 'Mango, reclaimed teak, stone tops' },
      { key: 'Packed size', value: 'Mostly under 0.4 CBM' },
      { key: 'Specified for', value: 'Container fill, showroom accents' },
      { key: 'Lead time', value: '30–45 days' },
    ],
  },
] as const satisfies readonly Omit<Collection, 'slug' | 'href'>[];

export const collections: Collection[] = COLLECTIONS.map((collection) => ({
  ...collection,
  slug: slugify(collection.name),
  href: `/collections/${slugify(collection.name)}`,
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

type PieceSeed = Omit<Piece, 'slug'>;

const withSlugs = (seed: readonly PieceSeed[]): Piece[] =>
  seed.map((piece) => ({ ...piece, slug: slugify(piece.name) }));

/**
 * Named for Rajasthan — Mehrangarh, Umaid, Marwar, the Thar. Every entry maps
 * to a design we have actually photographed; nothing here is a placeholder.
 */
export const pieces: Piece[] = withSlugs([
  // ── Living ──────────────────────────────────────────────────────────────
  {
    ref: 'VI-1042',
    name: 'Mehrangarh Sideboard',
    collection: 'Living',
    material: 'Reclaimed hardwood',
    finish: 'Natural wax',
    dimensions: 'L160 × D40 × H80 cm',
    image: 'pr-chevron-terracotta',
    note: 'Chevron-laid reclaimed boards. Every strip carries a different age, so no two fronts leave the floor identical.',
  },
  {
    ref: 'VI-0931',
    name: 'Jodhpur Bar Cabinet',
    collection: 'Living',
    material: 'Mango & iron',
    finish: 'Gunmetal & oak',
    dimensions: 'W110 × D45 × H120 cm',
    image: 'hero-chevron-bar',
    note: 'Opens to a lined service bay with a fitted rack. The frame is welded rather than bolted, so it stays square through shipping.',
  },
  {
    ref: 'VI-1215',
    name: 'Rajwada Media Console',
    collection: 'Living',
    material: 'Solid mango',
    finish: 'Washed natural',
    dimensions: 'L180 × D45 × H55 cm',
    image: 'pr-mango-media',
    note: 'Cable routing is cut through the back panel before finishing, so the exit is sealed rather than drilled on site.',
  },
  {
    ref: 'VI-1256',
    name: 'Nagaur Fretwork Sideboard',
    collection: 'Living',
    material: 'Mango & iron',
    finish: 'Bone white',
    dimensions: 'L150 × D40 × H75 cm',
    image: 'pr-fretwork-sideboard',
    note: 'Fretwork cut by hand, then filled and rubbed back twice so the bone white sits in the grain rather than on top of it.',
  },
  {
    ref: 'VI-1301',
    name: 'Chittor Wave Sideboard',
    collection: 'Living',
    material: 'Solid mango',
    finish: 'Carved relief',
    dimensions: 'L170 × D42 × H78 cm',
    image: 'pr-wave-carved',
    note: 'The relief is carved across all four doors as one continuous run, then split, so the pattern reads through when they are closed.',
  },

  // ── Storage ─────────────────────────────────────────────────────────────
  {
    ref: 'VI-1108',
    name: 'Umaid Carved Cabinet',
    collection: 'Storage',
    material: 'Solid mango',
    finish: 'Natural matt',
    dimensions: 'W90 × D40 × H180 cm',
    image: 'pr-mandala-carved',
    note: 'Two carved panels per door, chiselled by one hand from start to finish so the depth of cut stays even across the front.',
  },
  {
    ref: 'VI-0874',
    name: 'Thar Vitrine',
    collection: 'Storage',
    material: 'Mango & iron',
    finish: 'Antique walnut',
    dimensions: 'W100 × D40 × H190 cm',
    image: 'col-storage',
    note: 'Glazed on three sides in 4 mm toughened panes, beaded in rather than siliconed, so a cracked pane can be replaced.',
  },
  {
    ref: 'VI-0812',
    name: 'Pichola Tile Cabinet',
    collection: 'Storage',
    material: 'Mango & ceramic',
    finish: 'Hand-painted tile',
    dimensions: 'W80 × D40 × H140 cm',
    image: 'pr-tile-tall',
    note: 'Tiles are painted and fired in Jodhpur, then set into a rebate so the face finishes flush with the frame.',
  },
  {
    ref: 'VI-1163',
    name: 'Ranthambore Lattice Cabinet',
    collection: 'Storage',
    material: 'Solid mango',
    finish: 'Bone white',
    dimensions: 'W95 × D40 × H155 cm',
    image: 'pr-fretwork-cabinet',
    note: 'A lattice front that ventilates. Specified most often for linen, and for AV cabinets that need to breathe.',
  },

  // ── Dining ──────────────────────────────────────────────────────────────
  {
    ref: 'VI-1189',
    name: 'Marwar Parquet Sideboard',
    collection: 'Dining',
    material: 'Solid mango',
    finish: 'Diamond parquet',
    dimensions: 'L180 × D45 × H80 cm',
    image: 'pr-parquet-green',
    note: 'Around three hundred parquet pieces per front, laid to a diamond and then sanded as one face so the joints disappear.',
  },
  {
    ref: 'VI-0965',
    name: 'Osian Barn Sideboard',
    collection: 'Dining',
    material: 'Solid mango',
    finish: 'Natural matt',
    dimensions: 'L180 × D45 × H85 cm',
    image: 'pr-barn-sideboard',
    note: 'Sliding doors on a black iron track, stopped at both ends so they cannot run off the rail in transit.',
  },
  {
    ref: 'VI-1244',
    name: 'Sanchore Glazed Hutch',
    collection: 'Dining',
    material: 'Solid mango',
    finish: 'Chalk white',
    dimensions: 'W120 × D45 × H200 cm',
    image: 'pr-white-hutch',
    note: 'Ships as two units, base and glazed top, which is what keeps a two-metre piece inside a standard carton.',
  },

  // ── Bedroom ─────────────────────────────────────────────────────────────
  {
    ref: 'VI-1077',
    name: 'Bishnoi Tall Chest',
    collection: 'Bedroom',
    material: 'Solid mango',
    finish: 'Natural matt',
    dimensions: 'W60 × D45 × H130 cm',
    image: 'hero-tall-chest',
    note: 'Six drawers on waxed wooden runners, each one fitted to its own opening and numbered to it.',
  },
  {
    ref: 'VI-1096',
    name: 'Khimsar Whitewash Sideboard',
    collection: 'Bedroom',
    material: 'Solid mango',
    finish: 'Whitewash & black',
    dimensions: 'W120 × D40 × H75 cm',
    image: 'pr-whitewash-sideboard',
    note: 'Whitewash thinned to let the grain read through, on a slim black base that keeps the mass off the floor.',
  },
  {
    ref: 'VI-1121',
    name: 'Phalodi Barn Chest',
    collection: 'Bedroom',
    material: 'Solid mango',
    finish: 'Pale natural',
    dimensions: 'L150 × D42 × H80 cm',
    image: 'pr-barn-drawers',
    note: 'Half sliding door, half drawer stack, for rooms where a full run of hinged doors would have nowhere to open.',
  },

  // ── Hospitality ─────────────────────────────────────────────────────────
  {
    ref: 'VI-2010',
    name: 'Marwar Bar Counter',
    collection: 'Hospitality',
    material: 'Mango & iron',
    finish: 'Dark panelled',
    dimensions: 'L240 × D60 × H110 cm',
    image: 'col-hospitality',
    note: 'Contract build: 25 mm top, service side left open for glass racks, and a footrail rated for a public room.',
  },
  {
    ref: 'VI-2024',
    name: 'Boranada Service Counter',
    collection: 'Hospitality',
    material: 'Reclaimed & iron',
    finish: 'Natural & black',
    dimensions: 'L280 × D55 × H95 cm',
    image: 'pr-industrial-long',
    note: 'Made in two joined sections with an iron band at the joint, so a four-metre run can be specified without a visible break.',
  },

  // ── Occasional ──────────────────────────────────────────────────────────
  {
    ref: 'VI-1330',
    name: 'Sardar Console',
    collection: 'Occasional',
    material: 'Reclaimed teak',
    finish: 'Block parquet',
    dimensions: 'L200 × D40 × H80 cm',
    image: 'pr-block-parquet',
    note: 'End-grain blocks laid like a butcher’s board and then flattened by hand. Two metres long and still shallow enough for a hallway.',
  },
  {
    ref: 'VI-1352',
    name: 'Luni Side Table',
    collection: 'Occasional',
    material: 'Mango & stone',
    finish: 'Speckled stone top',
    dimensions: 'Ø45 × H55 cm',
    image: 'craft-round-table',
    note: 'Stone arrives in slabs and is cut to size here, so the speckle pattern differs from one table to the next.',
  },
  {
    ref: 'VI-1367',
    name: 'Balsamand Mirror',
    collection: 'Occasional',
    material: 'Reclaimed patchwork',
    finish: 'Natural wax',
    dimensions: 'W80 × D5 × H180 cm',
    image: 'craft-mirror',
    note: 'Frame pieced from offcuts kept back off the floor. It is the one design where variation is the whole point.',
  },
]);

/**
 * Shown only behind the trade access gate. The private range is the public
 * selection plus these, so a verified buyer genuinely sees roughly twice what
 * a visitor does rather than the same grid with a different heading.
 */
/* Annotated rather than inferred: without a contextual type the literal below
   would widen `image` to `string`, and a mistyped catalogue key would only
   surface as a blank plate at runtime. */
const PRIVATE_SEED: Omit<Piece, 'slug' | 'private'>[] = [
  // ── Living ──────────────────────────────────────────────────────────────
  {
    ref: 'VI-1412',
    name: 'Amber Sunburst Sideboard',
    collection: 'Living',
    material: 'Mixed hardwood',
    finish: 'Sunburst marquetry',
    dimensions: 'L165 × D42 × H78 cm',
    image: 'pr-sunburst-sideboard',
    note: 'Radial marquetry set out from a single centre point on each door. Around four days of one bench’s time per unit.',
  },
  {
    ref: 'VI-1388',
    name: 'Kumbhalgarh Sideboard',
    collection: 'Living',
    material: 'Reclaimed hardwood',
    finish: 'Ray inlay',
    dimensions: 'L170 × D40 × H75 cm',
    image: 'pr-reclaimed-sideboard',
    note: 'Rays cut from reclaimed stock in four different tones, sorted by colour before any of it is laid.',
  },
  {
    ref: 'VI-1470',
    name: 'Bikaner Media Unit',
    collection: 'Living',
    material: 'Solid mango',
    finish: 'Parquet front',
    dimensions: 'L190 × D45 × H50 cm',
    image: 'pr-parquet-media',
    note: 'Long and low, with the parquet run across all four drawer fronts as a single field rather than four.',
  },
  {
    ref: 'VI-1547',
    name: 'Dungarpur Checkerboard',
    collection: 'Living',
    material: 'Two-tone mango',
    finish: 'Checker parquet',
    dimensions: 'L180 × D45 × H80 cm',
    image: 'pr-checkerboard',
    note: 'Two tones taken from the same log run, one steamed and one not, rather than one of them stained to match.',
  },
  {
    ref: 'VI-1644',
    name: 'Merta Mixed Barn Sideboard',
    collection: 'Living',
    material: 'Mango & reclaimed',
    finish: 'Raw & painted',
    dimensions: 'L170 × D45 × H80 cm',
    image: 'pr-mixed-barn',
    note: 'Raw timber set against painted panels, under a concrete-look top that we cast here rather than buy in.',
    season: currentSeason,
  },
  {
    ref: 'VI-1659',
    name: 'Didwana Whitewash Media',
    collection: 'Living',
    material: 'Solid mango',
    finish: 'Whitewash & iron',
    dimensions: 'L160 × D40 × H50 cm',
    image: 'pr-whitewash-media',
    note: 'Fronts are brushed before the whitewash goes on so the grain lifts. Iron frame powder-coated matt black.',
    season: currentSeason,
  },

  // ── Storage ───────────────────────────────────────────────────────────
  {
    ref: 'VI-1455',
    name: 'Jaisalmer Faceted Cabinet',
    collection: 'Storage',
    material: 'Solid mango',
    finish: 'Diamond relief',
    dimensions: 'W95 × D42 × H90 cm',
    image: 'pr-parquet-terracotta',
    note: 'Facets cut individually and set proud of the frame, so the front holds a shadow line all the way through the day.',
  },
  {
    ref: 'VI-1502',
    name: 'Barmer Industrial Chest',
    collection: 'Storage',
    material: 'Mango & iron',
    finish: 'Natural & black',
    dimensions: 'W110 × D45 × H95 cm',
    image: 'pr-industrial-chest',
    note: 'Twelve drawers with cast label holders. Every runner is fitted, numbered, and returned to the opening it was cut for.',
  },
  {
    ref: 'VI-1566',
    name: 'Shekhawati Tall Cabinet',
    collection: 'Storage',
    material: 'Mango & iron',
    finish: 'Whitewash',
    dimensions: 'W90 × D40 × H185 cm',
    image: 'pr-whitewash-tall',
    note: 'Nearly two metres and still under fifty kilos, because the carcass is framed rather than solid-panelled.',
  },
  {
    ref: 'VI-1579',
    name: 'Ajmer Medallion Cabinet',
    collection: 'Storage',
    material: 'Mango & iron',
    finish: 'Carved medallion',
    dimensions: 'W100 × D42 × H175 cm',
    image: 'pr-mandala-iron',
    note: 'One carved medallion per door, set into an iron surround that is welded up and squared before the timber goes in.',
  },
  {
    ref: 'VI-1610',
    name: 'Pushkar Glazed Vitrine',
    collection: 'Storage',
    material: 'Mango & glass',
    finish: 'Antique walnut',
    dimensions: 'W110 × D40 × H200 cm',
    image: 'pr-white-vitrine',
    note: 'Our tallest glazed piece. Ships glass-out with the panes crated separately if you would rather glaze on arrival.',
  },
  {
    ref: 'VI-1688',
    name: 'Ratangarh Chevron Cabinet',
    collection: 'Storage',
    material: 'Reclaimed hardwood',
    finish: 'Chevron patchwork',
    dimensions: 'W85 × D40 × H165 cm',
    image: 'pr-chevron-tall',
    note: 'Chevron carried vertically up a tall door, which is considerably harder to keep true than the horizontal version.',
    season: currentSeason,
  },
  {
    ref: 'VI-1702',
    name: 'Nathdwara Parquet Cabinet',
    collection: 'Storage',
    material: 'Solid mango',
    finish: 'Parquet & dark top',
    dimensions: 'W100 × D42 × H90 cm',
    image: 'pr-parquet-teal',
    note: 'Parquet front under a darker top, so the pattern reads as inset into the piece rather than applied to it.',
    season: currentSeason,
  },
  {
    ref: 'VI-1725',
    name: 'Sirohi Sun Cabinet',
    collection: 'Storage',
    material: 'Mixed hardwood',
    finish: 'Starburst marquetry',
    dimensions: 'W95 × D40 × H110 cm',
    image: 'hero-starburst',
    note: 'Raised on a slim iron stand so the marquetry sits at eye level across a showroom floor.',
    season: currentSeason,
  },

  // ── Dining ────────────────────────────────────────────────────────────
  {
    ref: 'VI-1533',
    name: 'Alwar Sideboard',
    collection: 'Dining',
    material: 'Solid mango',
    finish: 'Natural matt',
    dimensions: 'L160 × D42 × H80 cm',
    image: 'pr-mango-sideboard',
    note: 'The plainest thing we make and the one that gets reordered most. There is nothing on it to date it.',
  },
  {
    ref: 'VI-1594',
    name: 'Banswara Tile Sideboard',
    collection: 'Dining',
    material: 'Mango & ceramic',
    finish: 'Hand-painted tile',
    dimensions: 'L150 × D40 × H80 cm',
    image: 'pr-tile-sideboard',
    note: 'Twenty-four painted tiles per front, laid out dry first and numbered so the run reads correctly left to right.',
  },
  {
    ref: 'VI-1628',
    name: 'Nawalgarh Terracotta Sideboard',
    collection: 'Dining',
    material: 'Solid mango',
    finish: 'Natural on slim legs',
    dimensions: 'L165 × D42 × H78 cm',
    image: 'pr-mango-terracotta',
    note: 'Four doors carried on a raised leg: the version buyers ask for when a room needs to feel lighter than it is.',
  },

  // ── Occasional ────────────────────────────────────────────────────────
  {
    ref: 'VI-1518',
    name: 'Osian Long Console',
    collection: 'Occasional',
    material: 'Solid mango',
    finish: 'Washed natural',
    dimensions: 'L200 × D40 × H55 cm',
    image: 'pr-barn-media',
    note: 'Two metres, shallow, and low. Specified more often behind seating than against a wall.',
  },

  // ── Hospitality ───────────────────────────────────────────────────────
  {
    ref: 'VI-1804',
    name: 'Sojat Drawer Bank',
    collection: 'Hospitality',
    material: 'Reclaimed & iron',
    finish: 'Natural & black',
    dimensions: 'W105 × D45 × H85 cm',
    image: 'pr-industrial-drawers',
    note: 'Built for back-of-house: cast label pulls, an open frame to sweep under, and a top that takes a knock.',
  },
];

export const privateAdditions: Piece[] = withSlugs(
  PRIVATE_SEED.map((piece) => ({ ...piece, private: true as const }))
);

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
