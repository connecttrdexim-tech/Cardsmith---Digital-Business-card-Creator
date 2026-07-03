import { PartyPopper, Pencil, Download } from 'lucide-react';
import CardPreview from '../CardPreview.jsx';
import { downloadJson } from '../../utils/jsonIO.js';

export default function FinishStep({ card, onBack, onFinish }) {
  return (
    <div className="max-w-lg mx-auto w-full text-center">
      <div className="w-12 h-12 rounded-xl bg-brass-100 text-brass-600 flex items-center justify-center mx-auto mb-5">
        <PartyPopper size={22} />
      </div>
      <h2 className="font-display text-2xl font-semibold text-ink-900 mb-1">Your card is ready</h2>
      <p className="text-sm text-ink-400 mb-6">Here's how it looks. You can fine-tune anything in the full editor next.</p>

      <div className="mb-6">
        <CardPreview card={card} />
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        <button
          onClick={onFinish}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-ink-900 text-white hover:bg-ink-800"
        >
          <Pencil size={15} /> Open in full editor
        </button>
        <button
          onClick={() => downloadJson(card)}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg border border-ink-200 hover:bg-ink-50"
        >
          <Download size={15} /> Download JSON backup
        </button>
        <button onClick={onBack} className="text-xs text-ink-400 hover:text-ink-600 mt-1">
          ← Back to gallery step
        </button>
      </div>
    </div>
  );
}
