export type Direction = 'up' | 'down' | 'left' | 'right';
export type Cell = { x: number; y: number };
export type Snake = { body: Cell[]; direction: Direction; food: Cell | null; score: number; over: boolean; won: boolean; mode: string };
export const GRID = 20;
const vector: Record<Direction, Cell> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
export const opposite: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
export function foodFor(body: Cell[], random: () => number) {
  const free: Cell[] = []; for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (!body.some(p => p.x === x && p.y === y)) free.push({ x, y });
  return free.length ? free[Math.min(free.length - 1, Math.floor(random() * free.length))] : null;
}
export function createSnake(mode: string, random: () => number): Snake { const body = [{ x: 6, y: 10 }, { x: 5, y: 10 }, { x: 4, y: 10 }]; return { body, direction: 'right', food: foodFor(body, random), score: 0, over: false, won: false, mode }; }
export function snakeStep(state: Snake, direction: Direction, random: () => number): Snake {
  if (state.over) return state;
  if (direction === opposite[state.direction]) direction = state.direction;
  let x = state.body[0].x + vector[direction].x, y = state.body[0].y + vector[direction].y;
  if (state.mode === 'chill') { x = (x + GRID) % GRID; y = (y + GRID) % GRID; }
  const ate = state.food?.x === x && state.food.y === y, body = ate ? state.body : state.body.slice(0, -1);
  if (x < 0 || x >= GRID || y < 0 || y >= GRID || body.some(p => p.x === x && p.y === y)) return { ...state, direction, over: true };
  const next = [{ x, y }, ...state.body]; if (!ate) next.pop();
  const food = ate ? foodFor(next, random) : state.food;
  return { ...state, body: next, direction, food, score: state.score + (ate ? 1 : 0), over: !food, won: !food };
}
export function snakeInterval(mode: string, score: number) { return mode === 'chill' ? Math.max(.13, .22 - score * .002) : Math.max(.075, .165 - score * .003); }
