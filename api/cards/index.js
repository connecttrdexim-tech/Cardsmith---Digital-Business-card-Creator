import { normalizeCard } from '../../src/utils/cardValidation.js';
import { hasBlobStorage, publishBlobCard, computeSlug } from '../_cards.js';
import { compressToEncodedURIComponent } from 'lz-string';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    if (!body?.card || typeof body.card !== 'object' || Array.isArray(body.card)) {
      return response.status(400).json({ error: 'Invalid card data.' });
    }

    const card = normalizeCard(body.card);

    // If Vercel Blob is configured, use it for short links
    if (hasBlobStorage()) {
      try {
        const slug = await publishBlobCard(card);
        return response.status(201).json({ slug, storage: 'blob' });
      } catch (blobErr) {
        console.error('Blob publish failed, falling back to encoded URL:', blobErr);
        // Fall through to embedded URL fallback below
      }
    }

    // Fallback: embed the full card as a compressed LZ-string encoded URL param.
    // This works without any backend storage — the card data travels in the URL itself.
    const encoded = compressToEncodedURIComponent(JSON.stringify(card));
    return response.status(201).json({ encoded, storage: 'embedded' });

  } catch (error) {
    console.error('Could not publish card:', error);
    return response.status(500).json({ error: 'Could not store the card.' });
  }
}
