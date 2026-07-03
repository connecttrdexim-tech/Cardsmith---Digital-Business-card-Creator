import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

async function renderToCanvas(node) {
  return html2canvas(node, {
    scale: 3,
    useCORS: true,
    backgroundColor: null,
  });
}

export async function exportNodeAsPng(node, filename = 'business-card.png') {
  const canvas = await renderToCanvas(node);
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportNodeAsPdf(node, filename = 'business-card.pdf') {
  const canvas = await renderToCanvas(node);
  const imgData = canvas.toDataURL('image/png');

  const widthPx = canvas.width;
  const heightPx = canvas.height;
  // Convert px (at 96dpi assumption) to mm for a tightly-fit PDF page.
  const widthMm = (widthPx * 25.4) / (96 * 3);
  const heightMm = (heightPx * 25.4) / (96 * 3);

  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
  pdf.save(filename);
}

export function printNode(node) {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head><title>Print Card</title></head>
      <body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;">
        ${node.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 400);
}
