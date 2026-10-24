import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { socialImage, readMeta, decodeMeta } from '../src/lib/social.ts';

test('share URLs stay stable but refresh their version when page copy changes', () => {
  const first = new URL(socialImage('/notes/story/', 'A title', 'A summary', 'Tanzil Ahmed'), 'https://tanzilahmed.tech');
  const updated = new URL(socialImage('/notes/story/', 'New title', 'New summary', 'Tanzil Ahmed'), first.origin);
  assert.equal(first.pathname, updated.pathname);
  assert.notEqual(first.search, updated.search);
  assert.equal(socialImage('/', 'Home', 'Intro', 'Tanzil Ahmed'), '/social-card.png');
  assert.notEqual(socialImage('/notes/a-b/', 'Title', 'Summary', 'Name'), socialImage('/notes/a/b/', 'Title', 'Summary', 'Name'));
  assert.match(socialImage('/notes/বাংলা/', 'বাংলা', 'Summary', 'Name'), /^\/share\/[a-z\d-]+\.png\?v=[a-f\d]{12}$/);
  assert.match(socialImage('/notes/Hello-World/', 'Title', 'Summary', 'Name'), /^\/share\/notes-hello-world-[a-f\d]{8}\.png\?v=/);
});

test('metadata extraction preserves escaped content and ignores body lookalikes', () => {
  const meta = readMeta(`<head><meta content='A &amp; B &quot;quote&quot; > C' property='og:title'><meta name="author" content="Tanzil&#39;s &#x09AC;log"><meta property="og:title" content="duplicate"></head><body><meta property="og:image" content="not a head tag"></body>`);
  assert.equal(meta['og:title'], 'A & B "quote" > C');
  assert.equal(meta.author, "Tanzil's বlog");
  assert.equal(meta['og:image'], undefined);
  assert.equal(decodeMeta('&amp;quot;'), '&quot;');
  assert.equal(decodeMeta('&#99999999;'), '\ufffd');
});

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? htmlFiles(join(directory, entry.name)) : entry.name.endsWith('.html') ? [join(directory, entry.name)] : []);
}
test('every built page exposes its own valid social PNG in initial HTML', () => {
  const urls = new Set(), gameImages = new Set();
  for (const file of htmlFiles('dist')) {
    const meta = readMeta(readFileSync(file, 'utf8'));
    const image = new URL(meta['og:image']), page = new URL(meta['og:url']);
    assert.equal(image.origin, 'https://tanzilahmed.tech');
    assert.equal(meta['twitter:image'], image.href);
    assert.equal(meta['og:image:secure_url'], image.href);
    assert.equal(meta['twitter:title'], meta['og:title']);
    assert.equal(meta['twitter:description'], meta['og:description']);
    assert.equal(meta['twitter:image:alt'], meta['og:image:alt']);
    assert.equal(meta['og:image:type'], 'image/png');
    assert.equal(meta['og:image:width'], '1200');
    assert.equal(meta['og:image:height'], '630');
    assert.ok(!urls.has(image.href), `Repeated preview in ${file}`);
    urls.add(image.href);
    const png = readFileSync(join('dist', image.pathname));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    if (page.pathname === '/') assert.equal(image.pathname, '/social-card.png');
    else assert.ok(image.pathname.startsWith('/share/'));
    if (page.pathname.startsWith('/play/') && page.pathname !== '/play/') gameImages.add(createHash('sha256').update(png).digest('hex'));
  }
  assert.ok(urls.size >= 21);
  assert.equal(gameImages.size, 8, 'Each game needs different artwork');
});
