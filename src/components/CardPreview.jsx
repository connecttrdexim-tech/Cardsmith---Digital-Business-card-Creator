import { forwardRef } from 'react';
import { Clock } from 'lucide-react';
import { THEMES } from '../data/themePresets.js';
import ContactIconGrid from './ContactIconGrid.jsx';
import DynamicSections from './DynamicSections.jsx';
import GalleryCarousel from './GalleryCarousel.jsx';

const CardPreview = forwardRef(function CardPreview({ card }, ref) {
  const theme = THEMES[card.theme] || THEMES.modern;
  const accent = card.accentColor || theme.accent;
  const fontClass = card.font === 'fraunces' ? 'font-display' : 'font-body';

  const patternLayer =
    theme.pattern === 'grain' ? (
      <div className="absolute inset-0 bg-grain pointer-events-none" />
    ) : theme.pattern === 'gradient' ? (
      <div className="absolute inset-0 bg-gradient-to-br from-ink-100/60 via-white/30 to-brass-100/40 pointer-events-none" />
    ) : null;

  return (
    <div
      ref={ref}
      className={`relative w-full max-w-sm mx-auto ${theme.radius} ${theme.border} ${theme.surface} ${theme.text} ${fontClass} shadow-card overflow-hidden`}
    >
      {patternLayer}

      <div className="relative p-6 pb-8">
        {/* Header: logo + identity */}
        <div className="flex items-start justify-between mb-4">
          {card.logo ? (
            <img src={card.logo} alt={`${card.companyName} logo`} className="h-9 object-contain" />
          ) : (
            <span className="text-xs uppercase tracking-widest opacity-50">{card.companyName || 'Your Company'}</span>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2"
            style={{ '--tw-ring-color': `${accent}55` }}
          >
            {card.profilePicture ? (
              <img src={card.profilePicture} alt={card.ownerName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-semibold" style={{ backgroundColor: `${accent}22`, color: accent }}>
                {(card.ownerName || card.companyName || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className={`text-lg font-semibold leading-tight truncate ${theme.pattern === 'grain' ? '' : ''}`}>
              {card.ownerName || 'Your Name'}
            </h1>
            {card.designation && <p className={`text-sm ${theme.subtext} truncate`}>{card.designation}</p>}
            {card.companyName && <p className={`text-xs ${theme.subtext} truncate opacity-80`}>{card.companyName}</p>}
          </div>
        </div>

        {card.description && <p className={`text-sm ${theme.subtext} mb-4 leading-relaxed`}>{card.description}</p>}

        {card.workingHours && (
          <div className={`flex items-center gap-1.5 text-xs ${theme.subtext} mb-4`}>
            <Clock size={13} />
            {card.workingHours}
          </div>
        )}

        <div className="mb-5">
          <ContactIconGrid card={card} accent={accent} textClass={theme.text} />
        </div>

        {card.gallery?.length > 0 && (
          <div className="mb-5">
            <GalleryCarousel items={card.gallery} accent={accent} />
          </div>
        )}

        {card.sections?.length > 0 && <DynamicSections sections={card.sections} accent={accent} textClass={theme.text} />}
      </div>

      <div className="relative px-6 py-3 text-center text-[10px] opacity-40 border-t border-black/5">
        Digital business card · made with Cardsmith
      </div>
    </div>
  );
});

export default CardPreview;
