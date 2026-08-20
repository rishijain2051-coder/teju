import { test, expect, type Page } from '@playwright/test';
import { collections } from '@/lib/site';

/**
 * The collections directory — six posters that spawn scattered across the first
 * viewport and land into a list.
 *
 * Everything asserted here is structure, and deliberately none of it is
 * choreography. The entrance is a CSS animation on server-rendered markup
 * (`poster-land` in `src/styles/tailwind.css`, armed by the custom properties
 * `CollectionPosters` writes inline), so every assertion below has to hold
 * whether or not motion is enabled and at any point during the flight. Colours,
 * positions and timing are therefore not the subject. What is worth pinning is
 * that an animation which throws six links up to 40vw sideways and thousands of
 * pixels upward can never leave them unreachable, mis-sized, or off the side of
 * the document — and that it still ships with no JavaScript of its own.
 */

const LIST = '/collections';

/** The `<li>` is the row, and the row pitch is what the entrance measures. */
const POSTER = 'li.poster';

/** Every custom property `poster-land` reads. A missing one poisons `transform`. */
const SCATTER = ['--fx', '--fy', '--fr', '--fs', '--slot', '--land-delay'] as const;

const posters = (page: Page) => page.locator(POSTER);

/* The poster the morph tests click. Not poster 0: it is the only one whose slot
   needs no lift and the only one marked `priority`, so a claim test that passed
   on it alone would not prove the handler found the right plate. */
const CLICKED = 2;

/** One inline custom property off every poster, in DOM order. */
const inline = (page: Page, property: string) =>
  posters(page).evaluateAll(
    (items, name) => items.map((el) => (el as HTMLElement).style.getPropertyValue(name).trim()),
    property
  );

test.describe('the directory is six reachable links first and an animation second', () => {
  test('all six posters render, are visible, and open the six collections in order', async ({
    page,
  }) => {
    await page.goto(LIST);

    /* Six because the catalogue has six, not because six is a nice number — a
       collection added at /keystatic should fail this and be looked at, since the
       stratified scatter is cut into exactly `collections.length` bands. */
    await expect(posters(page)).toHaveCount(collections.length);
    expect(collections).toHaveLength(6);

    for (let at = 0; at < collections.length; at += 1) {
      await expect(posters(page).nth(at), collections[at].name).toBeVisible();
    }

    /* The highest-value assertion in the file: it pins that the entrance can
       never leave content unreachable. Compared in order, so a scatter that
       reordered the list would fail rather than pass on set equality. */
    const hrefs = await page
      .locator(`${POSTER} a[href^="/collections/"]`)
      .evaluateAll((links) => links.map((el) => el.getAttribute('href')));
    expect(hrefs).toEqual(collections.map((collection) => collection.href));
  });

  test('every poster row is exactly the same height', async ({ page }) => {
    await page.goto(LIST);

    /*
     * Structural, not cosmetic. The entrance lifts poster N by `--slot * -100%`
     * of its OWN height to cluster the flock at poster 0's slot, which is only
     * poster 0's slot while the rows are uniform. A two-word collection name
     * wrapping the `h3`, or a tagline that outgrew the two-line clamp, would add
     * a line to one row and every poster below it would then fly in from
     * somewhere other than the cloud — silently, with nothing broken to see.
     * Measured once with the taglines free to wrap: rows of 570 to 851px, and
     * poster 5 started 908px above the viewport instead of inside the flock.
     *
     * `offsetHeight`, not a client rect: the entrance scales each poster by its
     * own `--fs`, so a bounding box measured mid-flight reports the transform
     * rather than the row.
     */
    const heights = await posters(page).evaluateAll((items) =>
      items.map((el) => (el as HTMLElement).offsetHeight)
    );

    expect(heights).toHaveLength(collections.length);
    expect(Math.min(...heights)).toBeGreaterThan(0);
    expect(new Set(heights).size, `row heights: ${heights.join(', ')}`).toBe(1);
  });

  test('the poster names are h3 under the section’s own h2', async ({ page }) => {
    await page.goto(LIST);
    const flock = page.locator('section.poster-flock');

    /* The h2 is load-bearing rather than decorative: without one the six names
       took this section's level, and the twenty piece headings in the grid below
       then read as belonging to whichever collection came last. It counts the
       collections rather than spelling the number, so a collection added at
       /keystatic cannot leave a stale figure behind. */
    await expect(flock.locator('h2')).toHaveCount(1);
    await expect(flock.locator('h2')).toHaveText(
      new RegExp(`^\\s*${collections.length} collections\\s*$`)
    );
    await expect(flock.locator(`${POSTER} h3`)).toHaveCount(collections.length);
  });
});

