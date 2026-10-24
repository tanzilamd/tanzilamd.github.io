import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import copy from '../../src/data/play.json' with { type: 'json' };

async function open(page: Page, activity: string) {
  await page.locator(`[data-play-choice="${activity}"]`).click();
  await expect(page.locator(`[data-play-panel="${activity}"]`)).toBeVisible();
  await expect(page.locator('[data-play-load]')).toBeEmpty();
}
async function alphaAt(page: Page, x: number, y: number) {
  return page.locator('[data-draw-canvas]').evaluate((element, point) => {
    const canvas = element as HTMLCanvasElement;
    return canvas.getContext('2d')!.getImageData(Math.floor(canvas.width * point.x), Math.floor(canvas.height * point.y), 1, 1).data[3];
  }, { x, y });
}

for (const theme of ['dark', 'light']) {
  test(`${theme}: all active Play workspaces have accessible controls`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript((theme) => localStorage.setItem('offscript-theme', theme), theme);
    await page.goto('/play/');
    for (const activity of copy.activities.map((activity) => activity.id)) {
      await open(page, activity);
      await expect(page.locator('h1')).toHaveCount(1);
      if (activity === 'playground') await page.locator('[data-physics-pause]').click();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
      expect(results.violations).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test('Play supports footer discovery, deep links, back navigation and retained artwork', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Take a little break' }).click();
  await expect(page).toHaveURL('/play/');
  await open(page, 'draw');
  await page.getByRole('button', { name: 'Add a star', exact: true }).click();
  const drawing = await page.locator('[data-draw-canvas]').evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  await open(page, 'button');
  await page.goBack();
  await expect(page).toHaveURL('/play/drawing-pad/');
  await expect(page.locator('[data-draw-star]')).toBeEnabled();
  expect(await page.locator('[data-draw-canvas]').evaluate((element) => (element as HTMLCanvasElement).toDataURL())).toBe(drawing);
  await page.locator('[data-play-close]').click();
  await expect(page).toHaveURL('/play/');
  await expect(page.locator('[data-play-choice="draw"]')).toHaveAttribute('href', '/play/drawing-pad/');
  await page.goto('/play/#button');
  await expect(page.locator('[data-press-button]')).toBeEnabled();
});

test('physics can pause, arrange with keyboard, cap shapes and reset under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/play/#playground');
  await expect(page.locator('.physics-shape')).toHaveCount(8);
  await expect(page.locator('[data-physics-pause]')).toBeDisabled();
  const shape = page.locator('.physics-shape').first();
  await shape.focus();
  const before = await shape.boundingBox();
  await page.keyboard.press('ArrowRight');
  const after = await shape.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x);
  await page.locator('[data-physics-add]').evaluate((button) => { for (let index = 0; index < 20; index++) (button as HTMLButtonElement).click(); });
  await expect(page.locator('.physics-shape')).toHaveCount(16);
  await expect(page.locator('[data-physics-add]')).toBeDisabled();
  await page.locator('[data-physics-gravity]').click();
  await expect(page.locator('[data-physics-gravity]')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('[data-physics-reset]').click();
  await expect(page.locator('.physics-shape')).toHaveCount(8);
  const arrangement = await shape.getAttribute('style');
  await page.locator('[data-physics-shuffle]').click();
  expect(await shape.getAttribute('style')).not.toBe(arrangement);
});

test('physics stops on pause, activity changes and offscreen scrolling', async ({ page }) => {
  await page.goto('/play/#playground');
  await expect(page.locator('.physics-shape')).toHaveCount(8);
  const first = page.locator('.physics-shape').first();
  const initial = await first.getAttribute('style');
  await expect.poll(() => first.getAttribute('style')).not.toBe(initial);
  await page.locator('[data-physics-pause]').click();
  const positions = await page.locator('.physics-shape').evaluateAll((elements) => elements.map((element) => (element as HTMLElement).style.transform));
  await page.waitForTimeout(120);
  expect(await page.locator('.physics-shape').evaluateAll((elements) => elements.map((element) => (element as HTMLElement).style.transform))).toEqual(positions);
  await page.locator('[data-physics-pause]').click();
  await page.setViewportSize({ width: 1280, height: 360 });
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => page.locator('[data-physics-stage]').evaluate((stage) => stage.getBoundingClientRect().bottom)).toBeLessThan(0);
  await page.waitForTimeout(100);
  const offscreen = await page.locator('.physics-shape').evaluateAll((elements) => elements.map((element) => (element as HTMLElement).style.transform));
  await page.waitForTimeout(120);
  expect(await page.locator('.physics-shape').evaluateAll((elements) => elements.map((element) => (element as HTMLElement).style.transform))).toEqual(offscreen);
  await open(page, 'draw');
  await expect(page.locator('#playground')).toBeHidden();
  await expect(page.locator('[data-draw-canvas]')).toBeVisible();
});

