import copy from '../../data/play.json';
import type { Activity } from './types';
type Point = { x: number; y: number };
type Stroke = { points: Point[]; color: string; size: number; erase: boolean; mirror: boolean };
const WIDTH = 1000, HEIGHT = 750, MAX_POINTS = 24000, MAX_STROKES = 120;
const STORAGE_KEY = 'offscript-doodle:v1';

export function mount(panel: HTMLElement): Activity {
  const canvas = panel.querySelector<HTMLCanvasElement>('[data-draw-canvas]')!;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable.');
  const ctx = context;
  const abort = new AbortController(), { signal } = abort;
  const undo = panel.querySelector<HTMLButtonElement>('[data-draw-undo]')!;
  const redo = panel.querySelector<HTMLButtonElement>('[data-draw-redo]')!;
  const saveNote = panel.querySelector<HTMLElement>('[data-draw-save]')!;
  const empty = panel.querySelector<HTMLElement>('[data-draw-empty]')!;
  const status = panel.querySelector<HTMLElement>('[data-draw-status]')!;
  const cursor = panel.querySelector<HTMLElement>('[data-draw-cursor]')!;
  const eraser = panel.querySelector<HTMLButtonElement>('[data-draw-eraser]')!;
  const mirrorButton = panel.querySelector<HTMLButtonElement>('[data-draw-mirror]')!;
  const palette = [...panel.querySelectorAll<HTMLButtonElement>('[data-draw-color]')];
  let strokes: Stroke[] = [], current: Stroke | undefined;
  let past: Stroke[][] = [], future: Stroke[][] = [];
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let dirty = false;
  let color = copy.palette[0].value, size = 8, erase = false, mirror = false, active = false;
  let pointer: number | undefined, bounds: DOMRect | undefined, keyboardPen = false;
  let pen: Point = { x: WIDTH / 2, y: HEIGHT / 2 }, promptIndex = -1;
  const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));
  const totalPoints = () => strokes.reduce((sum, stroke) => sum + stroke.points.length, 0) + (current?.points.length ?? 0);
  function tools() {
    undo.disabled = past.length === 0;
    redo.disabled = future.length === 0;
    empty.hidden = strokes.length > 0 || !!current;
    eraser.setAttribute('aria-pressed', String(erase));
    mirrorButton.setAttribute('aria-pressed', String(mirror));
    panel.querySelector('[data-mirror-label]')!.textContent = mirror ? 'on' : 'off';
    palette.forEach((button) => button.setAttribute('aria-pressed', String(!erase && button.dataset.drawColor === color)));
  }
  // Snapshots share immutable finished strokes. Bound history as well as live artwork.
  function trimHistory() {
    const points = () => [...past, ...future].reduce((sum, snapshot) => sum + snapshot.reduce((n, stroke) => n + stroke.points.length, 0), 0);
    while (past.length + future.length > 20 || points() > MAX_POINTS * 3) {
      if (past.length) past.shift(); else future.shift();
    }
  }
  function checkpoint() { past.push(strokes.slice()); future = []; trimHistory(); }
  function save() {
    clearTimeout(saveTimer);
    if (!dirty) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, strokes }));
      saveNote.textContent = 'Saved in this tab. Download PNG to keep it.';
    } catch { saveNote.textContent = 'Tab saving is unavailable. Download PNG before leaving.'; }
    dirty = false;
  }
  function changed() { dirty = true; clearTimeout(saveTimer); saveTimer = setTimeout(save, 150); }
  function restore() {
    try {
      // Check storage availability even before the first stroke.
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        if (raw.length > 2_000_000) throw new Error('Oversized drawing');
        const value = JSON.parse(raw);
        if (value?.version !== 1 || !Array.isArray(value.strokes) || value.strokes.length > MAX_STROKES) throw new Error('Invalid drawing');
        let points = 0;
        for (const stroke of value.strokes) {
          if (!stroke || !/^#[0-9a-f]{6}$/i.test(stroke.color) || !Number.isFinite(stroke.size) || stroke.size < 2 || stroke.size > 28 || typeof stroke.erase !== 'boolean' || typeof stroke.mirror !== 'boolean' || !Array.isArray(stroke.points) || !stroke.points.length) throw new Error('Invalid stroke');
          points += stroke.points.length;
          if (points > MAX_POINTS || stroke.points.some((point: Point) => !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > WIDTH || point.y < 0 || point.y > HEIGHT)) throw new Error('Invalid points');
        }
        strokes = value.strokes;
        if (strokes.length) { past = [[]]; status.textContent = 'Your drawing is back.'; }
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, strokes }));
      saveNote.textContent = 'Saved in this tab. Download PNG to keep it.';
    } catch { saveNote.textContent = 'Tab saving is unavailable. Download PNG before leaving.'; }
  }
  function segment(stroke: Stroke, a: Point, b?: Point) {
    ctx.save();
    ctx.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color; ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const reflected of stroke.mirror ? [false, true] : [false]) {
      const x = (point: Point) => reflected ? WIDTH - point.x : point.x;
      ctx.beginPath();
      if (b) { ctx.moveTo(x(a), a.y); ctx.lineTo(x(b), b.y); ctx.stroke(); }
      else { ctx.arc(x(a), a.y, stroke.size / 2, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }
  function redraw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    for (const stroke of [...strokes, ...(current ? [current] : [])]) {
      segment(stroke, stroke.points[0]);
      for (let index = 1; index < stroke.points.length; index++) segment(stroke, stroke.points[index - 1], stroke.points[index]);
    }
  }
  function measure() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const width = Math.min(2000, Math.round(rect.width * ratio));
    const height = Math.min(1600, Math.round(rect.height * ratio));
    if (canvas.width === width && canvas.height === height) return;
    finish();
    canvas.width = width; canvas.height = height;
    ctx.setTransform(width / WIDTH, 0, 0, height / HEIGHT, 0, 0);
    redraw();
  }
  function start(point: Point) {
    if (strokes.length >= MAX_STROKES || totalPoints() >= MAX_POINTS) { status.textContent = 'This canvas is full. Undo or clear to keep drawing.'; return false; }
    checkpoint();
    current = { points: [point], color, size, erase, mirror };
    segment(current, point); tools();
    return true;
  }
  function append(point: Point) {
    if (!current || totalPoints() >= MAX_POINTS) return;
    const previous = current.points[current.points.length - 1];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) < 1) return;
    current.points.push(point); segment(current, previous, point);
  }
  function finish() {
    if (current) { strokes = [...strokes, current]; current = undefined; changed(); }
    const previousPointer = pointer;
    pointer = undefined; bounds = undefined; keyboardPen = false;
    if (previousPointer !== undefined && canvas.hasPointerCapture(previousPointer)) canvas.releasePointerCapture(previousPointer);
    tools();
  }
  function coordinates(event: PointerEvent): Point {
    return { x: clamp((event.clientX - bounds!.left) / bounds!.width * WIDTH, WIDTH), y: clamp((event.clientY - bounds!.top) / bounds!.height * HEIGHT, HEIGHT) };
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (!active || pointer !== undefined || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault(); finish(); canvas.focus({ preventScroll: true }); cursor.hidden = true;
    bounds = canvas.getBoundingClientRect();
    const point = coordinates(event);
    if (!start(point)) { bounds = undefined; return; }
    pointer = event.pointerId; pen = point; canvas.setPointerCapture(pointer);
  }, { signal });
  canvas.addEventListener('pointermove', (event) => {
    if (pointer !== event.pointerId || !bounds || !active) return;
    const events = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
    for (const item of events.length ? events : [event]) { pen = coordinates(item); append(pen); }
  }, { signal });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(name, (event) => { if (pointer === (event as PointerEvent).pointerId) finish(); }, { signal });
  canvas.addEventListener('keydown', (event) => {
    if (!active || pointer !== undefined) return;
    if (event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      if (keyboardPen || event.key === 'Escape') finish();
      else keyboardPen = start({ ...pen });
    } else {
      const delta = event.shiftKey ? 45 : 15;
      const moves: Record<string, number[]> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] };
      const move = moves[event.key]; if (!move) return;
      event.preventDefault(); pen = { x: clamp(pen.x + move[0], WIDTH), y: clamp(pen.y + move[1], HEIGHT) };
      if (keyboardPen) append({ ...pen });
    }
    cursor.hidden = false; cursor.style.left = `${pen.x / WIDTH * 100}%`; cursor.style.top = `${pen.y / HEIGHT * 100}%`;
  }, { signal });
  canvas.addEventListener('blur', () => { finish(); cursor.hidden = true; }, { signal });
  palette.forEach((button) => button.addEventListener('click', () => { finish(); color = button.dataset.drawColor!; erase = false; tools(); }, { signal }));
  panel.querySelector<HTMLInputElement>('[data-draw-size]')!.addEventListener('input', (event) => { size = Number((event.target as HTMLInputElement).value); }, { signal });
  eraser.addEventListener('click', () => { finish(); erase = !erase; tools(); }, { signal });
  mirrorButton.addEventListener('click', () => { finish(); mirror = !mirror; tools(); status.textContent = mirror ? 'Mirror on. Every stroke gets a reflection.' : 'Mirror off.'; }, { signal });
  function undoDrawing() {
    finish();
    const previous = past.pop(); if (!previous) return;
    future.push(strokes); strokes = previous; trimHistory();
    redraw(); tools(); changed(); status.textContent = 'Undone.';
  }
  function redoDrawing() {
    finish();
    const next = future.pop(); if (!next) return;
    past.push(strokes); strokes = next; trimHistory();
    redraw(); tools(); changed(); status.textContent = 'Redone.';
  }
  undo.addEventListener('click', undoDrawing, { signal });
  redo.addEventListener('click', redoDrawing, { signal });
  panel.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || (event.target instanceof HTMLInputElement)) return;
    const key = event.key.toLowerCase();
    if (key === 'z' || key === 'y') { event.preventDefault(); if (key === 'y' || event.shiftKey) redoDrawing(); else undoDrawing(); }
  }, { signal });
  panel.querySelector('[data-draw-clear]')!.addEventListener('click', () => {
    finish();
    if (strokes.length) { checkpoint(); strokes = []; redraw(); tools(); changed(); status.textContent = 'Canvas cleared. Undo brings it back.'; }
  }, { signal });
  panel.querySelector('[data-draw-star]')!.addEventListener('click', () => {
    finish(); erase = false; tools();
    const center = { x: 220 + Math.random() * 560, y: 150 + Math.random() * 300 };
    const points = Array.from({ length: 11 }, (_, index) => { const angle = -Math.PI / 2 + index * Math.PI / 5; const r = index % 2 ? 24 : 57; return { x: center.x + Math.cos(angle) * r, y: center.y + Math.sin(angle) * r }; });
    if (start(points[0])) { points.slice(1).forEach(append); finish(); status.textContent = 'A star, just for you.'; }
  }, { signal });
  panel.querySelector('[data-draw-prompt-button]')!.addEventListener('click', () => {
    promptIndex = (promptIndex + 1) % copy.prompts.length;
    const prompt = copy.prompts[promptIndex] ?? 'Draw something unexpected.';
    panel.querySelector('[data-draw-prompt]')!.textContent = prompt; status.textContent = prompt;
  }, { signal });
  panel.querySelector('[data-draw-download]')!.addEventListener('click', () => {
    finish();
    const output = document.createElement('canvas'); output.width = canvas.width; output.height = canvas.height;
    const paint = output.getContext('2d'); if (!paint) { status.textContent = 'Download is unavailable in this browser.'; return; }
    paint.fillStyle = '#fffdf6'; paint.fillRect(0, 0, output.width, output.height); paint.drawImage(canvas, 0, 0);
    output.toBlob((blob) => {
      if (!blob) { status.textContent = 'Could not create the PNG. Please try again.'; return; }
      const url = URL.createObjectURL(blob), anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'a-little-doodle.png'; document.body.append(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500); status.textContent = 'Your PNG is ready.';
    }, 'image/png');
  }, { signal });
  panel.querySelectorAll<HTMLFieldSetElement>('[data-play-controls]').forEach((fieldset) => { fieldset.disabled = false; });
  panel.querySelector<HTMLButtonElement>('[data-draw-prompt-button]')!.disabled = false;
  const resize = new ResizeObserver(measure); resize.observe(canvas);
  restore(); measure(); redraw(); tools();
  return { setActive(value) { active = value; if (active) measure(); else { finish(); save(); cursor.hidden = true; } }, destroy() { active = false; finish(); save(); resize.disconnect(); abort.abort(); } };
}
