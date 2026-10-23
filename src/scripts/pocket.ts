// The shared entry has no particle engine or animation loop.
const pocket = document.querySelector<HTMLElement>('[data-pocket]');
if (pocket) {
  const button = pocket.querySelector<HTMLButtonElement>('[data-pocket-button]')!;
  const scene = pocket.querySelector<HTMLElement>('[data-pocket-scene]')!;
  const message = pocket.querySelector<HTMLElement>('[data-pocket-message]')!;
  const messages: string[] = JSON.parse(pocket.dataset.pocketMessages!);
  let effects: ReturnType<typeof import('./fun/pocket-effects').create> | undefined;
  let loading: Promise<typeof import('./fun/pocket-effects')> | undefined;
  let count = 0, version = 0;
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { version++; clearTimeout(fallbackTimer); effects?.clear(); message.textContent = ''; };
  pocket.hidden = false;
  button.addEventListener('click', async () => {
    const token = ++version, index = count++ % 3;
    clearTimeout(fallbackTimer);
    try {
      loading ??= import('./fun/pocket-effects');
      const module = await loading;
      if (token !== version || document.hidden) return;
      effects ??= module.create(scene, message, messages);
      effects.show(index);
    } catch {
      loading = undefined;
      if (token !== version || document.hidden) return;
      message.textContent = 'A little surprise: you made this star smile. ✦';
      fallbackTimer = setTimeout(clear, 2800);
    }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') clear(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  document.addEventListener('focusin', (event) => {
    if (event.target instanceof Element && event.target.closest('dialog, [data-draw-canvas], .physics-shape, [data-menu-toggle]')) clear();
  });
  window.addEventListener('pagehide', clear);
}
