import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { readMeta } from '../src/lib/social.ts';
import { renderCard } from './social-card-renderer.mjs';

const [output, root] = process.argv.slice(2);
if (!output || !root) throw new Error('Pass the build output and project root.');
async function pages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? pages(join(directory, entry.name)) : entry.name.endsWith('.html') ? [join(directory, entry.name)] : []));
  return nested.flat();
}
let count = 0;
for (const file of await pages(output)) {
  const meta = readMeta(await readFile(file, 'utf8'));
  if (!meta['og:image'] || !meta['og:url']) throw new Error(`Missing sharing metadata: ${file}`);
  const image = new URL(meta['og:image']), canonical = new URL(meta['og:url']);
  if (image.pathname === '/social-card.png') continue;
  if (image.origin !== canonical.origin || !/^\/share\/[a-z\d-]+-[a-f\d]{8}\.png$/.test(image.pathname)) throw new Error(`Invalid share asset path: ${image.pathname}`);
  const target = resolve(output, `.${image.pathname}`);
  if (!target.startsWith(resolve(output) + sep)) throw new Error('Share asset must stay inside the build.');
  await mkdir(join(output, 'share'), { recursive: true });
  await writeFile(target, await renderCard({ pathname: canonical.pathname, title: meta['og:title'], description: meta['og:description'], author: meta.author, origin: canonical.origin }, root));
  count++;
}
console.log(`Generated ${count} page-specific PNG share cards (1200 × 630).`);
