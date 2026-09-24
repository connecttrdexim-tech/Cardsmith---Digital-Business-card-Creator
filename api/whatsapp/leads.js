global.__leads = global.__leads || [];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { cardSlug = '', campaignCode = '' } = req.query;

  const filtered = global.__leads.filter((item) => {
    if (cardSlug && item.cardSlug && item.cardSlug !== cardSlug) return false;
    if (campaignCode && item.campaignCode && item.campaignCode !== String(campaignCode).toUpperCase()) return false;
    return true;
  });

  return res.status(200).json({ leads: filtered });
}
