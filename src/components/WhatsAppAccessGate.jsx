import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import {
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  ChevronRight,
  ExternalLink,
  Lock,
  Building2,
  RefreshCw,
} from 'lucide-react';
import {
  getEffectiveWhatsAppNumber,
  getEffectiveCampaignCode,
  buildWhatsAppClickToChatUrl,
  checkWhatsAppStatus,
  confirmWhatsAppVisitor,
  formatPhoneDisplay,
} from '../utils/whatsappGate.js';

export default function WhatsAppAccessGate({ card, cardSlug = '', onUnlock }) {
  const whatsappNumber = getEffectiveWhatsAppNumber(card);
  const campaignCode = getEffectiveCampaignCode(card);

  // Generate a random session token so desktop + mobile can uniquely pair
  const [sessionToken] = useState(() => `req_${Math.random().toString(36).slice(2, 9)}`);
  const [hasClickedChat, setHasClickedChat] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [showPhoneFallback, setShowPhoneFallback] = useState(false);
  const [submittingFallback, setSubmittingFallback] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const waChatUrl = buildWhatsAppClickToChatUrl({
    number: whatsappNumber,
    campaignCode,
    sessionToken,
  });

  const cardName = card.companyName || card.ownerName || 'Business Card';
  const owner = card.ownerName || card.companyName || 'Card Owner';

  // Poll for webhook unlock notification
  useEffect(() => {
    let active = true;
    let timer;

    async function poll() {
      if (!active || isUnlocked) return;
      try {
        const result = await checkWhatsAppStatus({ sessionToken, campaignCode });
        if (result?.unlocked && active) {
          setIsUnlocked(true);
          setStatusMessage('Verified! Revealing card…');
          setTimeout(() => {
            if (active) onUnlock();
          }, 1200);
          return;
        }
      } catch {
        // Keep polling silently
      }
      if (active && (hasClickedChat || true)) {
        timer = setTimeout(poll, 2500);
      }
    }

    timer = setTimeout(poll, 2000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [sessionToken, campaignCode, hasClickedChat, isUnlocked, onUnlock]);

  async function handleOpenWhatsApp() {
    setHasClickedChat(true);
    setIsChecking(true);
    setStatusMessage('Waiting for WhatsApp message…');
    window.open(waChatUrl, '_blank', 'noopener,noreferrer');
  }

  async function handleDirectContinue() {
    setIsChecking(true);
    setStatusMessage('Unlocking card…');
    await confirmWhatsAppVisitor({
      sessionToken,
      campaignCode,
      phone: visitorPhone || 'Visitor via WhatsApp Gate',
      name: visitorName || '',
      cardSlug,
    });
    setIsUnlocked(true);
    setTimeout(() => {
      onUnlock();
    }, 800);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-brass-400/10 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Card Teaser Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/50 text-center relative overflow-hidden">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium mb-5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>WhatsApp Contact Exchange</span>
          </div>

          {/* Profile / Avatar Preview */}
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brass-500 to-brass-300 p-0.5 shadow-lg shadow-black/30">
              <div className="w-full h-full rounded-2xl bg-ink-900 flex items-center justify-center overflow-hidden">
                {card.profilePicture ? (
                  <img src={card.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : card.logo ? (
                  <img src={card.logo} alt="" className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="font-display text-2xl font-bold text-brass-300">
                    {(card.ownerName || card.companyName || 'C').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {/* WhatsApp mini badge */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md border-2 border-ink-900">
              <MessageCircle size={15} fill="currentColor" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            {card.ownerName || card.companyName}
          </h1>
          {card.designation && (
            <p className="text-sm text-ink-200 mt-0.5">{card.designation}</p>
          )}
          {card.companyName && card.ownerName && (
            <p className="text-xs text-brass-300/90 font-medium flex items-center justify-center gap-1 mt-1">
              <Building2 size={12} /> {card.companyName}
            </p>
          )}

          {/* Instructions Box */}
          <div className="mt-5 p-4 rounded-2xl bg-ink-900/60 border border-white/10 text-left">
            <p className="text-xs font-semibold text-white/90 flex items-center gap-1.5 mb-1.5">
              <Lock size={13} className="text-brass-300" />
              <span>Card Access Protected</span>
            </p>
            <p className="text-xs text-ink-200 leading-relaxed">
              To view this digital business card, send a quick WhatsApp message with code{' '}
              <strong className="text-brass-300 bg-brass-400/10 px-1.5 py-0.5 rounded font-mono">
                {campaignCode}
              </strong>
              . This captures your contact with {owner} for a seamless connection.
            </p>
          </div>

          {/* Success State */}
          {isUnlocked ? (
            <div className="mt-6 py-6 flex flex-col items-center justify-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mb-3 animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <p className="font-display text-lg font-bold text-white">Access Granted!</p>
              <p className="text-xs text-emerald-300 mt-1">Opening digital business card now…</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {/* Primary WhatsApp Click-To-Chat Button */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full group relative flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold text-sm shadow-lg shadow-[#25D366]/25 hover:shadow-[#25D366]/40 hover:scale-[1.02] active:scale-[0.99] transition-all"
              >
                <MessageCircle size={18} fill="currentColor" />
                <span>Send WhatsApp to Unlock</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-[11px] text-ink-300">
                Prefills message:{' '}
                <span className="font-mono text-emerald-300 font-medium">Hi {campaignCode}</span>
              </div>

              {/* Status indicator after click */}
              {hasClickedChat && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <RefreshCw size={13} className="animate-spin text-emerald-400" />
                    <span>Listening for message on webhook…</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleDirectContinue}
                    className="underline text-white font-medium hover:text-emerald-300 text-xs"
                  >
                    I sent it →
                  </button>
                </div>
              )}

              {/* Desktop QR Code Option */}
              <div className="pt-3 border-t border-white/10 mt-4">
                <p className="text-xs text-ink-300 mb-3 flex items-center justify-center gap-1.5">
                  <Smartphone size={13} />
                  <span>Viewing on a computer? Scan with your phone:</span>
                </p>
                <div className="inline-block p-3 rounded-2xl bg-white shadow-xl">
                  <QRCode value={waChatUrl} size={140} />
                </div>
                <p className="text-[11px] text-ink-400 mt-2">
                  Scanning opens WhatsApp on your phone directly to send <strong>Hi {campaignCode}</strong>
                </p>
              </div>

              {/* Manual Confirmation / Continue fallback */}
              <div className="pt-2">
                {!showPhoneFallback ? (
                  <div className="flex items-center justify-between text-xs text-ink-300 pt-2">
                    <button
                      type="button"
                      onClick={handleDirectContinue}
                      className="text-ink-200 hover:text-white underline font-medium"
                    >
                      Already sent the message? Continue to Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhoneFallback(true)}
                      className="text-brass-300 hover:underline"
                    >
                      Enter number
                    </button>
                  </div>
                ) : (
                  <div className="bg-ink-900/80 p-3.5 rounded-2xl border border-white/10 text-left mt-2 space-y-2.5">
                    <p className="text-xs text-ink-200 font-medium">
                      Enter your WhatsApp number to exchange contacts:
                    </p>
                    <input
                      type="tel"
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-ink-400 focus:outline-none focus:border-emerald-400"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDirectContinue}
                        className="flex-1 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Submit & View Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPhoneFallback(false)}
                        className="px-3 py-2 text-xs text-ink-300 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer branding */}
        <p className="text-center text-xs text-ink-400 mt-4">
          Powered by <span className="font-semibold text-white">Cardsmith</span> · Digital Business Cards
        </p>
      </div>
    </div>
  );
}
