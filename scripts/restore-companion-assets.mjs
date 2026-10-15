import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const archiveDirectory = path.join(root, 'recovery/companion-atlases');
const { atlases } = JSON.parse(await readFile(path.join(archiveDirectory, 'manifest.json'), 'utf8'));
for (const atlas of atlases) {
  const filename = `${atlas.id}-walk-v1.png.b64`;
  if (!/^[a-z]+-walk-v1\.png\.b64$/.test(filename)) throw new Error('Invalid companion atlas name');
  const source = path.join(archiveDirectory, filename);
  const destination = path.join(root, 'client/public/manus-storage', filename.slice(0, -4));
  const bytes = Buffer.from((await readFile(source, 'utf8')).trim(), 'base64');
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== atlas.sha256) throw new Error(`Companion atlas integrity mismatch: ${atlas.id}`);
  let existing;
  try { existing = await readFile(destination); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!existing || !existing.equals(bytes)) {
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  }
  console.log(`Companion atlas restored: ${filename}, sha256 ${hash}`);
}
