import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { join } from 'node:path';

const created = [];
function create(path, data) { assert.ok(!existsSync(path), `Refusing to overwrite ${path}`); writeFileSync(path, data); created.push(path); }
function content(path, frontmatter, body = '') { create(path, `---\n${JSON.stringify(frontmatter)}\n---\n\n${body}\n`); }
function build() { const result = spawnSync('npm', ['run', 'build'], { encoding: 'utf8' }); if (result.status !== 0) throw new Error(result.stdout + result.stderr); }
function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]); }

try {
  mkdirSync('public/media', { recursive: true });
  create('public/media/authoring-check.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#173238"/></svg>');
  const project = { title: 'Authoring check project', summary: 'A temporary content-only authoring check.', category: 'Experiment', role: 'Test fixture', status: 'Test', featured: true, order: 0, tools: [], links: [], coverImage: '/media/authoring-check.svg', coverAlt: 'Temporary authoring check artwork' };
  content('src/content/projects/authoring-check.md', project, '## A content-only addition\n\nNo component changes were needed.');
  content('src/content/projects/authoring-draft.md', { ...project, title: 'PRIVATE_DRAFT_MARKER_7d7fb', draft: true }, 'PRIVATE_DRAFT_MARKER_7d7fb');
  content('src/content/contributions/authoring-check.md', { title: 'Authoring check contribution', repository: 'example/project', summary: 'A temporary open PR.', type: 'Code', relationship: 'Upstream', status: 'Open', featured: true, pr: 1, url: 'https://github.com/example/project/pull/1', order: 0 });
  const post = { kind: 'post', title: 'Authoring check essay', summary: 'Temporary original writing.', date: '2026-10-23', updated: '2026-10-24', dateWritten: '2024', genre: 'Essay', featured: true, order: 0 };
  content('src/content/notes/authoring-check.md', post, '## An original post\n\nORIGINAL_WRITING_BODY_81a2');
  content('src/content/notes/authoring-draft.md', { ...post, draft: true, title: 'PRIVATE_DRAFT_MARKER_7d7fb' }, 'PRIVATE_DRAFT_MARKER_7d7fb');
  content('src/content/notes/authoring-external.md', { kind: 'external', title: 'External writing fixture', summary: 'An external A & B article.', date: '2026-10-22', platform: 'Example publication', url: 'https://example.com/article?source=portfolio&lang=en' });
  const activity = { title: 'Authoring check activity', label: 'Community', summary: 'SINGLE_SOURCE_ACTIVITY_V1', featured: true, order: 0 };
  content('src/content/activities/authoring-check.md', activity, 'An activity added without changing a component.');
  content('src/content/activities/authoring-draft.md', { ...activity, draft: true, title: 'PRIVATE_DRAFT_MARKER_7d7fb' }, 'PRIVATE_DRAFT_MARKER_7d7fb');
  build();
  const page = readFileSync('dist/work/authoring-check/index.html', 'utf8');
  assert.ok(page.includes('Authoring check project') && page.includes('/media/authoring-check.svg'));
  assert.ok(readFileSync('dist/index.html', 'utf8').includes('/work/authoring-check/'));
  assert.ok(readFileSync('dist/work/index.html', 'utf8').includes('Experiment'));
  assert.ok(readFileSync('dist/open-source/index.html', 'utf8').includes('status-open'));
  assert.ok(readFileSync('dist/index.html', 'utf8').includes('status-open'));
  assert.ok(readFileSync('dist/sitemap.xml', 'utf8').includes('/work/authoring-check/'));
  assert.ok(!existsSync('dist/work/authoring-draft/index.html'));
  const writing = readFileSync('dist/notes/authoring-check/index.html', 'utf8');
  assert.ok(writing.includes('ORIGINAL_WRITING_BODY_81a2') && writing.includes('2024'));
  assert.ok(writing.includes('"datePublished":"2026-10-23"') && writing.includes('"dateModified":"2026-10-24"'));
  assert.ok(readFileSync('dist/index.html', 'utf8').includes('/notes/authoring-check/'));
  assert.ok(readFileSync('dist/about/index.html', 'utf8').includes('/notes/authoring-check/'));
  assert.ok(readFileSync('dist/notes/index.html', 'utf8').includes('Authoring check essay'));
  assert.ok(readFileSync('dist/sitemap.xml', 'utf8').includes('/notes/authoring-check/'));
  assert.ok(readFileSync('dist/rss.xml', 'utf8').includes('/notes/authoring-check/'));
  assert.ok(readFileSync('dist/rss.xml', 'utf8').includes('source=portfolio&amp;lang=en'));
  assert.ok(!existsSync('dist/notes/authoring-external/index.html'));
  assert.ok(!existsSync('dist/notes/authoring-draft/index.html'));
  assert.ok(!readFileSync('dist/sitemap.xml', 'utf8').includes('/notes/authoring-external/'));
  for (const path of ['dist/index.html', 'dist/beyond/index.html']) assert.ok(readFileSync(path, 'utf8').includes('SINGLE_SOURCE_ACTIVITY_V1'));
  writeFileSync('src/content/activities/authoring-check.md', `---\n${JSON.stringify({ ...activity, summary: 'SINGLE_SOURCE_ACTIVITY_V2' })}\n---\n\nUpdated in one content file.\n`);
  build();
  for (const path of ['dist/index.html', 'dist/beyond/index.html']) {
    const html = readFileSync(path, 'utf8');
    assert.ok(html.includes('SINGLE_SOURCE_ACTIVITY_V2') && !html.includes('SINGLE_SOURCE_ACTIVITY_V1'));
  }
  for (const path of files('dist').filter((file) => /\.(html|xml|js|json)$/.test(file))) assert.ok(!readFileSync(path, 'utf8').includes('PRIVATE_DRAFT_MARKER_7d7fb'), `Draft leaked into ${path}`);
  console.log('PASS: projects, original/external writing, dates, metadata, feed, shared activity edits, homepage, sitemap and draft exclusion.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const path of created.reverse()) rmSync(path);
  try { build(); console.log('PASS: temporary records removed; original production output rebuilt.'); }
  catch (error) { console.error(error); process.exitCode = 1; }
}
