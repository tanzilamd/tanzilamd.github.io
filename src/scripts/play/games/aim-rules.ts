export type Aim = { hits: number; misses: number; target: { x: number; y: number }; previous?: { x: number; y: number } };
export function nextTarget(random: () => number, previous?: { x: number; y: number }) {
  let target = { x: .5, y: .5 };
  for (let i = 0; i < 20; i++) { target = { x: .16 + random() * .68, y: .16 + random() * .68 }; if (!previous || Math.hypot(target.x - previous.x, target.y - previous.y) > .22) return target; }
  return { x: previous && previous.x > .5 ? .2 : .8, y: previous && previous.y > .5 ? .2 : .8 };
}
export function aimAccuracy(hits: number, misses: number) { return hits + misses > 0 ? Math.round(hits / (hits + misses) * 100) : 0; }
export function hitAim(s: Aim, random: () => number): Aim { return { hits: s.hits + 1, misses: s.misses, previous: s.target, target: nextTarget(random, s.target) }; }
