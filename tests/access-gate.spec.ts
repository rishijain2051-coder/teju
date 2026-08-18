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

    /* Longer than the default expect timeout: signing in is a POST, a client
       navigation and a server render of all 39 cards. Well under the test
       budget, so a step that follows this one still has room. */
    await expect(page).toHaveURL(new RegExp(`${GATED}$`), { timeout: 20_000 });

    // The point of the gate: more designs than the public grid, plus the packed
    // volumes that are not published.
    await expect(page.getByText(/In this catalogue/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^manifest$/i })).toBeVisible();
  });

  test('signing out closes the gate again', async ({ page }) => {
    await page.goto(GATE);
    await page.getByLabel('Access code').fill(TEST_ACCESS_CODE);
    await page.getByRole('button', { name: /enter/i }).click();
    await expect(page).toHaveURL(new RegExp(`${GATED}$`), { timeout: 20_000 });

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/logout') && r.status() === 200),
      page.getByRole('button', { name: /sign out/i }).click(),
    ]);
    await expect(page).toHaveURL(/\/collections$/, { timeout: 20_000 });

    await page.goto(GATED);
    await expect(page).toHaveURL(new RegExp(`${GATE}$`));
  });
});

/**
 * The gate reported every failure as a wrong code.
 *
 * `/api/verify-access` answers 503 when ACCESS_SECRET is missing or under 32
 * characters, and 503 when ACCESS_CODES is unset — both deployment faults. The
 * client showed "That code was not recognised" for all of them, so a broken
 * environment variable on the host was indistinguishable from a mistyped code:
 * verified buyers sat re-typing a correct code while we went looking for a bug in
 * the code list. These tests pin the three outcomes apart.
 */
test.describe('a server fault does not masquerade as a wrong code', () => {
  test('a wrong code is a bare 401 with no message of its own', async ({ request }) => {
    const res = await request.post('/api/verify-access', { data: { code: 'not-the-code' } });
    expect(res.status()).toBe(401);
    /* No `error` string: 401 is the one status the client is allowed to word
       itself. If the route starts sending one here, the client shows it instead
       and the wrong-code copy silently dies. */
    expect(await res.json()).not.toHaveProperty('error');
  });

  test('the gate shows the server’s own message for a 503, not the wrong-code copy', async ({
    page,
  }) => {
    /* Stubbed rather than driven through a misconfigured server: the suite pins
       ACCESS_CODES and ACCESS_SECRET for one shared `next start`, so the only way
       to exercise the unconfigured contract is to answer as it would. */
    await page.route('**/api/verify-access', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Access is temporarily unavailable. Please contact us directly.',
          reason: 'access-secret',
        }),
      })
    );

    await page.goto(GATE);
    await page.getByLabel('Access code').fill(TEST_ACCESS_CODE);
    await page.getByRole('button', { name: /enter/i }).click();

    const error = page.locator('p#code-error');
    await expect(error).toContainText(/temporarily unavailable/i);
    // The whole point: a deployment fault must not be blamed on the buyer.
    await expect(error).not.toContainText(/not recognised/i);
  });

  test('an unexpected status still says something other than “wrong code”', async ({ page }) => {
    // 500 with no body at all — the client has to fall back on its own wording.
    await page.route('**/api/verify-access', (route) =>
      route.fulfill({ status: 500, contentType: 'text/plain', body: '' })
    );

    await page.goto(GATE);
    await page.getByLabel('Access code').fill(TEST_ACCESS_CODE);
    await page.getByRole('button', { name: /enter/i }).click();

    const error = page.locator('p#code-error');
    await expect(error).toContainText(/could not be checked/i);
    await expect(error).not.toContainText(/not recognised/i);
  });
});

/**
 * Two runtimes, one secret.
 *
 * `/api/verify-access` runs on Node and signs the cookie; `middleware.ts` runs on
 * the Edge runtime and verifies it. If the Edge side cannot read ACCESS_SECRET,
 * the flow is: correct code accepted, cookie set, middleware rejects it, and the
 * middleware DELETES the cookie on the way out — so a buyer who signed in
 * successfully lands back on the gate with no error and no way to tell why.
 *
 * `x-vi-gate: unavailable` is exactly that condition. On a correctly configured
 * deployment the bounce must read `denied`, meaning "no valid cookie" and nothing
 * worse. This is the check to run against production first:
 *   curl -sI https://…/collections/private/catalogue | grep x-vi-gate
 */
test.describe('the bounce says why', () => {
  test('reads “denied”, proving the Edge runtime can read ACCESS_SECRET', async ({ request }) => {
    const res = await request.get(GATED, { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()['x-vi-gate']).toBe('denied');
  });

  test('and the header says nothing about the codes', async ({ request }) => {
    const res = await request.get(GATED, { maxRedirects: 0 });
    const header = res.headers()['x-vi-gate'];
    expect(['denied', 'unavailable']).toContain(header);
    expect(header).not.toContain(TEST_ACCESS_CODE);
  });
});

/**
 * ACCESS_CODES is read per request, not captured once at module scope, and a
 * dashboard-pasted value keeps its quotes because Vercel and Netlify store the
 * string literally. Both faults refused a correct code and looked identical to a
 * typo. The comparison is trimmed, lower-cased and quote-stripped, so the forms
 * an operator is likely to paste all resolve to the same code.
 */
test.describe('a code survives the ways it gets typed', () => {
  for (const [label, variant] of [
    ['as issued', TEST_ACCESS_CODE],
    ['upper-cased', TEST_ACCESS_CODE.toUpperCase()],
    ['with surrounding whitespace', `  ${TEST_ACCESS_CODE}  `],
  ] as const) {
    test(`${label} is accepted and issues a signed cookie`, async ({ request }) => {
      const res = await request.post('/api/verify-access', { data: { code: variant } });
      expect(res.status()).toBe(200);

      const cookie = res.headers()['set-cookie'] ?? '';
      expect(cookie).toContain(`${COOKIE}=`);
      // `<expiry>.<signature>`, never the old literal `granted`.
      expect(cookie).toMatch(new RegExp(`${COOKIE}=\\d{10,}\\.[A-Za-z0-9_-]{20,}`));
    });
  }

  test('a quoted code is not a second way in', async ({ request }) => {
    /* Quote stripping applies to the configured ACCESS_CODES value, never to what
       the visitor submits — otherwise `"code"` would be a free alias for `code`.  */
    const res = await request.post('/api/verify-access', {
      data: { code: `"${TEST_ACCESS_CODE}"` },
    });
    expect(res.status()).toBe(401);
  });

  test('an empty submission is refused without being called a wrong code', async ({ request }) => {
    const res = await request.post('/api/verify-access', { data: { code: '' } });
    expect(res.status()).toBe(400);
  });
});

test('the private range is not reachable from the sitemap', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/collections/private');
});
