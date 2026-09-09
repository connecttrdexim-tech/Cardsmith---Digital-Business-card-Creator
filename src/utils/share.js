import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

// Legacy embedded-data links are decoded for backwards compatibility.
// New shares are published through the API and use short /c/:slug routes.

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

function publicBaseUrl() {
  const configured = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  return (configured || `${window.location.origin}${window.location.pathname}`).replace(/\/$/, '');
}

export function buildShortShareUrl(slug) {
  return `${publicBaseUrl()}/#/c/${slug}`;
}

export async function publishCard(card) {
  let response;
  try {
    response = await fetch('./api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card }),
    });
  } catch {
    throw new Error('The sharing service is unavailable. Start Cardsmith with npm start and try again.');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.slug) throw new Error(result.error || 'Could not create a share link.');
  return buildShortShareUrl(result.slug);
}

export async function fetchPublishedCard(slug) {
  let response;
  try {
    response = await fetch(`./api/cards/${encodeURIComponent(slug)}`);
  } catch {
    throw new Error('The shared card could not be loaded because the sharing service is unavailable.');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.card) throw new Error(result.error || 'This card was not found.');
  return result.card;
}

export function isLocalShareUrl(url) {
  try { return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname); }
  catch { return false; }
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
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* use fallback */ }
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) throw new Error('Clipboard access was blocked.');
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
