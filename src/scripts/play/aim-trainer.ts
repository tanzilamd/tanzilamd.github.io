import { createArcade } from './arcade-shell';
import { aimAccuracy, hitAim, nextTarget, type Aim } from './games/aim-rules';
export function mount(panel: HTMLElement) {
  let state: Aim, locked = false;
  const target = panel.querySelector<HTMLButtonElement>('[data-aim-target]')!;
  const finish = () => shell.finish(state.hits, 'Round complete. A little sharper every time.', aimAccuracy(state.hits, state.misses));
  const shell = createArcade(panel, {
    game: 'aim-trainer', width: 1, height: 1, action() { if (shell.mode === 'practice') finish(); }, playingLabel: 'Finish practice',
    start() { state = { hits: 0, misses: 0, target: nextTarget(shell.random) }; locked = false; position(); },
    step() { shell.setScore(state.hits, aimAccuracy(state.hits, state.misses)); if (shell.mode !== 'practice' && shell.elapsed >= 30) finish(); },
    draw() {},
  });
  function position() { target.style.left = `${state.target.x * 100}%`; target.style.top = `${state.target.y * 100}%`; }
  function hit(input: 'mouse' | 'touch' | 'keyboard') { if (shell.phase !== 'playing' || locked) return; if (input === 'keyboard' && shell.mode !== 'practice') { shell.status('For keyboard play, choose untimed practice before starting.'); return; } shell.setInput(input); state = hitAim(state, shell.random); position(); shell.setScore(state.hits, aimAccuracy(state.hits, state.misses)); locked = true; queueMicrotask(() => { locked = false; }); }
  target.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse' && event.button !== 0) return; event.preventDefault(); event.stopPropagation(); hit(event.pointerType === 'touch' ? 'touch' : 'mouse'); }, { signal: shell.signal });
  target.addEventListener('click', event => { if (event.detail === 0) hit('keyboard'); }, { signal: shell.signal });
  shell.field.addEventListener('pointerdown', event => { if (event.target !== shell.field || shell.phase !== 'playing' || event.pointerType === 'mouse' && event.button !== 0) return; shell.setInput(event.pointerType === 'touch' ? 'touch' : 'mouse'); state.misses++; shell.setScore(state.hits, aimAccuracy(state.hits, state.misses)); }, { signal: shell.signal });
  shell.ready(); return shell.lifecycle;
}
