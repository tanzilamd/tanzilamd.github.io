import type { APIRoute } from 'astro';
import { notes } from '../lib/content';
import { writingHref, xmlEscape } from '../lib/writing';
import profile from '../data/profile.json';

export const GET: APIRoute = async ({ site }) => {
  const all = await notes();
  const items = all.map((note) => {
    const url = xmlEscape(new URL(writingHref(note), site).href);
    const published = note.data.date.length === 10 ? `<pubDate>${new Date(`${note.data.date}T00:00:00Z`).toUTCString()}</pubDate>` : '';
    return `<item><title>${xmlEscape(note.data.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xmlEscape(note.data.summary)}</description>${published}</item>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xmlEscape(profile.name)} — Writing</title><link>${new URL('/notes/', site).href}</link><description>Personal essays, project write-ups and articles by ${xmlEscape(profile.name)}.</description><language>en</language>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