test.describe('the scatter is server-rendered and never rolled twice', () => {
  test('every poster carries all six custom properties inline', async ({ page }) => {
    await page.goto(LIST);

    for (const property of SCATTER) {
      const values = await inline(page, property);
      expect(values, property).toHaveLength(collections.length);
      /* An invalid `var()` poisons the whole declaration at computed-value time,
         so one missing property does not degrade a poster — it resolves
         `transform` to the fallback and drops the flight entirely. */
      for (const value of values) expect(value, property).not.toBe('');
    }

    // `--slot` is the poster's index, and the lift is `calc(--slot * -100%)`, so
    // DOM order and slot order have to be the same thing.
    expect(await inline(page, '--slot')).toEqual(['0', '1', '2', '3', '4', '5']);
  });

  test('the scatter is in the HTML the server sends, before any script runs', async ({
    request,
  }) => {
    const html = await (await request.get(LIST)).text();

    /* `--slot:` with a colon appears only in a style attribute — the stylesheet
       reads it as `var(--slot, 0)` — so counting it counts server-rendered
       posters. This is the zero-JavaScript pin: the entrance has to be armed in
       the markup, because the first poster is this route's LCP element and an
       effect-driven entrance cannot start until the bundle has parsed. */
    expect(html.match(/--slot:/g)).toHaveLength(collections.length);
    expect(html.match(/--land-delay:/g)).toHaveLength(collections.length);
    expect(html).toMatch(/--fx:-?[\d.]+vw/);
  });

  test('two visits scatter the flock identically', async ({ page }) => {
    await page.goto(LIST);
    const first = await inline(page, '--fx');

    await page.goto(LIST);
    const second = await inline(page, '--fx');

    /* A `Math.random()` in the scatter would reshuffle the cloud on every return
       to this page, and a layout that differs run to run is a flicker rather than
       a texture. Six distinct values as well, or a hash that collapsed to one
       band would pass this trivially. */
    expect(second).toEqual(first);
    expect(new Set(first).size).toBe(collections.length);
  });

  test('hydration does not rewrite the scatter it was served', async ({ page, request }) => {
    /* The sharper half of determinism. A non-deterministic scatter is a style
       attribute mismatch: the server writes one set of values into the HTML and
       the hydrating tree computes another. Comparing the served attribute against
       the live DOM catches that whichever way React chooses to resolve it —
       patching the attribute, or leaving it and logging. */
    const served = [...(await (await request.get(LIST)).text()).matchAll(/--fx:(-?[\d.]+vw)/g)].map(
      (match) => match[1]
    );

    await page.goto(LIST);
    const live = await inline(page, '--fx');

    expect(served).toHaveLength(collections.length);
    expect(live).toEqual(served);
  });
});

test('the flight never pushes the page sideways', async ({ page }) => {
  await page.goto(LIST);

  /*
   * Measured immediately, which is the point: `--fx` reaches 40vw, so at this
   * moment several posters are translated clean off the side of the screen and a
   * transform still counts toward the document's scroll width. `.poster-flock`
   * carries `overflow-x: clip` for exactly this, and without it the entrance
   * hands the visitor a horizontal scrollbar and jerks the page sideways as it
   * settles. `+ 1` absorbs the sub-pixel rounding of a fractional viewport.
   */
  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));

  expect(
    width.scroll,
    `scrollWidth ${width.scroll} vs clientWidth ${width.client}`
  ).toBeLessThanOrEqual(width.client + 1);
});

test.describe('the plate morph names exactly one plate', () => {
  /*
   * Exactly one element may carry the shared name when the outgoing snapshot is
   * taken, or the browser abandons the transition and the photograph does not
   * travel. `PlateLink` clears every `[data-plate]` in the document and then
   * names the one being opened, so both halves of that are worth pinning.
   */

  test('nothing is active before a click, and every poster plate is idle', async ({ page }) => {
    await page.goto(LIST);

    /* Scoped to the list on purpose: the grid further down this page renders
       twenty `PieceCard` plates that are idle too, so a page-wide idle count is
       26 and says nothing about the posters. */
    await expect(page.locator(`${POSTER} [data-plate="idle"]`)).toHaveCount(collections.length);

    // Page-wide, though, for `active` — one anywhere would be one too many.
    await expect(page.locator('[data-plate="active"]')).toHaveCount(0);
  });

  test('clicking a poster marks that poster’s plate and no other', async ({ page }) => {
    await page.goto(LIST);

    /* The click is held rather than followed. `PlateLink` is a plain anchor, so a
       real click leaves the document and the state it just set is gone — a
       capture-phase `preventDefault` cancels the navigation while still letting
       React's delegated handler run, which is the thing under test. */
    await page.evaluate(() => {
      document.addEventListener('click', (event) => event.preventDefault(), true);
    });

    const clicked = posters(page).nth(CLICKED);

    /* Retried, because the handler is client-side: nothing is marked until
       `PlateLink` has hydrated, and this route deliberately ships its entrance
       without waiting for that. */
    await expect(async () => {
      await clicked.locator('a').click();
      await expect(page.locator('[data-plate="active"]')).toHaveCount(1);
      await expect(clicked.locator('[data-plate="active"]')).toHaveCount(1);
    }).toPass();

    // And the rest of the flock was cleared rather than left named.
    await expect(page.locator(`${POSTER} [data-plate="idle"]`)).toHaveCount(collections.length - 1);
  });

  test('the collection a poster opens has exactly one active plate of its own', async ({
    page,
  }) => {
    await page.goto(LIST);

    const opened = collections[CLICKED];
    await posters(page).nth(CLICKED).locator('a').click();
    await expect(page).toHaveURL(new RegExp(`${opened.href}$`));

    /* The destination end of the morph, marked server-side. The related pieces
       below it are idle plates, so this has to be exactly one — a second active
       plate on the page it lands on abandons the transition just as surely as a
       second one on the page it left. */
    await expect(page.locator('[data-plate="active"]')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(opened.name);
  });
});

test('the heading outline steps one level at a time', async ({ page }) => {
  await page.goto(LIST);

  const levels = await page
    .locator('h1, h2, h3, h4, h5, h6')
    .evaluateAll((headings) => headings.map((el) => Number(el.tagName[1])));

  expect(levels[0]).toBe(1);
  expect(levels.filter((level) => level === 1)).toHaveLength(1);

  /* A skip is a screen-reader user hearing a level that has no parent. Going back
     up any distance is fine — a new section after a run of h3s — so only the step
     downward is bounded. */
  for (let i = 1; i < levels.length; i += 1) {
    expect(
      levels[i] - levels[i - 1],
      `h${levels[i - 1]} followed by h${levels[i]}`
    ).toBeLessThanOrEqual(1);
  }
});
