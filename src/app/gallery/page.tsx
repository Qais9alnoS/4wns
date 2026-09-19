'use client';

import { useEffect, useState } from 'react';
import type { Media } from '@prisma/client';
import Footer from '@/components/Footer';

function formatDate(d: string | Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));
}

function hasInfo(item: Media) {
  return Boolean(item.description || item.details || item.date);
}

export default function GalleryPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Media | null>(null);

  useEffect(() => {
    fetch('/api/media')
      .then((r) => r.json())
      .then((data) => setItems(data.media || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="pt-14 pb-10">
        <div className="max-w-[1160px] mx-auto px-5 md:px-7">
          <div className="flex items-center gap-4 mb-10">
            <h1 className="font-display text-2xl md:text-3xl tracking-wide">المعرض</h1>
            <div className="flex-1 h-px bg-[var(--line)]" />
          </div>

          {loading && <p className="text-cream-dim text-sm">جارِ التحميل...</p>}

          {!loading && items.length === 0 && (
            <p className="text-cream-dim text-sm">لا توجد صور أو فيديوهات بعد.</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item)}
                className="relative group border border-[var(--line)] bg-panel aspect-square overflow-hidden"
              >
                {item.type === 'VIDEO' ? (
                  <video src={item.cloudinaryUrl} className="w-full h-full object-cover" muted preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.cloudinaryUrl}
                    alt={item.description || ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                {item.type === 'VIDEO' && (
                  <span className="absolute inset-0 flex items-center justify-center text-cream text-3xl bg-black/20 md:group-hover:opacity-0 transition-opacity">
                    ▶
                  </span>
                )}
                {hasInfo(item) && (
                  <div className="hidden md:flex absolute inset-0 flex-col justify-end p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-right">
                    {item.description && <p className="text-cream text-sm font-bold leading-snug line-clamp-2">{item.description}</p>}
                    {item.details && <p className="text-cream-dim text-xs mt-1 line-clamp-2">{item.details}</p>}
                    {item.date && <p className="text-gold-light text-xs mt-1">{formatDate(item.date)}</p>}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div
          className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4 md:p-10"
          onClick={() => setActive(null)}
        >
          <div className="max-w-3xl w-full bg-panel border border-[var(--line)] p-3" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full max-h-[70vh] overflow-hidden bg-bg-soft flex items-center justify-center">
              {active.type === 'VIDEO' ? (
                <video src={active.cloudinaryUrl} controls autoPlay className="max-h-[70vh] w-full" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.cloudinaryUrl} alt={active.description || ''} className="max-h-[70vh] w-full object-contain" />
              )}
            </div>
            <div className="p-3">
              {active.description && <p className="text-cream mb-1">{active.description}</p>}
              {active.details && <p className="text-cream-dim text-sm mb-1">{active.details}</p>}
              {active.date && <p className="text-cream-dim text-xs">{formatDate(active.date)}</p>}
            </div>
            <button
              onClick={() => setActive(null)}
              className="absolute -top-3 -left-3 w-8 h-8 bg-gold text-bg rounded-full flex items-center justify-center"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
