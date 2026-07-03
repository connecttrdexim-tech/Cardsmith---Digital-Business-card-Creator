import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

// Because there is no backend, a "shareable link" cannot point at a server
// record. Instead the entire card is compressed and embedded directly in
// the URL hash. Anyone who opens the link decodes the card client-side —
// the link IS the data. This keeps the app truly static/self-hostable.

export function encodeCardToParam(card) {
  const json = JSON.stringify(card);
  return compressToEncodedURIComponent(json);
}

export function decodeCardFromParam(param) {
  try {
    const json = decompressFromEncodedURIComponent(param);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function buildShareUrl(card) {
  const encoded = encodeCardToParam(card);
  const base = window.location.origin + window.location.pathname;
  return `${base}#/view/${encoded}`;
}

// Rough size warning: very large embedded photos/gallery images make the
// link unwieldy (some chat apps clip extremely long URLs). 6000 chars is a
// practical, conservative threshold — well under real browser URL limits.
export function estimateLinkWeight(url) {
  const length = url.length;
  if (length < 2000) return { level: 'ok', length };
  if (length < 6000) return { level: 'large', length };
  return { level: 'too-large', length };
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

export async function nativeShare({ title, text, url }) {
  if (navigator.share) {
    await navigator.share({ title, text, url });
    return true;
  }
  return false;
}

export function shareViaWhatsApp(url, message = '') {
  const text = encodeURIComponent(message ? `${message} ${url}` : url);
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
}

export function shareViaTelegram(url, message = '') {
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener'
  );
}

export function shareViaEmail(url, subject = 'My digital business card') {
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(url)}`;
}
