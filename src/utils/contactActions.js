export function digitsOnly(str = '') {
  return String(str).replace(/[^\d+]/g, '');
}

export async function copyPhone(phone) {
  await navigator.clipboard.writeText(phone);
}

export function callPhone(phone) {
  window.location.href = `tel:${digitsOnly(phone)}`;
}

export function openWhatsapp(number, message) {
  const digits = digitsOnly(number).replace('+', '');
  const text = encodeURIComponent(message || '');
  window.open(`https://wa.me/${digits}?text=${text}`, '_blank', 'noopener');
}

export function openEmail(email, subject = '', body = '') {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  window.location.href = `mailto:${email}${query ? `?${query}` : ''}`;
}

export function openExternal(url) {
  if (!url) return;
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  window.open(withProtocol, '_blank', 'noopener');
}

export function openMaps(card) {
  if (card.mapsUrl) return openExternal(card.mapsUrl);
  if (card.address) {
    const q = encodeURIComponent(card.address);
    return openExternal(`https://www.google.com/maps/search/?api=1&query=${q}`);
  }
}

export function openTelegram(handle) {
  const clean = handle.replace('@', '').replace('https://t.me/', '');
  openExternal(`https://t.me/${clean}`);
}
