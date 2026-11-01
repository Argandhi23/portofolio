import { expect, test } from '@playwright/test';

test.describe('Argandhi. Portfolio — Public UX, Motion & Security E2E', () => {
  test('renders landing page sections cleanly with strict security headers and zero console errors', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);

    // Verify HTTP Security Headers
    const headers = response?.headers() ?? {};
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');

    // Verify Hero, Services #01-#04, Selected Works, and Contact Inquiry form
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('#services')).toBeVisible();
    await expect(page.locator('#contact-name')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('opens and navigates via Mobile Obsidian-Glass Drawer on mobile viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const menuButton = page.getByRole('button', {
      name: /open navigation menu/i,
    });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const mobileNav = page.getByRole('navigation', {
      name: /mobile navigation/i,
    });
    await expect(mobileNav).toBeVisible();

    await mobileNav.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('h1')).toContainText(/Engineering With Clarity/i);
  });

  test('supports interactive project filtering on /projects archive page', async ({
    page,
  }) => {
    await page.goto('/projects');
    await expect(page.locator('h1')).toContainText(/Selected Works/i);

    const allTab = page.getByRole('tab', { name: 'All' });
    await expect(allTab).toHaveAttribute('aria-selected', 'true');

    const searchInput = page.getByRole('searchbox', {
      name: /search projects/i,
    });
    await expect(searchInput).toBeVisible();
  });

  test('enforces Defense-in-Depth middleware redirect from /admin to /login when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('reveals FooterBookend "Let\'s Talk." heading and client-navigated /projects/alparfume heading + structured Markdown blocks', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Scroll down to FooterBookend on landing page and verify "Let's Talk." reveals cleanly
    const homeFooterHeading = page.locator('footer h2', {
      hasText: "Let's Talk.",
    });
    await homeFooterHeading.scrollIntoViewIfNeeded();
    await expect(homeFooterHeading).toBeVisible();
    await expect
      .poll(async () =>
        homeFooterHeading.evaluate((el) => getComputedStyle(el.parentElement ?? el).opacity)
      )
      .toBe('1');

    // 2. Scroll to Selected Works and click Al Parfume via client-side navigation while scrolled down
    const alparfumeLink = page.locator('a[href="/projects/alparfume"]').first();
    await alparfumeLink.scrollIntoViewIfNeeded();
    await alparfumeLink.click();

    await expect(page).toHaveURL(/\/projects\/alparfume$/);

    // 3. Verify Hero H1 ("Al Parfume...") is visible & revealed (opacity 1) after scrolled client transition
    const detailHeroTitle = page.locator('h1');
    await expect(detailHeroTitle).toContainText(/Al Parfume/i);
    await expect
      .poll(async () =>
        detailHeroTitle.evaluate((el) => getComputedStyle(el.parentElement ?? el).opacity)
      )
      .toBe('1');

    // 4. Verify Case Study Markdown is parsed into distinct H2 headings, paragraphs, and list items (never merged into a single H2)
    const narrativeHeadings = page.locator('article h2');
    const headingCount = await narrativeHeadings.count();
    expect(headingCount).toBeGreaterThanOrEqual(3);

    const firstNarrativeH2Text = await narrativeHeadings.first().innerText();
    expect(firstNarrativeH2Text).not.toContain('## ');
    expect(firstNarrativeH2Text.length).toBeLessThan(120);

    await expect(page.locator('article ul li').first()).toBeVisible();

    // 5. Scroll to bottom of /projects/alparfume and verify footer "Let's Talk." also reveals
    const detailFooterHeading = page.locator('footer h2', {
      hasText: "Let's Talk.",
    });
    await detailFooterHeading.scrollIntoViewIfNeeded();
    await expect
      .poll(async () =>
        detailFooterHeading.evaluate((el) => getComputedStyle(el.parentElement ?? el).opacity)
      )
      .toBe('1');
  });
});
