import copy from '../../data/play.json';
import type { Activity } from './types';

export function mount(panel: HTMLElement): Activity {
  const abort = new AbortController(), { signal } = abort;
  const button = panel.querySelector<HTMLButtonElement>('[data-press-button]')!;
  const face = panel.querySelector<HTMLElement>('[data-press-face]')!;
  const stage = panel.querySelector<HTMLElement>('[data-press-stage]')!;
  const message = panel.querySelector<HTMLElement>('[data-press-message]')!;
  const caption = panel.querySelector<HTMLElement>('[data-press-caption]')!;
  const counter = panel.querySelector<HTMLElement>('[data-press-count]')!;
  const note = panel.querySelector<HTMLElement>('[data-press-note]')!;
  const duck = panel.querySelector<SVGElement>('[data-press-duck]')!;
  const sound = panel.querySelector<HTMLInputElement>('[data-press-sound]')!;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set<Animation>();
  let active = false, visible = false, presses = 0;
  let effectVersion = 0;
  let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
  let audio: AudioContext | undefined;
  let oscillator: OscillatorNode | undefined;
  function quiet() { try { oscillator?.stop(); } catch {} oscillator = undefined; if (audio?.state === 'running') void audio.suspend().catch(() => {}); }
  function clearEffect() {
    effectVersion++;
    clearTimeout(cleanupTimer);
    animations.forEach((animation) => animation.cancel()); animations.clear();
    stage.querySelectorAll('[data-confetti]').forEach((element) => element.remove());
    note.style.removeProperty('transform'); duck.style.removeProperty('left');
    note.textContent = 'Everything is under control.';
    quiet();
  }
  function animate(element: Element, frames: Keyframe[], duration: number) {
    if (preference.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, { duration, easing: 'cubic-bezier(.2,.65,.3,1)' });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
  }
  async function plop(version: number) {
    if (!sound.checked || !active || !visible) return;
    try {
      audio ??= new AudioContext();
      await audio.resume();
      if (version !== effectVersion) return;
      if (!sound.checked || !active || !visible) { quiet(); return; }
      const tone = audio.createOscillator(), gain = audio.createGain();
      oscillator = tone; tone.type = 'sine';
      tone.frequency.setValueAtTime(420, audio.currentTime); tone.frequency.exponentialRampToValueAtTime(150, audio.currentTime + .12);
      gain.gain.setValueAtTime(.06, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .14);
      tone.connect(gain); gain.connect(audio.destination); tone.start(); tone.stop(audio.currentTime + .15);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); if (oscillator === tone) oscillator = undefined; };
    } catch { sound.checked = false; caption.textContent = 'Sound is unavailable. The surprises still work.'; }
  }
  function press() {
    if (!active) return;
    clearEffect(); presses++;
    const reaction = copy.reactions[(presses - 1) % copy.reactions.length];
    message.textContent = reaction?.message ?? 'You pressed it. Of course you did.';
    caption.textContent = reaction?.caption ?? 'An entirely unnecessary experiment.';
    counter.textContent = `${presses} ${presses === 1 ? 'press' : 'presses'}`;
    const effect = reaction?.effect;
    if (effect === 'balloon') animate(face, [{ transform: 'translateY(-7px) scale(1)' }, { transform: 'translateY(-7px) scale(1.18)', offset: .45 }, { transform: 'translateY(-7px) scale(1)' }], 650);
    if (effect === 'flip') {
      if (preference.matches) note.textContent = 'A different perspective. No spinning required.';
      else animate(note, [{ transform: 'rotate(0)' }, { transform: 'rotate(180deg)', offset: .45 }, { transform: 'rotate(360deg)' }], 1000);
    }
    if (effect === 'confetti' && !preference.matches) {
      const colors = ['#ef9c80', '#a6cbb5', '#edce83', '#9dc6d3', '#d6abd0'];
      for (let index = 0; index < 18; index++) {
        const particle = document.createElement('span'); particle.className = 'press-confetti'; particle.dataset.confetti = ''; particle.setAttribute('aria-hidden', 'true');
        particle.style.background = colors[index % colors.length]; stage.append(particle);
        const x = (Math.random() - .5) * Math.min(stage.clientWidth - 32, 650);
        animate(particle, [{ opacity: 0, transform: 'translate(0,0) rotate(0)' }, { opacity: 1, transform: `translate(${x * .6}px,-70px) rotate(90deg)`, offset: .3 }, { opacity: 0, transform: `translate(${x}px,230px) rotate(${index * 29}deg)` }], 1100);
      }
    }
    if (effect === 'duck') {
      if (preference.matches) duck.style.left = '18px';
      else animate(duck, [{ transform: 'translateX(0) rotate(-3deg)' }, { transform: `translateX(${stage.clientWidth + 250}px) rotate(4deg)` }], 1600);
    }
    void plop(effectVersion);
    cleanupTimer = setTimeout(() => { clearEffect(); note.textContent = 'Everything is under control.'; }, 1800);
  }
  button.addEventListener('click', press, { signal });
  panel.querySelector('[data-press-reset]')!.addEventListener('click', () => { clearEffect(); presses = 0; message.textContent = "Tempting, isn't it?"; caption.textContent = 'Nothing has happened. So far.'; counter.textContent = '0 presses'; note.textContent = 'Everything is under control.'; }, { signal });
  sound.addEventListener('change', () => { if (!sound.checked) quiet(); }, { signal });
  preference.addEventListener('change', () => { if (preference.matches) clearEffect(); }, { signal });
  const viewport = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) clearEffect(); }, { threshold: .05 }); viewport.observe(stage);
  panel.querySelectorAll<HTMLFieldSetElement>('[data-play-controls]').forEach((fieldset) => { fieldset.disabled = false; });
  button.disabled = false;
  return { setActive(value) { active = value; if (!active) clearEffect(); }, destroy() { active = false; clearEffect(); abort.abort(); viewport.disconnect(); if (audio) void audio.close().catch(() => {}); } };
}
