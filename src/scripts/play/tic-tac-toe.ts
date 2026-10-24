import { recordRound, readProgress, resetTicProgress } from './games/progress';
import type { Activity } from './types';
import { computerMove, other, outcome, type Board, type Mark } from './games/tic-rules';
import { loadLocal, saveLocal, validScore } from './games/storage';

type Scores = { X: number; O: number; you: number; computer: number; draw: number };
type ScoreBook = { easy: Scores; hard: Scores; local: Scores };
const fresh = (): Scores => ({ X: 0, O: 0, you: 0, computer: 0, draw: 0 });
const validBook = (value: unknown): value is ScoreBook => !!value && typeof value === 'object' && ['easy', 'hard', 'local'].every((key) => {
  const scores = (value as Record<string, unknown>)[key];
  return !!scores && typeof scores === 'object' && ['X', 'O', 'you', 'computer', 'draw'].every((mark) => validScore((scores as Record<string, unknown>)[mark]));
});
const icons = {
  X: '<svg viewBox="0 0 100 100" class="tic-mark" aria-hidden="true"><path d="m28 28 44 44m0-44L28 72"/></svg>',
  O: '<svg viewBox="0 0 100 100" class="tic-mark" aria-hidden="true"><circle cx="50" cy="50" r="28"/></svg>',
};

