import { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Youtube,
  Send,
  MapPin,
  Check,
} from 'lucide-react';
import {
  copyPhone,
  callPhone,
  openWhatsapp,
  openEmail,
  openExternal,
  openMaps,
  openTelegram,
} from '../utils/contactActions.js';

// A minimal X/Twitter glyph — lucide dropped a dedicated Twitter icon in
// recent versions, so a small inline SVG keeps the icon set self-contained.
function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.5-6.9L4.3 22H1.2l8.1-9.3L1 2h7.3l5 6.3L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z" />
    </svg>
  );
}

export default function ContactIconGrid({ card, accent = '#c9a15c', textClass = 'text-ink-800' }) {
  const [copied, setCopied] = useState(false);

  const actions = [
    card.phone && {
      key: 'phone',
      icon: Phone,
      label: 'Call',
      onClick: async () => {
        await copyPhone(card.phone);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        callPhone(card.phone);
      },
    },
    card.whatsapp && {
      key: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      onClick: () => openWhatsapp(card.whatsapp, card.whatsappMessage),
    },
    card.email && {
      key: 'email',
      icon: Mail,
      label: 'Email',
      onClick: () => openEmail(card.email, card.emailSubject, card.emailBody),
    },
    card.website && {
      key: 'website',
      icon: Globe,
      label: 'Website',
      onClick: () => openExternal(card.website),
    },
    (card.mapsUrl || card.address) && {
      key: 'maps',
      icon: MapPin,
      label: 'Location',
      onClick: () => openMaps(card),
    },
    card.linkedin && {
      key: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      onClick: () => openExternal(card.linkedin),
    },
    card.github && {
      key: 'github',
      icon: Github,
      label: 'GitHub',
      onClick: () => openExternal(card.github),
    },
    card.facebook && {
      key: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      onClick: () => openExternal(card.facebook),
    },
    card.instagram && {
      key: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      onClick: () => openExternal(card.instagram),
    },
    card.twitter && {
      key: 'twitter',
      icon: XIcon,
      label: 'X',
      onClick: () => openExternal(card.twitter),
    },
    card.youtube && {
      key: 'youtube',
      icon: Youtube,
      label: 'YouTube',
      onClick: () => openExternal(card.youtube),
    },
    card.telegram && {
      key: 'telegram',
      icon: Send,
      label: 'Telegram',
      onClick: () => openTelegram(card.telegram),
    },
  ].filter(Boolean);

  if (actions.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map(({ key, icon: Icon, label, onClick }) => (
        <button
          key={key}
          type="button"
          onClick={onClick}
          className={`group flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-black/5 transition-colors ${textClass}`}
          title={label}
        >
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${accent}22`, color: accent }}
          >
            {key === 'phone' && copied ? <Check size={17} /> : <Icon size={17} />}
          </span>
          <span className="text-[11px] opacity-70">{key === 'phone' && copied ? 'Copied' : label}</span>
        </button>
      ))}
    </div>
  );
}
