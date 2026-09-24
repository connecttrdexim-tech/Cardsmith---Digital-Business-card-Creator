import { createEmptyCard } from '../data/cardModel.js';

const STRING_FIELDS = [
  'companyName', 'logo', 'ownerName', 'designation', 'profilePicture', 'description',
  'workingHours', 'phone', 'whatsapp', 'whatsappMessage', 'email', 'emailSubject',
  'emailBody', 'website', 'address', 'mapsUrl', 'linkedin', 'github', 'facebook',
  'instagram', 'twitter', 'youtube', 'telegram', 'theme', 'primaryColor',
  'accentColor', 'buttonStyle', 'font', 'layout',
  'campaignCode', 'whatsappGateNumber', 'whatsappGateMessage', 'whatsappGateTitle', 'whatsappGateSubtitle',
];

const text = (value) => (typeof value === 'string' ? value : '');
const safeId = (value) => (typeof value === 'string' && value ? value : crypto.randomUUID());

export function normalizeCard(input, { newId = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Card data must be a JSON object.');
  }

  const card = createEmptyCard();
  for (const field of STRING_FIELDS) {
    if (field in input) card[field] = text(input[field]);
  }

  card.id = newId ? crypto.randomUUID() : safeId(input.id);
  card.whatsappGateEnabled = input.whatsappGateEnabled !== false;
  if (!card.campaignCode) {
    card.campaignCode = `CARD-${card.id.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()}`;
  }
  card.createdAt = Number.isFinite(input.createdAt) ? input.createdAt : Date.now();
  card.updatedAt = Number.isFinite(input.updatedAt) ? input.updatedAt : Date.now();
  card.layout = ['classic', 'centered', 'banner', 'split'].includes(card.layout) ? card.layout : 'classic';
  card.sections = Array.isArray(input.sections)
    ? input.sections.filter((s) => s && typeof s === 'object').map((s) => ({
        id: safeId(s.id),
        type: text(s.type) || 'custom',
        title: text(s.title),
        body: text(s.body),
        items: Array.isArray(s.items)
          ? s.items.filter((item) => item && typeof item === 'object').map((item) => ({
              id: safeId(item.id),
              name: text(item.name), description: text(item.description), link: text(item.link),
              image: text(item.image), question: text(item.question), answer: text(item.answer),
              quote: text(item.quote), author: text(item.author), role: text(item.role),
            }))
          : [],
      }))
    : [];
  card.gallery = Array.isArray(input.gallery)
    ? input.gallery.filter((item) => item && typeof item === 'object').map((item) => ({
        id: safeId(item.id),
        type: item.type === 'youtube' ? 'youtube' : 'image',
        src: text(item.src),
        caption: text(item.caption),
      })).filter((item) => item.src)
    : [];
  return card;
}
