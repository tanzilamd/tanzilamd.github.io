import { test, expect, type Page } from '@playwright/test';

async function tic(page: Page) {
  await page.goto('/play/tic-tac-toe/');
  await expect(page.locator('[data-tic-new]')).toBeEnabled();
}
async function tower(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/play/stack-tower/');
  await expect(page.locator('[data-tower-action]')).toBeEnabled();
  await page.locator('[data-tower-canvas]').scrollIntoViewIfNeeded();
}

test('two players can win with keyboard/clicks, keep scores and replay without shifting the board', async ({ page }) => {
  await tic(page);
  await page.getByText('A friend', { exact: true }).click();
  await expect(page.locator('[data-tic-difficulty]').first()).toBeDisabled();
  const cells = page.locator('[data-tic-cell]');
  const size = await page.locator('.tic-board').boundingBox();
  await cells.nth(0).focus(); await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown'); await expect(cells.nth(3)).toBeFocused(); await page.keyboard.press('Space');
  for (const index of [1, 4, 2]) await cells.nth(index).click();
  await expect(page.locator('[data-tic-status]')).toContainText('X wins');
  await expect(page.locator('[data-tic-line]')).toBeVisible();
  await expect(page.locator('[data-tic-x]')).toHaveText('1');
  await cells.nth(6).evaluate((cell) => (cell as HTMLButtonElement).click()); await cells.nth(7).evaluate((cell) => (cell as HTMLButtonElement).click());
  await expect(page.locator('[data-tic-x]')).toHaveText('1');
  expect((await page.locator('.tic-board').boundingBox())!.width).toBe(size!.width);
  expect((await page.locator('.tic-board').boundingBox())!.height).toBe(size!.height);
  await page.locator('[data-tic-new]').click();
  await expect(page.locator('[data-tic-line]')).toBeHidden();
  await expect(page.locator('[data-tic-cell][data-mark="X"]')).toHaveCount(0);
  await page.reload(); await page.getByText('A friend', { exact: true }).click();
  await expect(page.locator('[data-tic-x]')).toHaveText('1');
  await page.locator('[data-tic-reset-scores]').click(); await expect(page.locator('[data-tic-x]')).toHaveText('0');
});

test('computer respects turn order, X/O choice, and cancels pending turns on settings or a new round', async ({ page }) => {
  await tic(page);
  const cells = page.locator('[data-tic-cell]');
  await cells.nth(0).click();
  await cells.nth(1).evaluate((cell) => (cell as HTMLButtonElement).click());
  await expect(page.locator('[data-tic-cell][data-mark="X"]')).toHaveCount(1);
  await expect(page.locator('[data-tic-cell][data-mark="O"]')).toHaveCount(1);
  await page.locator('[data-tic-new]').click();
  await cells.nth(0).click();
  await page.getByText('A friend', { exact: true }).click();
  await page.waitForTimeout(450);
  await expect(page.locator('[data-tic-cell] .tic-mark')).toHaveCount(0);
  await page.getByText('Computer', { exact: true }).click();
  await page.getByText('Hard', { exact: true }).click();
  await page.locator('[data-tic-mark][value="O"]').check();
  await page.locator('[data-tic-new]').evaluate((button) => { for (let i = 0; i < 5; i++) (button as HTMLButtonElement).click(); });
  await expect(page.locator('[data-tic-cell][data-mark="X"]')).toHaveCount(1);
  await expect(page.locator('[data-tic-cell][data-mark="O"]')).toHaveCount(0);
  await expect(page.locator('[data-tic-cell="4"]')).toHaveAttribute('data-mark', 'X');
  await expect(page.locator('[data-tic-status]')).toContainText('You’re O');
});


test('computer win/loss scores stay personal when changing X/O', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await tic(page);
  for (const index of [0, 3, 6]) {
    await page.locator(`[data-tic-cell="${index}"]`).click();
    if (index !== 6) await expect(page.locator('[data-tic-status]')).toContainText('Your move');
  }
  await expect(page.locator('[data-tic-status]')).toContainText('You win');
  await expect(page.locator('[data-tic-x]')).toHaveText('1');
  await page.locator('[data-tic-mark][value="O"]').check();
  await expect(page.locator('[data-tic-o-label]')).toHaveText('You · O');
  await expect(page.locator('[data-tic-o]')).toHaveText('1');
  await page.getByText('Hard', { exact: true }).click();
  await expect(page.locator('[data-tic-o]')).toHaveText('0');
});

test('a local draw is counted once, and reduced motion removes winning animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await tic(page); await page.getByText('A friend', { exact: true }).click();
  for (const index of [0, 1, 2, 4, 3, 5, 7, 6, 8]) await page.locator(`[data-tic-cell="${index}"]`).click();
  await expect(page.locator('[data-tic-status]')).toContainText('A draw');
  await expect(page.locator('[data-tic-draw]')).toHaveText('1');
  await page.locator('[data-tic-cell="0"]').evaluate((cell) => (cell as HTMLButtonElement).click()); await expect(page.locator('[data-tic-draw]')).toHaveText('1');
  expect(await page.locator('.tic-board').evaluate((board) => board.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length)).toBe(0);
});

