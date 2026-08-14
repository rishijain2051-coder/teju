#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/**
 * Reconciles `src/lib/imagery.ts` with the photographs in
 * `public/assets/images/catalogue/`.
 *
 * The manifest holds two different kinds of field, and this script treats them
 * differently on purpose:
 *
 *   Mechanical — src, width, height, blurDataURL. Measured from the file. Always
 *   recomputed, so a re-export at a new size can never leave the site laying out
 *   against stale dimensions.
 *
 *   Editorial — the key, the group, the alt text, and the order entries appear
 *   in. Written by a person and preserved exactly. The order is curated (the
 *   collection images run in the collections' display order; the product images
 *   run by design family), so re-deriving it alphabetically would shuffle
 *   `byGroup` output and reorder the pages that read it.
 *
 * A photograph with no alt text stops the run. An empty alt on a product shot is
 * an accessibility defect, and one that is easy to ship and hard to notice.
 *
 * Usage:
 *   node scripts/process-images.mjs            reconcile; keep existing blurs
 *   node scripts/process-images.mjs --reblur    regenerate every blur placeholder
 *   node scripts/process-images.mjs --check     report drift, write nothing (CI)
 */

const ROOT = path.resolve(import.meta.dirname, '..');
const IMAGES = path.join(ROOT, 'public/assets/images/catalogue');
const MANIFEST = path.join(ROOT, 'src/lib/imagery.ts');
const PUBLIC_PREFIX = '/assets/images/catalogue';

const reblur = process.argv.includes('--reblur');
const checkOnly = process.argv.includes('--check');

/** Filename prefix → group. The prefix is the convention the catalogue is named
 *  by, so a new photograph gets its group from what it is called. */
const GROUPS = [
  ['hero-', 'hero'],
  ['col-', 'collection'],
  ['craft-', 'craft'],
  ['pr-', 'product'],
];
const GROUP_ORDER = ['hero', 'collection', 'craft', 'product'];

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error(
    'This script needs sharp, which reads the image dimensions and encodes the blur\n' +
      'placeholders. Install it with:\n\n  npm install --save-dev sharp\n'
  );
  process.exit(1);
}

/* ── Read the existing manifest ────────────────────────────────────────────── */

if (!fs.existsSync(MANIFEST)) {
  console.error(`Missing ${path.relative(ROOT, MANIFEST)} — nothing to reconcile against.`);
  process.exit(1);
}

const existingSource = fs.readFileSync(MANIFEST, 'utf8');

/* One capture per entry, in file order. The manifest is generated, so its shape
   is known; anything that does not match is reported rather than skipped. */
const ENTRY = /^ {2}'([a-z0-9-]+)': \{\n([\s\S]*?)\n {2}\},$/gm;
/* `\s*` rather than a literal space: Prettier breaks the long blurDataURL onto
   its own line, so the value does not always sit beside the key. */
const field = (body, name) => {
  const match = new RegExp(`${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`).exec(body);
  return match ? match[1] : null;
};

const existing = [];
for (const [, key, body] of existingSource.matchAll(ENTRY)) {
  existing.push({
    key,
    group: field(body, 'group'),
    alt: field(body, 'alt'),
    blurDataURL: field(body, 'blurDataURL'),
  });
}

if (existing.length === 0) {
  console.error(
    `Could not parse a single entry out of ${path.relative(ROOT, MANIFEST)}.\n` +
      'If the file was reformatted by hand, restore it from git before running this.'
  );
  process.exit(1);
}

const byKey = new Map(existing.map((entry) => [entry.key, entry]));

/* ── Read what is actually on disk ─────────────────────────────────────────── */

if (!fs.existsSync(IMAGES)) {
  console.error(`Missing ${path.relative(ROOT, IMAGES)}.`);
  process.exit(1);
}

const files = fs
  .readdirSync(IMAGES)
  .filter((file) => file.endsWith('.webp'))
  .sort();

const groupOf = (key) => GROUPS.find(([prefix]) => key.startsWith(prefix))?.[1] ?? null;

const problems = [];
const changes = [];

const added = files
  .map((file) => file.replace(/\.webp$/, ''))
  .filter((key) => !byKey.has(key));

for (const key of added) {
  if (!groupOf(key)) {
    problems.push(
      `${key}.webp: cannot tell which group it belongs to. Rename it to start with ` +
        `${GROUPS.map(([prefix]) => prefix).join(', ')}.`
    );
    continue;
  }
  problems.push(
    `${key}.webp is new and has no alt text. Add an entry to src/lib/imagery.ts with the ` +
      `key '${key}', its group, and a sentence describing the photograph — then run this ` +
      `again to fill in the dimensions and blur placeholder.`
  );
}

const removed = existing.filter((entry) => !files.includes(`${entry.key}.webp`));
for (const entry of removed) {
  problems.push(
    `${entry.key} is in the manifest but ${entry.key}.webp is not in ` +
      `${path.relative(ROOT, IMAGES).replace(/\\/g, '/')}. Restore the file, or delete the ` +
      `entry and every reference to it in content/.`
  );
}

