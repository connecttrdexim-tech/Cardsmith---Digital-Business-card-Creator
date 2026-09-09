import { findCard, publishCard } from './cardStore.mjs';
import { normalizeCard } from '../src/utils/cardValidation.js';

const MAX_BODY_BYTES = 8 * 1024 * 1024;
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Card is too large to publish.'), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function handleApi(req, res, pathname) {
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
