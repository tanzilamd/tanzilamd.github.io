import type { CollectionEntry } from 'astro:content';

export function writingHref(note: CollectionEntry<'notes'>): string {
  return note.data.kind === 'external' ? note.data.url : `/notes/${note.id}/`;
}

export function formatDate(value: string): string {
  if (/^\d{4}$/.test(value)) return value;
  const date = value.length === 7 ? `${value}-01` : value;
  return new Intl.DateTimeFormat('en-GB', {
    day: value.length === 10 ? 'numeric' : undefined,
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

export function readingMinutes(note: CollectionEntry<'notes'>): number {
  return Math.max(1, Math.ceil((note.body?.trim().split(/\s+/).filter(Boolean).length ?? 0) / 200));
}

export function xmlEscape(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}
