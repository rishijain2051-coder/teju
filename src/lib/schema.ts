import { brand, facts, img } from './site';
import type { Piece } from './catalogue';
import type { Article } from './journal';

/**
 * Schema.org payloads for the JSON-LD blocks, built from `@/lib/site` so a
 * correction to the company record propagates to the structured data with it.
 *
 * Nothing here is asserted that is not already stated on a page. There is no
 * `geo`, because no coordinates for the works exist anywhere in the codebase and
 * a rich result would republish an invented one as fact. There are no prices in
 * `productSchema` for the same reason — the site quotes on enquiry, so there is
 * no price to state. The opening hours are the exception that proves the rule:
 * they are in here because the contact page already publishes them.
 */

/* Same default as the root layout, deliberately: two different fallbacks would
   put two different hostnames in the same document's metadata and structured
   data on a machine without the variable set. */
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028';

/**
 * Structured data has to carry absolute URLs, while every href in the codebase is
 * a route path. Callers pass whichever they have.
 */
const abs = (url: string) =>
  /^https?:\/\//.test(url) ? url : `${SITE}${url.startsWith('/') ? '' : '/'}${url}`;

/*
 * The address of record is stored the way it is printed — two display lines —
 * because that is what the footer, the contact page and the FSC licence all show.
 * `PostalAddress` wants it in parts, so the locality and region come from
 * `brand.origin` ("Jodhpur, Rajasthan") and the postcode is lifted off the second
 * line. Both are read rather than restated, so an edit at /keystatic cannot leave
 * the structured data describing a different place from the footer.
 */
const [ADDRESS_LOCALITY, ADDRESS_REGION] = brand.origin.split(',').map((part) => part.trim());
const POSTAL_CODE = /\b(\d{6})\b/.exec(brand.address.line2)?.[1];

const postalAddress = () => ({
  '@type': 'PostalAddress',
  streetAddress: brand.address.line1,
  addressLocality: ADDRESS_LOCALITY,
  addressRegion: ADDRESS_REGION,
  ...(POSTAL_CODE ? { postalCode: POSTAL_CODE } : {}),
  addressCountry: 'IN',
});

const ORGANISATION_ID = `${SITE}/#organisation`;

/*
 * The hours the site already publishes — "Mon–Sat, 09:30–18:30 IST" on the
 * contact page, in the private programme's spec list and on the thank-you page.
 *
 * Restated here because that string exists only inline in those three components;
 * this is a fourth copy and it should not stay one. It belongs in `brand`
 * alongside the phone number, at which point all four read from the record.
 *
 * `OpeningHoursSpecification` has no timezone field: `opens` and `closes` are
 * read as local time at the address, and the address is in Jodhpur, so IST is
 * what these mean without having to say it.
 */
const OPENING_HOURS = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  opens: '09:30',
  closes: '18:30',
};

/*
 * The floor area is deliberately not in here. It is a company figure and it is on
 * the site, but `works.ts` still carries FIGURES TO CONFIRM WITH THE WORKS
 * against it, and structured data is the one place a number gets restated by
 * Google as though it had been checked. The export count stays because it is
 * already published in this exact form in the root metadata description.
 */
const DESCRIPTION =
  `Furniture manufacturer and exporter in Jodhpur, India. Solid mango and reclaimed timber, ` +
  `made in one factory at Boranada since ${brand.established} and shipped to ` +
  `${facts.countries} countries.`;

/**
 * The company itself. Emitted once per document, on the root layout, and
 * referenced by `@id` from every other block rather than repeated — which is how
 * a product and its manufacturer end up describing the same entity instead of
 * two similarly named ones.
 */
export function organizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANISATION_ID,
    name: brand.name,
    alternateName: brand.short,
    url: SITE,
    logo: abs('/assets/images/app_logo.png'),
    email: brand.email,
    telephone: brand.phone,
    address: postalAddress(),
    foundingDate: String(brand.established),
    description: DESCRIPTION,
    /* Stated as a floor, because the site says "150+" and this is the same claim
       at the same precision. */
    numberOfEmployees: { '@type': 'QuantitativeValue', minValue: Number(facts.craftspeople) },
  };
}

