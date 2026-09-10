import { normalizeCard } from '../../src/utils/cardValidation.js';
import { hasBlobStorage, publishBlobCard } from '../_cards.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  if (!hasBlobStorage()) {
    return response.status(503).json({ error: 'Short-link storage is not configured.' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    if (!body?.card || typeof body.card !== 'object' || Array.isArray(body.card)) {
      return response.status(400).json({ error: 'Invalid card data.' });
    }
    const card = normalizeCard(body.card);
    const slug = await publishBlobCard(card);
    return response.status(201).json({ slug });
  } catch (error) {
    console.error('Could not publish card:', error);
    return response.status(500).json({ error: 'Could not store the complete card.' });
  }
}
