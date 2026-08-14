import { config, collection, singleton, fields } from '@keystatic/core';
import { catalogue } from './src/lib/imagery';

/**
 * The content editor, at /keystatic.
 *
 * Git-backed rather than hosted: entries are JSON files in `content/`, edited
 * through this UI and committed like any other change. No database, no account,
 * no third-party service holding the catalogue — and every edit arrives as a diff
 * you can read and revert.
 *
 * `npm run content` compiles `content/` into typed TypeScript under
 * `src/lib/generated/`, which is what the site actually imports. That indirection
 * is deliberate: the data modules are imported by client components, so reading
 * files at module scope would put `node:fs` in the browser bundle, and an async
 * reader would mean threading props through every component. Compiling keeps the
 * synchronous, fully typed API the site already has, and turns a bad edit into a
 * build failure instead of a broken page.
 */

/** Every photograph in the catalogue, as a dropdown. A free-text image field is
 *  a blank plate waiting to happen; this cannot name a file that is not there. */
const imageOptions = Object.entries(catalogue).map(([key, image]) => ({
  label: `${key} — ${image.alt.slice(0, 60)}`,
  value: key,
}));

const COLLECTION_NAMES = [
  'Living',
  'Storage',
  'Dining',
  'Bedroom',
  'Hospitality',
  'Occasional',
] as const;

const collectionOptions = COLLECTION_NAMES.map((name) => ({ label: name, value: name }));

export default config({
  /*
   * Local storage: writes straight to the working tree, so editing works offline
   * with zero setup. To edit from the browser on the deployed site instead,
   * switch to `{ kind: 'github', repo: 'rishijain2051-coder/teju' }` and install
   * the Keystatic GitHub App on the repository — that part needs a person, not a
   * config change.
   */
  storage: { kind: 'local' },

  ui: {
    brand: { name: 'Vardhman Impex' },
    navigation: {
      Catalogue: ['collections', 'pieces'],
      Editorial: ['journal'],
      Company: ['brand'],
    },
  },

  collections: {
    collections: collection({
      label: 'Collections',
      path: 'content/collections/*',
      format: { data: 'json' },
      slugField: 'name',
      columns: ['name', 'range'],
      schema: {
        name: fields.slug({
          name: {
            label: 'Name',
            description: 'Must be one of the six collection names the site knows.',
            validation: { isRequired: true },
          },
        }),
        index: fields.text({ label: 'Index', description: 'Two digits, e.g. 01.' }),
        tagline: fields.text({ label: 'Tagline', multiline: true }),
        range: fields.text({
          label: 'Range size',
          description: 'The size of the full range behind this collection, e.g. "55 designs".',
        }),
        image: fields.select({
          label: 'Cover photograph',
          options: imageOptions,
          defaultValue: 'col-living',
        }),
        bespoke: fields.checkbox({
          label: 'Specified to drawing',
          description: 'Contract programmes are not ordered from a range. Changes the page layout.',
        }),
        story: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
          label: 'Story',
          description: 'Exactly two paragraphs.',
          itemLabel: (item) => item.value.slice(0, 60),
        }),
        spec: fields.array(
          fields.object({
            key: fields.text({ label: 'Label' }),
            value: fields.text({ label: 'Value' }),
          }),
          { label: 'Specification', itemLabel: (item) => item.fields.key.value }
        ),
      },
    }),

    pieces: collection({
      label: 'Pieces',
      path: 'content/pieces/*',
      format: { data: 'json' },
      slugField: 'name',
      columns: ['name', 'ref', 'collection'],
      schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),
        ref: fields.text({
          label: 'Reference',
          description: 'e.g. VI-1042. Must be unique across the whole catalogue.',
          validation: { isRequired: true },
        }),
        collection: fields.select({
          label: 'Collection',
          options: collectionOptions,
          defaultValue: 'Living',
        }),
        material: fields.text({ label: 'Material' }),
        finish: fields.text({ label: 'Finish' }),
        dimensions: fields.text({
          label: 'Finished dimensions',
          description:
            'Format matters — the packed volume and container counts are computed from this. Use L160 × D40 × H80 cm, W90 × D40 × H180 cm, or Ø45 × H55 cm.',
        }),
        image: fields.select({
          label: 'Photograph',
          options: imageOptions,
          defaultValue: 'pr-mango-sideboard',
        }),
        note: fields.text({
          label: 'Note',
          description: 'One line on why this design is what it is. Card subtitle and page lead.',
          multiline: true,
        }),
        season: fields.text({
          label: 'New in season',
          description: 'Set to flag this as a new arrival, e.g. "Spring 2026". Leave blank if not.',
        }),
        private: fields.checkbox({
          label: 'Trade catalogue only',
          description: 'Hidden from the public site. No public product page is generated.',
        }),
      },
    }),

    journal: collection({
      label: 'Journal',
      path: 'content/journal/*',
      format: { data: 'json' },
      slugField: 'title',
      columns: ['title', 'category', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        category: fields.text({ label: 'Category' }),
        date: fields.text({ label: 'Date', description: 'e.g. June 2026.' }),
        readTime: fields.text({ label: 'Reading time', description: 'e.g. 4 min.' }),
        image: fields.select({
          label: 'Cover photograph',
          options: imageOptions,
          defaultValue: 'craft-barn-door',
        }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        standfirst: fields.text({ label: 'Standfirst', multiline: true }),
        body: fields.array(
          fields.object({
            heading: fields.text({ label: 'Heading', description: 'Optional.' }),
            paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
              label: 'Paragraphs',
              itemLabel: (item) => item.value.slice(0, 60),
            }),
            pull: fields.text({
              label: 'Pull quote',
              description: 'Optional. Set as an indented statement after the paragraphs.',
              multiline: true,
            }),
          }),
          {
            label: 'Body',
            itemLabel: (item) => item.fields.heading.value || 'Opening',
          }
        ),
      },
    }),
  },

  singletons: {
    brand: singleton({
      label: 'Company details',
      path: 'content/brand',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Name' }),
        short: fields.text({ label: 'Short name' }),
        established: fields.integer({ label: 'Established' }),
        origin: fields.text({ label: 'Origin' }),
        country: fields.text({ label: 'Country' }),
        address: fields.object({
          line1: fields.text({ label: 'Line 1' }),
          line2: fields.text({ label: 'Line 2' }),
          country: fields.text({ label: 'Country' }),
        }),
        email: fields.text({ label: 'Email' }),
        phone: fields.text({ label: 'Phone', description: 'As displayed.' }),
        phoneHref: fields.text({ label: 'Phone (tel: link)', description: 'No spaces.' }),
        whatsapp: fields.text({ label: 'WhatsApp', description: 'Digits only, with country code.' }),
        facts: fields.object(
          {
            years: fields.text({ label: 'Years' }),
            factory: fields.text({ label: 'Factory sq.mt' }),
            designs: fields.text({ label: 'Designs' }),
            countries: fields.text({ label: 'Export markets' }),
            craftspeople: fields.text({ label: 'Craftspeople' }),
          },
          { label: 'Headline figures' }
        ),
      },
    }),
  },
});
