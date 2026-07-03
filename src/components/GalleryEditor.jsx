import { useRef } from 'react';
import { Plus, Trash2, Youtube } from 'lucide-react';
import { readImageAsDataUrl } from '../utils/jsonIO.js';

export default function GalleryEditor({ gallery, onChange }) {
  const fileRef = useRef(null);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    const items = await Promise.all(
      files.map(async (file) => ({
        id: crypto.randomUUID(),
        type: 'image',
        src: await readImageAsDataUrl(file),
        caption: '',
      }))
    );
    onChange([...gallery, ...items]);
    e.target.value = '';
  }

  function addYoutube() {
    const url = prompt('Paste a YouTube video URL:');
    if (!url) return;
    const idMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    const embedSrc = idMatch ? `https://www.youtube.com/embed/${idMatch[1]}` : url;
    onChange([...gallery, { id: crypto.randomUUID(), type: 'youtube', src: embedSrc, caption: '' }]);
  }

  function updateCaption(id, caption) {
    onChange(gallery.map((g) => (g.id === id ? { ...g, caption } : g)));
  }
  function remove(id) {
    onChange(gallery.filter((g) => g.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {gallery.map((item) => (
          <div key={item.id} className="rounded-lg overflow-hidden border border-ink-100 relative group">
            {item.type === 'youtube' ? (
              <div className="aspect-video bg-ink-50 flex items-center justify-center text-ink-400">
                <Youtube size={20} />
              </div>
            ) : (
              <img src={item.src} alt="" className="w-full aspect-video object-cover" />
            )}
            <input
              value={item.caption}
              onChange={(e) => updateCaption(item.id, e.target.value)}
              placeholder="Caption (optional)"
              className="w-full text-xs px-2 py-1.5 border-t border-ink-100"
            />
            <button
              onClick={() => remove(item.id)}
              className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-dashed border-ink-300 hover:bg-ink-50"
        >
          <Plus size={13} /> Add photos
        </button>
        <button
          onClick={addYoutube}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-dashed border-ink-300 hover:bg-ink-50"
        >
          <Youtube size={13} /> Add YouTube
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      </div>
    </div>
  );
}
