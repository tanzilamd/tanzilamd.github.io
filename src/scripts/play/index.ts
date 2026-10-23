import copy from '../../data/play.json';
import type { Activity } from './types';

const workspace = document.querySelector<HTMLElement>('[data-play-workspace]')!;
const title = document.querySelector<HTMLElement>('[data-workspace-title]')!;
const label = document.querySelector<HTMLElement>('[data-workspace-label]')!;
const status = document.querySelector<HTMLElement>('[data-play-load]')!;
const retry = document.querySelector<HTMLButtonElement>('[data-play-retry]')!;
const choices = [...document.querySelectorAll<HTMLAnchorElement>('[data-play-choice]')];
const panels = [...document.querySelectorAll<HTMLElement>('[data-play-panel]')];
const loaders = {
  playground: () => import('./physics'),
  draw: () => import('./drawing'),
  button: () => import('./surprise'),
};
type Key = keyof typeof loaders;
const activities = new Map<Key, Activity>();
const loading = new Map<Key, Promise<Activity>>();
let active: Key | undefined;
let version = 0;

function syncActivity() { activities.forEach((activity, key) => activity.setActive(key === active && !document.hidden)); }
async function open(key: Key, focus = true) {
  const token = ++version;
  active = key;
  syncActivity();
  workspace.hidden = false;
  panels.forEach((panel) => { panel.hidden = panel.dataset.playPanel !== key; });
  choices.forEach((choice) => choice.setAttribute('aria-expanded', String(choice.dataset.playChoice === key)));
  const info = copy.activities.find((activity) => activity.id === key)!;
  title.textContent = info.title;
  label.textContent = info.label;
  retry.hidden = true;
  status.textContent = activities.has(key) ? '' : 'Opening your little break…';
  if (focus) title.focus({ preventScroll: true });
  if (focus) workspace.scrollIntoView({ behavior: 'instant', block: 'start' });
  try {
    let activity = activities.get(key);
    if (!activity) {
      let promise = loading.get(key);
      if (!promise) {
        const panel = panels.find((panel) => panel.dataset.playPanel === key)!;
        promise = loaders[key]().then((module) => module.mount(panel));
        loading.set(key, promise);
      }
      activity = await promise;
      activities.set(key, activity);
      loading.delete(key);
    }
    if (token !== version) { syncActivity(); return; }
    status.textContent = '';
    syncActivity();
  } catch {
    loading.delete(key);
    if (token !== version) return;
    status.textContent = 'This activity could not open in your browser. Try again or choose another one.';
    retry.hidden = false;
  }
}
function close(focus = true) {
  version++;
  const previous = active;
  active = undefined;
  syncActivity();
  workspace.hidden = true;
  panels.forEach((panel) => { panel.hidden = true; });
  choices.forEach((choice) => choice.setAttribute('aria-expanded', 'false'));
  if (focus) choices.find((choice) => choice.dataset.playChoice === previous)?.focus();
}
function fromUrl(focus = false) {
  const key = location.hash.slice(1);
  if (Object.hasOwn(loaders, key)) void open(key as Key, focus);
  else close(false);
}
choices.forEach((choice) => {
  choice.setAttribute('aria-expanded', 'false');
  choice.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    const key = choice.dataset.playChoice as Key;
    if (location.hash !== `#${key}`) history.pushState(null, '', `#${key}`);
    void open(key);
  });
});
document.querySelector('[data-play-close]')?.addEventListener('click', () => {
  history.pushState(null, '', location.pathname + location.search);
  close();
});
retry.addEventListener('click', () => { if (active) void open(active); });
window.addEventListener('popstate', () => fromUrl());
window.addEventListener('hashchange', () => fromUrl());
document.addEventListener('visibilitychange', syncActivity);
window.addEventListener('pagehide', (event) => { activities.forEach((activity) => { activity.setActive(false); if (!event.persisted) activity.destroy(); }); });
window.addEventListener('pageshow', (event) => { if (event.persisted) syncActivity(); });
fromUrl(location.hash.length > 0);
