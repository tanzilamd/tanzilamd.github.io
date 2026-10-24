import { createArcade } from './arcade-shell';
import { createSnake, snakeStep, snakeInterval, GRID, opposite, type Snake, type Direction } from './games/snake-rules';
export function mount(panel: HTMLElement) {
  let state: Snake, queue: Direction[] = [], accumulated = 0, pointer: { x: number; y: number; id: number } | undefined;
  const shell = createArcade(panel, {
    game: 'snake', width: 600, height: 600,
    start() { state = createSnake(shell.mode, shell.random); queue = []; accumulated = 0; pointer = undefined; },
    step(dt) {
      accumulated += dt;
      if (accumulated < snakeInterval(shell.mode, state.score)) return;
      accumulated -= snakeInterval(shell.mode, state.score); state = snakeStep(state, queue.shift() ?? state.direction, shell.random); shell.setScore(state.score);
      if (state.over || shell.goalReached()) shell.finish(state.score, state.won ? 'The whole board is yours. Beautifully done!' : 'That was a good run. One more?');
    },
    draw(ctx, theme) {
      if (!state) return; const unit = 600 / GRID;
      ctx.strokeStyle = theme.line; ctx.lineWidth = .5; for (let i = 1; i < GRID; i++) { ctx.beginPath(); ctx.moveTo(i * unit, 0); ctx.lineTo(i * unit, 600); ctx.moveTo(0, i * unit); ctx.lineTo(600, i * unit); ctx.stroke(); }
      if (state.food) { ctx.fillStyle = theme.accent; ctx.beginPath(); ctx.arc((state.food.x + .5) * unit, (state.food.y + .5) * unit, unit * .29, 0, Math.PI * 2); ctx.fill(); }
      for (let i = state.body.length - 1; i >= 0; i--) { const p = state.body[i]; ctx.fillStyle = i === 0 ? theme.positive : '#518a7f'; ctx.beginPath(); ctx.roundRect(p.x * unit + 2, p.y * unit + 2, unit - 4, unit - 4, i === 0 ? 9 : 5); ctx.fill(); }
      const head = state.body[0]; ctx.fillStyle = '#0a191d'; const dx = state.direction === 'right' ? 7 : state.direction === 'left' ? -7 : 0, dy = state.direction === 'down' ? 7 : state.direction === 'up' ? -7 : 0;
      for (const offset of [-5, 5]) { ctx.beginPath(); ctx.arc((head.x + .5) * unit + dx + (dy ? offset : 0), (head.y + .5) * unit + dy + (dx ? offset : 0), 2, 0, Math.PI * 2); ctx.fill(); }
    },
  });
  function turn(direction: Direction) { if (shell.phase !== 'playing' || queue.length >= 2 || direction === opposite[queue.at(-1) ?? state.direction] || direction === (queue.at(-1) ?? state.direction)) return; queue.push(direction); }
  const keys: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  shell.field.addEventListener('keydown', event => { const direction = keys[event.key] ?? keys[event.key.toLowerCase()]; if (direction) { event.preventDefault(); if (!event.repeat) { shell.setInput('keyboard'); turn(direction); } } }, { signal: shell.signal });
  panel.querySelectorAll<HTMLButtonElement>('[data-snake-direction]').forEach(button => button.addEventListener('click', () => turn(button.dataset.snakeDirection as Direction), { signal: shell.signal }));
  shell.field.addEventListener('pointerdown', event => { if (shell.phase !== 'playing') return; pointer = { x: event.clientX, y: event.clientY, id: event.pointerId }; shell.setInput(event.pointerType === 'touch' ? 'touch' : 'mouse'); shell.field.setPointerCapture(event.pointerId); }, { signal: shell.signal });
  shell.field.addEventListener('pointerup', event => { if (pointer?.id !== event.pointerId) return; const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = undefined; if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) return; turn(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up'); }, { signal: shell.signal });
  shell.field.addEventListener('pointercancel', () => { pointer = undefined; }, { signal: shell.signal });
  shell.ready(); return shell.lifecycle;
}
