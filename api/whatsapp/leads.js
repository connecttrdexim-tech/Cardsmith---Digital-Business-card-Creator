/**
 * WhatsApp Leads List — Vercel Serverless Function
 *
 * GET /api/whatsapp/leads?cardSlug=...&campaignCode=...
 *
 * Lists all captured WhatsApp leads from Blob storage.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ leads: [], note: 'Blob storage not configured. Leads are logged server-side only.' });
  }

  const { cardSlug = '', campaignCode = '' } = req.query;

  try {
    const { list } = await import('@vercel/blob');
    const blobs = await list({ prefix: 'leads/' });
    const leads = [];

    for (const blob of blobs.blobs) {
      try {
        const r = await fetch(blob.url);
        if (!r.ok) continue;
        const lead = await r.json();
        if (cardSlug && lead.cardSlug && lead.cardSlug !== cardSlug) continue;
        if (campaignCode && lead.campaignCode && lead.campaignCode !== campaignCode.toUpperCase()) continue;
        leads.push(lead);
      } catch {}
    }

    leads.sort((a, b) => b.timestamp - a.timestamp);
    return res.status(200).json({ leads });
  } catch (e) {
    console.error('[WhatsApp Leads Error]', e);
    return res.status(500).json({ error: 'Could not fetch leads.' });
  }
}
