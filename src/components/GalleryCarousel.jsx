import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryCarousel({ items = [], accent = '#c9a15c' }) {
  const trackRef = useRef(null);

  if (!items.length) return null;

  function scrollBy(dir) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * (track.clientWidth * 0.85), behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto snap-x-mandatory hide-scrollbar scroll-smooth pb-1"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="snap-center shrink-0 w-[78%] sm:w-[60%] rounded-xl overflow-hidden bg-black/5"
          >
            {item.type === 'youtube' ? (
              <div className="aspect-video">
                <iframe
                  className="w-full h-full"
                  src={item.src}
                  title={item.caption || 'video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <img src={item.src} alt={item.caption || ''} className="w-full aspect-square object-cover" />
            )}
            {item.caption && <p className="text-xs px-2 py-1.5 opacity-70">{item.caption}</p>}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/3 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center"
            style={{ color: accent }}
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/3 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center"
            style={{ color: accent }}
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}
