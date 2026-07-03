import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function SectionItems({ type, items, accent }) {
  if (!items?.length) return null;

  if (type === 'faqs') {
    return (
      <div className="space-y-2">
        {items.map((it) => (
          <details key={it.id} className="group rounded-lg bg-black/5 px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium list-none flex justify-between items-center">
              {it.question}
              <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
            </summary>
            <p className="text-sm opacity-70 mt-1.5">{it.answer}</p>
          </details>
        ))}
      </div>
    );
  }

  if (type === 'testimonials') {
    return (
      <div className="space-y-3">
        {items.map((it) => (
          <blockquote key={it.id} className="text-sm italic opacity-80 border-l-2 pl-3" style={{ borderColor: accent }}>
            "{it.quote}"
            <footer className="not-italic text-xs mt-1 opacity-60">— {it.author}</footer>
          </blockquote>
        ))}
      </div>
    );
  }

  if (type === 'team') {
    return (
      <div className="grid grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.id} className="text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-black/10 overflow-hidden mb-1.5">
              {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
            </div>
            <p className="text-xs font-medium">{it.name}</p>
            <p className="text-[11px] opacity-60">{it.role}</p>
          </div>
        ))}
      </div>
    );
  }

  // products / services / initiatives / projects / certifications / portfolio / brochures
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-lg overflow-hidden bg-black/5">
          {it.image && <img src={it.image} alt={it.name} className="w-full aspect-video object-cover" />}
          <div className="p-2">
            <p className="text-xs font-medium">{it.name}</p>
            {it.description && <p className="text-[11px] opacity-60 mt-0.5">{it.description}</p>}
            {it.link && (
              <a href={it.link} target="_blank" rel="noreferrer" className="text-[11px] underline" style={{ color: accent }}>
                View
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DynamicSections({ sections = [], accent = '#c9a15c', textClass = 'text-ink-800' }) {
  const [openId, setOpenId] = useState(sections[0]?.id);

  if (!sections.length) return null;

  return (
    <div className={`space-y-2 ${textClass}`}>
      {sections.map((s) => {
        const isOpen = openId === s.id;
        return (
          <div key={s.id} className="rounded-xl border border-black/5 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : s.id)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold"
            >
              {s.title}
              <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: accent }} />
            </button>
            {isOpen && (
              <div className="px-3.5 pb-3.5 space-y-3">
                {s.body && <p className="text-sm opacity-75 whitespace-pre-line">{s.body}</p>}
                <SectionItems type={s.type} items={s.items} accent={accent} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
