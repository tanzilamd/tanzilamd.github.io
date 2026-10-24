import copy from '../../data/play.json';
import { dailyChallenge, challengeGoal, dayKey, dayNumber, dailyStreak, scoredGames } from '../../lib/game-zone';
import { playRoutes } from '../../lib/play-routes';
import { readProgress, legacyRecords } from './games/progress';
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const titles = Object.fromEntries(copy.activities.map(a => [a.id, a.title]));
const filter = $<HTMLSelectElement>('[data-record-filter]');
function element(tag: string, text: string, className = '') { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; }
function render() {
  const today = dayKey(), challenge = dailyChallenge(today), { value: progress, saved } = readProgress();
  $('[data-zone-daily]').hidden = false;
  $('[data-daily-date]').textContent = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Dhaka', month: 'short', day: 'numeric' }).format(new Date());
  $('[data-daily-title]').textContent = titles[challenge.game]; $('[data-daily-description]').textContent = challengeGoal(challenge.game, challenge.target, challenge.accuracy);
  const link = $<HTMLAnchorElement>('[data-daily-link]'); link.href = `${playRoutes[challenge.game]}?daily=${today}`;
  link.firstChild!.textContent = progress.days.includes(today) ? 'Completed · Play again ' : 'Play today’s challenge ';
  $('[data-daily-note]').textContent = progress.days.includes(today) ? 'Today, done. Tomorrow, something new. Resets at midnight, Bangladesh time.' : 'New challenge at midnight, Bangladesh time.';
  $('[data-zone-progress]').hidden = false;
  const streak = dailyStreak(progress.days, today);
  if (progress.chain) { const gap = dayNumber(today) - dayNumber(progress.chain.last); streak.current = gap >= 0 && gap <= 1 ? progress.chain.current : 0; streak.longest = Math.max(streak.longest, progress.chain.longest); }
  $('[data-progress-streak]').textContent = `Daily streak: ${streak.current} ${streak.current === 1 ? 'day' : 'days'} · Longest: ${streak.longest}`;
  $('[data-progress-note]').textContent = saved ? 'Saved in this browser. Keep going at your own pace.' : 'Device saving is unavailable. Progress lasts only on this page.';
  for (const badge of copy.zone.achievements) { const li = $(`[data-badge="${badge.id}"]`), date = progress.badges[badge.id]; li.dataset.unlocked = String(!!date); li.querySelector('[data-badge-state]')!.textContent = date ? `Earned ${date}` : 'Not yet'; }
  const records = $('[data-zone-records]'); records.replaceChildren();
  const entries = Object.entries(progress.records).filter(([key]) => filter.value === 'all' || key.startsWith(filter.value + ':'));
  for (const [key, record] of entries.slice(0, 24)) {
    const [game, mode, input, kind] = key.split(':'), row = element('div', '', 'zone-record');
    const name = element('div', ''); name.append(element('strong', titles[game]), element('small', `${mode} · ${input}${kind === 'daily' ? ' · daily' : ''}`));
    const score = game === 'tic-tac-toe' ? mode === 'local' ? 'Shared-screen rounds' : `Best win streak: ${progress.wins[mode]?.longest ?? 0}` : `Best: ${record.best}`;
    row.append(name, element('span', score), element('small', `Recent: ${record.recent.map(r => (game === 'tic-tac-toe' && mode === 'local' ? r.score ? 'decided' : 'draw' : r.result ?? r.score) + (r.accuracy !== undefined ? ` (${r.accuracy}%)` : '')).join(' · ')}`)); records.append(row);
  }
  if (filter.value === 'all' || filter.value === 'stack-tower') for (const legacy of legacyRecords()) { const row = element('div', '', 'zone-record'); row.append(element('strong', legacy.label), element('span', String(legacy.score))); records.append(row); }
  if (!records.children.length) records.append(element('p', 'Your next round starts the story. Finished games will appear here.', 'game-storage-note'));
  const wins = Object.entries(progress.wins).map(([mode, value]) => `${mode}: ${value.current} consecutive wins`).join(' · ');
  if ((filter.value === 'all' || filter.value === 'tic-tac-toe') && wins) records.append(element('p', `Tic-tac-toe · ${wins}. A draw or loss breaks a win streak.`, 'game-storage-note'));
}
filter.addEventListener('change', render);
window.addEventListener('offscript:progress', render);
let rollover: ReturnType<typeof setTimeout>;
function refresh() { clearTimeout(rollover); render(); const untilMidnight = Date.parse(`${dayKey()}T18:00:00Z`) - Date.now(); rollover = setTimeout(refresh, Math.max(1000, untilMidnight + 100)); }
window.addEventListener('pageshow', refresh);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
window.addEventListener('pagehide', () => clearTimeout(rollover));
const surprise = $<HTMLButtonElement>('[data-random-game]'); surprise.hidden = false;
surprise.addEventListener('click', () => { let previous = ''; try { previous = sessionStorage.getItem('offscript-last-game') ?? ''; } catch {} const choices = scoredGames.filter(id => id !== previous), game = choices[Math.floor(Math.random() * choices.length)]; try { sessionStorage.setItem('offscript-last-game', game); } catch {} location.assign(playRoutes[game]); });
refresh();
