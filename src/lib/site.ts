import { catalogue, type CatalogueKey } from './imagery';
import { brandRecord } from './generated/content';

/**
 * Single source of truth for site content.
 *
 * Sections used to carry their own inline data arrays, which is why the same
 * facts drifted between the hero, the stats band and the footer. Everything
 * factual now lives here once.
 *
 * The catalogue, the journal and the works content have their own modules now
 * that each has pages of its own — they are re-exported from here, so
 * `import { pieces } from '@/lib/site'` still resolves.
 */

export * from './catalogue';
export * from './journal';
export * from './works';

/**
 * The company details, editable at /keystatic under "Company details".
 *
 * The address is the one on the FSC trademark licence agreement, which is the
 * address of record. Every surface that shows it reads from here — the footer,
 * the contact page, the factory page, product pages and the private catalogue —
 * which is why correcting it from G-769 / 342005 was a one-line change.
 *
 * `build-content.mjs` checks the required fields are present, that `phoneHref`
 * has no spaces (it goes straight into a `tel:` link) and that `email` looks like
 * an address, so an edit here cannot quietly break every contact route.
 */
export const brand = brandRecord;

/** The house facts. One place, so nothing contradicts anything else. */
export const facts = brandRecord.facts;

/** Set like a line on a bill of lading — this is the site's voice. */
export const manifest = [
  { key: 'Origin', value: 'Jodhpur, IN' },
  { key: 'Established', value: '2006' },
  { key: 'Factory', value: `${facts.factory} sq.mt` },
  { key: 'Catalogue', value: `${facts.designs}+ designs` },
  { key: 'Export', value: `${facts.countries} countries` },
  { key: 'Minimum', value: 'Low MOQ' },
  { key: 'Timber', value: 'FSC certified, on request' },
] as const;

export const nav = [
  { label: 'Collections', href: '/collections' },
  { label: 'Craft', href: '/craft' },
  { label: 'Factory', href: '/factory' },
  { label: 'Journal', href: '/journal' },
  { label: 'Contact', href: '/contact' },
] as const;

export interface Capability {
  index: string;
  title: string;
  detail: string;
}

export const capabilities: Capability[] = [
  {
    index: '01',
    title: 'One factory, start to finish',
    detail:
      'Sawing, joinery, carving, finishing and packing all happen under our own roof in Boranada. Nothing is subcontracted, so nothing drifts.',
  },
  {
    index: '02',
    title: 'Low minimums, honestly quoted',
    detail:
      'Mixed containers and small first orders are normal here. We would rather start small and grow than quote a minimum you cannot use.',
  },
  {
    index: '03',
    title: 'FSC timber on request',
    detail:
      'Certified sustainable stock is available across the mango and reclaimed ranges when your market asks for the paperwork.',
  },
  {
    index: '04',
    title: 'Private label and custom finishes',
    detail:
      'Your specification, your finish, your label. Sampling runs before the production floor commits.',
  },
  {
    index: '05',
    title: 'Export documentation handled',
    detail:
      'Nine destination markets and the paperwork that comes with each. Lead times we quote are lead times we hold.',
  },
  {
    index: '06',
    title: 'A catalogue that keeps moving',
    detail: `Over ${facts.designs} live designs, with new work added each season from our own drawing floor.`,
  },
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
      'Working with Vardhman Impex transformed our buying process. The consistency of quality across three containers was remarkable: every piece arrived exactly as specified. Their willingness to accommodate custom finishes is rare at this scale.',
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
      'Their hospitality range is exceptional. We furnished two boutique hotels with their custom programme, 340 pieces across both properties, and received zero complaints from guests about quality. The private label service was seamless.',
    author: 'Luca Ferrara',
    title: 'Operations Director',
    company: 'Ferrara Hospitality Group',
    country: 'Italy',
  },
] as const;

export const img = (key: CatalogueKey) => catalogue[key];
