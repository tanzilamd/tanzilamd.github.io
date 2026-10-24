import copy from '../data/play.json' with { type: 'json' };
export const scoredGames = ['snake', 'dino-run', 'aim-trainer', 'tic-tac-toe', 'stack-tower'] as const;
export type ScoredGame = typeof scoredGames[number];
export type ArcadeGame = 'snake' | 'dino-run' | 'aim-trainer';
export type InputKind = 'mouse' | 'touch' | 'keyboard' | 'mixed';
export const RULES_VERSION = 1;
export function dayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function validDay(day: unknown): day is string {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
}
export function dayNumber(day: string) { return Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000); }
export function hashSeed(text: string) { let n = 2166136261; for (const char of text) { n ^= char.charCodeAt(0); n = Math.imul(n, 16777619); } return n >>> 0; }
export function random(seed: number) { let value = seed >>> 0; return () => { value += 0x6D2B79F5; let n = value; n = Math.imul(n ^ n >>> 15, n | 1); n ^= n + Math.imul(n ^ n >>> 7, n | 61); return ((n ^ n >>> 14) >>> 0) / 4294967296; }; }
export function dailyChallenge(day = dayKey()) {
  if (!validDay(day)) throw new Error('Invalid challenge date');
  const entry = copy.zone.daily[((dayNumber(day) % copy.zone.daily.length) + copy.zone.daily.length) % copy.zone.daily.length];
  return { ...entry, game: entry.game as ArcadeGame, day, seed: hashSeed(`offscript:${RULES_VERSION}:${day}:${entry.game}`), mode: 'classic', kind: 'daily' as const };
}
export type Challenge = ReturnType<typeof dailyChallenge> | { kind: 'friend'; game: ArcadeGame; seed: number; mode: 'classic' | 'chill'; day?: undefined; target: number; accuracy: number };
export function challengeFrom(search: string, game: ArcadeGame): Challenge | undefined {
  const params = new URLSearchParams(search), day = params.get('daily');
  if (day && validDay(day) && day <= dayKey()) { const daily = dailyChallenge(day); if (daily.game === game) return daily; }
  const seed = params.get('seed');
  if (params.get('challenge') === '1' && params.get('v') === String(RULES_VERSION) && seed && /^\d{1,10}$/.test(seed) && Number(seed) <= 0xffffffff) {
    const mode = params.get('mode') === 'chill' && game !== 'aim-trainer' ? 'chill' : 'classic';
    return { kind: 'friend', game, seed: Number(seed), mode, target: 0, accuracy: 0 };
  }
}
export function challengeGoal(game: string, target: number, accuracy = 0) {
  return game === 'snake' ? `Collect ${target} food` : game === 'dino-run' ? `Run for ${target} seconds` : `Hit ${target} targets at ${accuracy}% accuracy`;
}
export function dailyStreak(dates: string[], today = dayKey()) {
  const days = [...new Set(dates.filter(validDay))].sort(); let longest = 0, length = 0, previous = -Infinity;
  for (const date of days) { const n = dayNumber(date); length = n === previous + 1 ? length + 1 : 1; longest = Math.max(longest, length); previous = n; }
  let current = 0, n = dayNumber(today); if (!days.includes(today)) n--;
  const numbers = new Set(days.map(dayNumber)); while (numbers.has(n--)) current++;
  return { current, longest };
}
export const badges = copy.zone.achievements;
