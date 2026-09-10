import { createHash } from 'node:crypto';
import { get, put } from '@vercel/blob';

const ACCESS = 'private';
const cardPath = (slug) => `cards/${slug}.json`;

export function hasBlobStorage() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID)
  );
}

export async function publishBlobCard(card) {
  const serialized = JSON.stringify(card);
  const slug = createHash('sha256').update(serialized).digest('base64url').slice(0, 10);
  await put(cardPath(slug), serialized, {
    access: ACCESS,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  return slug;
}

export async function findBlobCard(slug) {
  const result = await get(cardPath(slug), { access: ACCESS });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text());
}
