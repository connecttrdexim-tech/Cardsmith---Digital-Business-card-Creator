/**
 * WhatsApp Lead Status — Vercel Serverless Function
 *
 * GET /api/whatsapp/status?campaignCode=CARD-XXX
 *
 * Checks if a visitor has been captured (their message arrived via webhook).
 * On Vercel, this reads from Blob storage if configured.
 * Without Blob storage, always returns unlocked (trust-based fallback).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { campaignCode = '', sessionToken = '' } = req.query;

  // If no blob storage — return unlocked as a trust-based fallback
  // (visitor tapped the WhatsApp button; we trust they sent the message)
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ unlocked: true, fallback: true });
  }

  // With blob storage, look for a captured lead matching the campaign code or session token
  try {
    const { list } = await import('@vercel/blob');
    const blobs = await list({ prefix: 'leads/' });
    for (const blob of blobs.blobs) {
      try {
        const r = await fetch(blob.url);
        if (!r.ok) continue;
        const lead = await r.json();
        if (
          (sessionToken && lead.sessionToken === sessionToken) ||
          (campaignCode && lead.campaignCode === campaignCode.toUpperCase())
        ) {
          return res.status(200).json({ unlocked: true, lead });
        }
      } catch {}
    }
    return res.status(200).json({ unlocked: false });
  } catch (e) {
    console.error('[WhatsApp Status Error]', e);
    // Fail open — don't block card access if blob read fails
    return res.status(200).json({ unlocked: true, fallback: true });
  }
}
