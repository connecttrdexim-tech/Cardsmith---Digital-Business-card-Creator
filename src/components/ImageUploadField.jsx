import { useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { readImageAsDataUrl } from '../utils/jsonIO.js';

export default function ImageUploadField({ label, value, onChange, shape = 'square', hint }) {
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readImageAsDataUrl(file);
    onChange(dataUrl);
    e.target.value = '';
  }

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <div
          className={`w-16 h-16 ${shapeClass} bg-ink-50 border border-ink-100 flex items-center justify-center overflow-hidden shrink-0`}
        >
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={20} className="text-ink-300" />
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 transition-colors"
          >
            <Upload size={14} /> Upload
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <X size={14} /> Remove
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
}