test('drawing supports mirrored strokes, erasing, undo, clear recovery, resizing and an opaque PNG', async ({ page }) => {
  await page.goto('/play/#draw');
  const canvas = page.locator('[data-draw-canvas]');
  await expect(page.locator('[data-draw-mirror]')).toBeEnabled();
  await page.locator('[data-draw-mirror]').click();
  await page.locator('[data-draw-size]').fill('24');
  const line = async () => {
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    await page.mouse.move(box!.x + box!.width * .2, box!.y + box!.height * .4);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * .35, box!.y + box!.height * .4, { steps: 12 });
    await page.mouse.up();
  };
  await line();
  expect(await alphaAt(page, .27, .4)).toBeGreaterThan(0);
  expect(await alphaAt(page, .73, .4)).toBeGreaterThan(0);
  await page.locator('[data-draw-eraser]').click();
  await line();
  expect(await alphaAt(page, .27, .4)).toBe(0);
  await page.locator('[data-draw-undo]').click();
  expect(await alphaAt(page, .27, .4)).toBeGreaterThan(0);
  await page.locator('[data-draw-redo]').click();
  expect(await alphaAt(page, .27, .4)).toBe(0);
  await page.locator('[data-draw-undo]').click();
  await page.locator('[data-draw-clear]').click();
  expect(await alphaAt(page, .27, .4)).toBe(0);
  await page.locator('[data-draw-undo]').click();
  expect(await alphaAt(page, .27, .4)).toBeGreaterThan(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => alphaAt(page, .27, .4)).toBeGreaterThan(0);
  const downloadEvent = page.waitForEvent('download');
  await page.locator('[data-draw-download]').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('a-little-doodle.png');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const png = Buffer.concat(chunks);
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.length).toBeGreaterThan(1000);
  const paperPixel = await page.evaluate(async (base64) => {
    const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode();
    const output = document.createElement('canvas'); output.width = 1; output.height = 1;
    const context = output.getContext('2d')!; context.drawImage(image, 0, 0);
    return Array.from(context.getImageData(0, 0, 1, 1).data);
  }, png.toString('base64'));
  expect(paperPixel).toEqual([255, 253, 246, 255]);
});

test('drawing can be made using only the keyboard, with prompts and a star stamp', async ({ page }) => {
  await page.goto('/play/#draw');
  await expect(page.locator('[data-draw-star]')).toBeEnabled();
  await page.locator('[data-draw-canvas]').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Escape');
  await expect(page.locator('[data-draw-undo]')).toBeEnabled();
  expect(await alphaAt(page, .5, .5)).toBeGreaterThan(0);
  await page.locator('[data-draw-prompt-button]').click();
  await expect(page.locator('[data-draw-prompt]')).not.toHaveText('What will you make?');
  await page.locator('[data-draw-eraser]').click();
  await page.locator('[data-draw-star]').click();
  await expect(page.locator('[data-draw-eraser]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-draw-status]')).toContainText('A star');
});

test('surprises support rapid presses, bounded effects and reset without changing the page', async ({ page }) => {
  await page.goto('/play/#button');
  const button = page.locator('[data-press-button]');
  await expect(button).toBeEnabled();
  await button.evaluate((element) => { for (let index = 0; index < 13; index++) (element as HTMLButtonElement).click(); });
  await expect(page.locator('[data-press-count]')).toHaveText('13 presses');
  expect(await page.locator('[data-confetti]').count()).toBeLessThanOrEqual(18);
  await expect(page.locator('[data-press-message]')).toHaveText(copy.reactions[12 % copy.reactions.length].message);
  await page.locator('[data-press-reset]').click();
  await expect(page.locator('[data-press-count]')).toHaveText('0 presses');
  await expect(page.locator('[data-confetti]')).toHaveCount(0);
  await expect(page.locator('h1')).toContainText('Do not press');
});

test('sound is opt-in and reduced-motion surprises remain usable without animation', async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    (window as unknown as Record<string, unknown>).audioStarts = 0;
    window.AudioContext = class extends Original { constructor(options?: AudioContextOptions) { super(options); (window as unknown as Record<string, number>).audioStarts++; } };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/play/#button');
  const button = page.locator('[data-press-button]');
  await expect(button).toBeEnabled(); await button.click();
  expect(await page.evaluate(() => (window as unknown as Record<string, number>).audioStarts)).toBe(0);
  await page.locator('[data-press-sound]').check(); await button.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as Record<string, number>).audioStarts)).toBe(1);
  await page.locator('[data-press-sound]').uncheck();
  await button.click();
  await expect(page.locator('[data-confetti]')).toHaveCount(0);
  expect(await page.locator('[data-press-stage]').evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length)).toBe(0);
});

test('real touch dragging moves shapes and draws on a mobile canvas', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4321/play/#playground');
    const shape = page.locator('.physics-shape').first(); await expect(shape).toBeVisible();
    const box = await shape.boundingBox();
    const cdp = await context.newCDPSession(page);
    const drag = async (x: number, y: number, dx: number, dy: number) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx, y: y + dy }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    await drag(box!.x + box!.width / 2, box!.y + box!.height / 2, 45, 50);
    expect((await shape.boundingBox())!.x).toBeGreaterThan(box!.x + 20);
    await open(page, 'draw');
    await page.locator('[data-draw-canvas]').scrollIntoViewIfNeeded();
    const canvas = await page.locator('[data-draw-canvas]').boundingBox();
    await drag(canvas!.x + canvas!.width * .3, canvas!.y + canvas!.height * .4, 40, 20);
    await expect(page.locator('[data-draw-undo]')).toBeEnabled();
  } finally { await context.close(); }
});

