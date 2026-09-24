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
 * Builds the WhatsApp click-to-chat URL:
 * https://wa.me/<yourNumber>?text=Hi%20<campaign-code>
 */
export function buildWhatsAppClickToChatUrl({ number, campaignCode, sessionToken = '' }) {
  const cleanNumber = cleanWhatsAppNumber(number);
  let message = `Hi ${campaignCode}`;
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
