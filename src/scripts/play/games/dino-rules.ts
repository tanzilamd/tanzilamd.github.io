export const DINO_W = 900, DINO_H = 350, GROUND = 282, DINO_X = 112, DINO_SIZE = 42;
export type Obstacle = { x: number; width: number; height: number };
export type Dino = { y: number; vy: number; elapsed: number; distance: number; next: number; obstacles: Obstacle[]; over: boolean; mode: string };
export function createDino(mode: string): Dino { return { y: 0, vy: 0, elapsed: 0, distance: 0, next: 2.1, obstacles: [], over: false, mode }; }
export function jumpDino(s: Dino): Dino { return !s.over && s.y === 0 ? { ...s, vy: 660 } : s; }
export function dinoSpeed(s: Dino) { return Math.min(s.mode === 'chill' ? 340 : 480, (s.mode === 'chill' ? 220 : 285) + s.elapsed * 2.2); }
export function stepDino(s: Dino, dt: number, random: () => number): Dino {
  if (s.over || dt <= 0) return s;
  dt = Math.min(dt, 1 / 60); const speed = dinoSpeed(s), vy = s.vy - 1800 * dt, y = Math.max(0, s.y + vy * dt);
  const obstacles = s.obstacles.map(o => ({ ...o, x: o.x - speed * dt })).filter(o => o.x + o.width >= -20);
  let next = s.next - dt;
  if (next <= 0) { obstacles.push({ x: DINO_W + 30, width: 24 + Math.floor(random() * 20), height: 32 + Math.floor(random() * 24) }); next = 1.35 + random() * .65; }
  const over = obstacles.some(o => DINO_X + DINO_SIZE - 7 > o.x + 4 && DINO_X + 7 < o.x + o.width - 4 && y + 6 < o.height);
  return { ...s, y, vy: y === 0 ? 0 : vy, elapsed: s.elapsed + dt, distance: s.distance + speed * dt, next, obstacles, over };
}
