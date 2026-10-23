import { test, expect } from '@playwright/test';
import profile from '../../src/data/profile.json' with { type: 'json' };

test('the first-visit typing preserves the accessible headline and its layout, then skips on return', async ({ page }) => {
  await page.goto('/');
  const heading = page.getByRole('heading', { name: `${profile.headline} ${profile.headlineAccent}`, exact: true });
  await expect(heading).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const before = await heading.boundingBox();
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'done');
  await expect(page.locator('[data-type-line][data-typed="true"]')).toHaveCount(2);
  expect(await heading.boundingBox()).toEqual(before);
  await expect(page.locator('[data-type-text]')).toHaveText([profile.headline, profile.headlineAccent]);
  await expect(page.locator('.hero-type-caret:visible')).toHaveCount(0);
  await page.reload();
  expect(await page.locator('html').getAttribute('data-intro')).toBeNull();
  await expect(heading).toBeVisible();
});

test('reduced motion skips the opening and still lets every gallery image work', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('html').getAttribute('data-intro')).toBeNull();
  expect(await page.locator('[data-type-text]').first().evaluate((element) => getComputedStyle(element).clipPath)).toBe('none');
  await page.goto('/beyond/');
  await page.locator('[data-photo-link]').first().click();
  await page.locator('[data-photo-next]').click();
  await expect(page.locator('[data-photo-counter]')).toContainText('Photo 2 of');
  await expect.poll(() => page.locator('[data-photo-image]').evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length)).toBe(0);
});

test('changing motion preference during the opening immediately reveals all text', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'done');
  await expect(page.locator('.hero-type-caret:visible')).toHaveCount(0);
  expect(await page.locator('[data-type-text]').last().evaluate((element) => getComputedStyle(element).clipPath)).toBe('none');
});

test('the opening fails open when the enhancement script cannot load', async ({ page }) => {
  await page.route('**/_astro/*.js', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'done');
  expect(await page.locator('[data-type-text]').last().evaluate((element) => getComputedStyle(element).clipPath)).toBe('none');
  await expect(page.getByRole('link', { name: 'View projects', exact: true })).toBeVisible();
});

test('missing motion APIs or session storage never hide content or break navigation', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage blocked'); } });
    delete (window as unknown as Record<string, unknown>).IntersectionObserver;
  });
  await page.goto('/');
  expect(await page.locator('html').getAttribute('data-intro')).toBeNull();
  await expect(page.locator('.featured-grid h3')).toHaveCount(4);
  await page.getByRole('link', { name: 'All writing', exact: true }).click();
  await expect(page).toHaveURL('/notes/');
});

test('reading progress follows the essay and remains hidden without JavaScript', async ({ page, browser }) => {
  await page.goto('/notes/grandmas-xbox/');
  const progress = page.locator('[data-reading-progress]');
  await expect(progress).toBeVisible();
  expect(await progress.evaluate((element) => element.style.getPropertyValue('--reading-progress'))).toBe('0');
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => progress.evaluate((element) => Number(element.style.getPropertyValue('--reading-progress')))).toBe(1);
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage();
    await noJs.goto('http://127.0.0.1:4321/notes/grandmas-xbox/');
    await expect(noJs.locator('[data-reading-progress]')).toBeHidden();
    await expect(noJs.locator('.article-prose')).toContainText('Grandma’s Xbox');
    await noJs.goto('http://127.0.0.1:4321/');
    expect(await noJs.locator('[data-type-text]').first().evaluate((element) => getComputedStyle(element).clipPath)).toBe('none');
  } finally { await context.close(); }
});

test('rapid gallery navigation finishes on the latest photo and caption', async ({ page }) => {
  await page.goto('/beyond/');
  const links = page.locator('[data-photo-link]');
  const expectedSource = await links.nth(1).getAttribute('href');
  const expectedCaption = await links.nth(1).getAttribute('data-photo-caption');
  await links.first().click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-photo-image]')).toHaveAttribute('src', new URL(expectedSource!, page.url()).href);
  await expect(page.getByRole('dialog').locator('[data-photo-caption]')).toHaveText(expectedCaption!);
  await expect.poll(() => page.locator('[data-photo-image]').evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(links.first()).toBeFocused();
});

test('reaching a project with keyboard focus never fades the focused group', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('.featured-grid .cover-link').first();
  await link.focus();
  await expect(link).toBeFocused();
  // Allow the viewport observer to process the scroll caused by focus.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const focusedAnimations = await page.evaluate(() => document.getAnimations().filter((animation) => {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    return target instanceof Element && target.contains(document.activeElement) && animation.playState === 'running';
  }).length);
  expect(focusedAnimations).toBe(0);
});