test('Play remains readable without JavaScript and handles an unavailable canvas honestly', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage(); await noJs.goto('http://127.0.0.1:4321/play/');
    await expect(noJs.locator('.play-fallback')).toContainText('need JavaScript');
    await expect(noJs.locator('.play-choice')).toHaveCount(copy.activities.length);
    await expect(noJs.locator('[data-pocket]')).toBeHidden();
    await expect(noJs.locator('[data-play-workspace]')).toHaveCount(0);
    await noJs.locator('[data-play-choice="draw"]').click();
    await expect(noJs).toHaveURL(/\/play\/drawing-pad\//);
    await expect(noJs.locator('.play-fallback')).toContainText('needs JavaScript');
    await expect(noJs.locator('[data-draw-star]')).toBeDisabled();
  } finally { await context.close(); }
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext; });
  await page.goto('/play/#draw');
  await expect(page.locator('[data-play-load]')).toContainText('could not open');
  await expect(page.locator('[data-play-retry]')).toBeVisible();
  await open(page, 'button');
  await expect(page.locator('[data-press-button]')).toBeEnabled();
});

test('activity engines load only after selection and never on the portfolio Home page', async ({ page }) => {
  const requests: string[] = []; page.on('request', (request) => requests.push(request.url()));
  const engine = /\/(?:physics|drawing|surprise|tic-tac-toe|stack-tower)\.[^/]+\.js/;
  await page.goto('/'); expect(requests.filter((url) => engine.test(url))).toEqual([]);
  await page.goto('/play/'); expect(requests.filter((url) => engine.test(url))).toEqual([]);
  await open(page, 'draw');
  expect(requests.some((url) => /\/drawing\.[^/]+\.js/.test(url))).toBe(true);
  expect(requests.some((url) => /\/(?:physics|surprise|tic-tac-toe|stack-tower)\.[^/]+\.js/.test(url))).toBe(false);
});

test('expanded Play workspaces fit small and large screens in both themes', async ({ page }) => {
  test.setTimeout(90_000);
  for (const width of [320, 768, 1440]) for (const theme of ['dark', 'light']) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/play/'); await page.evaluate((theme) => { document.documentElement.dataset.theme = theme; localStorage.setItem('offscript-theme', theme); }, theme);
    for (const activity of copy.activities.map((activity) => activity.id)) {
      await open(page, activity);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${activity}, ${theme}, ${width}px`).toBe(true);
    }
  }
});

test('drawing survives reload and navigation, supports keyboard redo, and never uploads artwork', async ({ page }) => {
  const uploads: string[] = [];
  page.on('request', (request) => { if (request.method() !== 'GET') uploads.push(request.url()); });
  await page.goto('/play/drawing-pad/');
  await expect(page.locator('[data-draw-star]')).toBeEnabled();
  await page.locator('[data-draw-star]').click();
  const first = await page.locator('[data-draw-canvas]').evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  await page.locator('[data-draw-canvas]').focus();
  await page.keyboard.press('Control+z');
  await expect(page.locator('[data-draw-empty]')).toBeVisible();
  await page.keyboard.press('Control+Shift+z');
  await expect(page.locator('[data-draw-empty]')).toBeHidden();
  await page.reload();
  await expect(page.locator('[data-draw-status]')).toContainText('drawing is back');
  expect(await page.locator('[data-draw-canvas]').evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL())).toBe(first);
  await open(page, 'button');
  await open(page, 'draw');
  await expect(page.locator('[data-draw-empty]')).toBeHidden();
  await page.locator('[data-draw-clear]').click();
  await page.reload();
  await expect(page.locator('[data-draw-star]')).toBeEnabled();
  await expect(page.locator('[data-draw-empty]')).toBeVisible();
  expect(uploads).toEqual([]);
});

test('blocked or corrupt tab storage does not prevent drawing and exporting', async ({ browser }) => {
  for (const blocked of [false, true]) {
    const context = await browser.newContext();
    try {
      await context.addInitScript((blocked) => {
        if (blocked) Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Unavailable'); } });
        else sessionStorage.setItem('offscript-doodle:v1', JSON.stringify({ version: 1, strokes: [{ points: [{ x: -1, y: null }] }] }));
      }, blocked);
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:4321/play/drawing-pad/');
      await expect(page.locator('[data-draw-star]')).toBeEnabled();
      await expect(page.locator('[data-draw-save]')).toContainText('unavailable');
      await page.locator('[data-draw-star]').click();
      await expect(page.locator('[data-draw-undo]')).toBeEnabled();
      const download = page.waitForEvent('download');
      await page.locator('[data-draw-download]').click();
      expect((await download).suggestedFilename()).toBe('a-little-doodle.png');
    } finally { await context.close(); }
  }
});
