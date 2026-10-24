export type Mark = 'X' | 'O';
export type Board = (Mark | null)[];
export const winningLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export const other = (mark: Mark): Mark => mark === 'X' ? 'O' : 'X';
export const emptyCells = (board: Board) => board.flatMap((mark, index) => mark === null ? [index] : []);
export function outcome(board: Board): { winner: Mark | 'draw'; line: number[] } | null {
  for (const line of winningLines) {
    const mark = board[line[0]];
    if (mark && line.every((index) => board[index] === mark)) return { winner: mark, line };
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null;
}
function evaluate(board: Board, turn: Mark, computer: Mark, depth: number, cache: Map<string, number>): number {
  const result = outcome(board);
  if (result) return result.winner === 'draw' ? 0 : result.winner === computer ? 10 - depth : depth - 10;
  const key = board.map((mark) => mark ?? '-').join('') + turn;
  const saved = cache.get(key); if (saved !== undefined) return saved;
  const scores = emptyCells(board).map((index) => {
    const next = board.slice(); next[index] = turn;
    return evaluate(next, other(turn), computer, depth + 1, cache);
  });
  const score = turn === computer ? Math.max(...scores) : Math.min(...scores);
  cache.set(key, score); return score;
}
export function computerMove(board: Board, mark: Mark, difficulty: 'easy' | 'hard', random = Math.random): number | undefined {
  if (outcome(board)) return;
  const moves = emptyCells(board);
  if (!moves.length) return;
  if (difficulty === 'easy' && random() < .7) return moves[Math.min(moves.length - 1, Math.floor(random() * moves.length))];
  // Prefer the center/corners when several equally good moves exist.
  const order = [4, 0, 2, 6, 8, 1, 3, 5, 7].filter((index) => moves.includes(index));
  let best = -Infinity, choice = order[0];
  const cache = new Map<string, number>();
  for (const index of order) {
    const next = board.slice(); next[index] = mark;
    const score = evaluate(next, other(mark), mark, 0, cache);
    if (score > best) { best = score; choice = index; }
  }
  return choice;
}