for (const entry of existing) {
  if (!entry.alt || !entry.alt.trim()) {
    problems.push(`${entry.key}: "alt" is empty. Describe the photograph.`);
  }
  const expected = groupOf(entry.key);
  if (expected && entry.group !== expected) {
    problems.push(
      `${entry.key}: group is '${entry.group}' but the name says '${expected}'. ` +
        'Rename the file or correct the group.'
    );
  }
}

if (problems.length) {
  console.error(`\nCannot reconcile — ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`);
  problems.forEach((problem) => console.error(`  ${problem}`));
  console.error('\nNothing was written.\n');
  process.exit(1);
}

/* ── Measure ───────────────────────────────────────────────────────────────── */

/** 16 px wide: enough to carry the composition and the dominant colours, small
 *  enough that the base64 sits inline in the HTML without being noticed. */
const blurFor = async (file) => {
  const buffer = await sharp(file).resize(16).webp({ quality: 30 }).toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
};

const entries = [];
for (const entry of existing) {
  const file = path.join(IMAGES, `${entry.key}.webp`);
  const { width, height } = await sharp(file).metadata();

  const previousWidth = new RegExp(`'${entry.key}':[\\s\\S]*?width: (\\d+)`).exec(existingSource);
  const previousHeight = new RegExp(`'${entry.key}':[\\s\\S]*?height: (\\d+)`).exec(existingSource);
  if (previousWidth && Number(previousWidth[1]) !== width) {
    changes.push(`${entry.key}: width ${previousWidth[1]} → ${width}`);
  }
  if (previousHeight && Number(previousHeight[1]) !== height) {
    changes.push(`${entry.key}: height ${previousHeight[1]} → ${height}`);
  }

  let blurDataURL = entry.blurDataURL;
  if (reblur || !blurDataURL) {
    const next = await blurFor(file);
    if (next !== blurDataURL) {
      changes.push(`${entry.key}: blur placeholder ${blurDataURL ? 'regenerated' : 'generated'}`);
      blurDataURL = next;
    }
  }

  entries.push({
    key: entry.key,
    group: entry.group,
    src: `${PUBLIC_PREFIX}/${entry.key}.webp`,
    alt: entry.alt,
    width,
    height,
    blurDataURL,
  });
}

/* Curated order, kept: entries stay where they are, and anything new lands at
   the end of its own group rather than at the end of the file. */
entries.sort((a, b) => {
  const byGroup = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
  if (byGroup !== 0) return byGroup;
  return existing.findIndex((e) => e.key === a.key) - existing.findIndex((e) => e.key === b.key);
});

/* ── Emit ──────────────────────────────────────────────────────────────────── */

/* Matches what Prettier would produce at printWidth 100, so the only lines that
   move in a diff are the ones whose values actually changed. */
const quote = (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const block = (entry) => {
  const blur = `    blurDataURL: ${quote(entry.blurDataURL)},`;
  return [
    `  '${entry.key}': {`,
    `    name: '${entry.key}',`,
    `    group: '${entry.group}',`,
    `    src: '${entry.src}',`,
    `    alt: ${quote(entry.alt)},`,
    `    width: ${entry.width},`,
    `    height: ${entry.height},`,
    blur.length > 100 ? `    blurDataURL:\n      ${quote(entry.blurDataURL)},` : blur,
    '  },',
  ].join('\n');
};

const source = `// Generated from the VardhmanImpex catalogue renders. Do not edit by hand.
// Regenerate with scripts/process-images.mjs.

export interface CatalogueImage {
  name: string;
  group: 'hero' | 'collection' | 'craft' | 'product';
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL: string;
}

export const catalogue = {
${entries.map(block).join('\n')}
} as const satisfies Record<string, CatalogueImage>;

export type CatalogueKey = keyof typeof catalogue;

export const img = (key: CatalogueKey): CatalogueImage => catalogue[key];

export const byGroup = (group: CatalogueImage['group']): CatalogueImage[] =>
  Object.values(catalogue).filter((i) => i.group === group);
`;

const identical = source === existingSource;

if (checkOnly) {
  if (identical) {
    console.log(`src/lib/imagery.ts is in step with all ${entries.length} photographs.`);
    process.exit(0);
  }
  console.error('src/lib/imagery.ts is out of step with the photographs on disk:');
  changes.forEach((change) => console.error(`  ${change}`));
  if (changes.length === 0) console.error('  (formatting differs — run the script to normalise it)');
  console.error('\nRun `node scripts/process-images.mjs` and commit the result.');
  process.exit(1);
}

if (identical) {
  console.log(`Nothing to change — ${entries.length} photographs, all in step.`);
} else {
  fs.writeFileSync(MANIFEST, source);
  console.log(`Wrote src/lib/imagery.ts — ${entries.length} photographs.`);
  changes.forEach((change) => console.log(`  ${change}`));
  if (changes.length === 0) console.log('  (formatting normalised; no values changed)');
}
