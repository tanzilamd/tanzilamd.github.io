import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/work/', '/open-source/', '/about/', '/beyond/', '/notes/', '/contact/', '/work/tuktak/', '/work/choreseed/'];
for (const theme of ['dark', 'light']) {
  for (const route of routes) {
    test(`${theme}: ${route} is accessible and renders without failed local assets`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('response', (response) => { if (response.url().startsWith('http://127.0.0.1:4321') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      await page.addInitScript((value) => localStorage.setItem('offscript-theme', value), theme);
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('h1')).toHaveCount(1);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
      expect(results.violations).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test('the selected-work journey preserves theme and shows the right priorities', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.featured-grid h3')).toHaveText(['Tuktak', 'ScopeProof', 'EngJatra', 'Choreseed']);
  await expect(page.locator('.hero')).not.toContainText('Cargotab');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.getByRole('link', { name: 'Explore Tuktak', exact: true }).click();
  await expect(page).toHaveURL('/work/tuktak/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('link', { name: 'Visit Tuktak' })).toHaveAttribute('href', 'https://tuktakbd.vercel.app/');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('work filters are shareable and survive navigation back from a case study', async ({ page }) => {
  await page.goto('/work/');
  await page.getByRole('button', { name: 'Tool', exact: true }).click();
  await expect(page).toHaveURL('/work/?category=Tool');
  await expect(page.locator('[data-item]:visible h3')).toHaveText(['ScopeProof', 'Choreseed']);
  await page.getByRole('link', { name: 'Explore ScopeProof', exact: true }).click();
  await expect(page.locator('h1')).toContainText('ScopeProof');
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Tool', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-item]:visible')).toHaveCount(2);
  await page.goto('/work/?category=not-a-category');
  await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-item]:visible')).toHaveCount(6);
});

test('contribution filters distinguish organization and personal-fork work', async ({ page }) => {
  await page.goto('/open-source/');
  await page.getByRole('button', { name: 'Infrastructure', exact: true }).click();
  await expect(page.locator('[data-item]:visible')).toHaveCount(1);
  await expect(page.locator('[data-item]:visible')).toContainText('Personal fork');
  await expect(page.locator('[data-item]:visible .pr-link')).toHaveAttribute('href', 'https://github.com/tanzilamd/tabbycat/pull/1');
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(page.locator('[data-item]:visible')).toContainText('Organization');
  await page.getByRole('button', { name: 'Resources', exact: true }).click();
  await expect(page.locator('[data-item]:visible')).toHaveCount(8);
});

test('a published website contribution has source evidence without an invented pull request', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.contribution-preview').first()).toHaveAttribute('href', 'https://tabbycat-debate.org/tabbycat/');
  await page.goto('/open-source/');
  const spotlight = page.getByRole('region', { name: 'Tabbycat software website', exact: true });
  await expect(spotlight.getByRole('link', { name: 'Visit website', exact: true })).toHaveAttribute('href', 'https://tabbycat-debate.org/tabbycat/');
  await expect(spotlight.getByRole('link', { name: 'View source code', exact: true })).toHaveAttribute('href', 'https://github.com/tanzilamd/tc');
  await expect(spotlight.getByRole('link', { name: 'Official integration', exact: true })).toHaveAttribute('href', 'https://github.com/TabbycatDebate/tabbycatdebate.github.io/commit/aff7c01965bc775d38e0575b5176753b2e812624');
  await page.getByRole('button', { name: 'Website', exact: true }).click();
  const row = page.locator('[data-item]:visible');
  await expect(row).toHaveCount(1);
  await expect(row.locator('.merge-status')).toHaveText('Published');
  await expect(row.locator('.pr-link')).toHaveCount(0);
});

test('mobile menu supports keyboard, escape and route navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menuButton = page.locator('[data-menu-toggle]');
  await menuButton.click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation', exact: true })).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press('Tab');
  await expect(page.locator('#mobile-nav a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menuButton).toBeFocused();
  await expect(page.locator('#mobile-nav')).toBeHidden();
  await menuButton.click();
  await page.locator('#mobile-nav').getByRole('link', { name: 'Open source', exact: true }).click();
  await expect(page).toHaveURL('/open-source/');
  await expect(page.locator('#mobile-nav')).toBeHidden();
});

test('responsive layouts fit both themes at representative widths', async ({ page }) => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['dark', 'light']) {
      for (const route of ['/', '/work/', '/open-source/', '/work/scopeproof/', '/about/', '/beyond/', '/notes/', '/contact/']) {
        await page.goto(route);
        await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} at ${width}px in ${theme}`).toBe(true);
      }
    }
  }
});

test('essential mobile navigation and all work remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/work/');
  await expect(page.locator('[data-item]:visible')).toHaveCount(6);
  await expect(page.locator('[data-filter-bar]')).toBeHidden();
  await expect(page.locator('.fallback-nav')).toBeVisible();
  await page.locator('.fallback-nav').getByRole('link', { name: 'Open source' }).click();
  await expect(page.locator('[data-item]:visible')).toHaveCount(12);
  await expect(page.locator('h1')).toContainText('contributions');
  await context.close();
});

test('blocked local storage has a working theme fallback', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } }); });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('the error page offers a route back to the work', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('h1')).toContainText('found');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await page.getByRole('link', { name: 'View projects', exact: true }).click();
  await expect(page).toHaveURL('/work/');
});
