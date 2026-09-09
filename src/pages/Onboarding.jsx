import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Eye } from 'lucide-react';
import { getCard, saveCard } from '../db/storage.js';
import { createEmptyCard } from '../data/cardModel.js';
import StepShell from '../components/onboarding/StepShell.jsx';
import StartStep from '../components/onboarding/StartStep.jsx';
import FinishStep from '../components/onboarding/FinishStep.jsx';
import IdentityFields from '../components/IdentityFields.jsx';
import ContactFields from '../components/ContactFields.jsx';
import SocialFields from '../components/SocialFields.jsx';
import DesignFields from '../components/DesignFields.jsx';
import SectionsEditor from '../components/SectionsEditor.jsx';
import GalleryEditor from '../components/GalleryEditor.jsx';
import CardPreview from '../components/CardPreview.jsx';
import { normalizeCard } from '../utils/cardValidation.js';

// step 0 = start screen, step N+1 = finish screen
const STEPS = [
  { key: 'identity', title: 'Tell us about you', subtitle: 'Name, company, and what you do.' },
  { key: 'contact', title: 'How can people reach you?', subtitle: 'Phone, WhatsApp, email, website, location.' },
  { key: 'social', title: 'Link your profiles', subtitle: 'Any of these you want on the card — skip the rest.' },
  { key: 'design', title: 'Pick a look', subtitle: 'Choose a theme and accent color.' },
  { key: 'sections', title: 'Add extra info', subtitle: 'About, products, services, FAQs — totally optional.' },
  { key: 'gallery', title: 'Show your work', subtitle: 'Photos or a YouTube video, if you have any.' },
];

export default function Onboarding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('start'); // start | wizard | finish
  const [stepIdx, setStepIdx] = useState(0);
  const [card, setCard] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const existing = await getCard(id);
      setCard(existing || { ...createEmptyCard(), id });
    })();
  }, [id]);

  function persist(next) {
    setCard(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveCard(next), 400);
  }

  function set(patch) {
    persist({ ...card, ...patch });
  }

  function startFresh() {
    setPhase('wizard');
    setStepIdx(0);
  }

  async function handleImported(data) {
    const merged = { ...normalizeCard(data), id, updatedAt: Date.now() };
    await saveCard(merged);
    // Imported cards already have their details — skip straight to the editor.
    navigate(`/editor/${id}`);
  }

  async function goNext() {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      await saveCard(card);
      setPhase('finish');
    }
    window.scrollTo({ top: 0 });
  }

  function goBack() {
    if (stepIdx === 0) {
      setPhase('start');
    } else {
      setStepIdx((i) => i - 1);
    }
    window.scrollTo({ top: 0 });
  }

  async function finishToEditor() {
    clearTimeout(saveTimer.current);
    await saveCard(card);
    navigate(`/editor/${id}`);
  }

  if (!card) {
    return <div className="min-h-screen flex items-center justify-center text-ink-400">Loading…</div>;
  }

  const step = STEPS[stepIdx];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="border-b border-ink-100 bg-white/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-ink-900">Cardsmith</span>
          <div className="flex items-center gap-2">
            {phase === 'wizard' && (
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="sm:hidden inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-ink-200"
              >
                <Eye size={13} /> Preview
              </button>
            )}
            <button onClick={async () => { clearTimeout(saveTimer.current); await saveCard(card); navigate('/'); }} className="p-2 rounded-lg hover:bg-ink-50 text-ink-400" aria-label="Exit to home">
              <X size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-10">
        {phase === 'start' && <StartStep onStartFresh={startFresh} onImported={handleImported} />}

        {phase === 'wizard' && (
          <div className="max-w-4xl mx-auto grid sm:grid-cols-[1fr_320px] gap-10">
            <StepShell
              stepIndex={stepIdx}
              totalSteps={STEPS.length}
              title={step.title}
              subtitle={step.subtitle}
              onBack={goBack}
              onNext={goNext}
              onSkip={goNext}
              nextLabel={stepIdx === STEPS.length - 1 ? 'Finish' : 'Next'}
            >
              {step.key === 'identity' && <IdentityFields card={card} set={set} />}
              {step.key === 'contact' && <ContactFields card={card} set={set} />}
              {step.key === 'social' && <SocialFields card={card} set={set} />}
              {step.key === 'design' && <DesignFields card={card} set={set} />}
              {step.key === 'sections' && (
                <SectionsEditor sections={card.sections} onChange={(sections) => set({ sections })} />
              )}
              {step.key === 'gallery' && (
                <GalleryEditor gallery={card.gallery} onChange={(gallery) => set({ gallery })} />
              )}
            </StepShell>

            {/* live preview, desktop-persistent / mobile-toggle */}
            <div className={`${showPreview ? 'block' : 'hidden'} sm:block`}>
              <div className="sm:sticky sm:top-24">
                <CardPreview card={card} />
              </div>
            </div>
          </div>
        )}

        {phase === 'finish' && (
          <FinishStep card={card} onBack={() => { setPhase('wizard'); setStepIdx(STEPS.length - 1); }} onFinish={finishToEditor} />
        )}
      </main>
    </div>
  );
}
