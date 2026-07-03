import { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Mail, Send, AlertTriangle } from 'lucide-react';
import { copyToClipboard, nativeShare, shareViaWhatsApp, shareViaTelegram, shareViaEmail, estimateLinkWeight } from '../utils/share.js';

export default function ShareModal({ url, cardName, onClose }) {
  const [copied, setCopied] = useState(false);
  const weight = estimateLinkWeight(url);

  async function handleCopy() {
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
          The card's data lives inside this link itself — there's no server, so anyone with the link can view it.
        </p>

        {weight.level !== 'ok' && (
          <div className="flex items-start gap-2 text-xs bg-amber-50 text-amber-800 rounded-lg p-2.5 mb-4">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              This link is quite long ({weight.length.toLocaleString()} characters), usually because of large photos.
              Some apps may clip very long links — consider smaller images if sharing fails.
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <input readOnly value={url} className="flex-1 min-w-0 text-xs bg-ink-50 border border-ink-100 rounded-lg px-2.5 py-2 truncate" />
          <button onClick={handleCopy} className="shrink-0 p-2 rounded-lg bg-ink-900 text-white hover:bg-ink-800" aria-label="Copy link">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

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
