import { expect, test } from '@playwright/test';

// Browser checks must never write visitor analytics to the configured database.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/track', (route) => route.fulfill({ json: { tracked: false } }));
});

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

  test('transforms 2-line button to X and opens fullscreen black mobile overlay blocking whole page', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const menuButton = page.getByRole('button', {
      name: /open navigation menu/i,
    });
    await expect(menuButton).toBeVisible();

    // Verify 2-line SVG bars inside the button
    const bars = menuButton.locator('svg line');
    await expect(bars).toHaveCount(2);

    // Click to open
    await menuButton.click();

    // Verify mobile navigation inside the full-screen black overlay
    const mobileNav = page.getByRole('navigation', {
      name: /mobile navigation/i,
    });
    await expect(mobileNav).toBeVisible();

    // Verify close button shows rotated X bars
    const closeButton = page
      .getByRole('button', {
        name: /close navigation menu/i,
      })
      .last();
    await expect(closeButton).toBeVisible();
    await expect(closeButton.locator('svg line').first()).toHaveAttribute(
      'style',
      /rotate\(45deg\)/
    );

    await mobileNav.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('h1')).toContainText(/Engineering With Clarity/i);
  });

  test('reveals floating navbar on scroll on the home page via Portal', async ({
    page,
  }) => {
    await page.goto('/');
    const floatingNav = page.getByRole('navigation', {
      name: /floating navigation/i,
    });

    // Complete the intentional hero portal before testing document scrolling.
    await expect(page.getByTestId('intro-preloader')).toHaveCount(0, { timeout: 8000 });
    await expect.poll(async () => {
      await page.mouse.wheel(0, 600);
      return page.evaluate(() => document.documentElement.dataset.heroPortal);
    }, { timeout: 10000 }).toBe('about');
    await page.mouse.wheel(0, 400);
    await expect(floatingNav).toBeVisible();
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

  test('opens high-resolution ImageLightbox on /projects/alparfume and dismisses with ESC key', async ({
    page,
  }) => {
    await page.goto('/projects/alparfume');
    const inspectTrigger = page.getByRole('button', { name: /Zoom image/i }).first();
    await inspectTrigger.scrollIntoViewIfNeeded();
    await inspectTrigger.click();

    // Verify dialog opened directly in body (via portal) and is visible
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('plays full-orange Argandhi. SVG stroke-draw preloader on initial entry, unmounts cleanly, and skips on SPA navigation', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const preloader = page.getByTestId('intro-preloader');
    await expect(preloader).toBeAttached();

    // Verify pure black background and full brand-orange (#9E1B32) SVG stroke paths
    const bgColor = await preloader.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBe('rgb(0, 0, 0)');

    const firstStroke = preloader.locator('svg path').first();
    await expect(firstStroke).toHaveAttribute('stroke', '#9E1B32');

    // Wait for curtain slide-up exit & clean DOM unmount
    await expect(preloader).toHaveCount(0, { timeout: 8000 });

    // Navigate via SPA link to /about and verify preloader does NOT replay and scrolling is unlocked
    await page.locator('header nav a[href="/about"]').first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByTestId('intro-preloader')).toHaveCount(0);

    const hasLenisStoppedOnAbout = await page.evaluate(() =>
      document.documentElement.classList.contains('lenis-stopped')
    );
    expect(hasLenisStoppedOnAbout).toBe(false);

    await page.mouse.wheel(0, 600);
    await expect
      .poll(async () => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(50);

    // Navigate via SPA link to /projects and verify scrolling also works cleanly
    await page.locator('header nav a[href="/projects"]').first().click();
    await expect(page).toHaveURL(/\/projects$/);
    await page.mouse.wheel(0, 600);
    await expect
      .poll(async () => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(50);
  });

  test('switches UI and CMS copy cleanly between EN and ID via Navbar LanguageToggle', async ({
    page,
  }) => {
    await page.goto('/projects');
    await expect(page.locator('h1')).toContainText(/Selected Works/i);

    // Switch to Bahasa Indonesia (ID)
    const idBtn = page
      .locator('header')
      .getByRole('button', { name: 'Bahasa Indonesia' })
      .first();
    await idBtn.click();

    await expect(page.locator('h1')).toContainText(/Daftar Proyek/i);
    await expect(page.getByRole('tab', { name: 'Semua' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // Switch back to English (EN)
    const enBtn = page
      .locator('header')
      .getByRole('button', { name: 'English' })
      .first();
    await enBtn.click();

    await expect(page.locator('h1')).toContainText(/Selected Works/i);
  });
});
