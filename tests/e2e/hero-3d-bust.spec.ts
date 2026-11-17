import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/track', (route) =>
    route.fulfill({ json: { tracked: false } })
  );
});

test('renders interactive R3F 3D sculpted bust, turns cleanly on scroll, dives through right eye, and exits back to hero', async ({
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

  // Fast-skip intro preloader cleanly
  const preloader = page.getByTestId('intro-preloader');
  if ((await preloader.count()) > 0) {
    await preloader.click();
    await expect(preloader).toHaveCount(0, { timeout: 6000 });
  }

  // Wait for WebGL 3D bust to finish initializing
  const rigStage = page.locator('[data-rig-version="v6-r3f-sculpted-3d"]');
  await expect(rigStage).toHaveAttribute('data-rig-ready', 'true', {
    timeout: 12000,
  });
  await expect(rigStage.locator('canvas')).toBeVisible();

  // Wait a moment for first R3F frame render
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'test-results/hero-3d-01-side-profile.png' });

  // Phase 1 partial scroll: 3/4 turn (multiple wheel steps since single wheel delta is clamped)
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(80);
  await page.mouse.wheel(0, 120);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const sec = document.querySelector<HTMLElement>('[data-gp-motion]');
        return Number.parseFloat(
          sec?.style.getPropertyValue('--gp-head-turn') || '0'
        );
      })
    )
    .toBeGreaterThan(0.35);
  await page.waitForTimeout(350);
  await page.screenshot({ path: 'test-results/hero-3d-02-three-quarter.png' });

  // Phase 1 near-front: eyes glowing just before eye dive
  await page.mouse.wheel(0, 90);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const sec = document.querySelector<HTMLElement>('[data-gp-motion]');
        return Number.parseFloat(
          sec?.style.getPropertyValue('--gp-head-turn') || '0'
        );
      })
    )
    .toBeGreaterThan(0.75);
  await page.waitForTimeout(350);
  await page.screenshot({ path: 'test-results/hero-3d-03-front-glow.png' });

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
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'test-results/hero-3d-04-about-portal.png' });

  // Reverse scroll back up out of eye portal -> Hero restored cleanly
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

test('renders static 3D bust cleanly with prefers-reduced-motion: reduce', async ({
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
    page.locator('[data-rig-version="v6-r3f-sculpted-3d"]')
  ).toHaveAttribute('data-rig-ready', 'true', { timeout: 12000 });
  await expect(page.locator('#about')).toBeVisible();
  expect(errors).toEqual([]);
});
