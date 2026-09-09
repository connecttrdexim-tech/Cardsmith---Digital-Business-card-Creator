import { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Mail, Send, AlertTriangle } from 'lucide-react';
import { copyToClipboard, nativeShare, shareViaWhatsApp, shareViaTelegram, shareViaEmail, isLocalShareUrl } from '../utils/share.js';

export default function ShareModal({ url, cardName, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  async function handleCopy() {
    try {
      await copyToClipboard(url);
      setCopyError('');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyError('Copy was blocked. Select the link and copy it manually.');
    }
  }

  async function handleNativeShare() {
    const shared = await nativeShare({ title: cardName, text: `${cardName} — digital business card`, url });
    if (!shared) handleCopy();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-card max-w-sm w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-ink-400 hover:text-ink-700" aria-label="Close">
          <X size={18} />
        </button>
        <h3 className="font-display text-lg font-semibold mb-1">Share this card</h3>
        <p className="text-xs text-ink-400 mb-4">
          This short link opens the published version of your card. Anyone with the link can view it.
        </p>

        {isLocalShareUrl(url) && (
          <div className="flex items-start gap-2 text-xs bg-amber-50 text-amber-800 rounded-lg p-2.5 mb-4">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              This is a local development address. Set VITE_PUBLIC_APP_URL and deploy the Cardsmith server before sending it to another person.
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <input readOnly value={url} className="flex-1 min-w-0 text-xs bg-ink-50 border border-ink-100 rounded-lg px-2.5 py-2 truncate" />
          <button onClick={handleCopy} className="shrink-0 p-2 rounded-lg bg-ink-900 text-white hover:bg-ink-800" aria-label="Copy link">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        {copyError && <p role="alert" className="text-xs text-red-600 -mt-2 mb-3">{copyError}</p>}

        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleNativeShare} className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-ink-200 hover:bg-ink-50">
            <Share2 size={14} /> Share
          </button>
          <button onClick={() => shareViaWhatsApp(url)} className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-ink-200 hover:bg-ink-50">
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button onClick={() => shareViaEmail(url, cardName)} className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-ink-200 hover:bg-ink-50">
            <Mail size={14} /> Email
          </button>
          <button onClick={() => shareViaTelegram(url)} className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-ink-200 hover:bg-ink-50">
            <Send size={14} /> Telegram
          </button>
        </div>
      </div>
    </div>
  );
}
