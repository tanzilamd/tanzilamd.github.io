import type { Activity } from './types';
import { advanceTower, BASE_WIDTH, BLOCK_HEIGHT, createTower, dropTower, shiftTower, STAGE_HEIGHT as H, STAGE_WIDTH as W, type Block, type TowerMode } from './games/tower-rules';
import { loadLocal, saveLocal, validScore } from './games/storage';

type Bests = Record<TowerMode, number>;
type Piece = Block & { y: number; vx: number; vy: number; angle: number; age: number };
const validBests = (value: unknown): value is Bests => !!value && typeof value === 'object' && ['chill', 'classic', 'step'].every((mode) => validScore((value as Record<string, unknown>)[mode]));
const colors = ['#69a7a1', '#e29478', '#c5a966', '#8f9fc4', '#a28db4', '#83ad8d'];

export function mount(panel: HTMLElement): Activity {
  const canvas = panel.querySelector<HTMLCanvasElement>('[data-tower-canvas]')!;
  const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas is unavailable.');
  const ctx = context, abort = new AbortController(), { signal } = abort;
  const action = panel.querySelector<HTMLButtonElement>('[data-tower-action]')!;
  const pause = panel.querySelector<HTMLButtonElement>('[data-tower-pause]')!;
  const modeSelect = panel.querySelector<HTMLSelectElement>('[data-tower-mode]')!;
  const status = panel.querySelector<HTMLElement>('[data-tower-status]')!;
  const overlay = panel.querySelector<HTMLElement>('[data-tower-overlay]')!;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const stored = loadLocal('offscript-tower:v1', validBests, { chill: 0, classic: 0, step: 0 });
  const bests = stored.value;
  let canSave = stored.saved;
  let mode: TowerMode = preference.matches ? 'step' : 'chill';
  let state = createTower(mode), active = false, visible = false, frame = 0, lastTime = 0, camera = 0;
  let pieces: Piece[] = [], lockUntil = 0;
  let pointer: { id: number; x: number; y: number } | undefined;
  let theme = { text: '#f4f1e9', line: '#2d4549', quiet: '#93aaad', surface: '#102428' };
  const baseY = H - 110;
  const targetCamera = () => Math.max(0, (state.moving.level - 10) * BLOCK_HEIGHT);
  function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  function block(block: Block, alpha = 1) {
    const y = baseY - block.level * BLOCK_HEIGHT + camera;
    if (y > H + 60 || y < -60) return;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = colors[block.level % colors.length];
    ctx.fillRect(block.x, y, block.width, BLOCK_HEIGHT - 1);
    ctx.fillStyle = '#ffffff30'; ctx.fillRect(block.x, y, block.width, 5);
    ctx.fillStyle = '#00000018'; ctx.fillRect(block.x + Math.max(0, block.width - 7), y + 5, Math.min(7, block.width), BLOCK_HEIGHT - 6);
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = theme.line; ctx.lineWidth = 1; ctx.setLineDash([3, 10]);
    ctx.beginPath(); ctx.moveTo(W / 2, 40); ctx.lineTo(W / 2, H - 35); ctx.stroke(); ctx.setLineDash([]);
    const floor = baseY + BLOCK_HEIGHT + camera;
    if (floor < H) {
      ctx.fillStyle = theme.line; ctx.fillRect(70, floor + 3, W - 140, 1);
      ctx.fillStyle = theme.quiet; ctx.font = '11px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillText('ONE MORE BLOCK', W / 2, floor + 32);
    }
    for (const item of state.blocks) block(item);
    if (state.phase !== 'over') block(state.moving, state.phase === 'ready' ? .5 : 1);
    for (const piece of pieces) {
      ctx.save(); ctx.translate(piece.x + piece.width / 2, piece.y + camera); ctx.rotate(piece.angle); ctx.globalAlpha = Math.max(0, 1 - piece.age / 1.05);
      ctx.fillStyle = colors[piece.level % colors.length]; ctx.fillRect(-piece.width / 2, 0, piece.width, BLOCK_HEIGHT - 1); ctx.restore();
    }
  }
  function readTheme() {
    const css = getComputedStyle(panel);
    theme = { text: css.getPropertyValue('--text').trim(), line: css.getPropertyValue('--line').trim(), quiet: css.getPropertyValue('--quiet').trim(), surface: css.getPropertyValue('--surface').trim() };
  }
  function measure() {
    const width = canvas.clientWidth; if (width < 1) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), pixels = Math.min(1600, Math.round(width * dpr));
    canvas.width = pixels; canvas.height = Math.round(pixels * H / W);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0); readTheme(); draw();
  }
  function render() {
    panel.dataset.towerPhase = state.phase;
    panel.querySelector('[data-tower-score]')!.textContent = String(state.score);
    panel.querySelector('[data-tower-best]')!.textContent = String(bests[mode]);
    panel.querySelector('[data-tower-width]')!.textContent = String(Math.round(state.moving.width / BASE_WIDTH * 100));
    panel.querySelector('[data-tower-storage]')!.textContent = canSave ? 'Each pace has its own best on this device.' : 'Best scores stay for this visit. Device saving is unavailable.';
    panel.querySelector<HTMLElement>('[data-tower-step-controls]')!.hidden = mode !== 'step';
    modeSelect.value = mode;
    action.textContent = state.phase === 'playing' ? 'Drop block' : state.phase === 'paused' ? 'Resume' : state.phase === 'over' ? 'Play again' : 'Start stacking';
    pause.textContent = 'Pause';
    pause.disabled = state.phase !== 'playing';
    panel.querySelectorAll<HTMLButtonElement>('[data-tower-left], [data-tower-right]').forEach((button) => { button.disabled = state.phase !== 'playing'; });
    overlay.hidden = state.phase === 'playing';
    panel.querySelector('[data-tower-overlay-label]')!.textContent = state.phase === 'over' ? `${state.score} ${state.score === 1 ? 'block' : 'blocks'} tall` : state.phase === 'paused' ? 'Take your time' : 'One tap at a time';
    panel.querySelector('[data-tower-overlay-title]')!.textContent = state.phase === 'over' ? 'One more try?' : state.phase === 'paused' ? 'A little pause.' : 'How high can you go?';
    panel.querySelector('[data-tower-overlay-note]')!.textContent = state.phase === 'paused' ? 'Choose Resume when you’re ready.' : state.phase === 'over' ? 'Tap here or choose Play again.' : 'Tap here or choose Start stacking.';
  }
  function shouldRun() { return active && visible && !document.hidden && ((state.phase === 'playing' && mode !== 'step') || pieces.length > 0); }
  function tick(now: number) {
    frame = 0; if (!shouldRun()) return;
    const dt = Math.min(.05, (now - (lastTime || now - 16.67)) / 1000); lastTime = now;
    state = advanceTower(state, dt);
    camera += (targetCamera() - camera) * Math.min(1, dt * 10);
    pieces = pieces.filter((piece) => piece.age < 1.05).map((piece) => ({ ...piece, age: piece.age + dt, x: piece.x + piece.vx * dt, y: piece.y + piece.vy * dt, vy: piece.vy + 1000 * dt, angle: piece.angle + dt * .7 }));
    draw(); if (shouldRun()) frame = requestAnimationFrame(tick); else lastTime = 0;
  }
  function wake() { if (!frame && shouldRun()) frame = requestAnimationFrame(tick); }
  function pauseGame(message = 'Paused. Your tower is right here.') {
    if (state.phase === 'playing') { state = { ...state, phase: 'paused' }; status.textContent = message; }
    pieces = []; pointer = undefined; camera = targetCamera(); stop(); render(); draw();
  }
  function positionNote() {
    const previous = state.blocks[state.blocks.length - 1], difference = Math.round(state.moving.x - previous.x);
    status.textContent = Math.abs(difference) <= 8 ? 'Lined up. Drop for a perfect block.' : `${Math.abs(difference)} units ${difference < 0 ? 'left' : 'right'} of the tower. Use Left/Right to line it up.`;
  }
  function start() {
    state = { ...createTower(mode), phase: 'playing' }; pieces = []; camera = 0; lockUntil = 0;
    status.textContent = mode === 'step' ? 'No rush. Move the block with Left/Right, then drop.' : 'Find your rhythm. Drop when the edges line up.';
    render(); draw(); wake();
  }
  function resume() {
    if (!active || (mode !== 'step' && !visible)) return;
    state = { ...state, phase: 'playing' }; lastTime = 0;
    status.textContent = mode === 'step' ? 'Your move. Left/Right, then drop.' : 'Back to it. One block at a time.';
    render(); draw(); wake();
  }
  function drop() {
    if (state.phase !== 'playing' || !active || (mode !== 'step' && !visible) || performance.now() < lockUntil) return;
    lockUntil = performance.now() + 130;
    const result = dropTower(state); state = result.state;
    if (result.cutoff && !preference.matches && mode !== 'step') {
      pieces = [...pieces.slice(-5), { ...result.cutoff, y: baseY - result.cutoff.level * BLOCK_HEIGHT, vx: result.cutoff.x < W / 2 ? -55 : 55, vy: 20, angle: 0, age: 0 }];
    }
    if (state.score > bests[mode]) { bests[mode] = Math.min(999999, state.score); canSave = saveLocal('offscript-tower:v1', bests); }
    status.textContent = result.event === 'miss' ? `That one slipped. ${state.score} ${state.score === 1 ? 'block' : 'blocks'} tall. Try again?` : result.event === 'recovered' ? 'Three perfect blocks! A little width, back on your side.' : result.event === 'perfect' ? `Perfect. ${state.streak} in a row!` : `Nice landing. ${state.score} ${state.score === 1 ? 'block' : 'blocks'} tall.`;
    if (mode === 'step' || preference.matches) camera = targetCamera();
    render(); draw(); wake();
  }
  function primary() {
    if (!active) return;
    if (mode !== 'step' && !visible) {
      canvas.scrollIntoView({ block: 'center', behavior: 'instant' });
      const rect = canvas.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < innerHeight;
      if (!visible) return;
    }
    if (state.phase === 'ready' || state.phase === 'over') start(); else if (state.phase === 'paused') resume(); else drop();
  }
  function shift(amount: number) { if (!active || state.phase !== 'playing' || mode !== 'step') return; state = shiftTower(state, amount); draw(); positionNote(); }
  action.addEventListener('click', primary, { signal });
  pause.addEventListener('click', () => { if (state.phase === 'playing') pauseGame(); else if (state.phase === 'paused') resume(); }, { signal });
  panel.querySelector('[data-tower-reset]')!.addEventListener('click', () => { stop(); pieces = []; state = createTower(mode); camera = 0; lockUntil = 0; status.textContent = 'A fresh start. Choose Start stacking when you’re ready.'; render(); draw(); }, { signal });
  modeSelect.addEventListener('change', () => { stop(); mode = modeSelect.value as TowerMode; state = createTower(mode); pieces = []; camera = 0; status.textContent = mode === 'step' ? 'Step mode: move with Left/Right, then drop. No timer.' : `${mode === 'chill' ? 'A gentler pace' : 'A little more speed'}. Choose Start stacking.`; render(); draw(); }, { signal });
  panel.querySelector('[data-tower-left]')!.addEventListener('click', () => shift(-10), { signal });
  panel.querySelector('[data-tower-right]')!.addEventListener('click', () => shift(10), { signal });
  canvas.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); if (!event.repeat) primary(); }
    else if (mode === 'step' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); shift((event.key === 'ArrowLeft' ? -1 : 1) * (event.shiftKey ? 2 : 10)); }
    else if (event.key.toLowerCase() === 'p' && !event.repeat) { event.preventDefault(); if (state.phase === 'playing') pauseGame(); else if (state.phase === 'paused') resume(); }
  }, { signal });
  canvas.addEventListener('pointerdown', (event) => { if (!pointer && (event.pointerType !== 'mouse' || event.button === 0)) pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }; }, { signal });
  canvas.addEventListener('pointerup', (event) => { if (pointer?.id !== event.pointerId) return; const tap = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 12; pointer = undefined; if (tap) { canvas.focus({ preventScroll: true }); primary(); } }, { signal });
  canvas.addEventListener('pointercancel', () => { pointer = undefined; }, { signal });
  canvas.addEventListener('pointerleave', () => { pointer = undefined; }, { signal });
  preference.addEventListener('change', () => { if (preference.matches) { mode = 'step'; state = createTower(mode); camera = 0; pauseGame(); status.textContent = 'Step mode is ready. Start a new tower without timed motion.'; } }, { signal });
  const resize = new ResizeObserver(measure); resize.observe(canvas);
  const viewport = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .1; if (!visible && mode !== 'step') pauseGame('Paused while the play area is away. Choose Resume to continue.'); else if (visible) wake(); else stop(); }, { threshold: .1 }); viewport.observe(canvas);
  const themeObserver = new MutationObserver(() => { readTheme(); draw(); }); themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  panel.querySelectorAll<HTMLFieldSetElement>('[data-play-controls]').forEach((fieldset) => { fieldset.disabled = false; });
  measure(); render();
  return { setActive(value) { active = value; if (!active) pauseGame('Paused while you were away. Choose Resume to continue.'); }, destroy() { active = false; stop(); pieces = []; pointer = undefined; abort.abort(); resize.disconnect(); viewport.disconnect(); themeObserver.disconnect(); } };
}
