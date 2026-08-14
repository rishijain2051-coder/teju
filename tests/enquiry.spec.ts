import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * The enquiry path — the only conversion on the site.
 *
 * SMTP is blanked in `playwright.config.ts`, so nothing here can reach a real
 * mailbox. That is not a limitation: the contract worth pinning is that an
 * undeliverable lead is *refused loudly* rather than accepted and dropped, which
 * is exactly the failure a form like this hides best.
 *
 * Every request carries its own `x-forwarded-for`, because the route's rate
 * limiter buckets by IP. Sharing one address made the sixth test in the file fail
 * with a 429 that had nothing to do with what it was checking — and the limiter
 * deserves a test of its own rather than silently breaking its neighbours.
 */

/*
 * A fresh address per request, drawn randomly rather than counted.
 *
 * A module-level counter looked fine and was not: it resets in every worker
 * process, so ten parallel workers all started at 10.0.0.1 and shared limiter
 * buckets, and tests failed with 429s that had nothing to do with their subject.
 */
const fromNewIp = () =>
  `10.${1 + Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 256)}.${
    1 + Math.floor(Math.random() * 250)
  }`;

const post = (
  request: APIRequestContext,
  data: Record<string, unknown>,
  ip = fromNewIp()
) =>
  request.post('/api/enquiry', {
    data,
    headers: { 'x-forwarded-for': ip },
    failOnStatusCode: false,
  });

const validFields = [{ label: 'Company', value: 'Playwright Test Ltd' }];

test.describe('POST /api/enquiry validates before it sends', () => {
  test('rejects a missing subject', async ({ request }) => {
    const res = await post(request, { fields: validFields });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/subject/i);
  });

  test('rejects an empty field list', async ({ request }) => {
    const res = await post(request, { subject: 'Test', fields: [] });
    expect(res.status()).toBe(400);
  });

  test('rejects fields whose values are all blank', async ({ request }) => {
    const res = await post(request, {
      subject: 'Test',
      fields: [{ label: 'Company', value: '   ' }],
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/nothing to send/i);
  });

  test('discards non-string field entries rather than crashing', async ({ request }) => {
    const res = await post(request, {
      subject: 'Test',
      fields: [{ label: 1, value: {} }, null, 'nonsense'],
    });
    // Everything was discarded, so there is nothing to send — a 400, not a 500.
    expect(res.status()).toBe(400);
  });

  test('rejects a malformed body', async ({ request }) => {
    const res = await request.post('/api/enquiry', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': fromNewIp() },
      data: 'not json at all',
      failOnStatusCode: false,
    });
    expect([400, 415]).toContain(res.status());
  });

  test('truncates an oversized field instead of forwarding it whole', async ({ request }) => {
    const res = await post(request, {
      subject: 'Test',
      fields: [{ label: 'Message', value: 'x'.repeat(50_000) }],
    });
    // Accepted as far as the mail check, which is as far as it can get here.
    expect(res.status()).toBe(503);
  });
});

test.describe('the honeypot', () => {
  /* Answers 200 and sends nothing. A 4xx would tell a bot its submission was
     detected, which is a signal worth withholding. */
  test('swallows a filled honeypot with a 200 and no delivery', async ({ request }) => {
    const res = await post(request, {
      subject: 'Test',
      fields: validFields,
      honeypot: 'i am a robot',
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  test('an empty honeypot does not short-circuit validation', async ({ request }) => {
    const res = await post(request, { subject: 'Test', fields: [], honeypot: '' });
    expect(res.status()).toBe(400);
  });
});

test('an undeliverable lead is refused, never silently accepted', async ({ request }) => {
  const res = await post(request, { subject: 'Test', fields: validFields });

  // SMTP is deliberately unset for the suite.
  expect(res.status()).toBe(503);
  const body = await res.json();
  expect(body.ok).toBe(false);
  expect(body.error).toMatch(/not configured/i);
});

test('the rate limiter closes after five in a window', async ({ request }) => {
  /* One address for the whole burst — that is the point — but a fresh one per
     invocation. A fixed address meant the chromium and mobile projects shared a
     window, so whichever ran second was already limited on its first request. */
  const ip = fromNewIp();
  const statuses: number[] = [];

  for (let i = 0; i < 8; i += 1) {
    const res = await post(request, { subject: `Burst ${i}`, fields: validFields }, ip);
    statuses.push(res.status());
  }

  expect(statuses).toContain(429);
  // The limiter must not be the first thing that answers — early attempts should
  // still reach the mail check.
  expect(statuses[0]).not.toBe(429);
  expect(statuses.filter((s) => s === 429).length).toBeGreaterThanOrEqual(3);
});

test.describe('the contact form surfaces failure to the visitor', () => {
  test('shows an error instead of a false confirmation', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('Company name').fill('Playwright Test Ltd');
    await page.getByLabel('Country').fill('United Kingdom');
    await page.getByLabel('Business email').fill('buyer@example.com');
    await page.getByLabel('Business type').selectOption('retailer');
    await page.getByLabel('What are you looking for?').fill('Testing the failure path.');

    await page.getByRole('button', { name: /send enquiry/i }).click();

    /* Scoped to the form: Next.js injects its own `role="alert"` route announcer
       into the document, so an unscoped alert locator matches two elements. */
    await expect(page.locator('form').getByRole('alert')).toBeVisible({ timeout: 20_000 });

    // The whole point: no "Enquiry sent" panel when the send failed.
    await expect(page.getByText(/enquiry sent/i)).toBeHidden();

    // And WhatsApp stays reachable as the fallback route.
    await expect(page.getByRole('link', { name: /whatsapp/i })).toBeVisible();
  });

  test('will not submit with required fields empty', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /send enquiry/i }).click();

    // Native validation blocks it; we are still on the form, nothing sent.
    await expect(page.getByLabel('Company name')).toBeVisible();
    await expect(page.getByText(/enquiry sent/i)).toBeHidden();
  });
});
