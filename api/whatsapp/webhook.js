/**
 * WhatsApp Business Cloud API Webhook — Vercel Serverless Function
 *
 * GET  /api/whatsapp/webhook  — Meta's webhook verification handshake
 * POST /api/whatsapp/webhook  — Incoming messages (captures messages[].from)
 *
 * NOTE: On Vercel serverless, each invocation is stateless.
 * Captured leads are stored in Vercel Blob (if configured) or logged only.
 * For production real-time unlock, integrate a database (e.g. Vercel KV / Postgres).
 */
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'cardsmith_verify_token';

async function storeLead(lead) {
  // Try to persist via Vercel Blob if available
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    const { put } = await import('@vercel/blob');
    const key = `leads/${lead.timestamp}_${lead.phone}.json`;
    await put(key, JSON.stringify(lead), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
  } catch (e) {
    console.error('[WhatsApp Webhook] Could not persist lead:', e);
  }
}

export default async function handler(req, res) {
  // ── GET: Webhook verification handshake with Meta ───────────────────────────
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(challenge || '');
    }
    return res.status(403).send('Forbidden: verify token mismatch');
  }

  // ── POST: Incoming messages webhook from WhatsApp Business Cloud API ────────
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const entries = body?.entry || [];
      let capturedCount = 0;

      for (const entry of entries) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          const contacts = value.contacts || [];
          const messages = value.messages || [];

          for (const msg of messages) {
            // Capture sender's WhatsApp number from messages[].from
            const from = String(msg.from || '').replace(/[^0-9]/g, '');
            const contact = contacts.find((c) => c.wa_id === from) || contacts[0] || {};
            const senderName = contact?.profile?.name || '';
            const msgBody = msg.text?.body || '';

            const codeMatch = msgBody.match(/CARD-[A-Za-z0-9_-]+/i) || msgBody.match(/Hi\s+([A-Za-z0-9_-]+)/i);
            const campaignCode = codeMatch ? (codeMatch[1] || codeMatch[0]).toUpperCase() : '';
            const tokenMatch = msgBody.match(/\[([A-Za-z0-9_-]{5,})\]/);
            const sessionToken = tokenMatch ? tokenMatch[1] : '';

            const lead = {
              id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              phone: from,
              name: senderName,
              campaignCode,
              sessionToken,
              message: msgBody,
              timestamp: Date.now(),
            };

            console.log(`[WhatsApp Webhook] Captured lead: ${from} (${senderName}) — "${msgBody}"`);
            await storeLead(lead);
            capturedCount++;
          }
        }
      }
      return res.status(200).json({ status: 'EVENT_RECEIVED', captured: capturedCount });
    } catch (err) {
      console.error('[WhatsApp Webhook Error]', err);
      return res.status(500).json({ error: 'Failed to process webhook.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
