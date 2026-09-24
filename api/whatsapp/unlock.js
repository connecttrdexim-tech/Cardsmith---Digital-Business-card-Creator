/**
 * WhatsApp Visitor Unlock — Vercel Serverless Function
 *
 * POST /api/whatsapp/unlock
 *
 * Records that a visitor confirmed they opened WhatsApp (click-to-chat).
 * Stores the lead in Blob if configured. Always returns unlocked=true.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { sessionToken = '', campaignCode = '', phone = '', name = '', cardSlug = '' } = body;

  const lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    phone: String(phone || 'click-to-chat-visitor').replace(/[^0-9+]/g, '') || 'unknown',
    name: String(name || '').trim(),
    campaignCode: String(campaignCode || '').trim().toUpperCase(),
    sessionToken: String(sessionToken || '').trim(),
    cardSlug: String(cardSlug || '').trim(),
    message: 'Visitor tapped WhatsApp Click-to-Chat',
    timestamp: Date.now(),
  };

  // Persist to Blob if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const key = `leads/${lead.timestamp}_${lead.phone || 'visitor'}.json`;
      await put(key, JSON.stringify(lead), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
    } catch (e) {
      console.error('[WhatsApp Unlock] Could not persist lead:', e);
    }
  } else {
    console.log('[WhatsApp Unlock] Lead (no blob storage):', lead);
  }

  return res.status(200).json({ success: true, unlocked: true, lead });
}
