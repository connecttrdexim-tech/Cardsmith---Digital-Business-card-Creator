import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.resolve(process.env.CARDSMITH_DATA_DIR || 'data');
const storeFile = path.join(dataDir, 'cards.json');
let writeQueue = Promise.resolve();

async function readStore() {
  try { return JSON.parse(await readFile(storeFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
}

async function writeStore(store) {
  await mkdir(dataDir, { recursive: true });
  const temporary = `${storeFile}.${process.pid}.${randomBytes(3).toString('hex')}.tmp`;
  await writeFile(temporary, JSON.stringify(store), 'utf8');
  await rename(temporary, storeFile);
}

export async function publishCard(card) {
  const serialized = JSON.stringify(card);
  const slug = createHash('sha256').update(serialized).digest('base64url').slice(0, 10);
  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    store[slug] = { card, createdAt: Date.now() };
    await writeStore(store);
  });
  await writeQueue;
  return slug;
}

export async function findCard(slug) {
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(slug)) return null;
  return (await readStore())[slug]?.card || null;
}
