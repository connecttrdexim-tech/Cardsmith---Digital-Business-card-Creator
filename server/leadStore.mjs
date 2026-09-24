import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.resolve(process.env.CARDSMITH_DATA_DIR || 'data');
const leadsFile = path.join(dataDir, 'leads.json');
let writeQueue = Promise.resolve();

// In-memory active unlock tokens for fast real-time polling
const unlockedSessions = new Map();

async function readLeads() {
  try {
    return JSON.parse(await readFile(leadsFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    return [];
  }
}

async function writeLeads(leads) {
  await mkdir(dataDir, { recursive: true });
  const temporary = `${leadsFile}.${process.pid}.${randomBytes(3).toString('hex')}.tmp`;
  await writeFile(temporary, JSON.stringify(leads, null, 2), 'utf8');
  await rename(temporary, leadsFile);
}

export async function recordLead({ phone, name = '', campaignCode = '', cardSlug = '', sessionToken = '', message = '' }) {
  const cleanPhone = String(phone || '').replace(/[^0-9+]/g, '');
  const lead = {
    id: `lead_${Date.now()}_${randomBytes(4).toString('hex')}`,
    phone: cleanPhone,
    name: String(name || '').trim(),
    campaignCode: String(campaignCode || '').trim().toUpperCase(),
    cardSlug: String(cardSlug || '').trim(),
    sessionToken: String(sessionToken || '').trim(),
    message: String(message || '').trim(),
    timestamp: Date.now(),
  };

  writeQueue = writeQueue.then(async () => {
    const list = await readLeads();
    list.unshift(lead);
    // Keep last 1000 leads
    if (list.length > 1000) list.length = 1000;
    await writeLeads(list);
  });
  await writeQueue;

  // Mark session unlocked in memory
  if (sessionToken) {
    unlockedSessions.set(sessionToken, { unlocked: true, lead, timestamp: Date.now() });
  }
  if (lead.campaignCode) {
    unlockedSessions.set(`code_${lead.campaignCode}`, { unlocked: true, lead, timestamp: Date.now() });
  }

  return lead;
}

export async function listLeads({ cardSlug, campaignCode } = {}) {
  const list = await readLeads();
  return list.filter((item) => {
    if (cardSlug && item.cardSlug && item.cardSlug !== cardSlug) return false;
    if (campaignCode && item.campaignCode && item.campaignCode !== campaignCode.toUpperCase()) return false;
    return true;
  });
}

export function unlockSession(sessionToken, leadData = {}) {
  if (!sessionToken) return;
  unlockedSessions.set(sessionToken, { unlocked: true, lead: leadData, timestamp: Date.now() });
}

export function isSessionUnlocked(sessionToken, campaignCode = '') {
  if (sessionToken && unlockedSessions.has(sessionToken)) {
    return unlockedSessions.get(sessionToken);
  }
  if (campaignCode && unlockedSessions.has(`code_${campaignCode.toUpperCase()}`)) {
    return unlockedSessions.get(`code_${campaignCode.toUpperCase()}`);
  }
  return null;
}
