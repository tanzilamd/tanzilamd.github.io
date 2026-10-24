export function create(scene: HTMLElement) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set<Animation>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  function clear() {
    clearTimeout(timer); animations.forEach((animation) => animation.cancel()); animations.clear(); scene.replaceChildren();
  }
  function animate(element: Element, frames: Keyframe[], duration = 5100) {
    if (preference.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, { duration, easing: 'cubic-bezier(.18,.55,.35,1)', fill: 'both' }); animations.add(animation);
  }
  function show(index: number) {
    clear();
    const width = innerWidth, height = innerHeight, reduced = preference.matches;
    if (index === 0) {
      for (let i = 0; i < 3; i++) {
        const duck = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        duck.setAttribute('viewBox', '0 0 120 100'); duck.classList.add('pocket-duck');
        duck.innerHTML = '<path d="M20 55c-8 0-15 7-15 16 0 18 20 25 44 25 23 0 46-9 46-30l-9-15c10-5 17-17 12-29C92 3 63 6 59 25c-2 10 2 18 9 24-17 0-26 10-35 10Z" fill="#f4cb70"/><path d="m92 29 24 9-22 9Z" fill="#ed906b"/><circle cx="84" cy="25" r="3.5" fill="#25383e"/><path d="M28 69c12 11 30 12 42 0" fill="none" stroke="#bd852c" stroke-width="3" stroke-linecap="round"/>';
        const y = height * (.18 + i * .24), direction = i % 2 ? -1 : 1;
        duck.style.top = `${y}px`; duck.style.left = reduced ? `${12 + i * 28}%` : '0';
        scene.append(duck);
        const flip = direction === -1 ? -1 : 1;
        const start = direction === 1 ? -160 : width + 160, end = direction === 1 ? width + 160 : -160;
        animate(duck, [{ opacity: 0, transform: `translateX(${start}px) scaleX(${flip}) rotate(-5deg)` }, { opacity: .95, transform: `translate(${width * (direction === 1 ? .25 : .75)}px,-12px) scaleX(${flip}) rotate(4deg)`, offset: .3 }, { opacity: .95, transform: `translate(${width * (direction === 1 ? .75 : .25)}px,8px) scaleX(${flip}) rotate(-4deg)`, offset: .7 }, { opacity: 0, transform: `translateX(${end}px) scaleX(${flip}) rotate(3deg)` }], 4600 + i * 300);
      }
    } else {
      const count = reduced ? 6 : width < 600 ? 20 : 28;
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('span'); particle.className = index === 1 ? 'pocket-bubble' : 'pocket-star';
        if (index === 2) particle.textContent = '✦';
        const x = width * (.05 + Math.random() * .88), y = height * (.08 + Math.random() * .78);
        particle.style.left = `${x}px`; particle.style.top = `${y}px`; particle.style.setProperty('--particle-size', `${index === 1 ? 22 + Math.random() * 35 : 18 + Math.random() * 28}px`);
        scene.append(particle);
        const fromX = index === 1 ? (Math.random() - .5) * 55 : width - 45 - x;
        const fromY = index === 1 ? height - y + 40 : height - 45 - y;
        animate(particle, [{ opacity: 0, transform: `translate(${fromX}px,${fromY}px) scale(.3)` }, { opacity: .8, transform: 'translate(0,0) scale(1)', offset: .48 }, { opacity: .7, transform: `translate(${(Math.random() - .5) * 45}px,-35px) scale(1)`, offset: .75 }, { opacity: 0, transform: `translate(${(Math.random() - .5) * 90}px,-130px) scale(${index === 1 ? 1.2 : .4})` }], 4500 + Math.random() * 900);
      }
    }
    timer = setTimeout(clear, 5500);
  }
  preference.addEventListener('change', clear);
  return { show, clear };
}
