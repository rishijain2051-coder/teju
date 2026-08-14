import { test, expect, type Page } from '@playwright/test';
import { createHmac } from 'node:crypto';
import { TEST_ACCESS_CODE, TEST_ACCESS_SECRET } from '../playwright.config';

/**
 * The trade gate.
 *
 * This suite exists because the gate spent months not running at all:
 * `middleware.ts` was at the project root while the app lives in `src/app`, so
 * Next.js compiled zero middleware entries and the private catalogue answered
 * 200 to anyone with the URL — silently, with no warning and no build error.
 * The first test below is the regression test for exactly that.
 */

const GATED = '/collections/private/catalogue';
const GATE = '/collections/private';
const COOKIE = 'vi_private_access';

/** Mints a cookie the way the app does, so forgery paths can be checked. */
function token(secondsFromNow: number, secret = TEST_ACCESS_SECRET) {
  const expiry = String(Math.floor(Date.now() / 1000) + secondsFromNow);
  const signature = createHmac('sha256', secret).update(expiry).digest('base64url');
  return `${expiry}.${signature}`;
}

const setCookie = (page: Page, value: string) =>
  page
    .context()
    /* Explicit domain and path, matching what /api/verify-access sets. Deriving
       them from `page.url()` gave the cookie a narrower path, which the gate
       still rejected but could not clear — deletion must match name, domain and
       path exactly. */
    .addCookies([{ name: COOKIE, value, domain: 'localhost', path: '/' }]);

test.describe('the gate rejects', () => {
  test('a visitor with no cookie', async ({ page }) => {
    await page.goto(GATED);
    await expect(page).toHaveURL(new RegExp(`${GATE}$`));
    await expect(page.getByRole('heading', { name: /by invitation/i })).toBeVisible();
  });

  /* The specific value the gate used to accept. Anyone could type it into the
     devtools cookie editor; the codes never leaked, but they never had to. */
  test('the old literal value "granted"', async ({ page }) => {
    await page.goto(GATE);
    await setCookie(page, 'granted');
    await page.goto(GATED);
    await expect(page).toHaveURL(new RegExp(`${GATE}$`));
  });

  test('a valid expiry with no signature', async ({ page }) => {
    await page.goto(GATE);
    await setCookie(page, String(Math.floor(Date.now() / 1000) + 3600));
    await page.goto(GATED);
    await expect(page).toHaveURL(new RegExp(`${GATE}$`));
  });

  test('a signature made with the wrong secret', async ({ page }) => {
    await page.goto(GATE);
    await setCookie(page, token(3600, 'a-different-secret-of-sufficient-length-here'));
    await page.goto(GATED);
    await expect(page).toHaveURL(new RegExp(`${GATE}$`));
  });

  test('a correctly signed but expired token', async ({ page }) => {
    await page.goto(GATE);
    await setCookie(page, token(-60));
    await page.goto(GATED);
    await expect(page).toHaveURL(new RegExp(`${GATE}$`));
  });

  test('and clears the rejected cookie on the way out', async ({ page }) => {
    await page.goto(GATE);
    await setCookie(page, 'granted');
    await page.goto(GATED);

    const remaining = (await page.context().cookies()).find((c) => c.name === COOKIE);
    expect(remaining?.value ?? '').toBe('');
  });
});

test.describe('the gate accepts', () => {
  test('a correctly signed, in-date token', async ({ page }) => {
    await page.goto(GATE);
    await setCookie(page, token(3600));
    await page.goto(GATED);
    await expect(page).toHaveURL(new RegExp(`${GATED}$`));
    await expect(page.getByRole('heading', { name: /the full range/i })).toBeVisible();
  });
});

test.describe('signing in', () => {
  test('a wrong code is refused and sets no cookie', async ({ page }) => {
    await page.goto(GATE);
    await page.getByLabel('Access code').fill('not-the-code');
    await page.getByRole('button', { name: /enter/i }).click();

    await expect(page.locator('p#code-error')).toContainText(/not recognised/i);
    await expect(page).toHaveURL(new RegExp(`${GATE}$`));

    const cookie = (await page.context().cookies()).find((c) => c.name === COOKIE);
    expect(cookie).toBeUndefined();
  });

  test('the right code opens the catalogue and reveals the trade figures', async ({ page }) => {
    await page.goto(GATE);
    await page.getByLabel('Access code').fill(TEST_ACCESS_CODE);
    await page.getByRole('button', { name: /enter/i }).click();

    await expect(page).toHaveURL(new RegExp(`${GATED}$`), { timeout: 30_000 });

    // The point of the gate: more designs than the public grid, plus the packed
    // volumes that are not published.
    await expect(page.getByText(/In this catalogue/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^manifest$/i })).toBeVisible();
  });

  test('signing out closes the gate again', async ({ page }) => {
    await page.goto(GATE);
    await page.getByLabel('Access code').fill(TEST_ACCESS_CODE);
    await page.getByRole('button', { name: /enter/i }).click();
    await expect(page).toHaveURL(new RegExp(`${GATED}$`), { timeout: 30_000 });

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/logout') && r.status() === 200),
      page.getByRole('button', { name: /sign out/i }).click(),
    ]);
    await expect(page).toHaveURL(/\/collections$/, { timeout: 30_000 });

    await page.goto(GATED);
    await expect(page).toHaveURL(new RegExp(`${GATE}$`));
  });
});

test('the private range is not reachable from the sitemap', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/collections/private');
});
