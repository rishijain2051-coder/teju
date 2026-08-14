import { type CatalogueKey } from './imagery';
import { journalRecords } from './generated/content';

/**
 * The journal.
 *
 * Entries live in `content/journal/`, edited at /keystatic. Ordered newest first
 * by the `order` below rather than by parsing `date`: the dates are written as
 * "June 2026" for the reader, and inferring sort order from prose is how a new
 * article ends up third on the page.
 */

export interface JournalBlock {
  heading?: string;
  paragraphs: readonly string[];
  /** Set as an indented statement rather than body copy. */
  pull?: string;
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  standfirst: string;
  image: CatalogueKey;
  body: readonly JournalBlock[];
}

interface JournalRecord {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  standfirst: string;
  image: string;
  body: readonly { heading?: string; paragraphs: readonly string[]; pull?: string }[];
}

/**
 * Display order, newest first. A slug missing from this list still renders — it
 * simply sorts to the end — so publishing a new article never 404s while someone
 * remembers to update the order.
 */
const ORDER = [
  'solid-mango-wood',
  'timber-to-container',
  'european-retail-2027',
  'what-fsc-actually-certifies',
];

const rank = (slug: string) => {
  const at = ORDER.indexOf(slug);
  return at === -1 ? ORDER.length : at;
};

export const journal: Article[] = (journalRecords as readonly JournalRecord[])
  .map((record) => ({
    slug: record.slug,
    title: record.title,
    category: record.category,
    date: record.date,
    readTime: record.readTime,
    excerpt: record.excerpt,
    standfirst: record.standfirst,
    image: record.image as CatalogueKey,
    body: record.body.map((block) => ({
      ...(block.heading ? { heading: block.heading } : {}),
      paragraphs: block.paragraphs,
      ...(block.pull ? { pull: block.pull } : {}),
    })),
  }))
  .sort((a, b) => rank(a.slug) - rank(b.slug) || a.title.localeCompare(b.title));

export const findArticle = (slug: string) => journal.find((article) => article.slug === slug);
