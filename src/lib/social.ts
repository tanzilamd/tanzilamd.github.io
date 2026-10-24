import { createHash } from 'node:crypto';

export const SOCIAL_WIDTH = 1200;
export const SOCIAL_HEIGHT = 630;
// Bump when changing the renderer so cached image URLs pick up new artwork.
export const SOCIAL_VERSION = 'offscript-share-1';

export function socialImage(pathname: string, title: string, description: string, author: string) {
  if (pathname === '/') return '/social-card.png';
  const slug = pathname.toLowerCase().replace(/\.[a-z]+$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'page';
  const pathKey = createHash('sha256').update(pathname).digest('hex').slice(0, 8);
  const version = createHash('sha256').update(JSON.stringify([SOCIAL_VERSION, pathname, title, description, author])).digest('hex').slice(0, 12);
  // The path stays stable across text edits; old cached query versions still resolve.
  return `/share/${slug}-${pathKey}.png?v=${version}`;
}

export function decodeMeta(value: string) {
  const entities: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code: string) => {
    if (!code.startsWith('#')) return entities[code.toLowerCase()] ?? entity;
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : '\ufffd';
  });
}

export function readMeta(html: string): Record<string, string> {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const result: Record<string, string> = {};
  for (const [tag] of head.matchAll(/<meta\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi)) {
    const attributes: Record<string, string> = {};
    for (const [, key, , value] of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)) attributes[key.toLowerCase()] = decodeMeta(value);
    const key = attributes.property ?? attributes.name;
    if (key && attributes.content !== undefined && !(key in result)) result[key] = attributes.content;
  }
  return result;
}
