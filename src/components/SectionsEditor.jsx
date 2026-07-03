import { Plus, Trash2, GripVertical } from 'lucide-react';
import { SECTION_TYPES } from '../data/cardModel.js';
import FormField from './FormField.jsx';

function emptyItemForType(type) {
  const id = crypto.randomUUID();
  if (type === 'faqs') return { id, question: '', answer: '' };
  if (type === 'testimonials') return { id, quote: '', author: '' };
  if (type === 'team') return { id, name: '', role: '', image: '' };
  return { id, name: '', description: '', link: '', image: '' };
}

function ItemEditor({ type, item, onChange, onRemove }) {
  if (type === 'faqs') {
    return (
      <div className="grid grid-cols-1 gap-2 p-3 rounded-lg bg-ink-50 relative">
        <FormField label="Question" value={item.question} onChange={(v) => onChange({ ...item, question: v })} />
        <FormField label="Answer" value={item.answer} onChange={(v) => onChange({ ...item, answer: v })} textarea rows={2} />
        <button onClick={onRemove} className="absolute top-2 right-2 text-ink-400 hover:text-red-500"><Trash2 size={14} /></button>
      </div>
    );
  }
  if (type === 'testimonials') {
    return (
      <div className="grid grid-cols-1 gap-2 p-3 rounded-lg bg-ink-50 relative">
        <FormField label="Quote" value={item.quote} onChange={(v) => onChange({ ...item, quote: v })} textarea rows={2} />
        <FormField label="Author" value={item.author} onChange={(v) => onChange({ ...item, author: v })} />
        <button onClick={onRemove} className="absolute top-2 right-2 text-ink-400 hover:text-red-500"><Trash2 size={14} /></button>
      </div>
    );
  }
  if (type === 'team') {
    return (
      <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-ink-50 relative">
        <FormField label="Name" value={item.name} onChange={(v) => onChange({ ...item, name: v })} />
        <FormField label="Role" value={item.role} onChange={(v) => onChange({ ...item, role: v })} />
        <button onClick={onRemove} className="absolute top-2 right-2 text-ink-400 hover:text-red-500"><Trash2 size={14} /></button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-ink-50 relative">
      <FormField label="Name" value={item.name} onChange={(v) => onChange({ ...item, name: v })} />
      <FormField label="Link (optional)" value={item.link} onChange={(v) => onChange({ ...item, link: v })} />
      <div className="col-span-2">
        <FormField label="Description" value={item.description} onChange={(v) => onChange({ ...item, description: v })} textarea rows={2} />
      </div>
      <button onClick={onRemove} className="absolute top-2 right-2 text-ink-400 hover:text-red-500"><Trash2 size={14} /></button>
    </div>
  );
}

export default function SectionsEditor({ sections, onChange }) {
  function updateSection(id, patch) {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function removeSection(id) {
    onChange(sections.filter((s) => s.id !== id));
  }
  function addSection() {
    onChange([
      ...sections,
      { id: crypto.randomUUID(), type: 'about', title: 'About Us', body: '', items: [] },
    ]);
  }
  function addItem(section) {
    updateSection(section.id, { items: [...section.items, emptyItemForType(section.type)] });
  }
  function updateItem(section, itemId, patch) {
    updateSection(section.id, {
      items: section.items.map((it) => (it.id === itemId ? patch : it)),
    });
  }
  function removeItem(section, itemId) {
    updateSection(section.id, { items: section.items.filter((it) => it.id !== itemId) });
  }

  const needsItems = (type) => type !== 'custom';

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div key={s.id} className="border border-ink-100 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <GripVertical size={14} className="text-ink-300" />
            <select
              value={s.type}
              onChange={(e) => {
                const type = e.target.value;
                const label = SECTION_TYPES.find((t) => t.value === type)?.label || 'Section';
                updateSection(s.id, { type, title: s.title === '' ? label : s.title, items: [] });
              }}
              className="text-sm border border-ink-200 rounded-lg px-2 py-1.5 bg-white"
            >
              {SECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              value={s.title}
              onChange={(e) => updateSection(s.id, { title: e.target.value })}
              placeholder="Section title"
              className="flex-1 text-sm border border-ink-200 rounded-lg px-2.5 py-1.5"
            />
            <button onClick={() => removeSection(s.id)} className="text-ink-400 hover:text-red-500 shrink-0">
              <Trash2 size={16} />
            </button>
          </div>

          <FormField label="Body text (optional)" value={s.body} onChange={(v) => updateSection(s.id, { body: v })} textarea rows={2} />

          {needsItems(s.type) && (
            <div className="mt-3 space-y-2">
              {s.items.map((item) => (
                <ItemEditor
                  key={item.id}
                  type={s.type}
                  item={item}
                  onChange={(patch) => updateItem(s, item.id, patch)}
                  onRemove={() => removeItem(s, item.id)}
                />
              ))}
              <button
                onClick={() => addItem(s)}
                className="w-full text-xs font-medium text-ink-500 border border-dashed border-ink-200 rounded-lg py-2 hover:bg-ink-50"
              >
                + Add item
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addSection}
        className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium py-2.5 rounded-lg border border-dashed border-ink-300 text-ink-600 hover:bg-ink-50"
      >
        <Plus size={15} /> Add section
      </button>
    </div>
  );
}
