// Progressive motion: all content and navigation work without these enhancements.
const root = document.documentElement;
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const animations = new Set<Animation>();
let typingFrame = 0;
let revealObserver: IntersectionObserver | undefined;

function finishIntro() {
  cancelAnimationFrame(typingFrame);
  if (root.dataset.intro) root.dataset.intro = 'done';
  document.querySelectorAll<HTMLElement>('[data-type-line]').forEach((line) => {
    delete line.dataset.typing;
    line.style.removeProperty('--type-width');
  });
}

async function typeHeadline() {
  if (root.dataset.intro !== 'pending' || preference.matches) return;
  // Bound the font wait; slow font downloads never hold up the page.
  await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 350))]);
  if (root.dataset.intro !== 'pending' || preference.matches) return;
  const lines = [...document.querySelectorAll<HTMLElement>('[data-type-line]')];
  const measurements = lines.map((line) => {
    const text = line.querySelector<HTMLElement>('[data-type-text]')!;
    const node = text.firstChild;
    const widths = [0];
    if (node) {
      const range = document.createRange();
      let offset = 0;
      // Range preserves the original font's kerning, including proportional type.
      for (const character of Array.from(node.textContent ?? '')) {
        offset += character.length;
        range.setStart(node, 0);
        range.setEnd(node, offset);
        widths.push(range.getBoundingClientRect().width);
      }
    }
    return { line, widths };
  });
  root.dataset.intro = 'playing';
  const started = performance.now();
  const characterTime = 28;
  const pause = 110;
  function tick(now: number) {
    if (preference.matches || root.dataset.intro !== 'playing') { finishIntro(); return; }
    let elapsed = now - started;
    let complete = true;
    for (const { line, widths } of measurements) {
      const duration = (widths.length - 1) * characterTime;
      const position = Math.max(0, Math.min(widths.length - 1, Math.floor(elapsed / characterTime)));
      line.style.setProperty('--type-width', `${widths[position]}px`);
      line.dataset.typing = elapsed >= 0 && elapsed < duration + pause ? 'active' : 'idle';
      if (elapsed >= duration) line.dataset.typed = 'true';
      else complete = false;
      elapsed -= duration + pause;
    }
    if (complete) finishIntro();
    else typingFrame = requestAnimationFrame(tick);
  }
  typingFrame = requestAnimationFrame(tick);
}
void typeHeadline().catch(finishIntro);
// Interaction takes priority over an opening flourish.
window.addEventListener('pointerdown', finishIntro, { once: true, passive: true });
window.addEventListener('keydown', finishIntro, { once: true });
window.addEventListener('resize', finishIntro, { once: true, passive: true });
window.addEventListener('scroll', finishIntro, { once: true, passive: true });

function reveal(element: HTMLElement) {
  if (preference.matches || document.hidden || animations.size >= 2 || element.contains(document.activeElement) || typeof element.animate !== 'function') return;
  const animation = element.animate([
    { opacity: .7 },
    { opacity: 1 },
  ], { duration: 220, easing: 'ease-out' });
  animations.add(animation);
  animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
}

// Small desktop headings only; never composite an entire image grid during scroll.
// Touch devices keep static sections, and content is never hidden before observation.
if (!preference.matches && matchMedia('(hover: hover) and (pointer: fine)').matches && 'IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealObserver?.unobserve(entry.target);
      reveal(entry.target as HTMLElement);
    });
  }, { threshold: .08 });
  document.querySelectorAll<HTMLElement>('.section-top, .life-title, .open-intro').forEach((element) => {
    if (element.getBoundingClientRect().top >= innerHeight * .9) revealObserver!.observe(element);
  });
}
document.addEventListener('focusin', () => {
  // Never fade a control while someone is reaching it with the keyboard.
  animations.forEach((animation) => {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    if (target instanceof Element && target.contains(document.activeElement)) animation.cancel();
  });
});
preference.addEventListener('change', () => {
  if (!preference.matches) return;
  finishIntro();
  revealObserver?.disconnect();
  animations.forEach((animation) => animation.cancel());
  animations.clear();
});
window.addEventListener('pagehide', () => { finishIntro(); animations.forEach((animation) => animation.cancel()); });

// Reading progress is based on the actual prose, not the footer or related links.
const progress = document.querySelector<HTMLElement>('[data-reading-progress]');
const prose = document.querySelector<HTMLElement>('.article-prose');
if (progress && prose) {
  let scheduled = false;
  let metricsDirty = true;
  let proseStart = 0;
  let distance = 1;
  let viewportOffset = 0;
  function updateProgress() {
    scheduled = false;
    if (metricsDirty) {
      const bounds = prose!.getBoundingClientRect();
      proseStart = bounds.top + scrollY;
      distance = Math.max(1, bounds.height - innerHeight * .65);
      viewportOffset = innerHeight * .25;
      metricsDirty = false;
    }
    const value = Math.max(0, Math.min(1, (scrollY + viewportOffset - proseStart) / distance));
    progress!.style.setProperty('--reading-progress', String(value));
  }
  function scheduleProgress() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateProgress);
  }
  function invalidateMetrics() {
    metricsDirty = true;
    scheduleProgress();
  }
  progress.hidden = false;
  updateProgress();
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', invalidateMetrics, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(invalidateMetrics).observe(prose);
  void document.fonts.ready.then(invalidateMetrics);
}
