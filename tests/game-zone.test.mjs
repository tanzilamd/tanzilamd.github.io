import test from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, dailyChallenge, dailyStreak, random, challengeFrom, validDay } from '../src/lib/game-zone.ts';
import { createSnake, snakeStep, GRID, foodFor } from '../src/scripts/play/games/snake-rules.ts';
import { createDino, jumpDino, stepDino, dinoSpeed, DINO_X, DINO_SIZE } from '../src/scripts/play/games/dino-rules.ts';
import { nextTarget, hitAim, aimAccuracy } from '../src/scripts/play/games/aim-rules.ts';
import { applyRound, validProgress, bucket } from '../src/scripts/play/games/progress.ts';
const empty = () => ({ version: 1, records: {}, badges: {}, played: [], days: [], wins: {} });

test('Dhaka midnight changes daily configuration without deployment; seeds and links are stable', () => {
  assert.equal(dayKey(new Date('2026-10-24T17:59:59Z')), '2026-10-24');
  assert.equal(dayKey(new Date('2026-10-24T18:00:00Z')), '2026-10-25');
  assert.equal(validDay('2026-02-31'), false);
  const seen = new Set();
  for (const date of ['2026-10-21','2026-10-22','2026-10-23']) { const first = dailyChallenge(date); assert.deepEqual(first, dailyChallenge(date)); seen.add(first.game); assert.deepEqual(challengeFrom(`?daily=${date}`, first.game), first); }
  assert.equal(seen.size, 3);
  assert.equal(challengeFrom('?challenge=1&v=1&seed=4294967296', 'snake'), undefined);
  assert.equal(challengeFrom('?challenge=1&v=999&seed=42', 'snake'), undefined);
  assert.equal(challengeFrom('?daily=2999-01-01', 'snake'), undefined);
  const link = challengeFrom('?challenge=1&v=1&seed=42&mode=chill', 'snake'); assert.equal(link.seed,42); assert.equal(link.mode,'chill');
  assert.deepEqual(Array.from({length:8},random(42)),Array.from({length:8},random(42)));
});
test('Snake grows, prevents reversals, permits vacated-tail moves and handles walls/wrap/full boards', () => {
  let s=createSnake('classic',random(42)); const before=structuredClone(s); s={...s,food:{x:7,y:10}};
  const ate=snakeStep(s,'left',random(4)); assert.equal(ate.direction,'right'); assert.equal(ate.score,1); assert.equal(ate.body.length,4); assert.equal(before.body.length,3);
  const edge={...s,body:[{x:19,y:10},{x:18,y:10},{x:17,y:10}],food:{x:1,y:1}};
  assert.equal(snakeStep(edge,'right',random(4)).over,true);
  assert.equal(snakeStep({...edge,mode:'chill'},'right',random(4)).body[0].x,0);
  const tail={...s,direction:'left',body:[{x:2,y:1},{x:2,y:2},{x:1,y:2},{x:1,y:1}],food:{x:9,y:9}};
  assert.equal(snakeStep(tail,'left',random(4)).over,false);
  const body=[];for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++)body.push({x,y}); assert.equal(foodFor(body,random(2)),null);
  for(let seed=0;seed<100;seed++){ const state=createSnake('classic',random(seed));assert.ok(!state.body.some(p=>p.x===state.food.x&&p.y===state.food.y)); }
});
test('Dino physics is repeatable, rejects midair jumps and has reachable capped-speed obstacle courses', () => {
  const start=createDino('classic'), jumped=jumpDino(start);assert.equal(start.vy,0);const midair={...jumped,y:1};assert.equal(jumpDino(midair),midair);
  for(const mode of ['classic','chill']) for(const seed of [1,42,100]) {
    let s=createDino(mode);const rng=random(seed);
    for(let i=0;i<90*120;i++) { const next=s.obstacles.find(o=>o.x+o.width>DINO_X+7); if(next&&next.x<DINO_X+DINO_SIZE+dinoSpeed(s)*.22)s=jumpDino(s); s=stepDino(s,1/120,rng); assert.equal(s.over,false,`${mode}/${seed}/${i}`);assert.ok(s.obstacles.length<8); }
    assert.ok(s.elapsed>89);assert.ok(dinoSpeed(s)<=480);
  }
});
test('Aim targets stay in bounds, move away from the previous target and count accuracy clearly', () => {
  const rng=random(3);let state={hits:0,misses:0,target:nextTarget(rng)};
  for(let i=0;i<100;i++){const before=state;state=hitAim(state,rng);assert.equal(before.hits,i);assert.ok(Math.hypot(state.target.x-before.target.x,state.target.y-before.target.y)>.22);assert.ok(state.target.x>=.16&&state.target.x<=.84);}
  assert.equal(aimAccuracy(20,5),80);assert.equal(aimAccuracy(0,0),0);
});
test('daily streaks count dates once, retain the previous day and break after a missed day', () => {
  assert.deepEqual(dailyStreak(['2026-10-21','2026-10-22','2026-10-22','2026-10-23'],'2026-10-23'),{current:3,longest:3});
  assert.equal(dailyStreak(['2026-10-23'],'2026-10-24').current,1);
  assert.equal(dailyStreak(['2026-10-23'],'2026-10-25').current,0);
});
test('progress separates modes/inputs/daily attempts, bounds history and awards only relevant achievements', () => {
  let p=empty();const round={game:'aim-trainer',mode:'classic',input:'mouse',score:20,accuracy:90};
  for(let i=0;i<10;i++)p=applyRound(p,round,'2026-10-23');assert.equal(p.records[bucket(round)].recent.length,5);assert.ok(p.badges.aim);assert.equal(p.badges.first,'2026-10-23');
  const touch={...round,input:'touch',score:10};p=applyRound(p,touch,'2026-10-23');assert.equal(p.records[bucket(touch)].best,10);
  const daily={...round,daily:'2026-10-23',dailyAttempt:true};p=applyRound(p,daily,'2026-10-23');p=applyRound(p,daily,'2026-10-23');assert.deepEqual(p.days,['2026-10-23']);assert.ok(p.records[bucket(daily)]);
  p=applyRound(p,{...daily,daily:'2026-10-22'},'2026-10-23');assert.deepEqual(p.days,['2026-10-23']);assert.ok(validProgress(p));
  assert.equal(validProgress({...p,days:['not-a-day']}),false);assert.deepEqual(applyRound(p,{...round,score:NaN}),p);
});
test('win streaks follow human results per difficulty; draws break wins but can earn Hard badge', () => {
  let p=empty();const round={game:'tic-tac-toe',mode:'easy',input:'mixed',score:1,result:'win'};
  p=applyRound(p,round);p=applyRound(p,round);assert.deepEqual(p.wins.easy,{current:2,longest:2});
  p=applyRound(p,{...round,result:'draw'});assert.deepEqual(p.wins.easy,{current:0,longest:2});assert.equal(p.badges.draw,undefined);
  p=applyRound(p,{...round,mode:'hard',result:'draw'});assert.ok(p.badges.draw);assert.equal(p.wins.hard.current,0);assert.ok(validProgress(p));
});
test('bounded daily history does not truncate a long-running streak', () => {
 let p=empty();for(let i=0;i<500;i++){const day=new Date(Date.UTC(2025,0,1)+i*86400000).toISOString().slice(0,10);p=applyRound(p,{game:'snake',mode:'classic',input:'keyboard',score:8,daily:day},day);}
 assert.equal(p.days.length,400);assert.equal(p.chain.current,500);assert.equal(p.chain.longest,500);assert.ok(validProgress(p));assert.equal(validProgress({...p,records:[]}),false);
});
