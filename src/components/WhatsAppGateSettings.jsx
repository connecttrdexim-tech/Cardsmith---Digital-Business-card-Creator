import { useState } from 'react';
import {
  MessageCircle,
  Users,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  HelpCircle,
  QrCode,
} from 'lucide-react';
import FormField from './FormField.jsx';
import LeadsModal from './LeadsModal.jsx';
import {
  getEffectiveWhatsAppNumber,
  getEffectiveCampaignCode,
  buildWhatsAppClickToChatUrl,
} from '../utils/whatsappGate.js';

export default function WhatsAppGateSettings({ card, set }) {
  const [showLeads, setShowLeads] = useState(false);

  const effectiveNumber = getEffectiveWhatsAppNumber(card);
  const effectiveCode = getEffectiveCampaignCode(card);
  const waTestUrl = effectiveNumber
    ? buildWhatsAppClickToChatUrl({ number: effectiveNumber, campaignCode: effectiveCode })
    : '';

  return (
    <div className="space-y-4">
      {/* Enable Toggle Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle size={17} fill="currentColor" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-ink-900">
                WhatsApp Click-to-Chat Lead Gate
              </p>
              <p className="text-xs text-ink-500">
                Require visitors to send a WhatsApp message before viewing your card
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={card.whatsappGateEnabled !== false}
              onChange={(e) => set({ whatsappGateEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {card.whatsappGateEnabled !== false && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FormField
                label="WhatsApp Number to Receive Messages"
                value={card.whatsappGateNumber || card.whatsapp || card.phone || ''}
                onChange={(v) => set({ whatsappGateNumber: v })}
                placeholder="+91 98765 43210"
              />
              <p className="text-[11px] text-ink-400 mt-1">
                Your WhatsApp number that receives incoming messages from visitors.
              </p>
            </div>

            <div>
              <FormField
                label="Campaign Code (Encodes in QR & Message)"
                value={card.campaignCode || ''}
                onChange={(v) => set({ campaignCode: v.toUpperCase() })}
                placeholder="e.g. CARD-VIP"
              />
              <p className="text-[11px] text-ink-400 mt-1">
                Auto-appended to message: <code className="font-mono text-emerald-700">Hi {effectiveCode}</code>
              </p>
            </div>
          </div>

          <FormField
            label="Opening Message Template"
            value={card.whatsappGateMessage || 'Hi {campaignCode}! I would like to view your digital business card.'}
            onChange={(v) => set({ whatsappGateMessage: v })}
            placeholder="Hi {campaignCode}..."
          />

          {/* Quick Actions Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100">
            <button
              type="button"
              onClick={() => setShowLeads(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ink-900 text-white text-xs font-medium hover:bg-ink-800 transition-colors shadow-sm"
            >
              <Users size={14} />
              <span>View Captured Leads & Cloud API Webhook</span>
            </button>

            {waTestUrl && (
              <a
                href={waTestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-medium transition-colors"
              >
                <ExternalLink size={13} />
                <span>Test WhatsApp Link</span>
              </a>
            )}
          </div>
        </div>
      )}

      {showLeads && <LeadsModal card={card} onClose={() => setShowLeads(false)} />}
    </div>
  );
}
