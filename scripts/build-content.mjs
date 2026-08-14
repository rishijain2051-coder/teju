#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/**
 * Compiles `content/` into typed TypeScript at `src/lib/generated/content.ts`.
 *
 * Why compile rather than read at runtime:
 *   - The data modules are imported by client components. Reading files at module
 *     scope would put `node:fs` in the browser bundle.
 *   - An async reader would mean threading content through every component as
 *     props, for content that never changes between requests.
 *   - A compile step is the only place a bad edit can be *caught*. Everything
 *     below is validated before a line is written, so a mistyped image key or a
 *     duplicate reference fails `npm run build` with a message naming the file —
 *     rather than rendering a blank plate in production.
 *
 * Run it with `npm run content`. `prebuild` runs it automatically.
 */

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'src/lib/generated/content.ts');

const problems = [];
const fail = (file, message) => problems.push(`${file}: ${message}`);

/* ── Reference data, read from the source of truth rather than duplicated ──── */

/* Either quote style: the file is generated with double quotes and Prettier
   rewrites them to single, so matching only one silently found nothing. */
const imageryKeys = new Set(
  [
    ...fs
      .readFileSync(path.join(ROOT, 'src/lib/imagery.ts'), 'utf8')
      .matchAll(/^ {2}['"]([a-z0-9-]+)['"]:\s*\{/gm),
  ].map((m) => m[1])
);

if (imageryKeys.size === 0) {
  console.error('Could not read any catalogue keys from src/lib/imagery.ts — aborting.');
  process.exit(1);
}

const COLLECTION_NAMES = ['Living', 'Storage', 'Dining', 'Bedroom', 'Hospitality', 'Occasional'];

/* ── Load ─────────────────────────────────────────────────────────────────── */

const readDir = (dir) => {
  const full = path.join(CONTENT, dir);
  if (!fs.existsSync(full)) {
    console.error(`Missing content directory: content/${dir}`);
    process.exit(1);
  }
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const rel = `content/${dir}/${f}`;
      try {
        return { slug: f.replace(/\.json$/, ''), file: rel, data: JSON.parse(fs.readFileSync(path.join(full, f), 'utf8')) };
      } catch (error) {
        fail(rel, `is not valid JSON — ${error.message}`);
        return null;
      }
    })
    .filter(Boolean);
};

const collections = readDir('collections');
const pieces = readDir('pieces');
const journal = readDir('journal');

let brand;
try {
  brand = JSON.parse(fs.readFileSync(path.join(CONTENT, 'brand.json'), 'utf8'));
} catch (error) {
  fail('content/brand.json', `could not be read — ${error.message}`);
}

/* ── Validate ─────────────────────────────────────────────────────────────── */

const text = (entry, field, { required = true } = {}) => {
  const value = entry.data[field];
  if (typeof value !== 'string' || (required && !value.trim())) {
    fail(entry.file, `"${field}" must be a non-empty string`);
    return '';
  }
  return value;
};

const image = (entry) => {
  const key = entry.data.image;
  if (!imageryKeys.has(key)) {
    fail(entry.file, `"image" is "${key}", which is not a catalogue key. Run \`npm run images\` after adding the photograph, or pick an existing one.`);
    return '';
  }
  return key;
};

/** The dimension parser the site uses to compute CBM. If it cannot read a value,
 *  every container figure for that piece silently becomes a dash. */
const parsesAsDimensions = (value) => {
  let w = 0;
  let d = 0;
  let h = 0;
  let dia = 0;
  for (const part of String(value).replace(/\s*cm\s*$/i, '').split('×')) {
    const m = /^\s*([LWDHØ])\s*(\d+(?:\.\d+)?)\s*$/.exec(part);
    if (!m) return false;
    const n = Number(m[2]);
    if (m[1] === 'L' || m[1] === 'W') w = n;
    else if (m[1] === 'D') d = n;
    else if (m[1] === 'H') h = n;
    else dia = n;
  }
  if (dia) {
    w = w || dia;
    d = d || dia;
  }
  return Boolean(w && d && h);
};

for (const entry of collections) {
  text(entry, 'name');
  text(entry, 'index');
  text(entry, 'tagline');
  text(entry, 'range');
  image(entry);
  if (!COLLECTION_NAMES.includes(entry.data.name)) {
    fail(entry.file, `"name" is "${entry.data.name}"; the site knows only ${COLLECTION_NAMES.join(', ')}`);
  }
  if (!Array.isArray(entry.data.story) || entry.data.story.length !== 2) {
    fail(entry.file, '"story" must be exactly two paragraphs');
  }
  if (!Array.isArray(entry.data.spec) || entry.data.spec.length === 0) {
    fail(entry.file, '"spec" needs at least one row');
  }
}

