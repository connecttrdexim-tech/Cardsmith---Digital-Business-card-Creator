global.__leads = global.__leads || [];
global.__unlockedSessions = global.__unlockedSessions || new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { sessionToken, campaignCode, phone, name, cardSlug } = req.body || {};

  const lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    phone: String(phone || 'Visitor via WhatsApp Click-to-Chat').replace(/[^0-9+]/g, ''),
    name: String(name || '').trim(),
    campaignCode: String(campaignCode || '').trim().toUpperCase(),
    sessionToken: String(sessionToken || '').trim(),
    cardSlug: String(cardSlug || '').trim(),
    message: 'Visitor tapped WhatsApp Click-to-Chat and confirmed access',
    timestamp: Date.now(),
  };

  global.__leads.unshift(lead);
  if (global.__leads.length > 500) global.__leads.length = 500;

  if (sessionToken) global.__unlockedSessions.set(sessionToken, { unlocked: true, lead, timestamp: Date.now() });
  if (campaignCode) global.__unlockedSessions.set(`code_${campaignCode.toUpperCase()}`, { unlocked: true, lead, timestamp: Date.now() });

  return res.status(200).json({ success: true, unlocked: true, lead });
}
