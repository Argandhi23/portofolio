import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/track', (route) =>
    route.fulfill({ json: { tracked: false } })
  );
});

test('4-pose SVG bust turns smoothly across scroll scrub, dives through right eye, and exits back to hero', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const preloader = page.getByTestId('intro-preloader');
  if ((await preloader.count()) > 0) {
    await preloader.click();
    await expect(preloader).toHaveCount(0, { timeout: 6000 });
  }

  const rigSvg = page.locator('svg[data-rig-version="v6-sculpted-4pose-spline"]');
  await expect(rigSvg).toBeVisible({ timeout: 8000 });

  // Frame 0: 90° Side profile (t = 0)
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/svg-00-side.png' });

  // Frame 1: Quarter turn (t ~ 0.27)
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(450);
  await page.screenshot({ path: 'test-results/svg-25-turn.png' });

  // Frame 2: Three-quarter view (t ~ 0.6)
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(450);
  await page.screenshot({ path: 'test-results/svg-60-three-quarter.png' });

  // Frame 3: Near front view with glowing eyes (t ~ 0.9)
  await page.mouse.wheel(0, 85);
  await page.waitForTimeout(450);
  await page.screenshot({ path: 'test-results/svg-90-front.png' });

  // Complete Phase 2 eye dive into #about (#F5F0EB)
  await expect
    .poll(
      async () => {
        await page.mouse.wheel(0, 160);
        return page.evaluate(() => document.documentElement.dataset.heroPortal);
      },
      { timeout: 10000 }
    )
    .toBe('about');
  await page.waitForTimeout(200);

  // Exit back up out of eye portal -> Hero restored cleanly
  await expect
    .poll(
      async () => {
        await page.mouse.wheel(0, -120);
        return page.evaluate(() => document.documentElement.dataset.heroPortal);
      },
      { timeout: 10000 }
    )
    .toBe('hero');

  expect(errors).toEqual([]);
});

test('SVG bust renders cleanly under prefers-reduced-motion: reduce', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByTestId('intro-preloader')).toHaveCount(0, {
    timeout: 8000,
  });
  await expect(
    page.locator('svg[data-rig-version="v6-sculpted-4pose-spline"]')
  ).toBeVisible();
  await expect(page.locator('#about')).toBeVisible();
  expect(errors).toEqual([]);
});
