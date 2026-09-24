import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, CreditCard, Copy, Download, MessageCircle } from 'lucide-react';
import { listCards, saveCard, deleteCard } from '../db/storage.js';
import { createEmptyCard } from '../data/cardModel.js';
import { readJsonFile, downloadJson } from '../utils/jsonIO.js';
import { normalizeCard } from '../utils/cardValidation.js';
import LeadsModal from '../components/LeadsModal.jsx';

export default function Home() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardForLeads, setSelectedCardForLeads] = useState(null);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  async function refresh() {
    setCards(await listCards());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createNew() {
    const card = createEmptyCard();
    await saveCard(card);
    navigate(`/onboarding/${card.id}`);
  }

  async function duplicate(card) {
    const copy = { ...card, id: crypto.randomUUID(), companyName: `${card.companyName} (copy)`, createdAt: Date.now() };
    await saveCard(copy);
    refresh();
  }

  async function remove(id) {
    if (!confirm('Delete this card? This cannot be undone.')) return;
    await deleteCard(id);
    refresh();
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      const card = normalizeCard(data, { newId: true });
      await saveCard(card);
      refresh();
    } catch {
      alert('That file could not be read as a valid card JSON export.');
    }
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-ink-900 text-brass-300 flex items-center justify-center shrink-0">
              <CreditCard size={16} />
            </div>
            <span className="font-display text-lg font-semibold text-ink-900 truncate">Cardsmith</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-2.5 sm:px-3.5 py-2 rounded-lg border border-ink-200 hover:bg-ink-50"
              aria-label="Import JSON"
            >
              <Upload size={15} /> <span className="hidden sm:inline">Import JSON</span>
            </button>
            <button
              onClick={createNew}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-2.5 sm:px-3.5 py-2 rounded-lg bg-ink-900 text-white hover:bg-ink-800"
              aria-label="New card"
            >
              <Plus size={15} /> <span className="hidden sm:inline">New card</span>
            </button>
            <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        {!loading && cards.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-ink-800 mb-2">No cards yet</p>
            <p className="text-ink-400 mb-6 text-sm">Create your first digital business card — it takes about a minute.</p>
            <button onClick={createNew} className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-ink-900 text-white hover:bg-ink-800">
              <Plus size={15} /> Create a card
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {cards.map((card) => (
            <div key={card.id} className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-5 shadow-soft hover:shadow-card transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-brass-100 text-brass-600 flex items-center justify-center font-semibold overflow-hidden shrink-0">
                  {card.profilePicture ? (
                    <img src={card.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (card.ownerName || card.companyName || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-ink-800 truncate">{card.companyName || 'Untitled card'}</p>
                  <p className="text-xs text-ink-400 truncate">{card.ownerName || 'No name set'}</p>
                </div>
              </div>
              <p className="text-xs text-ink-300 mb-4">Updated {new Date(card.updatedAt).toLocaleDateString()}</p>
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={() => navigate(`/editor/${card.id}`)}
                  className="flex-1 text-sm font-medium py-1.5 rounded-lg bg-ink-900 text-white hover:bg-ink-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedCardForLeads(card)}
                  className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shrink-0"
                  title="WhatsApp Leads"
                >
                  <MessageCircle size={15} fill="currentColor" />
                </button>
                <button onClick={() => downloadJson(card)} className="p-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 shrink-0" title="Download JSON">
                  <Download size={15} />
                </button>
                <button onClick={() => duplicate(card)} className="p-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 shrink-0" title="Duplicate">
                  <Copy size={15} />
                </button>
                <button onClick={() => remove(card.id)} className="p-1.5 rounded-lg border border-ink-200 text-red-500 hover:bg-red-50 shrink-0" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedCardForLeads && (
        <LeadsModal card={selectedCardForLeads} onClose={() => setSelectedCardForLeads(null)} />
      )}
    </div>
  );
}
