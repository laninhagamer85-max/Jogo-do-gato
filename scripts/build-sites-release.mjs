import { cp, mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await import('./restore-companion-assets.mjs');
const config = await readFile(path.join(root, '.env.production'), 'utf8');
for (const name of ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID']) {
  if (!new RegExp(`^${name}=.+$`, 'm').test(config)) throw new Error(`Missing published client setting: ${name}`);
}
const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
// Keep existing hashed assets available to tabs opened before the update.
await mkdir(path.join(root, 'out'), { recursive: true });
await cp(path.join(root, 'recovery/published-v7'), path.join(root, 'out'), { recursive: true });
await cp(path.join(root, 'dist/public'), path.join(root, 'out'), { recursive: true });
console.log('Sites release ready: editable source, original public auth configuration, cached assets retained.');
