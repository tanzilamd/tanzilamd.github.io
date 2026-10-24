import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
export default function socialCards() {
  let root;
  return {
    name: 'offscript-social-cards',
    hooks: {
      'astro:config:done': ({ config }) => { root = fileURLToPath(config.root); },
      'astro:build:done': async ({ dir, logger }) => {
        const cache = join(root, 'node_modules', '.cache', 'offscript-social-cards');
        await mkdir(join(cache, 'fontconfig'), { recursive: true });
        // Scope Fontconfig's writable cache to the build worker, preserving the
        // parent environment and every inherited credential/proxy setting.
        const { stdout } = await run(process.execPath, [fileURLToPath(new URL('../scripts/build-social-cards.mjs', import.meta.url)), fileURLToPath(dir), root], {
          cwd: root, env: { ...process.env, XDG_CACHE_HOME: cache }, maxBuffer: 1024 * 1024,
        });
        logger.info(stdout.trim());
      },
    },
  };
}
