import { openDB } from 'idb';

const DB_NAME = 'cardsmith-db';
const DB_VERSION = 1;
const STORE = 'cards';

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    },
  });
}

export async function listCards() {
  const db = await getDb();
  const all = await db.getAll(STORE);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getCard(id) {
  const db = await getDb();
  return db.get(STORE, id);
}

export async function saveCard(card) {
  const db = await getDb();
  const toSave = { ...card, updatedAt: Date.now() };
  await db.put(STORE, toSave);
  return toSave;
}

export async function deleteCard(id) {
  const db = await getDb();
  await db.delete(STORE, id);
}

// LocalStorage is used only for small, non-critical UI preferences
// (e.g. last-used theme), per the "settings" storage requirement.
const PREFS_KEY = 'cardsmith-prefs';

export function getPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
}

export function setPrefs(patch) {
  const current = getPrefs();
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...patch }));
}
