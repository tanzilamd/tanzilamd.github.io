import sharp from 'sharp';
import { join } from 'node:path';

const palette = { background: '#0a191d', surface: '#11292d', line: '#2d4549', text: '#f4f1e9', muted: '#b3c2c3', coral: '#f39a80', mint: '#a4c9b5', gold: '#edce83', blue: '#9dc6d3' };
const clean = (text, limit) => Array.from(text.replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, limit).join('');
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

function star(x, y, radius, color) {
  const points = Array.from({ length: 10 }, (_, i) => { const angle = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? radius * .43 : radius; return `${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`; }).join(' ');
  return `<polygon points="${points}" fill="${color}"/>`;
}
function spark(x, y, size = 20) {
  return `<path d="M${x - size} ${y}H${x + size}M${x} ${y - size}V${y + size}M${x - size * .7} ${y - size * .7}L${x + size * .7} ${y + size * .7}M${x - size * .7} ${y + size * .7}L${x + size * .7} ${y - size * .7}" stroke="${palette.coral}" stroke-width="3"/>`;
}
function artwork(pathname) {
  const { coral, mint, gold, blue, line, surface } = palette;
  if (pathname === '/play/snake/') {
    return `<g transform="translate(760 150)"><rect width="350" height="350" rx="22" fill="${surface}" stroke="${line}"/><path d="M55 80h100v95H85v110h190V160" fill="none" stroke="${mint}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/><circle cx="281" cy="154" r="3" fill="#0a191d"/><circle cx="269" cy="154" r="3" fill="#0a191d"/><circle cx="270" cy="65" r="14" fill="${coral}"/></g>`;
  }
  if (pathname === '/play/dino-run/') {
    return `<g transform="translate(750 200)"><path d="M0 267h380" stroke="${line}" stroke-width="3"/><g transform="translate(30 65) scale(2.1)" fill="${mint}"><path d="M16 0h42v25H39v14H17v15H8V31H0V15h10v17h8V18h-2Z"/><path d="M17 48h9v16h-9zm19-10h9v18h-9Z"/></g><rect x="290" y="207" width="23" height="60" rx="4" fill="${coral}"/>${spark(220,55,20)}</g>`;
  }
  if (pathname === '/play/aim-trainer/') {
    return `<g fill="none" transform="translate(940 325)"><circle r="166" stroke="${line}"/><circle r="115" stroke="${mint}" stroke-width="3"/><circle r="62" stroke="${coral}" stroke-width="8"/><circle r="13" fill="${coral}"/><path d="M-190 0h45M145 0h45M0-190v45M0 145v45" stroke="${mint}" stroke-width="4"/></g>`;
  }
  if (pathname === '/play/tic-tac-toe/') {
    return `<g transform="translate(742 140) rotate(5 185 185)"><rect width="370" height="370" rx="20" fill="${surface}" stroke="${line}"/><path d="M123 12v346M247 12v346M12 123h346M12 247h346" stroke="${line}" stroke-width="3"/><g stroke="${coral}" stroke-width="12" stroke-linecap="round"><path d="m36 36 54 54m0-54L36 90M158 158l54 54m0-54-54 54M281 281l54 54m0-54-54 54"/><path d="M42 42 328 328" stroke-width="5" opacity=".5"/></g><g fill="none" stroke="${mint}" stroke-width="10"><circle cx="309" cy="62" r="33"/><circle cx="62" cy="185" r="33"/></g></g>`;
  }
  if (pathname === '/play/stack-tower/') {
    return `<g transform="translate(756 142)"><path d="M-10 377h382" stroke="${line}" stroke-width="3"/>${[mint, coral, gold, blue, '#a28db4', mint].map((color, i) => `<g transform="translate(${i * 9} ${338 - i * 48})"><rect width="${300 - i * 22}" height="47" fill="${color}"/><path d="M0 4h${300 - i * 22}" stroke="#ffffff" stroke-opacity=".18" stroke-width="6"/></g>`).join('')}<rect x="170" y="-2" width="190" height="43" fill="${coral}"/>${spark(70, 30, 15)}</g>`;
  }
  if (pathname === '/play/drawing-pad/') {
    return `<g transform="translate(755 168) rotate(-5 180 160)"><rect width="365" height="310" rx="18" fill="#fffdf6"/><path d="M35 210c50-230 78 105 137-52S242 80 234 151s54 74 97-34" fill="none" stroke="#416d74" stroke-width="10" stroke-linecap="round"/>${star(280, 245, 33, coral)}<g transform="translate(130 95) rotate(28)"><rect width="24" height="156" rx="4" fill="#bd6d51"/><path d="m0 156 12 29 12-29" fill="#25383e"/></g></g>`;
  }
  if (pathname === '/play/do-not-press/') {
    return `<circle cx="936" cy="329" r="159" fill="${surface}" stroke="${line}" stroke-width="2"/><circle cx="936" cy="342" r="133" fill="#864c40"/><circle cx="936" cy="324" r="133" fill="#bb5946"/><circle cx="936" cy="394" r="7" fill="#f5b593"/><path d="M936 248v72" stroke="#fff8ed" stroke-width="14" stroke-linecap="round"/><circle cx="936" cy="347" r="7" fill="#fff8ed"/>${spark(1101, 153, 14)}`;
  }
  if (pathname === '/play/playground/') {
    return `<circle cx="926" cy="302" r="166" fill="none" stroke="${line}" stroke-dasharray="8 10" stroke-width="2"/><circle cx="828" cy="382" r="88" fill="${coral}"/><rect x="945" y="181" width="120" height="120" rx="24" fill="${mint}" transform="rotate(18 1005 241)"/>${star(1042, 408, 93, gold)}`;
  }
  if (pathname.startsWith('/notes/')) {
    return `<g transform="translate(770 156) rotate(5 170 175)"><rect width="330" height="350" rx="16" fill="${surface}" stroke="${line}" stroke-width="2"/><path d="M48 70h150M48 120h234M48 160h234M48 200h190M48 240h220" stroke="${mint}" stroke-width="8" stroke-linecap="round" opacity=".7"/>${spark(263, 293, 22)}</g>`;
  }
  if (pathname === '/open-source/') {
    return `<g fill="none" stroke="${mint}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M825 224v174q0 62 62 62h125M1045 224v100q0 36-36 36H825"/><circle cx="825" cy="191" r="34" fill="${surface}"/><circle cx="1045" cy="191" r="34" fill="${surface}"/></g>${spark(1060, 454, 22)}`;
  }
  if (pathname.startsWith('/work/')) {
    return `<g transform="translate(741 175) rotate(-4 190 145)"><rect width="380" height="290" rx="19" fill="${surface}" stroke="${line}" stroke-width="2"/><path d="M0 51h380" stroke="${line}" stroke-width="2"/><g fill="${coral}"><circle cx="25" cy="25" r="5"/><circle cx="44" cy="25" r="5"/><circle cx="63" cy="25" r="5"/></g><path d="m103 115-52 58 52 58m174-116 52 58-52 58m-69-131-36 146" fill="none" stroke="${mint}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  if (pathname === '/play/') {
    return `<g transform="translate(752 152)"><rect width="165" height="165" rx="20" fill="#193a3d"/>${star(83, 83, 55, gold)}<rect x="184" y="38" width="165" height="165" rx="20" fill="#f0e9d7"/><path d="m216 161 47-91 30 13-47 91Z" fill="#bd6d51"/><rect x="64" y="184" width="165" height="165" rx="20" fill="#332b2b"/><circle cx="146" cy="266" r="55" fill="#bb5946"/>${spark(300, 303, 24)}</g>`;
  }
  return `<g transform="translate(770 155)"><rect width="330" height="350" rx="26" fill="${surface}" stroke="${line}" stroke-width="2"/><circle cx="165" cy="161" r="92" fill="none" stroke="${line}" stroke-width="2"/>${spark(165, 161, 65)}<path d="M77 286h176" stroke="${mint}" stroke-width="5" stroke-linecap="round"/></g>`;
}

export function category(pathname) {
  if (pathname.startsWith('/play/')) return pathname === '/play/' ? 'A LITTLE BREAK' : 'PLAY';
  if (pathname.startsWith('/work/')) return pathname === '/work/' ? 'PROJECTS' : 'PROJECT STORY';
  if (pathname.startsWith('/notes/')) return 'WRITING';
  return ({ '/open-source/': 'OPEN SOURCE', '/about/': 'ABOUT', '/beyond/': 'ACTIVITIES & COMMUNITY', '/contact/': 'GET IN TOUCH', '/404.html': 'FIND YOUR WAY BACK', '/404/': 'FIND YOUR WAY BACK' })[pathname] ?? 'OFFSCRIPT';
}

async function textLayer(text, size, root, color = palette.text, bold = false, width = 600) {
  const bengali = /[\u0980-\u09ff]/.test(text);
  const fontfile = bengali ? join(root, 'node_modules/@fontsource/hind-siliguri/files/hind-siliguri-bengali-600-normal.woff2') : join(root, 'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2');
  return sharp({ text: { text: `<span foreground="${color}"${bold ? ' weight="bold"' : ''}>${escape(text)}</span>`, font: `${bengali ? 'Hind Siliguri' : 'Manrope'} ${size}`, fontfile, width, wrap: 'word-char', rgba: true } }).png().toBuffer({ resolveWithObject: true });
}

export async function renderCard({ pathname, title, description, author, origin }, root) {
  const suffix = ` — ${author}`;
  const heading = clean(title.endsWith(suffix) ? title.slice(0, -suffix.length) : title, 160) || 'Offscript';
  let titleLayer;
  for (const size of [64, 58, 52, 46]) {
    titleLayer = await textLayer(heading, size, root, palette.text, true);
    if (titleLayer.info.height <= 192) break;
  }
  let shortened = heading;
  while (titleLayer.info.height > 192) {
    shortened = Array.from(shortened).slice(0, -12).join('');
    titleLayer = await textLayer(`${shortened}…`, 46, root, palette.text, true);
  }
  let excerpt = clean(description, 260) || 'Explore this page on Offscript.', descriptionLayer;
  for (;;) {
    descriptionLayer = await textLayer(excerpt, 25, root, palette.muted);
    if (descriptionLayer.info.height <= 96 || excerpt.length < 40) break;
    excerpt = `${Array.from(excerpt).slice(0, -20).join('').replace(/…$/, '')}…`;
  }
  const owner = await textLayer(clean(author.toUpperCase(), 60) || 'OFFSCRIPT', 20, root, palette.text, true, 950);
  const label = await textLayer(category(pathname), 16, root, palette.coral, true);
  const fullAddress = `${new URL(origin).hostname}${decodeURI(pathname)}`;
  const address = await textLayer(clean(fullAddress, 95) + (Array.from(fullAddress).length > 95 ? '…' : ''), 18, root, palette.muted, false, 1060);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${palette.background}"/><path d="M64 105h1072M64 541h1072" stroke="${palette.line}"/>${artwork(pathname)}</svg>`;
  return sharp(Buffer.from(svg)).composite([
    { input: owner.data, left: 64, top: 53 }, { input: label.data, left: 64, top: 145 },
    { input: titleLayer.data, left: 64, top: 194 }, { input: descriptionLayer.data, left: 64, top: 230 + titleLayer.info.height },
    { input: address.data, left: 64, top: 575 },
  ]).flatten({ background: palette.background }).png({ compressionLevel: 9 }).toBuffer();
}
