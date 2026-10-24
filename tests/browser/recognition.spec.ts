import { test, expect } from '@playwright/test';

test('recognition shares the real badge, contest proof and leadership session across pages', async ({ page, request }) => {
  let badgeSource: string | null = null;
  for (const route of ['/', '/about/', '/open-source/']) {
    await page.goto(route);
    const badge = page.locator('[data-recognition="hacktoberfest-2026"]');
    await expect(badge.getByRole('heading')).toHaveText('Hacktoberfest 2026 — Completionist');
    await expect(badge).toContainText('all three Hacktoberfest 2026 milestones');
    const image = badge.getByRole('img');
    await expect(image).toHaveAttribute('alt', /Completionist badge, earned by Tanzil Ahmed/);
    const source = await image.getAttribute('src');
    if (badgeSource) expect(source).toBe(badgeSource); else badgeSource = source;
    await expect(badge.getByRole('link', { name: 'DEV profile' })).toHaveAttribute('href', 'https://dev.to/tanzil_ahmed_e6a826eee8c4');
    const proof = (await badge.getByRole('link', { name: 'View badge' }).getAttribute('href'))!;
    const response = await request.get(proof);
    expect(response.status()).toBe(200); expect(response.headers()['content-type']).toContain('image/webp');
    if (route !== '/open-source/') {
      const ycpc = page.locator('[data-recognition="ycpc-2025"]');
      await expect(ycpc.getByRole('heading')).toHaveText('YCPC Grand Finale 2k25 — 3rd place');
      await expect(ycpc).toContainText('2025');
      await expect(ycpc).toContainText('HackerRank');
      const leaderboard = (await ycpc.getByRole('link', { name: 'View leaderboard' }).getAttribute('href'))!;
      expect((await request.get(leaderboard)).status()).toBe(200);
    }
    if (route === '/') {
      await expect(page.locator('.recognition-grid > article')).toHaveCount(4);
      await expect(page.locator('.beyond-stories')).toContainText('Former President of Faizur Rahman Ideal Institute Debating Club (2022–23 session)');
    }
  }
  await page.goto('/beyond/');
  await expect(page.locator('#debate .activity-prose')).toContainText('served as its President for the 2022–23 session');
});

test('desktop footer centers copyright independently while mobile keeps the identity stack', async ({ page }) => {
  for (const theme of ['dark', 'light']) for (const width of [320, 390, 800, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/contact/');
    await page.evaluate((theme) => { document.documentElement.dataset.theme = theme; }, theme);
    const footer = page.locator('.site-footer'); await footer.scrollIntoViewIfNeeded();
    const bounds = (await page.locator('.footer-bottom').boundingBox())!;
    const logo = (await page.locator('.footer-wordmark').boundingBox())!;
    const signoff = (await page.locator('.footer-signoff').boundingBox())!;
    const social = (await page.locator('.footer-bottom > .social-links').boundingBox())!;
    if (width >= 800) {
      expect(Math.abs(signoff.x + signoff.width / 2 - (bounds.x + bounds.width / 2))).toBeLessThan(1);
      expect(logo.x + logo.width).toBeLessThan(signoff.x);
      expect(signoff.x + signoff.width).toBeLessThan(social.x);
    } else {
      expect(Math.abs(logo.x - signoff.x)).toBeLessThan(1);
      expect(signoff.y).toBeGreaterThan(logo.y + logo.height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/');
  expect((await page.locator('.site-footer').boundingBox())!.height).toBeLessThan(400);
});
