import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
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

/*
 * Every test gets its own limiter bucket, and it has to be done twice.
 *
 * /api/verify-access is rate limited by client address. Playwright's `request`
 * fixture is a *different* context from the browser's, so headers set on one do not
 * reach the other — setting it only on the browser context left every header-less
 * `request.post` in this file sharing one budget across the chromium and mobile
 * projects, and the later ones were refused with a 429 that had nothing to do with
 * their subject. So `page` navigations get it from the context below, and API calls
 * go through `postCode`. Exactly the lesson enquiry.spec.ts already records.
 */
const freshIp = () =>
  `10.${20 + Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 256)}.${
    1 + Math.floor(Math.random() * 250)
  }`;

/** Pass `ip` to accumulate against one bucket on purpose; omit it to get a clean one. */
const postCode = (request: APIRequestContext, code: unknown, ip = freshIp()) =>
  request.post('/api/verify-access', {
    data: { code },
    headers: { 'x-forwarded-for': ip },
    failOnStatusCode: false,
  });

test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ 'x-forwarded-for': freshIp() });
});

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
    const res = await postCode(request, 'not-the-code');
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
      const res = await postCode(request, variant);
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
    const res = await postCode(request, `"${TEST_ACCESS_CODE}"`);
    expect(res.status()).toBe(401);
  });

  test('an empty submission is refused without being called a wrong code', async ({ request }) => {
    const res = await postCode(request, '');
    expect(res.status()).toBe(400);
  });
});

test('the private range is not reachable from the sitemap', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/collections/private');
});

test.describe('the gate is rate limited, not merely slowed', () => {
  /*
   * The 400ms wrong-code delay caps one client at about two and a half guesses a
   * second, sustained, forever. Against a short human-memorable code that is a rate
   * and not a ceiling, and this was the only mutating endpoint with no budget.
   *
   * A fresh address per test: the limiter buckets by IP, and the chromium and mobile
   * projects run against one server.
   */

  test('a sustained burst of wrong codes is cut off with 429', async ({ request }) => {
    const ip = freshIp();
    const statuses: number[] = [];

    for (let i = 0; i < 14; i += 1) {
      const res = await postCode(request, `guess-${i}`, ip);
      statuses.push(res.status());
    }

    // The limiter must not answer first — a wrong code is still a wrong code.
    expect(statuses[0]).toBe(401);
    expect(statuses).toContain(429);
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThanOrEqual(3);
  });

  test('a 429 says it is a rate problem, never a wrong code', async ({ request }) => {
    const ip = freshIp();
    let body: { error?: string } = {};

    for (let i = 0; i < 14; i += 1) {
      const res = await postCode(request, 'x', ip);
      if (res.status() === 429) {
        body = await res.json();
        break;
      }
    }

    expect(body.error).toMatch(/too many/i);
    expect(body.error).not.toMatch(/recognis|invalid code|wrong/i);
  });

  test('an oversized code is refused without being compared', async ({ request }) => {
    /* 500 characters: past the code cap, inside the body cap. At 5,000 the size
       guard answered first with 413, which is correct behaviour and the wrong
       thing to assert here — the two ceilings have to be tested separately. */
    const res = await postCode(request, 'a'.repeat(500));
    expect(res.status()).toBe(400);
  });

  test('an oversized request body is 413', async ({ request }) => {
    const res = await request.post('/api/verify-access', {
      data: JSON.stringify({ code: 'a'.repeat(50_000) }),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': freshIp() },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(413);
  });
});

test('the CMS is closed in production, with a real 404', async ({ request }) => {
  /* `/keystatic` used to answer 200 with 404 body copy — a soft 404 Google indexes
     as a real page. The API half was reachable too: /api/keystatic/tree returned
     400, which is a handler processing a request, not a closed door. */
  for (const path of ['/keystatic', '/keystatic/collection/pieces', '/api/keystatic/tree']) {
    const res = await request.get(path, { failOnStatusCode: false });
    expect(res.status(), path).toBe(404);
  }
});
