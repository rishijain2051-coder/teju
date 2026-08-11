import { catalogue, type CatalogueKey } from './imagery';

/**
 * Single source of truth for site content.
 *
 * Sections used to carry their own inline data arrays, which is why the same
 * facts drifted between the hero, the stats band and the footer. Everything
 * factual now lives here once.
 */

export const brand = {
  name: 'Vardhman Impex',
  short: 'VI',
  established: 2006,
  origin: 'Jodhpur, Rajasthan',
  country: 'India',
  address: {
    line1: 'G-769, Phase IV, Boranada Industrial Area',
    line2: 'Jodhpur, Rajasthan 342005',
    country: 'India',
  },
  email: 'rishi@vardhman-impex.com',
  phone: '+91 93521 87266',
  phoneHref: '+919352187266',
  whatsapp: '919352187266',
} as const;

/** The house facts. One place, so nothing contradicts anything else. */
export const facts = {
  years: '18',
  factory: '9,000',
  designs: '1,000',
  countries: '9',
  craftspeople: '150',
} as const;

/** Set like a line on a bill of lading — this is the site's voice. */
export const manifest = [
  { key: 'Origin', value: 'Jodhpur, IN' },
  { key: 'Established', value: '2006' },
  { key: 'Factory', value: `${facts.factory} sq.mt` },
  { key: 'Catalogue', value: `${facts.designs}+ designs` },
  { key: 'Export', value: `${facts.countries} countries` },
  { key: 'Minimum', value: 'Low MOQ' },
  { key: 'Timber', value: 'FSC available' },
] as const;

export const nav = [
  { label: 'Collections', href: '/collections' },
  { label: 'Craft', href: '/#craft' },
  { label: 'Factory', href: '/#factory' },
  { label: 'Journal', href: '/#journal' },
  { label: 'Contact', href: '/contact' },
] as const;

export interface Collection {
  index: string;
  name: string;
  tagline: string;
  count: string;
  image: CatalogueKey;
  href: string;
}

export const collections: Collection[] = [
  { index: '01', name: 'Living', tagline: 'Sideboards, consoles, and the pieces a room is built around.', count: '55 designs', image: 'col-living', href: '/collections' },
  { index: '02', name: 'Storage', tagline: 'Vitrines, almirahs, and cabinets that hold their line.', count: '35 designs', image: 'col-storage', href: '/collections' },
  { index: '03', name: 'Dining', tagline: 'Dressers and servers for the room that gathers people.', count: '40 designs', image: 'col-dining', href: '/collections' },
  { index: '04', name: 'Bedroom', tagline: 'Chests and nightstands in quiet, considered timber.', count: '30 designs', image: 'col-bedroom', href: '/collections' },
  { index: '05', name: 'Hospitality', tagline: 'Contract-grade programmes, specified and repeatable.', count: 'Custom', image: 'col-hospitality', href: '/collections' },
  { index: '06', name: 'Occasional', tagline: 'Coffee tables, side tables, and the smaller commissions.', count: '25 designs', image: 'col-occasional', href: '/collections' },
];

export interface Piece {
  ref: string;
  name: string;
  collection: string;
  material: string;
  finish: string;
  dimensions: string;
  image: CatalogueKey;
}

/**
 * Named for Rajasthan — Mehrangarh, Umaid, Marwar, the Thar. Each entry maps to
 * a piece we actually have photographed; nothing here is a stand-in.
 */
