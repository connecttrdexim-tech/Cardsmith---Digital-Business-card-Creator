const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'cardsmith_verify_token';

// In-memory fallback if deployed on serverless
global.__leads = global.__leads || [];
global.__unlockedSessions = global.__unlockedSessions || new Map();

export default async function handler(req, res) {
  // GET: Webhook verification handshake with Meta
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

  // POST: Incoming messages webhook from WhatsApp Business Cloud API
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const entries = body?.entry || [];
      let capturedCount = 0;

      for (const entry of entries) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          const contacts = value.contacts || [];
          const messages = value.messages || [];

          for (const msg of messages) {
            // The visitor's WhatsApp phone number (messages[].from)
            const from = msg.from;
            const contact = contacts.find((c) => c.wa_id === from) || contacts[0];
            const senderName = contact?.profile?.name || '';
            const msgBody = msg.text?.body || '';

            const codeMatch = msgBody.match(/CARD-[A-Za-z0-9_-]+/i) || msgBody.match(/Hi\s+([A-Za-z0-9_-]+)/i);
            const campaignCode = codeMatch ? (codeMatch[1] || codeMatch[0]) : '';

            const tokenMatch = msgBody.match(/(?:tok_|req_)[A-Za-z0-9_-]+/i) || msgBody.match(/\[([A-Za-z0-9_-]+)\]/);
            const sessionToken = tokenMatch ? (tokenMatch[1] || tokenMatch[0]) : '';

            const lead = {
              id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              phone: String(from).replace(/[^0-9+]/g, ''),
              name: senderName,
              campaignCode: campaignCode.toUpperCase(),
              sessionToken,
              message: msgBody,
              timestamp: Date.now(),
            };

            global.__leads.unshift(lead);
            if (global.__leads.length > 500) global.__leads.length = 500;

            if (sessionToken) global.__unlockedSessions.set(sessionToken, { unlocked: true, lead, timestamp: Date.now() });
            if (campaignCode) global.__unlockedSessions.set(`code_${campaignCode.toUpperCase()}`, { unlocked: true, lead, timestamp: Date.now() });
            capturedCount++;
          }
        }
      }
      return res.status(200).json({ status: 'EVENT_RECEIVED', captured: capturedCount });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to process webhook.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
