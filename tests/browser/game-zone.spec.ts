import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function start(page: Page) {
  await expect(page.locator('[data-arcade-action]')).toBeEnabled();
  await page.locator('[data-arcade-action]').click();
  await expect(page.locator('[data-play-panel]')).toHaveAttribute('data-arcade-phase', 'playing');
}

test('hub groups all eight activities, exposes local progress and randomizes only games', async ({ page }) => {
  await page.goto('/play/');
  await expect(page.locator('.zone-section').first().locator('[data-play-choice]')).toHaveCount(5);
  await expect(page.locator('.zone-creative [data-play-choice]')).toHaveCount(3);
  await expect(page.locator('[data-zone-daily]')).toBeVisible();
  await page.locator('[data-zone-progress] summary').click();
  await expect(page.locator('[data-badge]')).toHaveCount(8);
  await expect(page.locator('[data-zone-records]')).toContainText('Your next round');
  await page.getByRole('button', { name: 'Surprise me', exact: true }).click();
  await expect(page).toHaveURL(/\/play\/(snake|dino-run|aim-trainer|tic-tac-toe|stack-tower)\//);
});

test('an open hub rolls over at Dhaka midnight without a new build or reload', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-24T17:58:59Z') });
  await page.clock.pauseAt(new Date('2026-10-24T17:59:59Z'));
  await page.goto('/play/'); await expect(page.locator('[data-daily-link]')).toHaveAttribute('href', /daily=2026-10-24/);
  await page.clock.runFor(1500);
  await expect(page.locator('[data-daily-link]')).toHaveAttribute('href', /daily=2026-10-25/);
  await expect(page.locator('[data-daily-title]')).toHaveText('Snake');
});

test('Snake has real movement, keyboard turns, pause/resume, collision results and saved replay', async ({ page }) => {
  await page.goto('/play/snake/?challenge=1&v=1&seed=42&mode=classic');
  await start(page);
  const canvas = page.locator('canvas');
  const before = await canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL())).not.toBe(before);
  await page.keyboard.press('p');
  await expect(page.locator('[data-play-panel]')).toHaveAttribute('data-arcade-phase', 'paused');
  const paused = await canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL()); await page.waitForTimeout(150);
  expect(await canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL())).toBe(paused);
  await page.locator('[data-arcade-action]').click();
  await expect(page.locator('[data-play-panel]')).toHaveAttribute('data-arcade-phase', 'over', { timeout: 8000 });
  await expect(page.locator('[data-arcade-results]')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('offscript-zone:v1')!).played)).toContain('snake');
  await page.locator('[data-arcade-action]').click();
  await expect(page.locator('[data-arcade-results]')).toBeHidden();
});

test('Dino jumps on keyboard input and stops while paused or out of view', async ({ page }) => {
  await page.goto('/play/dino-run/'); await start(page);
  const canvas = page.locator('canvas'), before = await canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
  await page.keyboard.press('Space');
  await expect.poll(() => canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL())).not.toBe(before);
  await page.locator('[data-arcade-pause]').click();
  const paused = await page.locator('[data-arcade-score]').textContent(); await page.waitForTimeout(200);
  expect(await page.locator('[data-arcade-score]').textContent()).toBe(paused);
  await page.locator('[data-arcade-action]').click();
  await expect(page.locator('[data-play-panel]')).toHaveAttribute('data-arcade-phase', 'playing');
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(page.locator('[data-play-panel]')).toHaveAttribute('data-arcade-phase', 'paused');
});

test('Aim daily round counts real pointer hits/misses, freezes while paused and completes exactly once', async ({ page }) => {
  test.setTimeout(60_000);
  await page.clock.install({ time: new Date('2026-10-24T05:59:00Z') });
  await page.clock.pauseAt(new Date('2026-10-24T06:00:00Z'));
  await page.goto('/play/aim-trainer/?daily=2026-10-24');
  await expect(page.locator('[data-arcade-mode]')).toBeDisabled();
  await page.locator('[data-arcade-action]').click(); await page.clock.runFor(1400);
  for (let i = 0; i < 20; i++) await page.locator('[data-aim-target]').click({ force: true });
  await page.locator('[data-arcade-field]').click({ position: { x: 10, y: 10 }, force: true });
  await page.clock.runFor(30);
  await expect(page.locator('[data-arcade-score]')).toHaveText('20');
  await expect(page.locator('[data-arcade-extra]')).toContainText('95%');
  await page.locator('[data-arcade-pause]').click(); const timer = await page.locator('[data-arcade-extra]').textContent();
  await page.clock.runFor(5000); expect(await page.locator('[data-arcade-extra]').textContent()).toBe(timer);
  await page.locator('[data-arcade-action]').click(); await page.clock.runFor(33_000);
  await expect(page.locator('[data-play-panel]')).toHaveAttribute('data-arcade-phase', 'over');
  await expect(page.locator('[data-arcade-result]')).toContainText('Challenge complete');
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('offscript-zone:v1')!));
  expect(progress.days).toEqual(['2026-10-24']); expect(progress.badges.aim).toBe('2026-10-24');
  const count = Object.values(progress.records).reduce((sum: number, record) => sum + (record as { recent: unknown[] }).recent.length, 0);
  expect(count).toBe(1);
});

