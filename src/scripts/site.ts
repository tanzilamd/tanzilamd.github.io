const root = document.documentElement;
const themeToggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const updateThemeLabel = () => {
  const dark = root.dataset.theme === 'dark';
  themeToggle?.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a191d' : '#f0f1eb');
};
if (themeToggle) {
  themeToggle.hidden = false;
  updateThemeLabel();
  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('offscript-theme', root.dataset.theme); } catch {}
    updateThemeLabel();
  });
}
const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('#mobile-nav');
function closeMenu(returnFocus = false) {
  if (!menu || !menuToggle) return;
  menu.hidden = true;
  menu.inert = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  if (returnFocus) menuToggle.focus();
}
if (menuToggle && menu) {
  menuToggle.hidden = false;
  menuToggle.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !opening;
    menu.inert = !opening;
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !menu.hidden) closeMenu(true); });
  document.addEventListener('click', (event) => { if (event.target instanceof Node && !menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu(); });
  menu.addEventListener('click', (event) => { if ((event.target as HTMLElement).closest('a')) closeMenu(); });
  matchMedia('(min-width: 800px)').addEventListener('change', (event) => { if (event.matches) closeMenu(); });
}
const filterBar = document.querySelector<HTMLElement>('[data-filter-bar]');
if (filterBar) {
  filterBar.hidden = false;
  const buttons = [...filterBar.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const items = [...document.querySelectorAll<HTMLElement>('[data-item]')];
  const valid = new Set(buttons.map((button) => button.dataset.filter));
  function filter(category: string, updateUrl = true) {
    if (!valid.has(category)) category = 'All';
    let count = 0;
    items.forEach((item) => { item.hidden = category !== 'All' && item.dataset.category !== category; if (!item.hidden) count++; });
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    const empty = document.querySelector<HTMLElement>('[data-filter-empty]'); if (empty) empty.hidden = count > 0;
    const status = document.querySelector('[data-filter-status]'); if (status) status.textContent = `${count} ${count === 1 ? 'entry' : 'entries'} shown${category !== 'All' ? ` in ${category}` : ''}.`;
    if (updateUrl) { const url = new URL(location.href); if (category === 'All') url.searchParams.delete('category'); else url.searchParams.set('category', category); history.replaceState(null, '', url); }
  }
  buttons.forEach((button) => button.addEventListener('click', () => filter(button.dataset.filter ?? 'All')));
  document.querySelector('[data-reset-filter]')?.addEventListener('click', () => filter('All'));
  filter(new URL(location.href).searchParams.get('category') ?? 'All', false);
  window.addEventListener('popstate', () => filter(new URL(location.href).searchParams.get('category') ?? 'All', false));
}
const copyEmail = document.querySelector<HTMLButtonElement>('[data-copy-email]');
if (copyEmail && navigator.clipboard) {
  copyEmail.hidden = false;
  copyEmail.addEventListener('click', async () => {
    const feedback = document.querySelector('[data-copy-status]');
    try { await navigator.clipboard.writeText(copyEmail.dataset.copyEmail ?? ''); if (feedback) feedback.textContent = 'Email address copied.'; }
    catch { if (feedback) feedback.textContent = 'Copy is unavailable. Select the email address to copy it.'; }
  });
}
