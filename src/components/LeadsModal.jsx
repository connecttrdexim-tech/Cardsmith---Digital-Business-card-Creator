import { useState, useEffect } from 'react';
import {
  X,
  Users,
  Download,
  MessageCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  Phone,
} from 'lucide-react';
import { fetchCardLeads, formatPhoneDisplay } from '../utils/whatsappGate.js';
import { copyToClipboard } from '../utils/share.js';

export default function LeadsModal({ card, onClose }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'webhook'
  const [copiedField, setCopiedField] = useState('');
  const [simPhone, setSimPhone] = useState('+91 98765 43210');
  const [simName, setSimName] = useState('Demo Visitor');
  const [simulating, setSimulating] = useState(false);

  const campaignCode = card.campaignCode || 'CARD-DEMO';
  const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;
  const verifyToken = 'cardsmith_verify_token';

  async function loadLeads() {
    setLoading(true);
    const results = await fetchCardLeads({
      cardSlug: card.slug || card.id,
      campaignCode,
    });
    setLeads(results);
    setLoading(false);
  }

  useEffect(() => {
    loadLeads();
  }, [card]);

  function exportCsv() {
    if (leads.length === 0) return;
    const headers = ['Phone Number', 'Visitor Name', 'Campaign Code', 'Date', 'Time', 'Message'];
    const rows = leads.map((l) => [
      `"${l.phone}"`,
      `"${l.name || ''}"`,
      `"${l.campaignCode || ''}"`,
      `"${new Date(l.timestamp).toLocaleDateString()}"`,
      `"${new Date(l.timestamp).toLocaleTimeString()}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whatsapp-leads-${campaignCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleCopy(text, field) {
    await copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 1500);
  }

  async function handleSimulateWebhook() {
    setSimulating(true);
    try {
      await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'demo_account',
              changes: [
                {
                  value: {
                    messaging_product: 'whatsapp',
                    contacts: [{ profile: { name: simName }, wa_id: simPhone.replace(/[^0-9]/g, '') }],
                    messages: [
                      {
                        from: simPhone.replace(/[^0-9]/g, ''),
                        id: `wamid_sim_${Date.now()}`,
                        timestamp: String(Math.floor(Date.now() / 1000)),
                        text: { body: `Hi ${campaignCode}` },
                        type: 'text',
                      },
                    ],
                  },
                  field: 'messages',
                },
              ],
            },
          ],
        }),
      });
      await loadLeads();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-card max-w-2xl w-full p-6 sm:p-7 relative max-h-[90vh] flex flex-col animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-400 hover:text-ink-700 p-1.5 rounded-lg hover:bg-ink-50 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
            <MessageCircle size={20} fill="currentColor" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900">
              WhatsApp Lead Capture
            </h3>
            <p className="text-xs text-ink-400">
              Captured phone numbers from visitors accessing this card
            </p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-ink-100 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold px-3 transition-colors border-b-2 -mb-px ${
              activeTab === 'leads'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            <Users size={14} />
            <span>Captured Leads ({leads.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold px-3 transition-colors border-b-2 -mb-px ${
              activeTab === 'webhook'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Cloud API Webhook Setup</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'leads' ? (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-ink-500 font-medium">
                Campaign: <strong className="font-mono text-ink-800">{campaignCode}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadLeads}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 text-ink-600"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={leads.length === 0}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-40"
                >
                  <Download size={12} /> Export CSV
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-ink-400 flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-emerald-500" />
                <span>Loading captured leads…</span>
              </div>
            ) : leads.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-ink-200 p-6">
                <Smartphone size={32} className="mx-auto text-ink-300 mb-2" />
                <p className="font-medium text-ink-800 text-sm">No leads captured yet</p>
                <p className="text-xs text-ink-400 mt-1 max-w-sm mx-auto">
                  When someone scans your QR code or opens your card link and taps Send on WhatsApp, their phone number will arrive right here!
                </p>

                {/* Local Simulation Form for testing */}
                <div className="mt-5 pt-4 border-t border-ink-100 max-w-sm mx-auto text-left">
                  <p className="text-xs font-semibold text-ink-700 mb-2 flex items-center gap-1">
                    <Sparkles size={13} className="text-emerald-500" /> Test Lead Capture Webhook:
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-ink-200 bg-white"
                    />
                    <input
                      type="text"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      placeholder="Name"
                      className="w-28 text-xs px-2.5 py-1.5 rounded-lg border border-ink-200 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateWebhook}
                    disabled={simulating}
                    className="w-full text-xs font-medium py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    {simulating ? 'Simulating message…' : 'Simulate Incoming WhatsApp Message'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100 overflow-hidden bg-white shadow-soft">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-ink-50/60 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-ink-900 font-mono">
                          {formatPhoneDisplay(lead.phone) || lead.phone}
                        </span>
                        {lead.name && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-ink-100 text-ink-600 truncate max-w-[120px]">
                            {lead.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
                        <Clock size={11} />
                        <span>{new Date(lead.timestamp).toLocaleString()}</span>
                        {lead.message && (
                          <span className="truncate max-w-[180px] text-ink-500 font-mono">
                            · "{lead.message}"
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {lead.phone && lead.phone.replace(/[^0-9]/g, '') && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium"
                          title="Chat with lead on WhatsApp"
                        >
                          <MessageCircle size={13} fill="currentColor" /> Chat
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* WhatsApp Business Cloud API Configuration Tab */
          <div className="flex-1 overflow-y-auto space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
              <p className="font-semibold flex items-center gap-1.5 text-sm mb-1 text-emerald-950">
                <ShieldCheck size={16} /> Meta WhatsApp Business Cloud API
              </p>
              Configure this webhook URL inside your Meta Developer Dashboard to automatically receive incoming WhatsApp click-to-chat messages and capture visitor phone numbers in real time.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Callback URL (Webhook Endpoint):
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={webhookUrl}
                    className="flex-1 text-xs font-mono px-3 py-2 rounded-xl bg-ink-50 border border-ink-200 text-ink-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(webhookUrl, 'url')}
                    className="px-3 py-2 rounded-xl border border-ink-200 hover:bg-ink-50 text-ink-700"
                  >
                    {copiedField === 'url' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Verify Token:
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={verifyToken}
                    className="flex-1 text-xs font-mono px-3 py-2 rounded-xl bg-ink-50 border border-ink-200 text-ink-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(verifyToken, 'token')}
                    className="px-3 py-2 rounded-xl border border-ink-200 hover:bg-ink-50 text-ink-700"
                  >
                    {copiedField === 'token' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-ink-100 pt-3">
              <h4 className="font-semibold text-xs text-ink-900 mb-2">How it works:</h4>
              <ol className="text-xs text-ink-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Visitor opens your card link or scans your WhatsApp QR code.</li>
                <li>They tap <strong>"Send"</strong> in WhatsApp (prefilled with <code className="bg-ink-100 px-1 py-0.5 rounded font-mono">Hi {campaignCode}</code>).</li>
                <li>Meta's WhatsApp Cloud API delivers the message to this webhook via <code className="bg-ink-100 px-1 py-0.5 rounded font-mono">messages[].from</code>.</li>
                <li>The visitor's phone number is saved to your lead list, and the digital card unlocks automatically for them!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