export const pieces: Piece[] = [
  { ref: 'VI-1042', name: 'Mehrangarh Sideboard', collection: 'Living', material: 'Reclaimed hardwood', finish: 'Natural wax', dimensions: 'L160 × D40 × H80 cm', image: 'pr-chevron-terracotta' },
  { ref: 'VI-1108', name: 'Umaid Carved Cabinet', collection: 'Storage', material: 'Solid mango', finish: 'Natural matt', dimensions: 'W90 × D40 × H180 cm', image: 'pr-mandala-carved' },
  { ref: 'VI-0931', name: 'Jodhpur Bar Cabinet', collection: 'Living', material: 'Mango & iron', finish: 'Gunmetal & oak', dimensions: 'W110 × D45 × H120 cm', image: 'hero-chevron-bar' },
  { ref: 'VI-1215', name: 'Rajwada Media Console', collection: 'Living', material: 'Solid mango', finish: 'Washed natural', dimensions: 'L180 × D45 × H55 cm', image: 'pr-mango-media' },
  { ref: 'VI-0874', name: 'Thar Vitrine', collection: 'Storage', material: 'Mango & iron', finish: 'Antique walnut', dimensions: 'W100 × D40 × H190 cm', image: 'col-storage' },
  { ref: 'VI-1330', name: 'Sardar Console', collection: 'Occasional', material: 'Reclaimed teak', finish: 'Block parquet', dimensions: 'L200 × D40 × H80 cm', image: 'pr-block-parquet' },
  { ref: 'VI-1077', name: 'Bishnoi Tall Chest', collection: 'Bedroom', material: 'Solid mango', finish: 'Natural matt', dimensions: 'W60 × D45 × H130 cm', image: 'hero-tall-chest' },
  { ref: 'VI-1189', name: 'Marwar Parquet Sideboard', collection: 'Dining', material: 'Solid mango', finish: 'Diamond parquet', dimensions: 'L180 × D45 × H80 cm', image: 'pr-parquet-green' },
  { ref: 'VI-0812', name: 'Pichola Tile Cabinet', collection: 'Storage', material: 'Mango & ceramic', finish: 'Hand-painted tile', dimensions: 'W80 × D40 × H140 cm', image: 'pr-tile-tall' },
  { ref: 'VI-1256', name: 'Nagaur Fretwork Sideboard', collection: 'Living', material: 'Mango & iron', finish: 'Bone white', dimensions: 'L150 × D40 × H75 cm', image: 'pr-fretwork-sideboard' },
  { ref: 'VI-0965', name: 'Osian Barn Sideboard', collection: 'Living', material: 'Solid mango', finish: 'Natural matt', dimensions: 'L180 × D45 × H85 cm', image: 'pr-barn-sideboard' },
  { ref: 'VI-1301', name: 'Chittor Wave Sideboard', collection: 'Living', material: 'Solid mango', finish: 'Carved relief', dimensions: 'L170 × D42 × H78 cm', image: 'pr-wave-carved' },
];

/**
 * Shown only behind the access gate. The private range is the public selection
 * plus these — so a verified buyer genuinely sees more than a visitor does.
 */
export const privateAdditions: Piece[] = [
  { ref: 'VI-1412', name: 'Amber Sunburst Sideboard', collection: 'Living', material: 'Mixed hardwood', finish: 'Sunburst marquetry', dimensions: 'L165 × D42 × H78 cm', image: 'pr-sunburst-sideboard' },
  { ref: 'VI-1388', name: 'Kumbhalgarh Sideboard', collection: 'Living', material: 'Reclaimed hardwood', finish: 'Ray inlay', dimensions: 'L170 × D40 × H75 cm', image: 'pr-reclaimed-sideboard' },
  { ref: 'VI-1455', name: 'Jaisalmer Faceted Cabinet', collection: 'Storage', material: 'Solid mango', finish: 'Diamond relief', dimensions: 'W95 × D42 × H90 cm', image: 'pr-parquet-terracotta' },
  { ref: 'VI-1470', name: 'Bikaner Media Unit', collection: 'Living', material: 'Solid mango', finish: 'Parquet front', dimensions: 'L190 × D45 × H50 cm', image: 'pr-parquet-media' },
  { ref: 'VI-1502', name: 'Barmer Industrial Chest', collection: 'Storage', material: 'Mango & iron', finish: 'Natural & black', dimensions: 'W110 × D45 × H95 cm', image: 'pr-industrial-chest' },
  { ref: 'VI-1518', name: 'Sirohi Console', collection: 'Living', material: 'Solid mango', finish: 'Washed natural', dimensions: 'L200 × D40 × H55 cm', image: 'pr-barn-media' },
  { ref: 'VI-1533', name: 'Alwar Sideboard', collection: 'Dining', material: 'Solid mango', finish: 'Natural matt', dimensions: 'L160 × D42 × H80 cm', image: 'pr-mango-sideboard' },
  { ref: 'VI-1547', name: 'Dungarpur Checkerboard', collection: 'Living', material: 'Two-tone mango', finish: 'Checker parquet', dimensions: 'L180 × D45 × H80 cm', image: 'pr-checkerboard' },
  { ref: 'VI-1566', name: 'Shekhawati Tall Cabinet', collection: 'Storage', material: 'Mango & iron', finish: 'Whitewash', dimensions: 'W90 × D40 × H185 cm', image: 'pr-whitewash-tall' },
  { ref: 'VI-1579', name: 'Ajmer Medallion Cabinet', collection: 'Storage', material: 'Mango & iron', finish: 'Carved medallion', dimensions: 'W100 × D42 × H175 cm', image: 'pr-mandala-iron' },
  { ref: 'VI-1594', name: 'Banswara Tile Sideboard', collection: 'Dining', material: 'Mango & ceramic', finish: 'Hand-painted tile', dimensions: 'L150 × D40 × H80 cm', image: 'pr-tile-sideboard' },
  { ref: 'VI-1610', name: 'Pushkar Glazed Vitrine', collection: 'Storage', material: 'Mango & glass', finish: 'Antique walnut', dimensions: 'W110 × D40 × H200 cm', image: 'pr-white-vitrine' },
];