const seenRefs = new Map();
for (const entry of pieces) {
  text(entry, 'name');
  text(entry, 'material');
  text(entry, 'finish');
  text(entry, 'note');
  image(entry);

  const ref = text(entry, 'ref');
  if (ref) {
    if (seenRefs.has(ref)) fail(entry.file, `reference "${ref}" is already used by ${seenRefs.get(ref)}`);
    else seenRefs.set(ref, entry.file);
  }

  if (!COLLECTION_NAMES.includes(entry.data.collection)) {
    fail(entry.file, `"collection" is "${entry.data.collection}"; expected one of ${COLLECTION_NAMES.join(', ')}`);
  }

  const dimensions = text(entry, 'dimensions');
  if (dimensions && !parsesAsDimensions(dimensions)) {
    fail(
      entry.file,
      `"dimensions" ("${dimensions}") cannot be parsed, so the packed volume and container counts would be blank. Use L160 × D40 × H80 cm, W90 × D40 × H180 cm, or Ø45 × H55 cm.`
    );
  }
}

const referencedCollections = new Set(pieces.map((p) => p.data.collection));
for (const name of referencedCollections) {
  if (!collections.some((c) => c.data.name === name)) {
    fail('content/collections', `pieces reference the collection "${name}", which has no entry`);
  }
}

for (const entry of journal) {
  text(entry, 'title');
  text(entry, 'category');
  text(entry, 'date');
  text(entry, 'excerpt');
  text(entry, 'standfirst');
  image(entry);
  if (!Array.isArray(entry.data.body) || entry.data.body.length === 0) {
    fail(entry.file, '"body" needs at least one block');
  } else {
    entry.data.body.forEach((block, i) => {
      if (!Array.isArray(block.paragraphs) || block.paragraphs.length === 0) {
        fail(entry.file, `body block ${i + 1} has no paragraphs`);
      }
    });
  }
}

if (brand) {
  for (const field of ['name', 'origin', 'email', 'phone', 'phoneHref', 'whatsapp']) {
    if (!brand[field]) fail('content/brand.json', `"${field}" is required`);
  }
  if (brand.phoneHref && /\s/.test(brand.phoneHref)) {
    fail('content/brand.json', '"phoneHref" must not contain spaces — it goes straight into a tel: link');
  }
  if (brand.email && !brand.email.includes('@')) {
    fail('content/brand.json', '"email" does not look like an address');
  }
}

if (problems.length) {
  console.error(`\nContent is not valid — ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`);
  problems.forEach((p) => console.error(`  ${p}`));
  console.error('\nNothing was written. Fix the entries above and run `npm run content` again.\n');
  process.exit(1);
}

/* ── Emit ─────────────────────────────────────────────────────────────────── */

const literal = (value) => JSON.stringify(value, null, 2).replace(/\n/g, '\n  ');

const source = `// GENERATED FROM content/ BY scripts/build-content.mjs — DO NOT EDIT BY HAND.
//
// Edit the content at /keystatic while running \`npm run dev\`, or edit the JSON in
// content/ directly, then run \`npm run content\`. \`npm run build\` regenerates this
// first, so a stale file cannot ship.
//
// ${collections.length} collections · ${pieces.length} pieces · ${journal.length} journal entries

export const collectionRecords = ${literal(collections.map((c) => ({ slug: c.slug, ...c.data })))} as const;

export const pieceRecords = ${literal(
  pieces.map((p) => ({
    slug: p.slug,
    ...p.data,
    // Normalised here rather than in every consumer: Keystatic writes '' for an
    // unset optional text field, and the site tests these for truthiness.
    season: p.data.season || undefined,
    private: p.data.private || undefined,
  }))
)} as const;

export const journalRecords = ${literal(
  journal.map((j) => ({
    slug: j.slug,
    ...j.data,
    body: (j.data.body ?? []).map((block) => ({
      ...(block.heading ? { heading: block.heading } : {}),
      paragraphs: block.paragraphs,
      ...(block.pull ? { pull: block.pull } : {}),
    })),
  }))
)} as const;

export const brandRecord = ${literal(brand)} as const;
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });

const previous = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
if (previous === source) {
  console.log(`Content unchanged — ${collections.length} collections, ${pieces.length} pieces, ${journal.length} journal entries.`);
} else {
  fs.writeFileSync(OUT, source);
  console.log(
    `Wrote src/lib/generated/content.ts — ${collections.length} collections, ${pieces.length} pieces, ${journal.length} journal entries.`
  );
}
