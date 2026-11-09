import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/track', (route) => route.fulfill({ json: { tracked: false } }));
});

for (const viewport of [
  { width: 1440, reducedMotion: 'no-preference' },
  { width: 390, reducedMotion: 'no-preference' },
  { width: 1440, reducedMotion: 'reduce' },
] as const) {
  for (const section of ['services', 'contact']) {
    test(`Projects to ${section} reaches the section at ${viewport.width}px (${viewport.reducedMotion})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width: viewport.width, height: 900 });
      await page.emulateMedia({ reducedMotion: viewport.reducedMotion });
      await page.goto('/projects');
      await expect(page.getByTestId('intro-preloader')).toHaveCount(0, { timeout: 15000 });
      if (viewport.width < 768) {
        await page.getByRole('button', { name: 'Open navigation menu' }).click();
      }
      const nav = page.getByRole('navigation', { name: viewport.width < 768 ? 'Mobile navigation' : 'Primary navigation', exact: true });
      await nav.getByRole('link', { name: section === 'services' ? 'Services' : 'Contact', exact: true }).click();
      await expect(page).toHaveURL(`/#${section}`);
      const target = page.locator(`#${section}`);
      await expect.poll(() => target.evaluate((element) => Math.abs(element.getBoundingClientRect().top - 24))).toBeLessThan(3);

      // A direct hash load must also account for the desktop gallery's pin spacing.
      await page.reload();
      await expect(page.getByTestId('intro-preloader')).toHaveCount(0, { timeout: 15000 });
      await expect.poll(() => target.evaluate((element) => Math.abs(element.getBoundingClientRect().top - 24))).toBeLessThan(3);
      expect(errors).toEqual([]);
    });
  }
}
