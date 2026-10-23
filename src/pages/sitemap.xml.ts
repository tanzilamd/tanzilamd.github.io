import type { APIRoute } from 'astro';
import { projects, notes } from '../lib/content';
import { writingHref, xmlEscape } from '../lib/writing';
export const GET: APIRoute = async ({ site }) => {
  const paths = ['/', '/work/', '/open-source/', '/about/', '/beyond/', '/notes/', '/contact/', '/play/', ...(await projects()).map((project) => `/work/${project.id}/`)];
  const posts = (await notes()).filter((note) => note.data.kind === 'post');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${xmlEscape(new URL(path, site).href)}</loc></url>`).join('')}${posts.map((post) => `<url><loc>${xmlEscape(new URL(writingHref(post), site).href)}</loc><lastmod>${post.data.updated ?? post.data.date}</lastmod></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
