export const STAGE_WIDTH = 600, STAGE_HEIGHT = 660, BLOCK_HEIGHT = 32, BASE_WIDTH = 250, MARGIN = 24;
export type TowerMode = 'chill' | 'classic' | 'step';
export type Block = { x: number; width: number; level: number };
export type TowerState = {
  mode: TowerMode; phase: 'ready' | 'playing' | 'paused' | 'over';
  score: number; streak: number; blocks: Block[];
  moving: Block & { direction: 1 | -1 };
};
export function createTower(mode: TowerMode): TowerState {
  return { mode, phase: 'ready', score: 0, streak: 0, blocks: [{ x: (STAGE_WIDTH - BASE_WIDTH) / 2, width: BASE_WIDTH, level: 0 }], moving: { x: MARGIN, width: BASE_WIDTH, level: 1, direction: 1 } };
}
export function speed(state: TowerState) { return Math.min(state.mode === 'chill' ? 260 : 370, (state.mode === 'chill' ? 140 : 205) + state.score * (state.mode === 'chill' ? 7 : 9)); }
export function advanceTower(state: TowerState, seconds: number): TowerState {
  if (state.phase !== 'playing' || state.mode === 'step') return state;
  const min = MARGIN, max = STAGE_WIDTH - MARGIN - state.moving.width;
  let x = state.moving.x + state.moving.direction * speed(state) * Math.max(0, Math.min(seconds, .05));
  let direction = state.moving.direction;
  if (x > max) { x = max - (x - max); direction = -1; }
  if (x < min) { x = min + (min - x); direction = 1; }
  return { ...state, moving: { ...state.moving, x, direction } };
}
export function shiftTower(state: TowerState, amount: number): TowerState {
  if (state.phase !== 'playing' || state.mode !== 'step') return state;
  return { ...state, moving: { ...state.moving, x: Math.max(MARGIN, Math.min(STAGE_WIDTH - MARGIN - state.moving.width, state.moving.x + amount)) } };
}
export function settleBlock(previous: Block, moving: Block, tolerance: number) {
  const perfect = Math.abs(previous.x - moving.x) <= tolerance;
  const x = perfect ? previous.x : Math.max(previous.x, moving.x);
  const width = perfect ? previous.width : Math.min(previous.x + previous.width, moving.x + moving.width) - x;
  const cutoff = perfect ? null : moving.x < previous.x ? { x: moving.x, width: previous.x - moving.x, level: moving.level } : { x: x + Math.max(0, width), width: moving.x + moving.width - (x + Math.max(0, width)), level: moving.level };
  return { x, width: Math.max(0, width), perfect, missed: width < 10, cutoff };
}
export function dropTower(state: TowerState): { state: TowerState; event: 'perfect' | 'landed' | 'recovered' | 'miss' | 'idle'; cutoff?: Block | null } {
  if (state.phase !== 'playing') return { state, event: 'idle' };
  const previous = state.blocks[state.blocks.length - 1];
  const result = settleBlock(previous, state.moving, state.mode === 'classic' ? 5 : 8);
  if (result.missed) return { state: { ...state, phase: 'over', streak: 0 }, event: 'miss', cutoff: state.moving };
  const streak = result.perfect ? state.streak + 1 : 0;
  const recovered = streak > 0 && streak % 3 === 0 && result.width < BASE_WIDTH;
  const width = recovered ? Math.min(BASE_WIDTH, result.width + 12) : result.width;
  const block = { x: Math.max(MARGIN, Math.min(STAGE_WIDTH - MARGIN - width, result.x - (width - result.width) / 2)), width, level: state.moving.level };
  const direction = (block.level % 2 ? -1 : 1) as 1 | -1;
  return {
    state: { ...state, score: state.score + 1, streak, blocks: [...state.blocks.slice(-23), block], moving: { x: direction === 1 ? MARGIN : STAGE_WIDTH - MARGIN - width, width, level: block.level + 1, direction } },
    event: recovered ? 'recovered' : result.perfect ? 'perfect' : 'landed', cutoff: result.cutoff,
  };
}
