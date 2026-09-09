import { useState } from 'react';
import { PartyPopper, Pencil, Download, QrCode, Share2 } from 'lucide-react';
import CardPreview from '../CardPreview.jsx';
import QRCodeModal from '../QRCodeModal.jsx';
import ShareModal from '../ShareModal.jsx';
import { downloadJson } from '../../utils/jsonIO.js';
import { publishCard } from '../../utils/share.js';

export default function FinishStep({ card, onBack, onFinish }) {
  const [showQr, setShowQr] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const cardName = card.companyName || card.ownerName || 'Business card';

  async function openShare(kind) {
    if (publishing) return;
    setPublishing(true);
    setPublishError('');
    try {
      const url = await publishCard(card);
      setShareUrl(url);
      if (kind === 'qr') setShowQr(true);
      else setShowShare(true);
    } catch (error) {
      setPublishError(error.message || 'Could not publish this card.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <div className="max-w-lg mx-auto w-full text-center">
        <div className="w-12 h-12 rounded-xl bg-brass-100 text-brass-600 flex items-center justify-center mx-auto mb-5">
          <PartyPopper size={22} />
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink-900 mb-1">Your card is ready</h2>
        <p className="text-sm text-ink-400 mb-6">Share it now, or fine-tune anything in the full editor.</p>

        <div className="mb-6">
          <CardPreview card={card} />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            disabled={publishing}
            onClick={() => openShare('qr')}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-50"
          >
            <QrCode size={15} /> QR code
          </button>
          <button
            disabled={publishing}
            onClick={() => openShare('share')}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-50"
          >
            <Share2 size={15} /> {publishing ? 'Publishing…' : 'Share link'}
          </button>
          <button
            onClick={onFinish}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg border border-ink-200 hover:bg-ink-50"
          >
            <Pencil size={15} /> Open in full editor
          </button>
          <button
            onClick={() => downloadJson(card)}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg border border-ink-200 hover:bg-ink-50"
          >
            <Download size={15} /> Download JSON backup
          </button>
          {publishError && <p role="alert" className="col-span-2 text-sm text-red-700">{publishError}</p>}
          <button onClick={onBack} className="col-span-2 text-xs text-ink-400 hover:text-ink-600 mt-1">
            ← Back to gallery step
          </button>
        </div>
      </div>

      {showQr && <QRCodeModal url={shareUrl} onClose={() => setShowQr(false)} />}
      {showShare && <ShareModal url={shareUrl} cardName={cardName} onClose={() => setShowShare(false)} />}
    </>
  );
}
