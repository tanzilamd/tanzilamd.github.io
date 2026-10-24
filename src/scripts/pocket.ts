// Only an explicit click loads the decorative viewport effect engine.
const pocket = document.querySelector<HTMLElement>('[data-pocket]');
if (pocket) {
  const button = pocket.querySelector<HTMLButtonElement>('[data-pocket-button]')!;
  const scene = pocket.querySelector<HTMLElement>('[data-pocket-scene]')!;
  let effects: ReturnType<typeof import('./fun/pocket-effects').create> | undefined;
  let loading: Promise<typeof import('./fun/pocket-effects')> | undefined;
  let feedback: Animation | undefined;
  let count = 0, version = 0;
  const clear = () => { version++; effects?.clear(); feedback?.cancel(); };
  pocket.hidden = false;
  button.addEventListener('click', async () => {
    const token = ++version, index = count++ % 3;
    try {
      loading ??= import('./fun/pocket-effects');
      const module = await loading;
      if (token !== version || document.hidden) return;
      effects ??= module.create(scene); effects.show(index);
    } catch {
      loading = undefined;
      if (token !== version || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // A failed optional effect still gets silent, local feedback; never a popup.
      feedback?.cancel();
      feedback = button.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(.85)' }, { transform: 'scale(1)' }], { duration: 350 });
    }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') clear(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  document.addEventListener('focusin', (event) => {
    if (event.target instanceof Element && event.target.closest('dialog, [data-play-panel], [data-menu-toggle]')) clear();
  });
  window.addEventListener('resize', clear);
  window.addEventListener('pagehide', clear);
}
