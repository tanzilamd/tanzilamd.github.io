export function create(scene: HTMLElement, message: HTMLElement, messages: string[]) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set<Animation>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  function clear() {
    clearTimeout(timer);
    animations.forEach((animation) => animation.cancel()); animations.clear();
    scene.replaceChildren(); message.textContent = '';
  }
  function animate(element: Element, frames: Keyframe[], duration: number) {
    if (preference.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, { duration, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' });
    animations.add(animation);
  }
  function show(index: number) {
    clear(); message.textContent = messages[index];
    if (index === 0) {
      const duck = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      duck.setAttribute('viewBox', '0 0 120 100'); duck.classList.add('pocket-duck');
      // Local decorative SVG, no images or third-party requests.
      duck.innerHTML = '<path d="M20 55c-8 0-15 7-15 16 0 18 20 25 44 25 23 0 46-9 46-30l-9-15c10-5 17-17 12-29C92 3 63 6 59 25c-2 10 2 18 9 24-17 0-26 10-35 10Z" fill="#f4cb70"/><path d="m92 29 24 9-22 9Z" fill="#ed906b"/><circle cx="84" cy="25" r="3.5" fill="#25383e"/><path d="M28 69c12 11 30 12 42 0" fill="none" stroke="#bd852c" stroke-width="3" stroke-linecap="round"/>';
      scene.append(duck);
      animate(duck, [{ opacity: 0, transform: 'translate(100px,25px) rotate(8deg)' }, { opacity: 1, transform: 'translate(0,0) rotate(-5deg)', offset: .25 }, { opacity: 1, transform: 'translate(-20px,-8px) rotate(3deg)', offset: .75 }, { opacity: 0, transform: 'translate(-80px,0) rotate(-4deg)' }], 2100);
    } else {
      for (let i = 0; i < (preference.matches ? 3 : 12); i++) {
        const particle = document.createElement('span');
        particle.className = index === 1 ? 'pocket-bubble' : 'pocket-star';
        particle.textContent = index === 2 ? '✦' : '';
        particle.style.left = `${12 + Math.random() * 76}%`;
        particle.style.top = `${12 + Math.random() * 62}%`;
        scene.append(particle);
        const x = (Math.random() - .5) * 70, y = -35 - Math.random() * 65;
        animate(particle, [{ opacity: 0, transform: 'translate(0,25px) scale(.4)' }, { opacity: 1, transform: 'translate(0,0) scale(1)', offset: .3 }, { opacity: 0, transform: `translate(${x}px,${y}px) scale(${index === 1 ? 1.2 : .4})` }], 1300 + i * 45);
      }
    }
    timer = setTimeout(clear, 2800);
  }
  preference.addEventListener('change', clear);
  return { show, clear };
}
