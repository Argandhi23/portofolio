import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/track', (route) => route.fulfill({ json: { tracked: false } }));
});
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`reduced-motion archive and keyboard lightbox at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/projects');
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/audit-archive-${viewport.width}.png` });
    await page.goto('/projects/alparfume');
    const trigger = page.getByRole('button', { name: /Zoom image/i }).first();
    await trigger.focus(); await page.keyboard.press('Enter');
    const close = page.getByRole('button', { name: 'Close image preview' });
    await expect(close).toBeFocused();
    await page.keyboard.press('Tab'); await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab'); await expect(close).toBeFocused();
    await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  });
}
test('reduced-motion desktop keeps every featured card within the viewport width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const cards = page.locator('[data-gsap-project-card]');
  expect(await cards.count()).toBeGreaterThan(1);
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1441);
  }
});
test('protected endpoints and recovery form reject unauthenticated requests', async ({ request }) => {
  expect((await request.get('/api/keep-alive')).status()).toBe(401);
  expect((await request.post('/api/revalidate')).status()).toBe(401);
  expect((await request.get('/auth/callback', { maxRedirects: 0 })).headers().location).toContain('/login?recovery=invalid');
  const reset = await request.get('/reset-password');
  expect(reset.url()).toContain('/login');
});

test('unknown or malformed URL fragments do not break the hero controller', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const hash of ['#[', '#%']) {
    await page.goto(`/${hash}`);
    await expect(page.locator('#about')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.heroPortal)).toBe('about');
  }
  expect(errors).toEqual([]);
});

test('clipboard rejection reports failure rather than claiming success', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Denied')) }, configurable: true });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contact');
  const copy = page.getByTitle('Copy email').first();
  await copy.click();
  await expect(copy).toContainText('Copy failed');
});