/**
 * The same company as a place of business, for the local pack. Separate `@id`
 * from the Organization: they are the same trade name but different entities to
 * a crawler, and merging them onto one node makes whichever block loads second
 * overwrite the first.
 */
export function localBusinessSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE}/#localbusiness`,
    name: brand.name,
    url: SITE,
    logo: abs('/assets/images/app_logo.png'),
    /* The same plate the factory page opens on. There is no photograph of the
       premises in the catalogue — every image is of the work — so the honest
       stand-in is the work rather than a stock building. */
    image: abs(img('hero-mango-light').src),
    email: brand.email,
    telephone: brand.phone,
    address: postalAddress(),
    /* No `geo`. We hold no coordinates for the works, and a plausible-looking
       latitude is a direction someone drives in. */
    openingHoursSpecification: OPENING_HOURS,
    foundingDate: String(brand.established),
    description: DESCRIPTION,
    parentOrganization: { '@id': ORGANISATION_ID },
  };
}

/** A step in the trail. No `href` means the page currently being read. */
export interface Crumb {
  name: string;
  href?: string;
}

/**
 * The trail, positioned from 1.
 *
 * The last entry deliberately carries no `item`: Google's own guidance is that
 * the current page is identified by its position rather than by a link, and a
 * self-referential URL there is what makes a breadcrumb result show the same page
 * twice. Any entry without an `href` is treated the same way, so the shape
 * matches `<Breadcrumbs>` exactly and one array can feed both.
 */
export function breadcrumbSchema(trail: Crumb[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, at) => ({
      '@type': 'ListItem',
      position: at + 1,
      name: crumb.name,
      ...(crumb.href ? { item: abs(crumb.href) } : {}),
    })),
  };
}

/**
 * A design.
 *
 * `sku` is the catalogue reference, which is the identifier a buyer quotes back
 * to us, and `material`, `finish` and `dimensions` are carried as
 * `additionalProperty` rather than squeezed into the description — they are the
 * spec table on the page, and a crawler reading them as properties can surface
 * them as such.
 */
export function productSchema(piece: Piece, url: string): object {
  const plate = img(piece.image);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: piece.name,
    sku: piece.ref,
    mpn: piece.ref,
    url: abs(url),
    description: `${piece.note} ${piece.material}, ${piece.finish.toLowerCase()}, ${piece.dimensions}.`,
    image: abs(plate.src),
    material: piece.material,
    category: piece.collection,
    brand: { '@type': 'Brand', name: brand.name },
    manufacturer: { '@id': ORGANISATION_ID },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Finish', value: piece.finish },
      { '@type': 'PropertyValue', name: 'Dimensions', value: piece.dimensions },
      { '@type': 'PropertyValue', name: 'Collection', value: piece.collection },
    ],
  };
}

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

/*
 * The journal dates are written for the reader — "June 2026" — and that is the
 * whole of what we hold. Schema.org accepts a partial ISO date, so the month is
 * published as `2026-06` rather than guessed up to a day; anything that does not
 * parse is omitted instead of defaulting to today, which would re-date the
 * archive on every build.
 */
const isoMonth = (date: string) => {
  const match = /^([A-Za-z]+)\s+(\d{4})$/.exec(date.trim());
  if (!match) return undefined;
  const month = MONTHS.indexOf(match[1].toLowerCase());
  return month === -1 ? undefined : `${match[2]}-${String(month + 1).padStart(2, '0')}`;
};

/** "4 min" -> ISO 8601 duration. Undefined if the copy stops being a figure. */
const isoMinutes = (readTime: string) => {
  const match = /(\d+)/.exec(readTime);
  return match ? `PT${match[1]}M` : undefined;
};

export function articleSchema(article: Article, url: string): object {
  const cover = img(article.image);
  const published = isoMonth(article.date);
  const timeRequired = isoMinutes(article.readTime);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    url: abs(url),
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(url) },
    image: abs(cover.src),
    articleSection: article.category,
    /* House writing, filed under the house name — there are no bylines on the
       journal, so inventing an author would be a fact. */
    author: { '@id': ORGANISATION_ID },
    publisher: { '@id': ORGANISATION_ID },
    ...(published ? { datePublished: published } : {}),
    ...(timeRequired ? { timeRequired } : {}),
  };
}
