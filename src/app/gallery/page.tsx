'use client';

import { useEffect, useRef, useState } from 'react';
import type { Media } from '@prisma/client';
import Footer from '@/components/Footer';
import GalleryMosaic, { GalleryMosaicSkeleton } from '@/components/GalleryMosaic';

function formatDate(d: string | Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));
}

export default function GalleryPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Media | null>(null);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('/api/media')
      .then((r) => r.json())
      .then((data) => setItems(data.media || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setShowControls(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [active]);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setShowControls(true);
    }
  };

  return (
    <main>
      <section className="pt-14 pb-10">
        <div className="w-full px-5 md:px-8 lg:px-10">
          <div className="flex items-center gap-4 mb-10">
            <h1 className="font-display text-2xl md:text-3xl tracking-wide">المعرض</h1>
            <div className="flex-1 h-px bg-[var(--line)]" />
          </div>

          {loading && <GalleryMosaicSkeleton count={12} />}

          {!loading && items.length === 0 && (
            <p className="text-cream-dim text-sm">لا توجد صور أو فيديوهات بعد.</p>
          )}

          {!loading && items.length > 0 && <GalleryMosaic items={items} onOpen={setActive} />}
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
                <>
                  <video
                    ref={videoRef}
                    src={active.cloudinaryUrl}
                    controls={showControls}
                    className="max-h-[70vh] w-full"
                  />
                  {!showControls && (
                    <button
                      onClick={handlePlayClick}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group"
                      aria-label="تشغيل الفيديو"
                    >
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="white"
                        className="opacity-90 group-hover:opacity-100 transition-opacity"
                        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
                      >
                        <path d="M8 5v14l11-7z" style={{ borderRadius: '2px' }} />
                      </svg>
                    </button>
                  )}
                </>
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
