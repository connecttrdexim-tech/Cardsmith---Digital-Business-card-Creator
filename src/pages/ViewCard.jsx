import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IdCard, Download, Share2, QrCode, CreditCard, PlusCircle } from 'lucide-react';
import { decodeCardFromParam, buildShareUrl } from '../utils/share.js';
import { downloadVcf } from '../utils/vcf.js';
import { exportNodeAsPng } from '../utils/exportCard.js';
import { saveCard } from '../db/storage.js';
import CardPreview from '../components/CardPreview.jsx';
import QRCodeModal from '../components/QRCodeModal.jsx';
import ShareModal from '../components/ShareModal.jsx';

export default function ViewCard() {
  const { payload } = useParams();
  const [card, setCard] = useState(undefined); // undefined = loading, null = invalid
  const [showQr, setShowQr] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [savedCopy, setSavedCopy] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    setCard(decodeCardFromParam(payload));
  }, [payload]);

  if (card === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-ink-400">Loading…</div>;
  }

  if (card === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="font-display text-xl text-ink-800 mb-2">This card link looks broken</p>
        <p className="text-sm text-ink-400 mb-6">It may have been cut off when it was shared.</p>
        <Link to="/" className="text-sm font-medium px-4 py-2 rounded-lg bg-ink-900 text-white">Go to Cardsmith</Link>
      </div>
    );
  }

  const shareUrl = buildShareUrl(card);
  const cardName = card.companyName || card.ownerName || 'Business card';

  async function keepInMyCards() {
    const copy = { ...card, id: crypto.randomUUID(), updatedAt: Date.now() };
    await saveCard(copy);
    setSavedCopy(true);
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="border-b border-ink-100 bg-white/80 backdrop-blur">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-ink-900 text-brass-300 flex items-center justify-center">
              <CreditCard size={14} />
            </div>
            <span className="font-display text-sm font-semibold text-ink-900">Cardsmith</span>
          </Link>
          <button
            onClick={keepInMyCards}
            disabled={savedCopy}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 disabled:opacity-50"
          >
            <PlusCircle size={13} /> {savedCopy ? 'Saved to your cards' : 'Save a copy'}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8">
        <CardPreview ref={previewRef} card={card} />

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => downloadVcf(card)}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2.5 rounded-lg bg-ink-900 text-white hover:bg-ink-800"
          >
            <IdCard size={15} /> Add to contacts
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2.5 rounded-lg border border-ink-200 hover:bg-ink-50"
          >
            <Share2 size={15} /> Share
          </button>
          <button
            onClick={() => setShowQr(true)}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2.5 rounded-lg border border-ink-200 hover:bg-ink-50"
          >
            <QrCode size={15} /> QR code
          </button>
          <button
            onClick={() => exportNodeAsPng(previewRef.current, `${cardName}.png`)}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2.5 rounded-lg border border-ink-200 hover:bg-ink-50"
          >
            <Download size={15} /> Save image
          </button>
        </div>
      </main>

      {showQr && <QRCodeModal url={shareUrl} onClose={() => setShowQr(false)} />}
      {showShare && <ShareModal url={shareUrl} cardName={cardName} onClose={() => setShowShare(false)} />}
    </div>
  );
}
