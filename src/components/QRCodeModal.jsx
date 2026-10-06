import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { X, Download, Printer, MessageCircle, Globe, ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';
import {
  getEffectiveWhatsAppNumber,
  getEffectiveCampaignCode,
  buildWhatsAppClickToChatUrl,
} from '../utils/whatsappGate.js';
import { buildShareUrl, copyToClipboard } from '../utils/share.js';

class QRErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('QR Code generation failed, falling back to URL:', err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center text-xs text-ink-600 w-[184px] h-[184px]">
          <Globe size={24} className="text-brass-500 mb-2" />
          <p className="font-semibold text-ink-800">Card Link Ready</p>
          <p className="text-[11px] text-ink-400 mt-1">Use the copy button below to share the link.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function QRCodeModal({ url, card = {}, onClose }) {
  const wrapRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // If url is not provided or still publishing, build the client-side share url as fallback
  const resolvedCardUrl = url || (card ? buildShareUrl(card) : (typeof window !== 'undefined' ? window.location.href : ''));

  const whatsappNumber = getEffectiveWhatsAppNumber(card);
  const campaignCode = getEffectiveCampaignCode(card);
  const hasWhatsApp = Boolean(whatsappNumber);

  // The QR encodes WhatsApp click-to-chat with pre-filled message + digital profile link
  const waQrUrl = hasWhatsApp
    ? buildWhatsAppClickToChatUrl({
        number: whatsappNumber,
        campaignCode,
        cardUrl: resolvedCardUrl,
        card,
      })
    : '';

  const [mode, setMode] = useState(hasWhatsApp ? 'whatsapp' : 'card');
  const currentQrValue = (mode === 'whatsapp' && waQrUrl ? waQrUrl : resolvedCardUrl) || 'https://cardsmith.app';

  async function handleCopy() {
    try {
      await copyToClipboard(currentQrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function downloadPng() {
    const svg = wrapRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const scale = 8;
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(svgUrl);

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = mode === 'whatsapp' ? `whatsapp-lead-qr-${campaignCode}.png` : 'business-card-qr.png';
      a.click();
    };
    img.src = svgUrl;
  }

  function printQr() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
        <h2 style="margin-bottom:8px;">${card.ownerName || card.companyName || 'Business Card'}</h2>
        <p style="margin-top:0;font-size:13px;color:#666;">
          ${mode === 'whatsapp' ? `Scan to exchange contacts on WhatsApp & view profile` : 'Scan to view digital business card'}
        </p>
        ${wrapRef.current ? wrapRef.current.innerHTML : ''}
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-card max-w-sm w-full p-5 sm:p-6 relative animate-scale-up my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-400 hover:text-ink-700 p-1 rounded-lg hover:bg-ink-50 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h3 className="font-display text-lg font-semibold text-ink-900 text-center mb-1">
          Share via QR Code
        </h3>
        <p className="text-xs text-ink-400 text-center mb-4">
          Choose how visitors interact when scanning your QR code
        </p>

        {/* Mode selector if WhatsApp is configured */}
        {hasWhatsApp && (
          <div className="flex p-1 bg-ink-50 rounded-xl mb-4 border border-ink-100">
            <button
              type="button"
              onClick={() => setMode('whatsapp')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <MessageCircle size={14} fill={mode === 'whatsapp' ? 'currentColor' : 'none'} />
              <span>2-Step WhatsApp QR</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('card')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'card'
                  ? 'bg-ink-900 text-white shadow-sm'
                  : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <Globe size={14} />
              <span>Direct URL QR</span>
            </button>
          </div>
        )}

        {/* QR Code Container */}
        <div className="flex flex-col items-center">
          <div
            ref={wrapRef}
            className={`p-4 rounded-2xl border-2 flex items-center justify-center transition-colors bg-white ${
              mode === 'whatsapp' ? 'border-emerald-500/40 bg-emerald-50/20' : 'border-ink-100'
            }`}
          >
            <QRErrorBoundary>
              <QRCode value={currentQrValue} size={180} />
            </QRErrorBoundary>
          </div>

          {/* Description banner */}
          <div className="w-full mt-3 p-3 rounded-xl bg-ink-50 border border-ink-100 text-left text-xs text-ink-600">
            {mode === 'whatsapp' ? (
              <div className="space-y-1.5">
                <p className="font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck size={14} /> 2-Step WhatsApp Contact Exchange
                </p>
                <ol className="text-[11px] text-ink-600 list-decimal list-inside space-y-1">
                  <li>
                    Scanning redirects to WhatsApp to send <strong>"Hi"</strong> + your profile link.
                  </li>
                  <li>
                    You receive their phone number; they tap the link in chat to view your card.
                  </li>
                </ol>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-ink-800 flex items-center gap-1">
                  <Globe size={13} /> Direct Card URL
                </p>
                <p className="text-[11px] text-ink-500 mt-0.5">
                  Scanning opens your card directly in their web browser.
                </p>
              </div>
            )}
          </div>

          {/* Direct URL view & copy */}
          <div className="flex items-center gap-2 mt-3 w-full">
            <input
              readOnly
              value={currentQrValue}
              className="flex-1 min-w-0 text-[11px] bg-ink-50 border border-ink-100 rounded-xl px-2.5 py-2 font-mono text-ink-700 truncate select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 px-3 py-2 rounded-xl bg-ink-900 text-white hover:bg-ink-800 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={downloadPng}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2.5 rounded-xl bg-ink-900 text-white hover:bg-ink-800 transition-colors shadow-sm"
          >
            <Download size={14} /> PNG
          </button>
          <button
            onClick={printQr}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2.5 rounded-xl border border-ink-200 hover:bg-ink-50 transition-colors text-ink-800"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
