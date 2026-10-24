import type { Activity } from './types';
import { challengeFrom, challengeGoal, dayKey, random, RULES_VERSION, type ArcadeGame, type InputKind } from '../../lib/game-zone';
import { bucket, readProgress, recordRound } from './games/progress';
export type Theme = { text: string; line: string; accent: string; positive: string; surface: string; quiet: string };
type Phase = 'ready' | 'countdown' | 'playing' | 'paused' | 'over';
type Hooks = { game: ArcadeGame; width: number; height: number; start: () => void; step: (dt: number) => void; draw: (ctx: CanvasRenderingContext2D, theme: Theme) => void; action?: () => void; playingLabel?: string };
export function createArcade(panel: HTMLElement, hooks: Hooks) {
  const abort = new AbortController(), { signal } = abort;
  const $ = <T extends HTMLElement = HTMLElement>(name: string) => panel.querySelector<T>(`[data-${name}]`)!;
  const field = $('arcade-field'), canvas = field instanceof HTMLCanvasElement ? field : undefined;
  const ctx = canvas?.getContext('2d'); if (canvas && !ctx) throw new Error('Canvas is unavailable.');
  const action = $<HTMLButtonElement>('arcade-action'), pause = $<HTMLButtonElement>('arcade-pause'), modeSelect = $<HTMLSelectElement>('arcade-mode'), overlay = $('arcade-overlay');
  const challenge = challengeFrom(location.search, hooks.game);
  let mode = challenge?.mode ?? (matchMedia('(prefers-reduced-motion: reduce)').matches && hooks.game !== 'aim-trainer' ? 'chill' : 'classic');
  let phase: Phase = 'ready', active = false, visible = false, frame = 0, lastTime = 0, elapsed = 0, score = 0, accuracy: number | undefined;
  let seed = challenge?.seed ?? freshSeed(), rng = random(seed), input: InputKind = matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse', usedInput = false;
  let countdown = 0, stored = readProgress(), theme: Theme;
  function freshSeed() { try { return crypto.getRandomValues(new Uint32Array(1))[0]; } catch { return Date.now() >>> 0; } }
  function text(name: string, value: string) { const node = $(name); if (node.textContent !== value) node.textContent = value; }
  function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  function draw() { if (ctx) { ctx.clearRect(0, 0, hooks.width, hooks.height); hooks.draw(ctx, theme); } }
  function measure() {
    const css = getComputedStyle(panel); theme = Object.fromEntries(['text', 'line', 'accent', 'positive', 'surface', 'quiet'].map(key => [key, css.getPropertyValue(`--${key}`).trim()])) as Theme;
    if (canvas) { const pixels = Math.min(1600, Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 2))); if (pixels) { canvas.width = pixels; canvas.height = Math.round(pixels * hooks.height / hooks.width); ctx!.setTransform(pixels / hooks.width, 0, 0, canvas.height / hooks.height, 0, 0); } }
    draw();
  }
  function update() {
    panel.dataset.arcadePhase = phase; modeSelect.value = mode; modeSelect.disabled = !!challenge || phase === 'playing' || phase === 'countdown' || phase === 'paused';
    action.textContent = phase === 'playing' ? hooks.game === 'aim-trainer' && mode !== 'practice' ? 'In progress' : hooks.playingLabel ?? 'Playing' : phase === 'countdown' ? 'Get ready…' : phase === 'paused' ? 'Resume' : phase === 'over' ? 'Play again' : 'Start game';
    action.disabled = phase === 'countdown' || phase === 'playing' && (!hooks.action || hooks.game === 'aim-trainer' && mode !== 'practice');
    pause.disabled = phase !== 'playing' && phase !== 'countdown'; overlay.hidden = phase === 'playing';
    text('arcade-score', hooks.game === 'dino-run' ? score.toFixed(1) : String(Math.floor(score)));
    text('arcade-best', String(stored.value.records[bucket({ game: hooks.game, mode, input, dailyAttempt: challenge?.kind === 'daily' })]?.best ?? 0));
    text('arcade-extra-label', hooks.game === 'aim-trainer' ? 'Accuracy / time' : 'Your pace');
    text('arcade-extra', hooks.game === 'aim-trainer' ? `${accuracy ?? 0}% · ${mode === 'practice' ? 'untimed' : Math.max(0, Math.ceil(30 - elapsed)) + 's'}` : mode === 'chill' ? 'Chill' : 'Classic');
    text('arcade-storage', stored.saved ? `Records stay in this browser.${hooks.game === 'aim-trainer' ? ` Current input: ${input}; separate records for mouse, touch and practice.` : ' Each pace has its own record.'}` : 'Device saving is unavailable. Records last only on this page.');
    if (phase !== 'playing') {
      text('arcade-overlay-label', phase === 'over' ? 'One more round?' : phase === 'paused' ? 'Take your time' : phase === 'countdown' ? 'Ready when you are' : 'Make a little time');
      text('arcade-overlay-title', phase === 'countdown' ? String(Math.max(1, Math.ceil(countdown / .4))) : phase === 'paused' ? 'A little pause.' : phase === 'over' ? challenge && challenge.kind === 'daily' && meetsGoal() ? 'Challenge complete.' : 'Nicely played.' : hooks.game === 'snake' ? 'A growing appetite.' : hooks.game === 'dino-run' ? 'A little leap of faith.' : 'Find your focus.');
      text('arcade-overlay-note', phase === 'countdown' ? 'Get comfortable. Here we go.' : phase === 'paused' ? 'Choose Resume when you’re ready.' : 'Choose the button above to play.');
    }
    const target = panel.querySelector<HTMLButtonElement>('[data-aim-target]'); if (target) { target.hidden = phase !== 'playing'; target.disabled = phase !== 'playing'; }
    const jump = panel.querySelector<HTMLButtonElement>('[data-dino-jump]'); if (jump) jump.disabled = phase !== 'playing';
  }
  function wake() { if (!frame && active && visible && !document.hidden && (phase === 'playing' || phase === 'countdown')) frame = requestAnimationFrame(tick); }
  function tick(now: number) {
    frame = 0; if (!active || !visible || document.hidden) return;
    const dt = Math.min(.05, (now - (lastTime || now - 16.67)) / 1000); lastTime = now;
    if (phase === 'countdown') { countdown -= dt; if (countdown <= 0) { phase = 'playing'; text('arcade-status', mode === 'practice' ? 'No timer. Take your time.' : 'Your round is underway.'); } }
    else if (phase === 'playing') { elapsed += dt; hooks.step(dt); }
    update(); draw(); wake();
  }
  function setInput(next: InputKind) { if (!usedInput || next === input) input = next; else input = 'mixed'; usedInput = true; }
  function focusField() { const rect = field.getBoundingClientRect(); if (rect.top < 10 || rect.bottom > innerHeight) field.scrollIntoView({ block: 'center', behavior: 'instant' }); const next = field.getBoundingClientRect(); visible = next.bottom > 0 && next.top < innerHeight; if (canvas) canvas.focus({ preventScroll: true }); }
  function start() {
    stop(); seed = challenge?.seed ?? freshSeed(); rng = random(seed); score = 0; accuracy = undefined; elapsed = 0; usedInput = false;
    $('arcade-results').hidden = true; $('share-fallback').hidden = true; text('share-status', '');
    hooks.start(); phase = 'countdown'; countdown = 1.2; focusField(); update(); draw(); wake();
  }
  function primary() { if (!active) return; if (phase === 'ready' || phase === 'over') start(); else if (phase === 'paused') { focusField(); phase = 'countdown'; countdown = 1.2; update(); wake(); } else if (phase === 'playing') hooks.action?.(); }
  function pauseGame() { if (phase === 'playing' || phase === 'countdown') { phase = 'paused'; stop(); text('arcade-status', 'Paused. Choose Resume when you’re ready.'); update(); draw(); } }
  function meetsGoal() { return !!challenge && challenge.kind === 'daily' && score >= challenge.target && (accuracy ?? 100) >= challenge.accuracy; }
  function finish(value: number, note: string, aimAccuracy?: number) {
    if (phase !== 'playing') return;
    score = Math.min(999999, Math.max(0, Math.round(value * 10) / 10)); accuracy = aimAccuracy; phase = 'over'; stop();
    const completed = meetsGoal(), result = recordRound({ game: hooks.game, mode, input, score, accuracy, dailyAttempt: challenge?.kind === 'daily', daily: completed && challenge?.day === dayKey() ? challenge.day : undefined });
    stored = result; text('arcade-status', completed ? 'Daily challenge complete. Well played!' : note);
    $('arcade-results').hidden = false; $('arcade-share').hidden = mode === 'practice';
    text('arcade-result', `${score} ${hooks.game === 'snake' ? 'food collected' : hooks.game === 'dino-run' ? 'seconds survived' : `${score === 1 ? 'target' : 'targets'} hit · ${accuracy ?? 0}% accuracy`}${challenge?.kind === 'daily' ? completed ? ' · Challenge complete' : ' · Try the challenge again' : ''}`);
    text('arcade-badges', result.unlocked.length ? `Unlocked: ${result.unlocked.map(b => b.title).join(' · ')}` : 'A little progress, one round at a time.'); update(); draw();
  }
  action.addEventListener('click', primary, { signal });
  pause.addEventListener('click', pauseGame, { signal });
  $('arcade-reset').addEventListener('click', () => { stop(); phase = 'ready'; score = 0; elapsed = 0; accuracy = undefined; $('arcade-results').hidden = true; hooks.start(); text('arcade-status', 'A fresh start. Choose Start game when you’re ready.'); update(); draw(); }, { signal });
  modeSelect.addEventListener('change', () => { mode = modeSelect.value; phase = 'ready'; score = 0; elapsed = 0; accuracy = undefined; $('arcade-results').hidden = true; hooks.start(); update(); draw(); }, { signal });
  field.addEventListener('keydown', event => { if ((event.key.toLowerCase() === 'p' || event.key === 'Escape') && !event.repeat && !(event.target instanceof HTMLInputElement)) { event.preventDefault(); if (phase === 'paused' && event.key !== 'Escape') primary(); else pauseGame(); } }, { signal });
  $('arcade-share').addEventListener('click', async () => {
    const url = new URL(location.pathname, location.origin);
    if (challenge?.kind === 'daily') url.searchParams.set('daily', challenge.day);
    else { url.search = new URLSearchParams({ challenge: '1', v: String(RULES_VERSION), seed: String(seed), mode }).toString(); }
    const message = `${score} ${hooks.game === 'dino-run' ? 'seconds' : hooks.game === 'snake' ? 'food' : 'targets'}${accuracy !== undefined ? ` at ${accuracy}% accuracy` : ''}. Your turn: ${url.href}`;
    try { if (navigator.share) { await navigator.share({ title: 'A little friendly challenge', text: message }); text('share-status', 'Challenge shared.'); } else { await navigator.clipboard.writeText(message); text('share-status', 'Result and challenge link copied.'); } }
    catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; $('share-fallback').hidden = false; $<HTMLInputElement>('share-link').value = message; $<HTMLInputElement>('share-link').focus(); $<HTMLInputElement>('share-link').select(); text('share-status', 'Copy the result and link above.'); }
  }, { signal });
  if (challenge) { $('challenge-context').hidden = false; text('challenge-kind', challenge.kind === 'daily' ? `Daily challenge · ${challenge.day}${challenge.day !== dayKey() ? ' · archive' : ''}` : 'A friendly challenge'); text('challenge-goal', challenge.kind === 'daily' ? challengeGoal(hooks.game, challenge.target, challenge.accuracy) : 'Same seed, same pace. Compare results with your friend.'); }
  const resize = new ResizeObserver(measure); resize.observe(field);
  const viewport = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .15; if (!visible) pauseGame(); else wake(); }, { threshold: .15 }); viewport.observe(field);
  const themes = new MutationObserver(measure); themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return {
    get phase() { return phase; }, get mode() { return mode; }, get elapsed() { return elapsed; }, get challenge() { return challenge; }, get input() { return input; },
    random: () => rng(), signal, field, primary, pause: pauseGame, finish, draw, setInput,
    setScore(value: number, aimAccuracy?: number) { score = value; accuracy = aimAccuracy; },
    goalReached: () => meetsGoal(),
    status: (value: string) => text('arcade-status', value),
    ready() { panel.querySelectorAll<HTMLFieldSetElement>('[data-play-controls]').forEach(e => { e.disabled = false; }); hooks.start(); measure(); update(); },
    lifecycle: { setActive(value: boolean) { active = value; if (!value) pauseGame(); }, destroy() { active = false; stop(); abort.abort(); resize.disconnect(); viewport.disconnect(); themes.disconnect(); } } satisfies Activity,
  };
}
