import type { Activity } from './types';
type Shape = { element: HTMLButtonElement; x: number; y: number; px: number; py: number; vx: number; vy: number; r: number; angle: number; spin: number };
const colors = ['#ef9c80', '#a6cbb5', '#edce83', '#9dc6d3', '#d6abd0'];
const kinds = ['circle', 'square', 'star'];

export function mount(panel: HTMLElement): Activity {
  const abort = new AbortController();
  let shapeEvents = new AbortController();
  const { signal } = abort;
  const stage = panel.querySelector<HTMLElement>('[data-physics-stage]')!;
  const add = panel.querySelector<HTMLButtonElement>('[data-physics-add]')!;
  const pause = panel.querySelector<HTMLButtonElement>('[data-physics-pause]')!;
  const gravityButton = panel.querySelector<HTMLButtonElement>('[data-physics-gravity]')!;
  const status = panel.querySelector<HTMLElement>('[data-physics-status]')!;
  const count = panel.querySelector<HTMLElement>('[data-physics-count]')!;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let shapes: Shape[] = [];
  let width = 600, height = 360, frame = 0, lastTime = 0;
  let quietFrames = 0;
  let active = false, visible = false, paused = preference.matches, gravity = true;
  let drag: { shape: Shape; pointer: number; dx: number; dy: number; left: number; top: number; time: number; x: number; y: number } | undefined;
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const random = (min: number, max: number) => min + Math.random() * (max - min);
  function render(shape: Shape) { shape.element.style.transform = `translate3d(${shape.x - shape.r}px,${shape.y - shape.r}px,0) rotate(${shape.angle}deg)`; }
  function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  function labels() {
    pause.textContent = paused ? 'Resume' : 'Pause';
    pause.setAttribute('aria-pressed', String(paused));
    pause.disabled = preference.matches;
    gravityButton.setAttribute('aria-pressed', String(gravity));
    panel.querySelector('[data-gravity-label]')!.textContent = gravity ? 'on' : 'off';
    count.textContent = `${shapes.length} / 16 shapes`;
    add.disabled = shapes.length >= 16;
    status.textContent = preference.matches ? 'Manual mode · reduced motion' : paused ? 'Paused. You can still arrange shapes.' : '';
  }
  function step(dt: number) {
    for (const shape of shapes) {
      if (drag?.shape === shape) continue;
      if (gravity) shape.vy += 1050 * dt;
      const damping = Math.pow(gravity ? .993 : .984, dt * 60);
      shape.vx *= damping; shape.vy *= damping;
      shape.x += shape.vx * dt; shape.y += shape.vy * dt;
      shape.angle += shape.spin * dt;
      if (shape.x < shape.r || shape.x > width - shape.r) { shape.x = clamp(shape.x, shape.r, width - shape.r); shape.vx *= -.75; }
      if (shape.y < shape.r) { shape.y = shape.r; shape.vy = Math.abs(shape.vy) * .7; }
      if (shape.y > height - shape.r) {
        shape.y = height - shape.r;
        shape.vy = Math.abs(shape.vy) < 30 ? 0 : -Math.abs(shape.vy) * .63;
        shape.vx *= .93; shape.spin *= .92;
      }
    }
    for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) {
      const a = shapes[i], b = shapes[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || .1;
      const overlap = a.r + b.r - distance;
      if (overlap <= 0) continue;
      const nx = dx / distance, ny = dy / distance;
      const aHeld = drag?.shape === a, bHeld = drag?.shape === b;
      if (!aHeld) { a.x -= nx * overlap * (bHeld ? 1 : .5); a.y -= ny * overlap * (bHeld ? 1 : .5); }
      if (!bHeld) { b.x += nx * overlap * (aHeld ? 1 : .5); b.y += ny * overlap * (aHeld ? 1 : .5); }
      const velocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (velocity < 0) {
        const impulse = -.78 * velocity;
        if (!aHeld) { a.vx -= impulse * nx; a.vy -= impulse * ny; }
        if (!bHeld) { b.vx += impulse * nx; b.vy += impulse * ny; }
      }
    }
    for (const shape of shapes) {
      shape.x = clamp(shape.x, shape.r, width - shape.r);
      shape.y = clamp(shape.y, shape.r, height - shape.r);
      if (Math.abs(shape.vx) < .4) shape.vx = 0;
      if (!gravity && Math.abs(shape.vy) < .4) shape.vy = 0;
      render(shape);
    }
  }
  function tick(now: number) {
    frame = 0;
    if (!active || !visible || paused || preference.matches || document.hidden) return;
    const dt = Math.min((now - (lastTime || now - 16.67)) / 1000, 1 / 30);
    lastTime = now;
    for (const shape of shapes) { shape.px = shape.x; shape.py = shape.y; }
    // Two small steps keep fast throws stable without an unbounded catch-up loop.
    step(dt / 2); step(dt / 2);
    // Resting stacks can sleep too; a shape needn't touch the floor itself.
    const moving = drag || shapes.some((shape) => Math.hypot(shape.x - shape.px, shape.y - shape.py) > .15);
    quietFrames = moving ? 0 : quietFrames + 1;
    if (quietFrames < 45) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }
  function wake() { quietFrames = 0; if (!frame && active && visible && !paused && !preference.matches && !document.hidden) frame = requestAnimationFrame(tick); }
  function release() {
    if (!drag) return;
    const held = drag;
    drag = undefined;
    if (held.shape.element.hasPointerCapture(held.pointer)) held.shape.element.releasePointerCapture(held.pointer);
    if (paused || preference.matches || !active) { held.shape.vx = 0; held.shape.vy = 0; }
    wake();
  }
  function makeShape(index: number) {
    const element = document.createElement('button');
    const kind = kinds[index % kinds.length];
    const r = 24 + (index % 3) * 4;
    element.type = 'button'; element.className = `physics-shape physics-${kind}`;
    element.setAttribute('aria-label', `Shape ${index + 1}, ${kind}. Use arrow keys to move.`);
    element.style.width = `${r * 2}px`; element.style.height = `${r * 2}px`;
    element.style.setProperty('--shape-color', colors[index % colors.length]);
    element.append(document.createElement('span'));
    const shape: Shape = { element, r, x: clamp(width * (.18 + (index % 4) * .2), r, width - r), y: clamp(58 + Math.floor(index / 4) * 95, r, height - r), px: 0, py: 0, vx: random(-65, 65), vy: random(-30, 15), angle: random(-22, 22), spin: random(-45, 45) };
    element.addEventListener('pointerdown', (event) => {
      if (!active || drag || (event.pointerType === 'mouse' && event.button !== 0)) return;
      event.preventDefault(); element.focus({ preventScroll: true });
      const bounds = stage.getBoundingClientRect();
      drag = { shape, pointer: event.pointerId, dx: event.clientX - bounds.left - shape.x, dy: event.clientY - bounds.top - shape.y, left: bounds.left, top: bounds.top, time: performance.now(), x: shape.x, y: shape.y };
      shape.vx = 0; shape.vy = 0;
      element.setPointerCapture(event.pointerId); wake();
    }, { signal: shapeEvents.signal });
    element.addEventListener('pointermove', (event) => {
      if (drag?.pointer !== event.pointerId || drag.shape !== shape) return;
      const now = performance.now(), elapsed = Math.max(8, now - drag.time) / 1000;
      shape.x = clamp(event.clientX - drag.left - drag.dx, r, width - r);
      shape.y = clamp(event.clientY - drag.top - drag.dy, r, height - r);
      shape.vx = clamp((shape.x - drag.x) / elapsed, -1200, 1200);
      shape.vy = clamp((shape.y - drag.y) / elapsed, -1200, 1200);
      drag.x = shape.x; drag.y = shape.y; drag.time = now;
      render(shape);
    }, { signal: shapeEvents.signal });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) element.addEventListener(name, (event) => { if (drag?.pointer === (event as PointerEvent).pointerId) release(); }, { signal: shapeEvents.signal });
    element.addEventListener('keydown', (event) => {
      const moves: Record<string, number[]> = { ArrowLeft: [-18, 0], ArrowRight: [18, 0], ArrowUp: [0, -18], ArrowDown: [0, 18] };
      const move = moves[event.key]; if (!move) return;
      event.preventDefault();
      shape.x = clamp(shape.x + move[0], r, width - r); shape.y = clamp(shape.y + move[1], r, height - r);
      shape.vx = move[0] * 8; shape.vy = move[1] * 8;
      render(shape); wake();
    }, { signal: shapeEvents.signal });
    shapes.push(shape); stage.append(element); render(shape);
  }
  function measure() {
    if (stage.clientWidth < 1 || stage.clientHeight < 1) return;
    const oldWidth = width, oldHeight = height;
    width = Math.max(80, stage.clientWidth); height = Math.max(100, stage.clientHeight);
    release();
    for (const shape of shapes) { shape.x = clamp(shape.x / oldWidth * width, shape.r, width - shape.r); shape.y = clamp(shape.y / oldHeight * height, shape.r, height - shape.r); render(shape); }
    wake();
  }
  function reset() { release(); stop(); shapeEvents.abort(); shapeEvents = new AbortController(); shapes.forEach((shape) => shape.element.remove()); shapes = []; measure(); for (let index = 0; index < 8; index++) makeShape(index); labels(); wake(); }
  add.addEventListener('click', () => { if (shapes.length < 16) { makeShape(shapes.length); labels(); wake(); } }, { signal });
  pause.addEventListener('click', () => { paused = !paused; if (paused) stop(); else wake(); labels(); }, { signal });
  gravityButton.addEventListener('click', () => { gravity = !gravity; shapes.forEach((shape) => { shape.vx += random(-45, 45); shape.vy = gravity ? shape.vy : random(-85, 30); }); labels(); wake(); }, { signal });
  panel.querySelector('[data-physics-reset]')!.addEventListener('click', reset, { signal });
  preference.addEventListener('change', () => { if (preference.matches) { paused = true; release(); stop(); } labels(); }, { signal });
  const resize = new ResizeObserver(measure); resize.observe(stage);
  const viewport = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else { release(); stop(); } }, { threshold: .05 }); viewport.observe(stage);
  panel.querySelectorAll<HTMLFieldSetElement>('[data-play-controls]').forEach((fieldset) => { fieldset.disabled = false; });
  reset();
  return { setActive(value) { active = value; if (active) { measure(); wake(); } else { release(); stop(); } }, destroy() { active = false; release(); stop(); shapeEvents.abort(); abort.abort(); resize.disconnect(); viewport.disconnect(); } };
}
