import test from 'node:test';
import assert from 'node:assert/strict';
import { computerMove, outcome, other, winningLines } from '../src/scripts/play/games/tic-rules.ts';
import { advanceTower, BASE_WIDTH, createTower, dropTower, MARGIN, settleBlock, shiftTower, STAGE_WIDTH } from '../src/scripts/play/games/tower-rules.ts';

test('tic-tac-toe detects every winning line, draws, and finished games', () => {
  for (const line of winningLines) for (const mark of ['X', 'O']) {
    const board = Array(9).fill(null); line.forEach((index) => { board[index] = mark; });
    assert.deepEqual(outcome(board), { winner: mark, line });
    assert.equal(computerMove(board, other(mark), 'hard'), undefined);
  }
  assert.equal(outcome(Array(9).fill(null)), null);
  assert.equal(outcome(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']).winner, 'draw');
  const board = ['X', null, null, null, null, null, null, null, null], copy = board.slice();
  assert.equal(computerMove(board, 'O', 'easy', () => 0), 1);
  assert.deepEqual(board, copy, 'Choosing a move must not mutate the live board');
});

test('Hard cannot lose against any legal human continuation as either X or O', () => {
  let endings = 0;
  for (const computer of ['X', 'O']) {
    function explore(board, turn) {
      const result = outcome(board);
      if (result) { assert.notEqual(result.winner, other(computer)); endings++; return; }
      if (turn === computer) {
        const index = computerMove(board, computer, 'hard');
        assert.equal(board[index], null);
        const next = board.slice(); next[index] = turn; explore(next, other(turn));
      } else for (let index = 0; index < 9; index++) if (!board[index]) {
        const next = board.slice(); next[index] = turn; explore(next, other(turn));
      }
    }
    explore(Array(9).fill(null), 'X');
  }
  assert.ok(endings > 500, `Explored ${endings} complete games`);
});

test('tower overlap trims either side, snaps perfect landings and rejects tiny or missed slices', () => {
  const previous = { x: 100, width: 150, level: 0 };
  assert.deepEqual(settleBlock(previous, { x: 105, width: 150, level: 1 }, 5), { x: 100, width: 150, perfect: true, missed: false, cutoff: null });
  for (const x of [80, 120]) {
    const settled = settleBlock(previous, { x, width: 150, level: 1 }, 5);
    assert.equal(settled.width, 130); assert.equal(settled.cutoff.width, 20); assert.equal(settled.missed, false);
  }
  for (const x of [-80, 250, 245]) assert.equal(settleBlock(previous, { x, width: 150, level: 1 }, 5).missed, true);
});

test('tower motion has equal pace across refresh rates and keeps blocks in bounds', () => {
  const positions = [];
  for (const hz of [30, 60, 120]) {
    let state = { ...createTower('classic'), phase: 'playing' };
    for (let frame = 0; frame < hz * 8; frame++) {
      state = advanceTower(state, 1 / hz);
      assert.ok(state.moving.x >= MARGIN && state.moving.x + state.moving.width <= STAGE_WIDTH - MARGIN);
    }
    positions.push(state.moving.x);
  }
  assert.ok(Math.max(...positions) - Math.min(...positions) < .001);
  const paused = { ...createTower('classic'), phase: 'paused' };
  assert.deepEqual(advanceTower(paused, 10), paused);
  const step = { ...createTower('step'), phase: 'playing' };
  assert.deepEqual(advanceTower(step, 10), step);
  assert.equal(shiftTower(step, -1000).moving.x, MARGIN);
  assert.equal(shiftTower(step, 1000).moving.x + step.moving.width, STAGE_WIDTH - MARGIN);
});

test('tower recovery, losing, and long runs keep scores and history correct', () => {
  let state = { ...createTower('chill'), phase: 'playing' };
  state.moving.x = state.blocks[0].x + 30;
  state = dropTower(state).state;
  assert.equal(state.moving.width, BASE_WIDTH - 30);
  let event;
  for (let i = 0; i < 3; i++) { state.moving.x = state.blocks.at(-1).x; const dropped = dropTower(state); state = dropped.state; event = dropped.event; }
  assert.equal(event, 'recovered'); assert.equal(state.moving.width, BASE_WIDTH - 18);
  for (let i = state.score; i < 1000; i++) {
    state.moving.x = state.blocks.at(-1).x; state = dropTower(state).state;
    assert.ok(state.blocks.length <= 24); assert.ok(state.moving.width <= BASE_WIDTH);
  }
  assert.equal(state.score, 1000);
  state.moving.x = MARGIN;
  state.blocks[state.blocks.length - 1] = { ...state.blocks.at(-1), x: 300, width: 80 };
  const missed = dropTower(state);
  assert.equal(missed.event, 'miss'); assert.equal(missed.state.phase, 'over'); assert.equal(missed.state.score, 1000);
  assert.equal(dropTower(missed.state).event, 'idle');
});
