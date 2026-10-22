import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import config from '../astro.config.mjs';

const root = resolve('dist');
const site = new URL(config.site).origin;
function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]); }
const built = files(root);
const pages = built.filter((file) => file.endsWith('.html'));
test('all emitted internal links and local assets resolve, including fragments', () => {
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const address = value.replaceAll('&amp;', '&');
      if (!address.startsWith('/') && !address.startsWith('#')) continue;
      const url = new URL(address, site + '/' + page.slice(root.length + 1).replace(/index\.html$/, ''));
      let target = resolve(root, '.' + decodeURIComponent(url.pathname));
      assert.ok(target.startsWith(root), address);
      if (url.pathname.endsWith('/')) target = join(target, 'index.html');
      assert.ok(existsSync(target), `${page}: missing ${address}`);
      if (url.hash) assert.ok(readFileSync(target, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${page}: broken fragment ${address}`);
    }
  }
});
test('public output contains no source application, phone contacts, old photos or private research', () => {
  const forbiddenFiles = /(?:\.pdf$|SOURCE-LEDGER|PORTFOLIO-PLAN|\.env|logo\.png|index1\.jpg|portfolio-source)/i;
  for (const file of built) assert.ok(!forbiddenFiles.test(file), file);
  for (const file of built.filter((file) => /\.(html|js|json|xml|txt|svg)$/.test(file))) {
    const data = readFileSync(file, 'utf8');
    assert.doesNotMatch(data, /tel:|\+880[.\s-]*1[3-9]|FERPA|Permanent address|Fee waiver requested/i, file);
  }
});
test('canonical URLs, social metadata and sitemap cover published pages only', () => {
  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    assert.ok(html.includes(`rel="canonical" href="${site}/`), page);
    assert.match(html, /property="og:image"/);
    if (page.endsWith('404.html')) { assert.ok(!sitemap.includes('404')); continue; }
    const pathname = '/' + page.slice(root.length + 1).replace(/index\.html$/, '');
    assert.ok(sitemap.includes(`${site}${pathname}`), pathname);
  }
  assert.equal(readFileSync(join(root, 'CNAME'), 'utf8').trim(), new URL(site).hostname);
  assert.ok(readFileSync(join(root, 'robots.txt'), 'utf8').includes(`Sitemap: ${site}/sitemap.xml`));
  assert.ok(existsSync(join(root, 'social-card.png')));
  assert.ok(statSync(join(root, 'social-card.png')).size > 1000);
});
test('new-tab destinations are protected and no placeholder actions are emitted', () => {
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    for (const [anchor] of html.matchAll(/<a\s[^>]*>/g)) {
      assert.doesNotMatch(anchor, /href="(?:#|javascript:[^"]*)"/, page);
      if (anchor.includes('target="_blank"')) { assert.match(anchor, /rel="[^"]*noopener/); assert.match(anchor, /rel="[^"]*noreferrer/); }
    }
  }
});
