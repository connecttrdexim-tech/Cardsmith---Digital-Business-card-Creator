import { useRef } from 'react';
import { PenLine, Upload, CreditCard } from 'lucide-react';
import { readJsonFile } from '../../utils/jsonIO.js';

export default function StartStep({ onStartFresh, onImported }) {
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      onImported(data);
    } catch {
      alert('That file could not be read as a valid card JSON export.');
    }
    e.target.value = '';
  }

  return (
    <div className="max-w-lg mx-auto w-full text-center">
      <div className="w-12 h-12 rounded-xl bg-ink-900 text-brass-300 flex items-center justify-center mx-auto mb-5">
        <CreditCard size={22} />
      </div>
      <h2 className="font-display text-2xl font-semibold text-ink-900 mb-2">Let's build your card</h2>
      <p className="text-sm text-ink-400 mb-8">
        Answer a few quick questions, step by step — you can skip anything you don't need right now.
        Already have a card saved as a JSON file?
      </p>

      <div className="grid gap-3">
        <button
          onClick={onStartFresh}
          className="flex items-center gap-3 text-left px-5 py-4 rounded-2xl border border-ink-200 hover:border-brass-300 hover:bg-brass-50/40 transition-colors"
        >
          <span className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center shrink-0">
            <PenLine size={17} className="text-ink-700" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink-800">Start fresh</span>
            <span className="block text-xs text-ink-400">Fill in your details step by step</span>
          </span>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 text-left px-5 py-4 rounded-2xl border border-ink-200 hover:border-brass-300 hover:bg-brass-50/40 transition-colors"
        >
          <span className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center shrink-0">
            <Upload size={17} className="text-ink-700" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink-800">Upload a JSON file</span>
            <span className="block text-xs text-ink-400">Restore a card you exported earlier</span>
          </span>
        </button>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}
