import { useState } from 'react';
import {
  ChevronDown,
  Building2,
  Phone,
  MessageCircle,
  Share2,
  Palette,
  LayoutList,
  Image as ImageIcon,
} from 'lucide-react';
import IdentityFields from './IdentityFields.jsx';
import ContactFields from './ContactFields.jsx';
import WhatsAppGateSettings from './WhatsAppGateSettings.jsx';
import SocialFields from './SocialFields.jsx';
import DesignFields from './DesignFields.jsx';
import SectionsEditor from './SectionsEditor.jsx';
import GalleryEditor from './GalleryEditor.jsx';

function Group({ title, icon: Icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="flex items-center gap-2 font-display text-base font-semibold text-ink-800">
          <Icon size={17} className="text-brass-500" />
          {title}
        </span>
        <ChevronDown size={18} className={`text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-5 space-y-4">{children}</div>}
    </div>
  );
}

export default function CardForm({ card, onChange }) {
  function set(patch) {
    onChange({ ...card, ...patch });
  }

  return (
    <div className="divide-y divide-ink-100">
      <Group title="Identity" icon={Building2} defaultOpen>
        <IdentityFields card={card} set={set} />
      </Group>

      <Group title="Contact" icon={Phone}>
        <ContactFields card={card} set={set} />
      </Group>

      <Group title="WhatsApp Lead Gate" icon={MessageCircle}>
        <WhatsAppGateSettings card={card} set={set} />
      </Group>

      <Group title="Social profiles" icon={Share2}>
        <SocialFields card={card} set={set} />
      </Group>

      <Group title="Theme & design" icon={Palette}>
        <DesignFields card={card} set={set} />
      </Group>

      <Group title="Info sections" icon={LayoutList}>
        <SectionsEditor sections={card.sections} onChange={(sections) => set({ sections })} />
      </Group>

      <Group title="Gallery" icon={ImageIcon}>
        <GalleryEditor gallery={card.gallery} onChange={(gallery) => set({ gallery })} />
      </Group>
    </div>
  );
}
