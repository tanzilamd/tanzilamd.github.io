import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const theme of ['dark', 'light']) {
  test(`${theme}: corner surprises stay on the page without moving content or focus`, async ({ page }) => {
    const requests: string[] = [], errors: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript((theme) => localStorage.setItem('offscript-theme', theme), theme);
    await page.goto('/about/');
    const chunk = /\/pocket-effects\.[^/]+\.js/;
    expect(requests.some((url) => chunk.test(url))).toBe(false);
    const button = page.locator('[data-pocket-button]');
    const heading = await page.locator('h1').boundingBox(), position = await button.boundingBox();
    await button.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.pocket-duck')).toHaveCount(1);
    expect(requests.some((url) => chunk.test(url))).toBe(true);
    await expect(button).toBeFocused();
    expect(await page.locator('h1').boundingBox()).toEqual(heading);
    expect(await button.boundingBox()).toEqual(position);
    await expect(page).toHaveURL('/about/');
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(accessibility.violations).toEqual([]);
    await button.click(); await expect(page.locator('.pocket-bubble')).toHaveCount(12);
    await button.click(); await expect(page.locator('.pocket-star')).toHaveCount(12);
    await button.evaluate((button) => { for (let i = 0; i < 35; i++) (button as HTMLButtonElement).click(); });
    expect(await page.locator('[data-pocket-scene] > *').count()).toBeLessThanOrEqual(12);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pocket-scene] > *')).toHaveCount(0);
    await expect(page.locator('[data-pocket-message]')).toBeEmpty();
    expect(errors).toEqual([]);
  });
}

test('corner button and footer fit small screens, and hide behind menu/gallery/drawing focus', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/beyond/');
  const button = page.locator('[data-pocket-button]');
  const fixed = await button.boundingBox();
  await page.locator('.footer-play').scrollIntoViewIfNeeded();
  expect(await button.boundingBox()).toEqual(fixed);
  const card = await page.locator('.footer-play').boundingBox();
  expect(card!.y + card!.height).toBeLessThan(fixed!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('[data-menu-toggle]').click();
  await expect(button).toBeHidden();
  await page.keyboard.press('Escape'); await expect(button).toBeVisible();
  await page.locator('[data-photo-link]').first().click(); await expect(button).toBeHidden();
  await page.keyboard.press('Escape'); await expect(button).toBeVisible();
  await page.goto('/play/drawing-pad/');
  await expect(page.locator('[data-draw-star]')).toBeEnabled();
  await page.locator('[data-draw-canvas]').focus(); await expect(button).toBeHidden();
  await page.keyboard.press('Tab'); await expect(button).toBeHidden();
  await page.locator('[data-play-close]').focus(); await expect(button).toBeVisible();
});

test('reduced-motion corner surprises are static and fully cleaned up', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/contact/');
  await page.locator('[data-pocket-button]').click();
  await expect(page.locator('.pocket-duck')).toHaveCount(1);
  expect(await page.locator('[data-pocket]').evaluate((pocket) => pocket.getAnimations({ subtree: true }).length)).toBe(0);
  await page.locator('[data-pocket-button]').click();
  await expect(page.locator('.pocket-bubble')).toHaveCount(3);
  await expect(page.locator('[data-pocket-message]')).toBeEmpty({ timeout: 5000 });
  await expect(page.locator('[data-pocket-scene] > *')).toHaveCount(0);
});

test('a failed surprise chunk stays recoverable and does not break navigation', async ({ page }) => {
  await page.route('**/pocket-effects.*.js', (route) => route.abort());
  await page.goto('/about/');
  await page.locator('[data-pocket-button]').click();
  await expect(page.locator('[data-pocket-message]')).toContainText('star smile');
  await page.locator('.footer-play').click();
  await expect(page).toHaveURL('/play/');
});
