import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  QrCode,
  Share2,
  Download,
  FileText,
  Printer,
  IdCard,
  FileJson,
  Check,
  Eye,
  PenLine,
} from 'lucide-react';
import { getCard, saveCard } from '../db/storage.js';
import { createEmptyCard } from '../data/cardModel.js';
import CardForm from '../components/CardForm.jsx';
import CardPreview from '../components/CardPreview.jsx';
import QRCodeModal from '../components/QRCodeModal.jsx';
import ShareModal from '../components/ShareModal.jsx';
import { buildShareUrl } from '../utils/share.js';
import { downloadVcf } from '../utils/vcf.js';
import { downloadJson } from '../utils/jsonIO.js';
import { exportNodeAsPng, exportNodeAsPdf, printNode } from '../utils/exportCard.js';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [saved, setSaved] = useState(true);
  const [mobileTab, setMobileTab] = useState('edit');
  const [showQr, setShowQr] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const previewRef = useRef(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const existing = await getCard(id);
      setCard(existing || { ...createEmptyCard(), id });
    })();
  }, [id]);

  const handleChange = useCallback((next) => {
    setCard(next);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveCard(next);
      setSaved(true);
    }, 600);
  }, []);

  async function saveNow() {
    clearTimeout(saveTimer.current);
    await saveCard(card);
    setSaved(true);
  }

  if (!card) {
    return <div className="min-h-screen flex items-center justify-center text-ink-400">Loading…</div>;
  }

  const shareUrl = buildShareUrl(card);
  const cardName = card.companyName || card.ownerName || 'Business card';

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink-100 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-ink-50 shrink-0" aria-label="Back">
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="font-display font-semibold text-ink-900 truncate">{cardName}</p>
              <p className="text-[11px] text-ink-400 flex items-center gap-1">
                {saved ? <><Check size={11} /> Saved</> : 'Saving…'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button onClick={saveNow} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50">
              <Save size={14} /> Save
            </button>
            <button onClick={() => setShowQr(true)} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50">
              <QrCode size={14} /> QR
            </button>
            <button onClick={() => setShowShare(true)} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-ink-900 text-white hover:bg-ink-800">
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>

        {/* mobile edit/preview toggle */}
        <div className="sm:hidden flex border-t border-ink-100">
          <button
            onClick={() => setMobileTab('edit')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium ${mobileTab === 'edit' ? 'text-ink-900 border-b-2 border-brass-400' : 'text-ink-400'}`}
          >
            <PenLine size={14} /> Edit
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium ${mobileTab === 'preview' ? 'text-ink-900 border-b-2 border-brass-400' : 'text-ink-400'}`}
          >
            <Eye size={14} /> Preview
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-0 sm:gap-8 px-4 sm:px-6 py-6">
        {/* Form */}
        <div className={`${mobileTab === 'edit' ? 'block' : 'hidden'} sm:block bg-white rounded-2xl border border-ink-100 px-5 sm:px-6 sm:sticky sm:top-[calc(4.5rem+1px)] sm:max-h-[calc(100vh-6rem)] sm:overflow-y-auto scrollbar-thin`}>
          <CardForm card={card} onChange={handleChange} />
        </div>

        {/* Preview */}
        <div className={`${mobileTab === 'preview' ? 'block' : 'hidden'} sm:block`}>
          <div className="sm:sticky sm:top-[calc(4.5rem+1px)] py-6 sm:py-2">
            <CardPreview ref={previewRef} card={card} />

            <div className="max-w-sm mx-auto mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadVcf(card)}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-ink-200 hover:bg-ink-50"
              >
                <IdCard size={14} /> Save contact
              </button>
              <button
                onClick={() => exportNodeAsPng(previewRef.current, `${cardName}.png`)}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-ink-200 hover:bg-ink-50"
              >
                <Download size={14} /> PNG
              </button>
              <button
                onClick={() => exportNodeAsPdf(previewRef.current, `${cardName}.pdf`)}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-ink-200 hover:bg-ink-50"
              >
                <FileText size={14} /> PDF
              </button>
              <button
                onClick={() => printNode(previewRef.current)}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-ink-200 hover:bg-ink-50"
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={() => downloadJson(card)}
                className="col-span-2 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-dashed border-ink-300 text-ink-500 hover:bg-ink-50"
              >
                <FileJson size={14} /> Export card data (JSON backup)
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQr && <QRCodeModal url={shareUrl} onClose={() => setShowQr(false)} />}
      {showShare && <ShareModal url={shareUrl} cardName={cardName} onClose={() => setShowShare(false)} />}
    </div>
  );
}
