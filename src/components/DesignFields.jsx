import ThemePicker from './ThemePicker.jsx';
import { THEMES } from '../data/themePresets.js';

const ACCENTS = ['#c9a15c', '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#059669', '#111827'];
const LAYOUTS = [
  { value: 'classic', label: 'Classic', preview: 'items-start' },
  { value: 'centered', label: 'Centered', preview: 'items-center' },
  { value: 'banner', label: 'Banner', preview: 'items-start bg-ink-100' },
  { value: 'split', label: 'Split', preview: 'items-end' },
];

export default function DesignFields({ card, set }) {
  return (
    <>
      <ThemePicker value={card.theme} onChange={(theme) => set({ theme, accentColor: THEMES[theme].accent, primaryColor: THEMES[theme].primary })} />

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">Card layout</label>
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
          {LAYOUTS.map((layout) => (
            <button key={layout.value} type="button" onClick={() => set({ layout: layout.value })}
              className={`rounded-xl border p-2 text-xs font-medium ${card.layout === layout.value ? 'border-brass-400 ring-1 ring-brass-300' : 'border-ink-100'}`}>
              <span className={`h-10 rounded-md bg-ink-50 mb-1.5 flex flex-col justify-center gap-1 px-2 ${layout.preview}`}>
                <span className="block w-4 h-4 rounded-full bg-brass-300" />
                <span className="block w-7 h-1 rounded bg-ink-300" />
              </span>
              {layout.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">Accent color</label>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENTS.map((color) => (
            <button key={color} type="button" onClick={() => set({ accentColor: color })} aria-label={`Use accent ${color}`}
              className={`w-8 h-8 rounded-full border-2 ${(card.accentColor || '').toLowerCase() === color ? 'border-ink-900 ring-2 ring-ink-200' : 'border-white'}`}
              style={{ backgroundColor: color }} />
          ))}
          <label className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-dashed border-ink-300" title="Custom color">
            <input aria-label="Custom accent color" type="color" value={card.accentColor} onChange={(e) => set({ accentColor: e.target.value })} className="absolute inset-[-8px] w-12 h-12 cursor-pointer" />
          </label>
          <span className="text-xs text-ink-400">Custom</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5">Button shape</label>
        <select value={card.buttonStyle || 'pill'} onChange={(e) => set({ buttonStyle: e.target.value })} className="w-full h-9 rounded-lg border border-ink-200 px-2 text-sm">
          <option value="pill">Pill</option><option value="rounded">Rounded</option><option value="square">Square</option>
        </select>
      </div>
    </>
  );
}
