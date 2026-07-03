import { THEME_LIST } from '../data/themePresets.js';
import { Check } from 'lucide-react';

export default function ThemePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {THEME_LIST.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`relative rounded-xl p-3 text-left border transition-all ${
              active ? 'border-brass-400 ring-1 ring-brass-300' : 'border-ink-100 hover:border-ink-200'
            }`}
          >
            <div className={`h-8 rounded-lg mb-2 ${t.surface}`} style={{ border: '1px solid rgba(0,0,0,0.06)' }} />
            <span className="text-xs font-medium">{t.label}</span>
            {active && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brass-400 text-white flex items-center justify-center">
                <Check size={10} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
