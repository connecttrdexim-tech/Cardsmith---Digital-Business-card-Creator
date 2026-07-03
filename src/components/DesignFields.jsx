import ThemePicker from './ThemePicker.jsx';

export default function DesignFields({ card, set }) {
  return (
    <>
      <ThemePicker value={card.theme} onChange={(theme) => set({ theme })} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Accent color</label>
          <input type="color" value={card.accentColor} onChange={(e) => set({ accentColor: e.target.value })} className="w-full h-9 rounded-lg border border-ink-200" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Font</label>
          <select value={card.font} onChange={(e) => set({ font: e.target.value })} className="w-full h-9 rounded-lg border border-ink-200 px-2 text-sm">
            <option value="inter">Inter (clean sans)</option>
            <option value="fraunces">Fraunces (editorial serif)</option>
          </select>
        </div>
      </div>
    </>
  );
}
