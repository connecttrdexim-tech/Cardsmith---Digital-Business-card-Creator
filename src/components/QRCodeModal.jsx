import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { X, Download, Printer } from 'lucide-react';

export default function QRCodeModal({ url, onClose }) {
  const wrapRef = useRef(null);

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
      a.download = 'business-card-qr.png';
      a.click();
    };
    img.src = svgUrl;
  }

  function printQr() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-card max-w-xs w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-ink-400 hover:text-ink-700" aria-label="Close">
          <X size={18} />
        </button>
        <h3 className="font-display text-lg font-semibold mb-4 text-center">Scan to open card</h3>
        <div ref={wrapRef} className="bg-white p-4 rounded-xl border border-ink-100 flex items-center justify-center">
          <QRCode value={url} size={192} />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={downloadPng}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-ink-900 text-white hover:bg-ink-800"
          >
            <Download size={14} /> PNG
          </button>
          <button
            onClick={printQr}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-ink-200 hover:bg-ink-50"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
