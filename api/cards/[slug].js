import { findBlobCard, hasBlobStorage } from '../_cards.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  if (!hasBlobStorage()) {
    return response.status(503).json({ error: 'Short-link storage is not configured.' });
  }

  const value = Array.isArray(request.query.slug) ? request.query.slug[0] : request.query.slug;
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(value || '')) {
    return response.status(400).json({ error: 'Invalid card link.' });
  }

  try {
    const card = await findBlobCard(value);
    return card
      ? response.status(200).json({ card })
      : response.status(404).json({ error: 'Card not found.' });
  } catch (error) {
    console.error('Could not load card:', error);
    return response.status(500).json({ error: 'Could not load this card.' });
  }
}
