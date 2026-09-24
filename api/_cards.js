import { createHash } from 'node:crypto';

const cardPath = (slug) => `cards/${slug}.json`;

// ─── Blob Storage Detection ───────────────────────────────────────────────────
export function hasBlobStorage() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID)
  );
}

// ─── Slug Computation ─────────────────────────────────────────────────────────
export function computeSlug(serialized) {
  return createHash('sha256').update(serialized).digest('base64url').slice(0, 10);
}

// ─── Blob Storage (lazy-import so non-Vercel builds don't break) ──────────────
async function getBlobModule() {
  try {
    return await import('@vercel/blob');
  } catch {
    return null;
  }
}

// @vercel/blob v2.x — put() writes, head() fetches metadata, then fetch URL
export async function publishBlobCard(card) {
  const blob = await getBlobModule();
  if (!blob) throw new Error('Vercel Blob SDK not available.');

  const serialized = JSON.stringify(card);
  const slug = computeSlug(serialized);

  // put() in v2 returns a BlobObject with a .url property
  await blob.put(cardPath(slug), serialized, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  return slug;
}

export async function findBlobCard(slug) {
  const blob = await getBlobModule();
  if (!blob) return null;

  try {
    // head() in v2 returns { url, pathname, ... } or throws if not found
    const meta = await blob.head(cardPath(slug));
    if (!meta?.url) return null;
    // Fetch the public URL directly — no auth needed for public blobs
    const res = await fetch(meta.url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // head() throws if the blob doesn't exist
    return null;
  }
}
