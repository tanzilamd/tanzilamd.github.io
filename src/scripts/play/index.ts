import type { Activity } from './types';
const workspace = document.querySelector<HTMLElement>('[data-game-id]')!;
const status = workspace.querySelector<HTMLElement>('[data-play-load]')!;
const retry = workspace.querySelector<HTMLButtonElement>('[data-play-retry]')!;
const panel = workspace.querySelector<HTMLElement>('[data-play-panel]')!;
const loaders = {
  playground: () => import('./physics'),
  draw: () => import('./drawing'),
  button: () => import('./surprise'),
  'tic-tac-toe': () => import('./tic-tac-toe'),
  'stack-tower': () => import('./stack-tower'),
  snake: () => import('./snake'),
  'dino-run': () => import('./dino-run'),
  'aim-trainer': () => import('./aim-trainer'),
};
const key = workspace.dataset.gameId as keyof typeof loaders;
let activity: Activity | undefined;
let loading = false, hidden = false;
function sync() { activity?.setActive(!document.hidden && !hidden); }
async function open() {
  if (loading || activity) return;
  loading = true; retry.hidden = true; status.textContent = 'Opening your little break…';
  try {
    const module = await loaders[key]();
    activity = module.mount(panel);
    status.textContent = ''; sync();
  } catch {
    status.textContent = 'This activity could not open in your browser. Try again or choose another one.';
    retry.hidden = false;
  } finally { loading = false; }
}
retry.addEventListener('click', () => void open());
document.addEventListener('visibilitychange', sync);
window.addEventListener('pagehide', (event) => { hidden = true; sync(); if (!event.persisted) { activity?.destroy(); activity = undefined; } });
window.addEventListener('pageshow', (event) => { hidden = false; if (event.persisted) { if (activity) sync(); else void open(); } });
void open();
