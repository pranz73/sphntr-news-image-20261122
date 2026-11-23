import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const image = path.join(here, 'entry.png');
if (!existsSync(image)) {
  const render = spawnSync(process.execPath, [path.join(here, 'render.mjs')], { stdio: 'inherit' });
  if (render.error) throw render.error;
  if (render.status !== 0) process.exit(render.status ?? 1);
}
const destination = process.env.MAKEFUN_OUTPUT_DIR || '/output';
mkdirSync(destination, { recursive: true });
copyFileSync(image, path.join(destination, 'entry.png'));
