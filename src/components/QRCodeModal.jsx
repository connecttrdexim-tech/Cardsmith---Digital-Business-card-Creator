import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { X, Download, Printer, MessageCircle, Globe, ShieldCheck } from 'lucide-react';
import {
  getEffectiveWhatsAppNumber,
  getEffectiveCampaignCode,
} from '../utils/whatsappGate.js';

export default function QRCodeModal({ url, card = {}, onClose }) {
  const wrapRef = useRef(null);

  const whatsappNumber = getEffectiveWhatsAppNumber(card);
  const campaignCode = getEffectiveCampaignCode(card);
  const hasWhatsApp = Boolean(whatsappNumber);

  // The QR encodes https://wa.me/<yourNumber>?text=Hi%20<campaign-code>
  const waQrUrl = hasWhatsApp
    ? `https://wa.me/${whatsappNumber}?text=Hi%20${encodeURIComponent(campaignCode)}`
    : '';

  const [mode, setMode] = useState(hasWhatsApp ? 'whatsapp' : 'card');

  const currentQrValue = mode === 'whatsapp' && waQrUrl ? waQrUrl : url;

  function downloadPng() {
    const svg = wrapRef.current.querySelector('svg');
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
    printWindow.document.write(`
      <html><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
        <h2 style="margin-bottom:8px;">${card.ownerName || card.companyName || 'Business Card'}</h2>
        <p style="margin-top:0;font-size:13px;color:#666;">
          ${mode === 'whatsapp' ? `Scan to connect on WhatsApp (Code: ${campaignCode})` : 'Scan to view digital business card'}
        </p>
        ${wrapRef.current.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-card max-w-sm w-full p-6 relative animate-scale-up">
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
          Choose which action the QR code triggers when scanned
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
              <span>WhatsApp Lead QR</span>
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
              <span>Card URL QR</span>
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
            <QRCode value={currentQrValue || 'https://cardsmith.app'} size={184} />
          </div>

          {/* Description banner */}
          <div className="w-full mt-3 p-2.5 rounded-xl bg-ink-50 border border-ink-100 text-center text-xs text-ink-600">
            {mode === 'whatsapp' ? (
              <div>
                <p className="font-semibold text-emerald-700 flex items-center justify-center gap-1">
                  <ShieldCheck size={13} /> Encodes WhatsApp Click-to-Chat
                </p>
                <p className="text-[11px] text-ink-400 mt-0.5 truncate font-mono">
                  https://wa.me/{whatsappNumber}?text=Hi%20{campaignCode}
                </p>
                <p className="text-[11px] text-ink-500 mt-1">
                  Scanning opens WhatsApp to send <strong>Hi {campaignCode}</strong>, capturing their number.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-ink-800">Encodes Card URL</p>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  Opens the card webpage (visitors complete the WhatsApp step before view).
                </p>
              </div>
            )}
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
