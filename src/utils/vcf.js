// Builds a vCard 3.0 file so contact details import cleanly into iOS,
// Android, and desktop address books.
function escapeVcf(str = '') {
  return String(str).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function buildVcf(card) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVcf(card.ownerName || card.companyName)}`,
    `N:${escapeVcf(card.ownerName)};;;;`,
  ];

  if (card.companyName) lines.push(`ORG:${escapeVcf(card.companyName)}`);
  if (card.designation) lines.push(`TITLE:${escapeVcf(card.designation)}`);
  if (card.phone) lines.push(`TEL;TYPE=WORK,VOICE:${escapeVcf(card.phone)}`);
  if (card.whatsapp) lines.push(`TEL;TYPE=CELL:${escapeVcf(card.whatsapp)}`);
  if (card.email) lines.push(`EMAIL;TYPE=WORK:${escapeVcf(card.email)}`);
  if (card.website) lines.push(`URL:${escapeVcf(card.website)}`);
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${escapeVcf(card.address)};;;;`);
  if (card.description) lines.push(`NOTE:${escapeVcf(card.description)}`);

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVcf(card) {
  const vcf = buildVcf(card);
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(card.ownerName || card.companyName || 'contact').replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
