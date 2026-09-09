import { useRef, useState } from 'react';
import { Plus, Trash2, Youtube } from 'lucide-react';
import { readImageAsDataUrl } from '../utils/jsonIO.js';

export default function GalleryEditor({ gallery, onChange }) {
  const fileRef = useRef(null);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState('');

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

  function getYoutubeId(value) {
    try {
      const url = new URL(value.trim());
      const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');
      let id = '';
      if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
      if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        id = url.searchParams.get('v') || '';
        if (!id) {
          const parts = url.pathname.split('/').filter(Boolean);
          if (['embed', 'shorts', 'live'].includes(parts[0])) id = parts[1] || '';
        }
      }
      return /^[\w-]{11}$/.test(id) ? id : '';
    } catch {
      return '';
    }
  }

  function addYoutube() {
    const id = getYoutubeId(youtubeUrl);
    if (!id) {
      setYoutubeError('Enter a valid YouTube watch, Shorts, live, embed, or youtu.be link.');
      return;
    }
    const embedSrc = `https://www.youtube.com/embed/${id}`;
    onChange([...gallery, { id: crypto.randomUUID(), type: 'youtube', src: embedSrc, caption: '' }]);
    setYoutubeUrl('');
    setYoutubeError('');
    setShowYoutubeInput(false);
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

      {showYoutubeInput && (
        <div className="rounded-xl border border-ink-200 bg-ink-50 p-3 space-y-2">
          <label htmlFor="youtube-url" className="block text-xs font-medium text-ink-700">YouTube video URL</label>
          <input
            id="youtube-url"
            type="url"
            value={youtubeUrl}
            onChange={(e) => { setYoutubeUrl(e.target.value); setYoutubeError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addYoutube(); } }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
            autoFocus
          />
          {youtubeError && <p role="alert" className="text-xs text-red-600">{youtubeError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setShowYoutubeInput(false); setYoutubeUrl(''); setYoutubeError(''); }} className="text-xs px-3 py-2 text-ink-500">Cancel</button>
            <button type="button" onClick={addYoutube} className="text-xs font-medium px-3 py-2 rounded-lg bg-ink-900 text-white">Add video</button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-dashed border-ink-300 hover:bg-ink-50"
        >
          <Plus size={13} /> Add photos
        </button>
        <button
          onClick={() => setShowYoutubeInput(true)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-dashed border-ink-300 hover:bg-ink-50"
        >
          <Youtube size={13} /> Add YouTube
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      </div>
    </div>
  );
}
