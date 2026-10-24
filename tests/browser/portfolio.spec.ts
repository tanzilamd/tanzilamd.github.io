import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/work/', '/open-source/', '/about/', '/beyond/', '/notes/', '/notes/grandmas-xbox/', '/contact/', '/work/tuktak/', '/work/choreseed/', '/play/'];
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
  await expect(page.locator('[data-item]:visible').getByRole('heading', { level: 2 })).toHaveText(['ScopeProof', 'Choreseed']);
  await page.getByRole('link', { name: 'Explore ScopeProof', exact: true }).click();
  await expect(page.locator('h1')).toContainText('ScopeProof');
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Tool', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-item]:visible')).toHaveCount(2);
  await page.goto('/work/?category=not-a-category');
  await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-item]:visible')).toHaveCount(6);
});

test('contribution filters distinguish resource work and personal-fork infrastructure', async ({ page }) => {
  await page.goto('/open-source/');
  await page.getByRole('button', { name: 'Infrastructure', exact: true }).click();
  await expect(page.locator('[data-item]:visible')).toHaveCount(1);
  await expect(page.locator('[data-item]:visible')).toContainText('Personal fork');
  await expect(page.locator('[data-item]:visible .pr-link')).toHaveAttribute('href', 'https://github.com/tanzilamd/tabbycat/pull/1');
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
  test.setTimeout(240_000);
  const allRoutes = [...routes, '/play/playground/', '/play/drawing-pad/', '/play/do-not-press/', '/play/tic-tac-toe/', '/play/stack-tower/', '/play/snake/', '/play/dino-run/', '/play/aim-trainer/', '/work/scopeproof/', '/work/engjatra/', '/work/cargotab/', '/work/tanzilbot/', '/404.html'];
  for (const width of [320, 360, 390, 768, 800, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['dark', 'light']) {
      for (const route of allRoutes) {
        await page.goto(route);
        await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} at ${width}px in ${theme}`).toBe(true);
        const clipped = await page.locator('.tuktak-name, .scope-word, .eng-word, .chore-word, .archive-word').evaluateAll((nodes) => nodes.filter((node) => {
          const range = document.createRange(); range.selectNodeContents(node);
          const text = range.getBoundingClientRect();
          const cover = node.closest('.project-art')!.getBoundingClientRect();
          return text.left < cover.left - 1 || text.right > cover.right + 1;
        }).map((node) => node.textContent));
        expect(clipped, `Project title clipped on ${route} at ${width}px in ${theme}`).toEqual([]);
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
  await expect(page.locator('[data-item]:visible')).toHaveCount(11);
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

test('writing distinguishes local posts and external articles and preserves the list filter', async ({ page }) => {
  await page.goto('/notes/');
  await page.getByRole('button', { name: 'On this site', exact: true }).click();
  await expect(page.locator('[data-item]:visible')).toHaveCount(1);
  await page.getByRole('link', { name: 'Read essay', exact: true }).click();
  await expect(page).toHaveURL('/notes/grandmas-xbox/');
  await expect(page.locator('.article-byline time')).toHaveAttribute('datetime', '2026-10-23');
  await expect(page.getByRole('complementary', { name: 'About this piece' })).toContainText('2024');
  await expect(page.locator('.article-prose')).toContainText('Grandma’s Xbox and an old PC.');
  await page.goBack();
  await expect(page.getByRole('button', { name: 'On this site', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Elsewhere', exact: true }).click();
  const external = page.locator('[data-item]:visible');
  await expect(external).toHaveCount(1);
  await expect(external.getByRole('link', { name: 'Read on DEV Community', exact: true })).toHaveAttribute('target', '_blank');
  await expect(external.getByRole('link', { name: 'Read on DEV Community', exact: true })).toHaveAttribute('href', /dev\.to\//);
});

test('original writing remains readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/notes/');
  await expect(page.locator('[data-item]:visible')).toHaveCount(2);
  await page.getByRole('link', { name: 'Read essay', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Grandma’s Xbox');
  await expect(page.locator('.article-prose')).toContainText('console.log');
  await expect(page.locator('[data-copy-link]')).toBeHidden();
  await context.close();
});

for (const theme of ['dark', 'light']) {
  test(`${theme}: activity photos have an accessible keyboard viewer and return focus`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('offscript-theme', value), theme);
    await page.goto('/beyond/');
    const photos = await page.locator('[data-photo-link]').evaluateAll((links) => links.map((link) => ({ caption: (link as HTMLElement).dataset.photoCaption, demo: (link as HTMLElement).dataset.photoDemo === 'true' })));
    test.skip(photos.length === 0, 'No activity photos are published.');
    const opener = page.locator('[data-photo-link]').first();
    await opener.click();
    const viewer = page.getByRole('dialog');
    await expect(viewer).toBeVisible();
    await expect(viewer.locator('[data-photo-counter]')).toHaveText(`Photo 1 of ${photos.length}`);
    if (photos[0].demo) await expect(viewer.locator('[data-photo-demo-label]')).toBeVisible();
    else await expect(viewer.locator('[data-photo-demo-label]')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Close photo', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: photos.length > 1 ? 'Next photo' : 'Close photo', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Close photo', exact: true })).toBeFocused();
    // Decode first: the viewer starts its caption transition after the image resolves.
    await viewer.locator('[data-photo-image]').evaluate((image) => (image as HTMLImageElement).decode());
    await viewer.evaluate(async (dialog) => { await Promise.all(dialog.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))); });
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
    expect(accessibility.violations).toEqual([]);
    if (photos.length > 1) {
      await page.getByRole('button', { name: 'Next photo', exact: true }).click();
      await expect(viewer.locator('[data-photo-caption]')).toHaveText(photos[1].caption!);
      await expect(viewer.locator('[data-photo-counter]')).toHaveText(`Photo 2 of ${photos.length}`);
      await page.keyboard.press('ArrowLeft');
      await expect(viewer.locator('[data-photo-counter]')).toHaveText(`Photo 1 of ${photos.length}`);
      await page.getByRole('button', { name: 'Previous photo', exact: true }).click();
      await expect(viewer.locator('[data-photo-counter]')).toHaveText(`Photo ${photos.length} of ${photos.length}`);
    } else await expect(viewer.locator('[data-photo-controls]')).toBeHidden();
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(page.locator('html')).not.toHaveClass(/photo-viewer-open/);
  });
}

test('Home activity preview leads to its selected photo section', async ({ page }) => {
  await page.goto('/');
  const preview = page.locator('.activity-photo-preview');
  test.skip(await preview.count() === 0, 'No Home photo preview is selected.');
  const link = preview.getByRole('link');
  const destination = (await link.getAttribute('href'))!;
  if (await preview.locator('.photo-demo-badge').count()) await expect(link).toHaveAccessibleName(/demo/i);
  await link.click();
  await expect(page).toHaveURL(destination);
  await expect(page.locator(`${new URL(destination, 'https://example.com').hash} .activity-gallery`)).toBeVisible();
});

test('mobile photo viewer fits the screen and closes with its button or backdrop', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/beyond/');
  const count = await page.locator('[data-photo-link]').count();
  test.skip(count === 0, 'No activity photos are published.');
  await page.locator('[data-photo-link]').first().click();
  const viewer = page.getByRole('dialog');
  await expect(viewer).toBeVisible();
  expect(await viewer.evaluate((node) => { const bounds = node.getBoundingClientRect(); return bounds.left >= 0 && bounds.top >= 0 && bounds.right <= window.innerWidth && bounds.bottom <= window.innerHeight; })).toBe(true);
  if (count > 1) {
    await page.getByRole('button', { name: 'Next photo', exact: true }).click();
    await expect(viewer.locator('[data-photo-counter]')).toHaveText(`Photo 2 of ${count}`);
  }
  await page.getByRole('button', { name: 'Close photo', exact: true }).click();
  await expect(viewer).toBeHidden();
  await page.locator('[data-photo-link]').first().click();
  await page.mouse.click(2, 2);
  await expect(viewer).toBeHidden();
});

test('activity photo captions and full-image links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/beyond/');
  const links = page.locator('[data-photo-link]');
  test.skip(await links.count() === 0, 'No activity photos are published.');
  const caption = await links.first().getAttribute('data-photo-caption');
  const destination = await links.first().getAttribute('href');
  await expect(page.locator('.activity-photo figcaption').first()).toContainText(caption!);
  await links.first().click();
  await expect(page).toHaveURL(destination!);
  await context.close();
});
