global.__unlockedSessions = global.__unlockedSessions || new Map();

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { sessionToken = '', campaignCode = '' } = req.query;

  if (sessionToken && global.__unlockedSessions.has(sessionToken)) {
    return res.status(200).json(global.__unlockedSessions.get(sessionToken));
  }
  if (campaignCode && global.__unlockedSessions.has(`code_${String(campaignCode).toUpperCase()}`)) {
    return res.status(200).json(global.__unlockedSessions.get(`code_${String(campaignCode).toUpperCase()}`));
  }

  return res.status(200).json({ unlocked: false });
}
