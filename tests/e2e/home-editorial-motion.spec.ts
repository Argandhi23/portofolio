import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/track', (route) => route.fulfill({ json: { tracked: false } }));
});

for (const width of [1440, 390]) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`home editorial flow at ${width}px with ${reducedMotion} motion`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error' && /hydration|didn't match|Minified React error/i.test(message.text())) {
          errors.push(message.text());
        }
      });
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion });
      await page.goto('/#about');
      await expect(page.getByTestId('intro-preloader')).toHaveCount(0, { timeout: 8000 });

      const bridge = page.locator('[data-portal-bridge]');
      expect(await bridge.evaluate((element) => element.getBoundingClientRect().height)).toBeLessThanOrEqual(144);
      await bridge.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + scrollY));
      await expect.poll(() => page.locator('[data-bridge-curve]').getAttribute('d')).toBe('M0,0 Q50,0 100,0 L100,100 L0,100 Z');
      await page.screenshot({ path: `test-results/home-bridge-${width}-${reducedMotion}.png` });

      const entries = page.locator('[data-service-entry]');
      expect(await entries.count()).toBeGreaterThan(0);
      for (const entry of await entries.all()) {
        await entry.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + scrollY - innerHeight * 0.2));
        await expect.poll(() => entry.locator('h3').evaluate((element) => {
          const style = getComputedStyle(element);
          return Number(style.opacity) > 0.99 && Math.abs(new DOMMatrixReadOnly(style.transform).m42) < 1;
        })).toBe(true);
      }
      await page.screenshot({ path: `test-results/home-services-${width}-${reducedMotion}.png` });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const lastChar = page.locator('[data-gsap-footer-char]').last();
      await expect.poll(() => lastChar.evaluate((element) => Math.abs(new DOMMatrixReadOnly(getComputedStyle(element).transform).m42))).toBeLessThan(1);
      await expect.poll(() => page.locator('footer [data-gsap-word]').evaluateAll((elements) => elements.every((element) => {
        const style = getComputedStyle(element);
        return Number(style.opacity) > 0.99 && Math.abs(new DOMMatrixReadOnly(style.transform).m42) < 1;
      }))).toBe(true);
      await page.screenshot({ path: `test-results/home-footer-${width}-${reducedMotion}.png` });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      // Changing the OS preference live must restore content, including masked text.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect.poll(() => entries.first().locator('h3').evaluate((element) => getComputedStyle(element).transform)).toBe('none');
      expect(errors).toEqual([]);
    });
  }
}

for (const locale of ['en', 'id']) {
  test(`public pages hydrate cleanly with saved ${locale} locale`, async ({ page }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.addInitScript((language) => localStorage.setItem('argandhi_lang', language), locale);
    for (const route of ['/#about', '/about', '/projects']) {
      await page.goto(route);
      await expect(page.getByTestId('intro-preloader')).toHaveCount(0, { timeout: 15000 });
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('[data-gsap-word].origin-bottom-left').first()).toBeAttached();
    }
    // Return through client navigation, then hard reload the home page as well.
    await page.getByRole('link', { name: 'Argandhi.', exact: true }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('[data-gsap-word].origin-bottom-left').first()).toBeAttached();
    expect(errors).toEqual([]);
  });
}
