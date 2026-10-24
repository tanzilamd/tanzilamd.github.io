import { createArcade } from './arcade-shell';
import { createDino, jumpDino, stepDino, DINO_W, DINO_H, DINO_X, DINO_SIZE, GROUND, type Dino } from './games/dino-rules';
export function mount(panel: HTMLElement) {
  let state: Dino, accumulator = 0, pointer: { x: number; y: number; id: number } | undefined;
  const jump = () => { if (shell.phase === 'playing') { state = jumpDino(state); shell.draw(); } };
  const shell = createArcade(panel, {
    game: 'dino-run', width: DINO_W, height: DINO_H, action: jump, playingLabel: 'Jump ↑',
    start() { state = createDino(shell.mode); accumulator = 0; pointer = undefined; },
    step(dt) { accumulator += dt; while (accumulator >= 1 / 120 && shell.phase === 'playing') { accumulator -= 1 / 120; state = stepDino(state, 1 / 120, shell.random); shell.setScore(Math.floor(state.elapsed * 10) / 10); if (state.over || shell.goalReached()) shell.finish(state.elapsed, 'A little further every time. Try again?'); } },
    draw(ctx, theme) {
      if (!state) return; ctx.strokeStyle = theme.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(25, GROUND + 1); ctx.lineTo(DINO_W - 25, GROUND + 1); ctx.stroke();
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) { ctx.fillStyle = theme.line; for (let i = 0; i < 12; i++) ctx.fillRect((i * 100 - state.distance * .45 % 100 + 100) % DINO_W, GROUND + 15 + i % 3 * 10, 18, 2); }
      ctx.fillStyle = theme.accent; for (const o of state.obstacles) { const top = GROUND - o.height; ctx.beginPath(); ctx.roundRect(o.x, top, o.width, o.height, 4); ctx.fill(); ctx.fillRect(o.x - 8, top + 10, 10, 7); ctx.fillRect(o.x + o.width - 2, top + 18, 10, 7); }
      ctx.save(); ctx.translate(DINO_X, GROUND - state.y - DINO_SIZE); ctx.fillStyle = theme.positive;
      ctx.beginPath(); ctx.roundRect(13, 0, 37, 22, 3); ctx.fill(); ctx.fillRect(8, 17, 25, 21); ctx.fillRect(0, 12, 9, 17); ctx.fillRect(30, 27, 10, 4);
      const stride = state.y > 0 || reduced || shell.phase !== 'playing' ? 0 : Math.floor(state.elapsed * 10) % 2 * 5;
      ctx.fillRect(11, 34, 8, 8 - stride); ctx.fillRect(26, 34, 8, 3 + stride); ctx.fillStyle = theme.surface; ctx.fillRect(39, 5, 4, 4); ctx.restore();
    },
  });
  shell.field.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'Enter') { event.preventDefault(); if (!event.repeat) { shell.setInput('keyboard'); if (shell.phase === 'playing') jump(); else shell.primary(); } } }, { signal: shell.signal });
  shell.field.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse' && event.button !== 0) return; pointer = { x: event.clientX, y: event.clientY, id: event.pointerId }; }, { signal: shell.signal });
  shell.field.addEventListener('pointerup', event => { if (pointer?.id !== event.pointerId) return; const tap = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 12; pointer = undefined; if (tap) { shell.setInput(event.pointerType === 'touch' ? 'touch' : 'mouse'); if (shell.phase === 'playing') jump(); else shell.primary(); } }, { signal: shell.signal });
  shell.field.addEventListener('pointercancel', () => { pointer = undefined; }, { signal: shell.signal });
  panel.querySelector('[data-dino-jump]')!.addEventListener('click', jump, { signal: shell.signal });
  shell.ready(); return shell.lifecycle;
}
