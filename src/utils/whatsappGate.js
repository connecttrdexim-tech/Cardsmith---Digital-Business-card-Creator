/**
 * WhatsApp Click-to-Chat & Lead Gate Utilities
 */

export function cleanWhatsAppNumber(number = '') {
  return String(number).replace(/[^0-9]/g, '');
}

export function formatPhoneDisplay(number = '') {
  const digits = cleanWhatsAppNumber(number);
  if (!digits) return '';
  if (digits.length === 10) return `+${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

export function getEffectiveWhatsAppNumber(card) {
  return cleanWhatsAppNumber(card.whatsappGateNumber || card.whatsapp || card.phone || '');
}

export function getEffectiveCampaignCode(card) {
  if (card.campaignCode && card.campaignCode.trim()) return card.campaignCode.trim().toUpperCase();
  const base = (card.slug || card.id || 'CARD').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();
  return `CARD-${base}`;
}

/**
 * Appends unlock parameter to card URL so opening from WhatsApp unlocks immediately
 */
export function buildUnlockedCardUrl(url) {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}unlock=1`;
}

/**
 * Builds the WhatsApp click-to-chat URL with 2-step verification:
 * Prefills a "Hi" message + the visitor's digital profile link with unlock=1
 */
export function buildWhatsAppClickToChatUrl({
  number,
  campaignCode = '',
  sessionToken = '',
  cardUrl = '',
  card = null,
}) {
  const cleanNumber = cleanWhatsAppNumber(number);
  if (!cleanNumber) return '';

  const unlockedUrl = cardUrl ? buildUnlockedCardUrl(cardUrl) : '';
  const code = campaignCode || (card ? getEffectiveCampaignCode(card) : '');

  let message = '';
  if (card?.whatsappGateMessage && card.whatsappGateMessage.trim()) {
    message = card.whatsappGateMessage.trim();
    if (code) {
      message = message.replace(/{campaignCode}/g, code);
    }
    if (unlockedUrl && message.includes('{link}')) {
      message = message.replace(/{link}/g, unlockedUrl);
    } else if (unlockedUrl) {
      message = `${message}\n\n👉 View Digital Profile: ${unlockedUrl}`;
    }
  } else {
    const greeting = code ? `Hi ${code}!` : 'Hi!';
    if (unlockedUrl) {
      message = `${greeting} I would like to connect and view your digital business card.\n\n👉 Digital Profile Link: ${unlockedUrl}`;
    } else {
      message = `${greeting} I would like to view your digital business card.`;
    }
  }

  if (sessionToken) {
    message += ` [${sessionToken}]`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Check if a session has been unlocked via WhatsApp Cloud API webhook
 */
export async function checkWhatsAppStatus({ sessionToken = '', campaignCode = '' }) {
  try {
    const params = new URLSearchParams();
    if (sessionToken) params.append('sessionToken', sessionToken);
    if (campaignCode) params.append('campaignCode', campaignCode);
    const res = await fetch(`/api/whatsapp/status?${params.toString()}`);
    if (!res.ok) return { unlocked: false };
    return await res.json();
  } catch {
    return { unlocked: false };
  }
}

/**
 * Manually unlock or record visitor confirmation
 */
export async function confirmWhatsAppVisitor({ sessionToken, campaignCode, phone, name, cardSlug }) {
  try {
    const res = await fetch('/api/whatsapp/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, campaignCode, phone, name, cardSlug }),
    });
    if (!res.ok) throw new Error('Unlock request failed');
    return await res.json();
  } catch (error) {
    console.warn('Unlock API offline, using client session unlock:', error);
    return { success: true, unlocked: true };
  }
}

/**
 * Fetch captured leads for a card
 */
export async function fetchCardLeads({ cardSlug = '', campaignCode = '' } = {}) {
  try {
    const params = new URLSearchParams();
    if (cardSlug) params.append('cardSlug', cardSlug);
    if (campaignCode) params.append('campaignCode', campaignCode);
    const res = await fetch(`/api/whatsapp/leads?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.leads) ? data.leads : [];
  } catch {
    return [];
  }
}