export interface Capability {
  index: string;
  title: string;
  detail: string;
}

export const capabilities: Capability[] = [
  { index: '01', title: 'One factory, start to finish', detail: 'Sawing, joinery, carving, finishing and packing all happen under our own roof in Boranada. Nothing is subcontracted, so nothing drifts.' },
  { index: '02', title: 'Low minimums, honestly quoted', detail: 'Mixed containers and small first orders are normal here. We would rather start small and grow than quote a minimum you cannot use.' },
  { index: '03', title: 'FSC timber on request', detail: 'Certified sustainable stock is available across the mango and reclaimed ranges when your market asks for the paperwork.' },
  { index: '04', title: 'Private label and custom finishes', detail: 'Your specification, your finish, your label. Sampling runs before the production floor commits.' },
  { index: '05', title: 'Export documentation handled', detail: 'Nine destination markets and the paperwork that comes with each. Lead times we quote are lead times we hold.' },
  { index: '06', title: 'A catalogue that keeps moving', detail: `Over ${facts.designs} live designs, with new work added each season from our own drawing floor.` },
];

export const stats = [
  { value: 18, suffix: '+', label: 'Years', detail: `Manufacturing since ${brand.established}` },
  { value: 9000, suffix: '', label: 'Sq.Mt', detail: 'Factory floor at Boranada' },
  { value: 1000, suffix: '+', label: 'Designs', detail: 'Live in the full catalogue' },
  { value: 9, suffix: '+', label: 'Countries', detail: 'Active export destinations' },
  { value: 150, suffix: '+', label: 'Craftspeople', detail: 'Employed directly in-house' },
] as const;

export const testimonials = [
  {
    quote:
      'Working with Vardhman Impex transformed our buying process. The consistency of quality across three containers was remarkable — every piece arrived exactly as specified. Their willingness to accommodate custom finishes is rare at this scale.',
    author: 'Matthias Brandt',
    title: 'Procurement Director',
    company: 'Haus & Raum GmbH',
    country: 'Germany',
  },
  {
    quote:
      'We have sourced furniture from twelve different manufacturers across Asia. Vardhman is the only one that feels like a genuine long-term partner. Lead times are honest, communication is direct, and the finish quality consistently exceeds our buyer expectations.',
    author: 'Sarah Thornton',
    title: 'Head of Buying',
    company: 'Thornton Home Collective',
    country: 'United Kingdom',
  },
  {
    quote:
      'Their hospitality range is exceptional. We furnished two boutique hotels with their custom programme — 340 pieces across both properties — and received zero complaints from guests about quality. The private label service was seamless.',
    author: 'Luca Ferrara',
    title: 'Operations Director',
    company: 'Ferrara Hospitality Group',
    country: 'Italy',
  },
] as const;

export const journal = [
  {
    title: 'The enduring appeal of solid mango wood',
    category: 'Material',
    date: 'June 2026',
    excerpt:
      'Why the most overlooked hardwood in Indian furniture is quietly becoming the material of choice for European buyers.',
    image: 'craft-barn-door' as CatalogueKey,
  },
  {
    title: 'From timber to container',
    category: 'Factory',
    date: 'May 2026',
    excerpt:
      'A rare look at how a piece moves from raw stock to a finished, export-ready container on the floor at Boranada.',
    image: 'pr-industrial-drawers' as CatalogueKey,
  },
  {
    title: 'What European retail is ordering for 2027',
    category: 'Trade',
    date: 'April 2026',
    excerpt:
      'Wabi-sabi finishes, reclaimed materials, and the return of the sideboard — read from the order book.',
    image: 'pr-chevron-terracotta' as CatalogueKey,
  },
] as const;

export const img = (key: CatalogueKey) => catalogue[key];
