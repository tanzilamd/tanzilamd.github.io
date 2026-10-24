import { badges, dailyStreak, dayKey, dayNumber, scoredGames, validDay, type ScoredGame, type InputKind } from '../../../lib/game-zone.ts';
export type Round = { game: ScoredGame; mode: string; input: InputKind; score: number; accuracy?: number; result?: 'win' | 'loss' | 'draw'; daily?: string; dailyAttempt?: boolean };
type RecordEntry = { best: number; recent: { score: number; date: string; accuracy?: number; result?: Round['result'] }[] };
export type Progress = { version: 1; records: Record<string, RecordEntry>; badges: Record<string, string>; played: ScoredGame[]; days: string[]; wins: Record<string, { current: number; longest: number }>; chain?: { last: string; current: number; longest: number } };
const KEY = 'offscript-zone:v1';
const fresh = (): Progress => ({ version: 1, records: {}, badges: {}, played: [], days: [], wins: {} });
let memory: Progress | undefined;
const finiteScore = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 999999;
const bucketPattern = /^(snake|dino-run|aim-trainer|stack-tower|tic-tac-toe):(classic|chill|practice|step|easy|hard|local):(mouse|touch|keyboard|mixed):(daily|practice)$/;
export function validProgress(value: unknown): value is Progress {
  if (!value || typeof value !== 'object') return false;
  const p = value as Progress;
  return p.version === 1 && Array.isArray(p.played) && p.played.length <= 5 && p.played.every(id => scoredGames.includes(id)) && Array.isArray(p.days) && p.days.length <= 400 && p.days.every(validDay)
    && !!p.badges && typeof p.badges === 'object' && !Array.isArray(p.badges) && Object.entries(p.badges).length <= badges.length && Object.entries(p.badges).every(([id, day]) => badges.some(b => b.id === id) && validDay(day))
    && !!p.records && typeof p.records === 'object' && !Array.isArray(p.records) && Object.entries(p.records).length <= 100 && Object.entries(p.records).every(([key, r]) => bucketPattern.test(key) && r && finiteScore(r.best) && Array.isArray(r.recent) && r.recent.length <= 5 && r.recent.every(x => x && finiteScore(x.score) && validDay(x.date) && (x.accuracy === undefined || finiteScore(x.accuracy) && x.accuracy <= 100) && (x.result === undefined || ['win', 'draw', 'loss'].includes(x.result))))
    && !!p.wins && typeof p.wins === 'object' && !Array.isArray(p.wins) && Object.entries(p.wins).length <= 2 && Object.entries(p.wins).every(([key, w]) => ['easy', 'hard'].includes(key) && w && finiteScore(w.current) && finiteScore(w.longest) && w.current <= w.longest) && (p.chain === undefined || !!p.chain && validDay(p.chain.last) && finiteScore(p.chain.current) && finiteScore(p.chain.longest) && p.chain.current <= p.chain.longest);
}
export function readProgress(): { value: Progress; saved: boolean } {
  try {
    const raw = localStorage.getItem(KEY), parsed: unknown = raw && raw.length < 50000 ? JSON.parse(raw) : null;
    const value = validProgress(parsed) ? parsed : memory ?? fresh(); memory = value;
    return { value, saved: true };
  } catch { return { value: memory ??= fresh(), saved: false }; }
}
export function bucket(round: Pick<Round, 'game' | 'mode' | 'input' | 'daily' | 'dailyAttempt'>) { return `${round.game}:${round.mode}:${round.input}:${round.daily || round.dailyAttempt ? 'daily' : 'practice'}`; }
export function applyRound(progress: Progress, round: Round, today = dayKey()) {
  const p = structuredClone(progress), key = bucket(round);
  if (!bucketPattern.test(key) || !finiteScore(round.score) || round.accuracy !== undefined && (!finiteScore(round.accuracy) || round.accuracy > 100)) return p;
  const record = p.records[key] ?? { best: 0, recent: [] };
  p.records[key] = { best: Math.max(record.best, round.score), recent: [{ score: round.score, date: today, ...(round.accuracy !== undefined ? { accuracy: round.accuracy } : {}), ...(round.result ? { result: round.result } : {}) }, ...record.recent].slice(0, 5) };
  if (!p.played.includes(round.game)) p.played.push(round.game);
  const unlock = (id: string) => { p.badges[id] ??= today; };
  unlock('first');
  if (round.game === 'snake' && round.mode === 'classic' && round.score >= 10) unlock('snake');
  if (round.game === 'dino-run' && round.mode === 'classic' && round.score >= 45) unlock('dino');
  if (round.game === 'aim-trainer' && round.mode === 'classic' && round.input !== 'keyboard' && round.score >= 20 && (round.accuracy ?? 0) >= 90) unlock('aim');
  if (round.game === 'stack-tower' && round.score >= 20) unlock('tower');
  if (round.game === 'tic-tac-toe' && ['easy', 'hard'].includes(round.mode) && round.result) {
    const old = p.wins[round.mode] ?? { current: 0, longest: 0 }, current = round.result === 'win' ? Math.min(999999, old.current + 1) : 0;
    p.wins[round.mode] = { current, longest: Math.max(old.longest, current) };
    if (round.mode === 'hard' && round.result === 'draw') unlock('draw');
  }
  if (round.daily === today && !p.days.includes(today)) {
    const old = p.chain, current = old && dayNumber(today) - dayNumber(old.last) === 1 ? Math.min(999999, old.current + 1) : 1;
    p.chain = { last: today, current, longest: Math.max(old?.longest ?? dailyStreak(p.days, today).longest, current) };
    p.days = [...p.days, today].sort().slice(-400);
  }
  if (dailyStreak(p.days, today).current >= 3) unlock('daily');
  if (scoredGames.every(id => p.played.includes(id))) unlock('explorer');
  return p;
}
export function recordRound(round: Round) {
  const previous = readProgress(), value = applyRound(previous.value, round); memory = value; let saved = previous.saved;
  try { localStorage.setItem(KEY, JSON.stringify(value)); saved = true; } catch { saved = false; }
  window.dispatchEvent(new CustomEvent('offscript:progress'));
  return { value, saved, unlocked: badges.filter(b => value.badges[b.id] && !previous.value.badges[b.id]) };
}
export function legacyRecords(): { label: string; score: number }[] {
  try { const tower = JSON.parse(localStorage.getItem('offscript-tower:v1') ?? 'null'); return ['chill', 'classic', 'step'].flatMap(mode => tower && finiteScore(tower[mode]) && tower[mode] > 0 ? [{ label: `Stack Tower · ${mode} · existing best`, score: tower[mode] }] : []); } catch { return []; }
}

export function resetTicProgress(mode: 'easy' | 'hard' | 'local') {
  const value = structuredClone(readProgress().value);
  delete value.wins[mode];
  for (const key of Object.keys(value.records)) if (key.startsWith(`tic-tac-toe:${mode}:`)) delete value.records[key];
  memory = value;
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* Other games and earned badges remain available in memory. */ }
  window.dispatchEvent(new CustomEvent('offscript:progress'));
}
