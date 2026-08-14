import { defineConfig, devices } from '@playwright/test';

/**
 * The suite starts its own dev server on 4029 so it never collides with a
 * developer's own on 4028.
 *
 * The env below is the important part. It pins a known access code so the gate
 * can be exercised without anyone's real one, pins a known secret so signed
 * cookies are reproducible, and — deliberately — blanks every SMTP variable.
 * Next.js does not overwrite variables already present in `process.env`, so
 * these win over `.env.local` and the suite physically cannot send mail through
 * a real account. The enquiry tests assert the unconfigured contract instead.
 */
const PORT = 4029;

export const TEST_ACCESS_CODE = 'playwright-test-code';
export const TEST_ACCESS_SECRET = 'playwright-test-secret-at-least-32-characters-long';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    /*
     * Pixel 7 rather than iPhone 14: the iPhone descriptors run on WebKit, which
     * would mean a second ~100 MB browser download in CI for no extra coverage
     * here. Nothing in these flows is engine-specific — they exercise redirects,
     * cookies and form submission — so a Chromium-based phone profile tests the
     * viewport and touch behaviour at a fraction of the setup cost.
     */
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    /*
     * A production build, not `next dev`.
     *
     * Dev mode re-evaluates route handler modules between requests, which resets
     * the enquiry limiter's in-memory window: eight rapid posts all came back 503
     * and the limiter looked broken. Against `next start` the same burst gives
     * five 503s then three 429s — the behaviour that actually ships. Costs about
     * forty seconds of build on a cold run, and tests the real artefact.
     */
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      ACCESS_CODES: TEST_ACCESS_CODE,
      ACCESS_SECRET: TEST_ACCESS_SECRET,
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      // Blanked on purpose — see above. Never point the suite at a real mailbox.
      SMTP_HOST: '',
      SMTP_USER: '',
      SMTP_PASS: '',
      MAIL_FROM: '',
    },
  },
});
