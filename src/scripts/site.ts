import './motion';

const root = document.documentElement;
const themeToggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const updateThemeLabel = () => {
  const dark = root.dataset.theme === 'dark';
  themeToggle?.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a191d' : '#f5f4ef');
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
const copyLink = document.querySelector<HTMLButtonElement>('[data-copy-link]');
if (copyLink && navigator.clipboard) {
  copyLink.hidden = false;
  copyLink.addEventListener('click', async () => {
    const feedback = document.querySelector('[data-link-copy-status]');
    const url = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? location.href;
    try { await navigator.clipboard.writeText(url); if (feedback) feedback.textContent = 'Link copied.'; }
    catch { if (feedback) feedback.textContent = 'Copy is unavailable. Copy the address from your browser.'; }
  });
}

// Native dialog keeps gallery browsing accessible; image links work without JS.
const photoViewer = document.querySelector<HTMLDialogElement>('[data-photo-viewer]');
const photoLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-photo-link]')];
if (photoViewer && typeof photoViewer.showModal === 'function' && photoLinks.length > 0) {
  const image = photoViewer.querySelector<HTMLImageElement>('[data-photo-image]')!;
  const title = photoViewer.querySelector<HTMLElement>('#photo-viewer-title')!;
  const caption = photoViewer.querySelector<HTMLElement>('[data-photo-caption]')!;
  const meta = photoViewer.querySelector<HTMLElement>('[data-photo-meta]')!;
  const counter = photoViewer.querySelector<HTMLElement>('[data-photo-counter]')!;
  const demoLabel = photoViewer.querySelector<HTMLElement>('[data-photo-demo-label]')!;
  const controls = photoViewer.querySelector<HTMLElement>('[data-photo-controls]')!;
  let active = 0;
  let imageVersion = 0;
  const photoMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const imageAnimations = new Set<Animation>();
  const stopImageAnimations = () => { imageAnimations.forEach((animation) => animation.cancel()); imageAnimations.clear(); };
  photoMotion.addEventListener('change', () => { if (photoMotion.matches) stopImageAnimations(); });
  let opener: HTMLAnchorElement | undefined;
  const showPhoto = (index: number) => {
    active = (index + photoLinks.length) % photoLinks.length;
    const link = photoLinks[active];
    image.src = link.href;
    image.alt = link.querySelector('img')?.alt ?? link.dataset.photoCaption ?? '';
    const version = ++imageVersion;
    stopImageAnimations();
    // Decode before animating; a rapid next/previous action always wins.
    image.decode().then(() => {
      if (version !== imageVersion || !photoViewer.open || photoMotion.matches || typeof image.animate !== 'function') return;
      [image, caption, meta].forEach((element) => {
        const animation = element.animate([{ opacity: .35, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
        imageAnimations.add(animation);
        animation.finished.then(() => imageAnimations.delete(animation), () => imageAnimations.delete(animation));
      });
    }).catch(() => {});
    title.textContent = link.dataset.photoActivity ?? 'Activity photos';
    caption.textContent = link.dataset.photoCaption ?? '';
    const demo = link.dataset.photoDemo === 'true';
    meta.textContent = [link.dataset.photoMeta, demo ? 'Demo image · illustrative placeholder' : ''].filter(Boolean).join(' · ');
    demoLabel.hidden = !demo;
    counter.textContent = `Photo ${active + 1} of ${photoLinks.length}`;
    controls.hidden = photoLinks.length < 2;
  };
  photoLinks.forEach((link, index) => link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    showPhoto(index);
    photoViewer.showModal();
    root.classList.add('photo-viewer-open');
  }));
  photoViewer.querySelector('[data-photo-close]')?.addEventListener('click', () => photoViewer.close());
  photoViewer.querySelector('[data-photo-previous]')?.addEventListener('click', () => showPhoto(active - 1));
  photoViewer.querySelector('[data-photo-next]')?.addEventListener('click', () => showPhoto(active + 1));
  photoViewer.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const buttons = [...photoViewer.querySelectorAll<HTMLButtonElement>('button:not([disabled])')].filter((button) => button.getClientRects().length > 0);
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  photoViewer.addEventListener('click', (event) => {
    if (event.target !== photoViewer) return;
    const bounds = photoViewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) photoViewer.close();
  });
  photoViewer.addEventListener('close', () => {
    imageVersion++;
    stopImageAnimations();
    root.classList.remove('photo-viewer-open');
    opener?.focus({ preventScroll: true });
  });
}
