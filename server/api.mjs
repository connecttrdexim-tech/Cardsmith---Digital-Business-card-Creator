import { findCard, publishCard } from './cardStore.mjs';
import { recordLead, listLeads, isSessionUnlocked, unlockSession } from './leadStore.mjs';
import { normalizeCard } from '../src/utils/cardValidation.js';

const MAX_BODY_BYTES = 8 * 1024 * 1024;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'cardsmith_verify_token';

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function text(res, status, content) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(content);
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Payload is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function handleApi(req, res, pathname) {
  const url = new URL(req.url, 'http://localhost');
  const searchParams = url.searchParams;

  // 1. WhatsApp Cloud API Webhook Verification (GET)
  if (req.method === 'GET' && pathname === '/api/whatsapp/webhook') {
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook] Verification challenge accepted.');
      return text(res, 200, challenge || '');
    }
    console.warn('[WhatsApp Webhook] Verification failed. Token mismatch.');
    return text(res, 403, 'Forbidden: verify token mismatch');
  }

  // 2. WhatsApp Cloud API Incoming Message Webhook (POST)
  // WhatsApp Business sends incoming message webhook with `messages[].from`
  if (req.method === 'POST' && pathname === '/api/whatsapp/webhook') {
    try {
      const body = await readJson(req);
      const entries = body?.entry || [];
      let capturedCount = 0;

      for (const entry of entries) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          const contacts = value.contacts || [];
          const messages = value.messages || [];

          for (const msg of messages) {
            // Capture sender WhatsApp number (messages[].from)
            const from = msg.from;
            const contact = contacts.find((c) => c.wa_id === from) || contacts[0];
            const senderName = contact?.profile?.name || '';
            const msgBody = msg.text?.body || '';

            // Extract campaign code: matches CARD-XXXX or "Hi <code/campaign>"
            const codeMatch = msgBody.match(/CARD-[A-Za-z0-9_-]+/i) || msgBody.match(/Hi\s+([A-Za-z0-9_-]+)/i);
            const campaignCode = codeMatch ? (codeMatch[1] || codeMatch[0]) : '';

            // Extract session token if present
            const tokenMatch = msgBody.match(/(?:tok_|req_)[A-Za-z0-9_-]+/i) || msgBody.match(/\[([A-Za-z0-9_-]+)\]/);
            const sessionToken = tokenMatch ? (tokenMatch[1] || tokenMatch[0]) : '';

            console.log(`[WhatsApp Webhook] Captured lead from ${from} (${senderName}): "${msgBody}"`);

            await recordLead({
              phone: from,
              name: senderName,
              campaignCode,
              sessionToken,
              message: msgBody,
            });
            capturedCount++;
          }
        }
      }
      return json(res, 200, { status: 'EVENT_RECEIVED', captured: capturedCount });
    } catch (err) {
      console.error('[WhatsApp Webhook Error]', err);
      return json(res, 500, { error: 'Failed to process WhatsApp webhook.' });
    }
  }

  // 3. Poll session unlock status (GET)
  if (req.method === 'GET' && pathname === '/api/whatsapp/status') {
    const sessionToken = searchParams.get('sessionToken') || '';
    const campaignCode = searchParams.get('campaignCode') || '';
    const status = isSessionUnlocked(sessionToken, campaignCode);
    return json(res, 200, status ? { unlocked: true, lead: status.lead } : { unlocked: false });
  }

  // 4. Verify / Unlock Visitor (POST)
  // Allows visitor to unlock card after sending WhatsApp or confirming number
  if (req.method === 'POST' && pathname === '/api/whatsapp/unlock') {
    try {
      const body = await readJson(req);
      const { sessionToken, campaignCode, phone, name, cardSlug } = body || {};
      const lead = await recordLead({
        phone: phone || 'Visitor via WhatsApp Click-to-Chat',
        name: name || '',
        campaignCode: campaignCode || '',
        sessionToken: sessionToken || '',
        cardSlug: cardSlug || '',
        message: 'Visitor tapped WhatsApp Click-to-Chat and confirmed access',
      });
      if (sessionToken) unlockSession(sessionToken, lead);
      return json(res, 200, { success: true, unlocked: true, lead });
    } catch (err) {
      return json(res, 400, { error: err.message || 'Invalid request' });
    }
  }

  // 5. List captured leads (GET)
  if (req.method === 'GET' && pathname === '/api/whatsapp/leads') {
    const cardSlug = searchParams.get('cardSlug') || '';
    const campaignCode = searchParams.get('campaignCode') || '';
    const leads = await listLeads({ cardSlug, campaignCode });
    return json(res, 200, { leads });
  }

  // Cardsmith Card Publishing API
  if (req.method === 'POST' && pathname === '/api/cards') {
    try {
      const body = await readJson(req);
      if (!body?.card || typeof body.card !== 'object' || Array.isArray(body.card)) return json(res, 400, { error: 'Invalid card data.' });
      return json(res, 201, { slug: await publishCard(normalizeCard(body.card)) });
    } catch (error) {
      return json(res, error.status || 400, { error: error.status ? error.message : 'Invalid request.' });
    }
  }
  const match = pathname.match(/^\/api\/cards\/([A-Za-z0-9_-]{6,32})$/);
  if (req.method === 'GET' && match) {
    const card = await findCard(match[1]);
    return card ? json(res, 200, { card }) : json(res, 404, { error: 'Card not found.' });
  }
  return false;
}