test('keyboard Aim practice has no countdown timer, saves separately and supports share fallback on timed results', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined }); Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('blocked'); } } }); });
  await page.goto('/play/aim-trainer/'); await expect(page.locator('[data-arcade-mode]')).toBeEnabled();
  await page.locator('[data-arcade-mode]').selectOption('practice'); await start(page);
  await page.locator('[data-aim-target]').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('[data-arcade-score]')).toHaveText('1');
  await page.locator('[data-arcade-action]').click();
  await expect(page.locator('[data-arcade-result]')).toContainText('1 target');
  await expect(page.locator('[data-arcade-share]')).toBeHidden();
  await page.goto('/play/snake/?challenge=1&v=1&seed=123'); await start(page);
  await expect(page.locator('[data-play-panel]')).toHaveAttribute('data-arcade-phase', 'over', { timeout: 8000 });
  await page.locator('[data-arcade-share]').click();
  await expect(page.locator('[data-share-fallback]')).toBeVisible();
  await expect(page.locator('[data-share-link]')).toHaveValue(/challenge=1&v=1&seed=123&mode=classic/);
});

test('new games and hub stay usable with blocked or malformed local storage and preserve previous tower scores', async ({ browser }) => {
  for (const blocked of [false, true]) {
    const context = await browser.newContext();
    try {
      await context.addInitScript((blocked) => { if (blocked) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }); else { localStorage.setItem('offscript-zone:v1', '{broken'); localStorage.setItem('offscript-tower:v1', JSON.stringify({ classic: 42, chill: 3, step: 5 })); } }, blocked);
      const page = await context.newPage(); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto('http://127.0.0.1:4321/play/'); await page.locator('[data-zone-progress] summary').click();
      if (!blocked) await expect(page.locator('[data-zone-records]')).toContainText('42');
      await page.goto('http://127.0.0.1:4321/play/aim-trainer/'); await page.locator('[data-arcade-mode]').selectOption('practice'); await start(page); await page.locator('[data-arcade-action]').click();
      if (blocked) await expect(page.locator('[data-arcade-storage]')).toContainText('unavailable');
      else await expect(page.locator('[data-arcade-storage]')).toContainText('Records stay in this browser');
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  }
});

test('real phone input turns Snake, jumps Dino and hits a comfortably sized Aim target', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage(); await page.goto('http://127.0.0.1:4321/play/snake/'); await start(page);
    await page.getByRole('button', { name: 'Turn up', exact: true }).tap(); await page.locator('[data-arcade-pause]').tap();
    await expect(page.locator('[data-play-panel]')).toHaveAttribute('data-arcade-phase', 'paused');
    await page.goto('http://127.0.0.1:4321/play/dino-run/'); await start(page); await page.locator('[data-dino-jump]').tap();
    await page.goto('http://127.0.0.1:4321/play/aim-trainer/'); await start(page); await expect(page.locator('[data-pocket]')).toBeHidden(); const target = page.locator('[data-aim-target]');
    expect((await target.boundingBox())!.width).toBeGreaterThanOrEqual(48); await target.tap(); await expect(page.locator('[data-arcade-score]')).toHaveText('1');
    await page.locator('[data-arcade-pause]').tap(); await page.locator('[data-arcade-action]').tap();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

for (const theme of ['dark','light']) test(`${theme}: active new games and expanded progress have accessible controls`, async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(theme => localStorage.setItem('offscript-theme',theme),theme);
  for (const game of ['snake','dino-run','aim-trainer']) { await page.goto(`/play/${game}/`); await start(page); await page.locator('[data-arcade-pause]').click(); const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze(); expect(results.violations).toEqual([]); }
  await page.goto('/play/'); await page.locator('[data-zone-progress] summary').click(); const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze(); expect(results.violations).toEqual([]);
});

test('Tic-tac-toe reset clears its mode streak/records but keeps other games and earned badges', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('offscript-zone:v1',JSON.stringify({version:1,records:{'tic-tac-toe:easy:mixed:practice':{best:1,recent:[{score:1,date:'2026-10-24',result:'win'}]},'snake:classic:keyboard:practice':{best:12,recent:[]}},badges:{first:'2026-10-24'},played:['tic-tac-toe','snake'],days:[],wins:{easy:{current:2,longest:2}}}));
  });
  await page.goto('/play/tic-tac-toe/'); await expect(page.locator('[data-tic-streak]')).toContainText('Win streak: 2');
  await page.locator('[data-tic-reset-scores]').click(); await expect(page.locator('[data-tic-streak]')).toContainText('Win streak: 0');
  const p=await page.evaluate(()=>JSON.parse(localStorage.getItem('offscript-zone:v1')!));
  expect(p.wins.easy).toBeUndefined();expect(p.records['tic-tac-toe:easy:mixed:practice']).toBeUndefined();expect(p.records['snake:classic:keyboard:practice'].best).toBe(12);expect(p.badges.first).toBe('2026-10-24');
});
