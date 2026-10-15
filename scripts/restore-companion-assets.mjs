import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const id of ['sol', 'mimo']) {
  const source = path.join(root, `recovery/companion-atlases/${id}-walk-v1.png.b64`);
  const destination = path.join(root, `client/public/manus-storage/${id}-walk-v1.png`);
  const bytes = Buffer.from((await readFile(source, 'utf8')).trim(), 'base64');
  let existing;
  try { existing = await readFile(destination); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!existing || !existing.equals(bytes)) {
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  }
  console.log(`Companion atlas restored: ${id}, sha256 ${createHash('sha256').update(bytes).digest('hex')}`);

}