export function mount(panel: HTMLElement): Activity {
  const abort = new AbortController(), { signal } = abort;
  const cells = [...panel.querySelectorAll<HTMLButtonElement>('[data-tic-cell]')];
  const status = panel.querySelector<HTMLElement>('[data-tic-status]')!;
  const line = panel.querySelector<SVGElement>('[data-tic-line]')!;
  const stored = loadLocal('offscript-tic:v1', validBook, { easy: fresh(), hard: fresh(), local: fresh() });
  const scores = stored.value;
  let canSave = stored.saved;
  let board: Board = Array(9).fill(null), turn: Mark = 'X', human: Mark = 'X';
  let mode: 'computer' | 'local' = 'computer', difficulty: 'easy' | 'hard' = 'easy';
  let active = false, timer: ReturnType<typeof setTimeout> | undefined, version = 0;
  let recorded = false;
  const bucket = () => mode === 'local' ? scores.local : scores[difficulty];
  function cancelComputer() { version++; clearTimeout(timer); timer = undefined; }
  function store() { canSave = saveLocal('offscript-tic:v1', scores); }
  function render() {
    const result = outcome(board), thinking = mode === 'computer' && turn !== human && !result;
    const book = bucket();
    cells.forEach((cell, index) => {
      const mark = board[index];
      if ((cell.dataset.mark || null) !== mark) { cell.innerHTML = mark ? icons[mark] : ''; cell.dataset.mark = mark ?? ''; }
      cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${mark ?? 'empty'}`);
      cell.setAttribute('aria-disabled', String(!!mark || !!result || thinking));
      cell.classList.toggle('tic-winning', result?.line.includes(index) ?? false);
    });
    line.style.display = result?.line.length ? '' : 'none';
    if (result?.line.length) {
      const first = result.line[0], last = result.line[2], segment = line.querySelector('line')!;
      segment.setAttribute('x1', String(first % 3 * 100 + 50)); segment.setAttribute('y1', String(Math.floor(first / 3) * 100 + 50));
      segment.setAttribute('x2', String(last % 3 * 100 + 50)); segment.setAttribute('y2', String(Math.floor(last / 3) * 100 + 50));
    }
    status.textContent = result ? result.winner === 'draw' ? 'A draw. One more round?' : mode === 'local' ? `${result.winner} wins. Nicely played!` : result.winner === human ? 'You win. Nicely played!' : 'Computer wins. Your rematch awaits.' : thinking ? 'Computer is thinking…' : mode === 'local' ? `${turn}’s turn. Make your move.` : `You’re ${human}. Your move.`;
    for (const mark of ['X', 'O'] as const) {
      panel.querySelector(`[data-tic-${mark.toLowerCase()}]`)!.textContent = String(mode === 'local' ? book[mark] : book[mark === human ? 'you' : 'computer']);
      panel.querySelector(`[data-tic-${mark.toLowerCase()}-label]`)!.textContent = mode === 'local' ? `Player ${mark}` : `${mark === human ? 'You' : 'Computer'} · ${mark}`;
    }
    panel.querySelector('[data-tic-draw]')!.textContent = String(book.draw);
    panel.querySelector('[data-tic-note]')!.textContent = mode === 'local' ? 'Two players. One screen. Take turns as X and O.' : difficulty === 'hard' ? 'Hard plays perfectly. A draw is a good result.' : 'Easy leaves a little room for luck.';
    panel.querySelector('[data-tic-storage]')!.textContent = canSave ? 'Scores stay on this device, separately for each mode.' : 'Scores stay for this visit. Device saving is unavailable.';
    const streak = readProgress().value.wins[difficulty];
    panel.querySelector<HTMLElement>('[data-tic-streak]')!.textContent = mode === 'computer' ? `Win streak: ${streak?.current ?? 0} · Best: ${streak?.longest ?? 0}. A draw or loss breaks the streak.` : '';
    panel.querySelector<HTMLFieldSetElement>('[data-tic-computer-options]')!.disabled = mode === 'local';
    panel.querySelector<HTMLFieldSetElement>('[data-tic-mark-options]')!.disabled = mode === 'local';
  }
  function finishTurn() {
    const result = outcome(board);
    if (result && !recorded) { const book = bucket(); const key = result.winner === 'draw' ? 'draw' : mode === 'local' ? result.winner : result.winner === human ? 'you' : 'computer'; book[key] = Math.min(999999, book[key] + 1); recorded = true; store(); recordRound({ game: 'tic-tac-toe', mode: mode === 'local' ? 'local' : difficulty, input: 'mixed', score: mode === 'local' ? result.winner === 'draw' ? 0 : 1 : key === 'you' ? 1 : 0, result: mode === 'local' ? undefined : result.winner === 'draw' ? 'draw' : key === 'you' ? 'win' : 'loss' }); }
    render(); scheduleComputer();
  }
  function scheduleComputer() {
    if (!active || mode !== 'computer' || turn === human || outcome(board) || timer) return;
    const token = version;
    timer = setTimeout(() => {
      timer = undefined;
      if (!active || token !== version || mode !== 'computer' || turn === human || outcome(board)) return;
      const index = computerMove(board, turn, difficulty);
      if (index !== undefined) { board[index] = turn; turn = other(turn); finishTurn(); }
    }, 320);
  }
  function newRound() { cancelComputer(); board = Array(9).fill(null); turn = 'X'; recorded = false; render(); scheduleComputer(); }
  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => {
      if (!active || board[index] || outcome(board) || (mode === 'computer' && turn !== human)) return;
      cancelComputer(); board[index] = turn; turn = other(turn); finishTurn();
    }, { signal });
    cell.addEventListener('focus', () => cells.forEach((item) => { item.tabIndex = item === cell ? 0 : -1; }), { signal });
    cell.addEventListener('keydown', (event) => {
      const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
      if (event.key in deltas) { event.preventDefault(); cells[(index + deltas[event.key] + 9) % 9].focus(); }
      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); cells[event.key === 'Home' ? 0 : 8].focus(); }
    }, { signal });
  });
  for (const input of panel.querySelectorAll<HTMLInputElement>('[data-tic-mode], [data-tic-difficulty], [data-tic-mark]')) input.addEventListener('change', () => {
    mode = panel.querySelector<HTMLInputElement>('[data-tic-mode]:checked')!.value as typeof mode;
    difficulty = panel.querySelector<HTMLInputElement>('[data-tic-difficulty]:checked')!.value as typeof difficulty;
    human = panel.querySelector<HTMLInputElement>('[data-tic-mark]:checked')!.value as Mark;
    newRound();
  }, { signal });
  panel.querySelector('[data-tic-new]')!.addEventListener('click', newRound, { signal });
  panel.querySelector('[data-tic-reset-scores]')!.addEventListener('click', () => { Object.assign(bucket(), fresh()); store(); resetTicProgress(mode === 'local' ? 'local' : difficulty); render(); }, { signal });
  panel.querySelectorAll<HTMLFieldSetElement>('[data-play-controls]').forEach((fieldset) => { fieldset.disabled = false; });
  cells.forEach((cell) => { cell.disabled = false; });
  panel.querySelector<HTMLButtonElement>('[data-tic-new]')!.disabled = false;
  panel.querySelector<HTMLButtonElement>('[data-tic-reset-scores]')!.disabled = false;
  render();
  return { setActive(value) { active = value; if (!active) cancelComputer(); else scheduleComputer(); }, destroy() { active = false; cancelComputer(); abort.abort(); } };
}