test('Stack Tower step mode supports keyboard perfects, trimming, recovery, miss and replay', async ({ page }) => {
  await tower(page);
  const canvas = page.locator('[data-tower-canvas]');
  await expect(page.locator('[data-tower-mode]')).toHaveValue('step');
  await page.locator('[data-tower-action]').click();
  await canvas.focus();
  for (let round = 0; round < 3; round++) {
    for (let step = 0; step < 15; step++) await page.keyboard.press(round % 2 ? 'ArrowLeft' : 'ArrowRight');
    await page.waitForTimeout(150);
    await page.keyboard.press('Space');
    await expect(page.locator('[data-tower-score]')).toHaveText(String(round + 1));
    await expect(page.locator('[data-tower-status]')).toContainText('Perfect');
  }
  await expect(page.locator('[data-tower-width]')).toHaveText('100');
  await page.locator('[data-tower-reset]').click(); await page.locator('[data-tower-action]').click();
  await page.locator('[data-tower-action]').click();
  await expect(page.locator('[data-tower-score]')).toHaveText('1');
  await expect(page.locator('[data-tower-width]')).not.toHaveText('100');
  await page.waitForTimeout(150); await page.locator('[data-tower-action]').click();
  await expect(page.locator('[data-tower-action]')).toHaveText('Play again');
  await expect(page.locator('[data-tower-status]')).toContainText('slipped');
  await expect(page.locator('[data-tower-best]')).toHaveText('3');
  await page.locator('[data-tower-action]').click(); await expect(page.locator('[data-tower-score]')).toHaveText('0');
  await page.reload(); await expect(page.locator('[data-tower-best]')).toHaveText('3');
  await page.locator('[data-tower-mode]').selectOption('classic'); await expect(page.locator('[data-tower-best]')).toHaveText('0');
});

test('timed tower moves only while playing, pauses offscreen and requires explicit resume', async ({ page }) => {
  await page.goto('/play/stack-tower/');
  const canvas = page.locator('[data-tower-canvas]'); await expect(page.locator('[data-tower-action]')).toBeEnabled();
  await canvas.scrollIntoViewIfNeeded(); await page.locator('[data-tower-action]').click();
  const image = await canvas.evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  await expect.poll(() => canvas.evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL())).not.toBe(image);
  await page.locator('[data-tower-pause]').click();
  await expect(page.locator('[data-tower-action]')).toHaveText('Resume');
  const paused = await canvas.evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(180); expect(await canvas.evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL())).toBe(paused);
  await page.locator('[data-tower-action]').click();
  await page.setViewportSize({ width: 1280, height: 360 });
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(page.locator('[data-tower-action]')).toHaveText('Resume');
  await page.setViewportSize({ width: 1280, height: 900 }); await canvas.scrollIntoViewIfNeeded();
  await expect(page.locator('[data-tower-action]')).toHaveText('Resume');
  await page.locator('[data-tower-action]').click(); await expect(page.locator('[data-tower-action]')).toHaveText('Drop block');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-tower-mode]')).toHaveValue('step');
  await expect(page.locator('[data-tower-action]')).toHaveText('Start stacking');
});

test('both games work with blocked or corrupt device storage and neither loads on Home', async ({ browser, page }) => {
  const requests: string[] = []; page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  expect(requests.some((url) => /\/(?:tic-tac-toe|stack-tower)\.[^/]+\.js/.test(url))).toBe(false);
  for (const blocked of [false, true]) {
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4321', reducedMotion: 'reduce' });
    try {
      await context.addInitScript((blocked) => {
        if (blocked) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Unavailable'); } });
        else { localStorage.setItem('offscript-tic:v1', '{broken'); localStorage.setItem('offscript-tower:v1', JSON.stringify({ chill: -3, classic: 'oops', step: Infinity })); }
      }, blocked);
      const local = await context.newPage(); await tic(local);
      await local.getByText('A friend', { exact: true }).click();
      for (const index of [0, 3, 1, 4, 2]) await local.locator(`[data-tic-cell="${index}"]`).click();
      await expect(local.locator('[data-tic-x]')).toHaveText('1');
      if (blocked) await expect(local.locator('[data-tic-storage]')).toContainText('this visit');
      await tower(local); await local.locator('[data-tower-action]').click(); await local.locator('[data-tower-action]').click();
      await expect(local.locator('[data-tower-score]')).toHaveText('1');
      if (blocked) await expect(local.locator('[data-tower-storage]')).toContainText('this visit');
    } finally { await context.close(); }
  }
});

test('real mobile touch can play both games and scrolling the tower canvas never drops a block', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4321', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage(); await tic(page); await page.getByText('A friend', { exact: true }).tap();
    for (const index of [0, 3, 1, 4, 2]) await page.locator(`[data-tic-cell="${index}"]`).tap();
    await expect(page.locator('[data-tic-status]')).toContainText('X wins');
    await tower(page); const canvas = page.locator('[data-tower-canvas]');
    await canvas.tap(); await expect(page.locator('[data-tower-action]')).toHaveText('Drop block');
    await canvas.scrollIntoViewIfNeeded(); const box = (await canvas.boundingBox())!;
    const cdp = await context.newCDPSession(page);
    const x = box.x + box.width / 2, y = box.y + box.height * .65;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 90 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('[data-tower-score]')).toHaveText('0');
    await expect(page.locator('[data-tower-action]')).toHaveText('Drop block');
    await page.locator('[data-tower-action]').click();
    await expect(page.locator('[data-tower-score]')).toHaveText('1');
  } finally { await context.close(); }
});
