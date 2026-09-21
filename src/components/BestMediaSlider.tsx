'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Media } from '@prisma/client';

const GAP = 20;

function formatDate(d: string | Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));
}

function visibleCount(width: number) {
  if (width >= 1280) return 4;
  if (width >= 768) return 2;
  return 1;
}

export default function BestMediaSlider({ items }: { items: Media[] }) {
  const [index, setIndex] = useState(0);
  const [viewportW, setViewportW] = useState(0);
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragX = useRef<number | null>(null);
  const dragged = useRef(false);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const accumulatedDeltaX = useRef(0);

  const visible = visibleCount(viewportW || 1280);
  const maxIndex = Math.max(0, items.length - visible);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!items.length) return;
      setIndex((i) => {
        const next = i + dir;
        if (next < 0) return maxIndex;
        if (next > maxIndex) return 0;
        return next;
      });
    },
    [items.length, maxIndex]
  );

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => setViewportW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  if (!items.length) return null;

  const cardW = viewportW ? (viewportW - GAP * (visible - 1)) / visible : 0;
  const offset = viewportW ? -index * (cardW + GAP) : 0;

  const onPointerDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest('video, button, a')) return;
    dragX.current = event.clientX;
    dragged.current = false;
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (dragX.current == null) return;
    const delta = event.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(delta) < 48) return;
    dragged.current = true;
    go(delta < 0 ? 1 : -1);
  };

  // Handle horizontal scroll/trackpad swipe
  const onWheel = (event: React.WheelEvent) => {
    // Check if it's a horizontal scroll (trackpad swipe left/right)
    const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);

    if (isHorizontal && items.length > visible) {
      event.preventDefault();

      // Accumulate deltaX for smoother trackpad gestures
      accumulatedDeltaX.current += event.deltaX;

      // Clear existing timeout
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }

      // Set a new timeout to trigger navigation after accumulation
      wheelTimeout.current = setTimeout(() => {
        const threshold = 30; // Lower threshold for better responsiveness

        if (Math.abs(accumulatedDeltaX.current) > threshold) {
          go(accumulatedDeltaX.current > 0 ? 1 : -1);
          accumulatedDeltaX.current = 0;
        }
      }, 50); // Short delay for accumulation
    }
  };

  const pages = maxIndex + 1;

  const handlePlayClick = (itemId: string, videoEl: HTMLVideoElement) => {
    videoEl.play();
    setPlayingVideos((prev) => new Set(prev).add(itemId));
  };

  return (
    <section className="py-10 md:py-14">
      <div className="w-full px-5 md:px-8 lg:px-10 mb-8">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-xl md:text-2xl tracking-wide">هايلايتس</h2>
          <div className="flex-1 h-px bg-[var(--line)]" />
        </div>
      </div>

      <div className="w-full px-5 md:px-8 lg:px-10">
        <div
          ref={viewportRef}
          dir="ltr"
          className="relative w-full overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragX.current = null;
          }}
          onWheel={onWheel}
        >
          <div
            className="flex items-start will-change-transform motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              gap: GAP,
              transform: `translate3d(${offset}px, 0, 0)`,
            }}
          >
            {items.map((item, i) => {
              const dateLabel = formatDate(item.date);
              return (
                <article
                  key={item.id}
                  className="flex aspect-square shrink-0 flex-col group"
                  style={{ width: cardW || undefined }}
                  onClick={() => {
                    if (dragged.current) return;
                    setIndex(Math.min(i, maxIndex));
                  }}
                >
                  <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-bg-soft">
                    {item.type === 'VIDEO' ? (
                      <>
                        <video
                          key={item.id}
                          ref={(el) => {
                            if (el && !playingVideos.has(item.id)) {
                              el.load();
                            }
                          }}
                          src={item.cloudinaryUrl}
                          controls={playingVideos.has(item.id)}
                          controlsList="nodownload"
                          className="h-full w-full object-cover"
                        />
                        {!playingVideos.has(item.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const videoEl = e.currentTarget.previousElementSibling as HTMLVideoElement;
                              if (videoEl) handlePlayClick(item.id, videoEl);
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group"
                            aria-label="تشغيل الفيديو"
                          >
                            <svg
                              width="56"
                              height="56"
                              viewBox="0 0 24 24"
                              fill="white"
                              className="opacity-90 group-hover:opacity-100 transition-opacity"
                              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                        )}
                      </>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.cloudinaryUrl}
                        alt={item.description || ''}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {(dateLabel || item.description || item.details) && (
                    <div dir="rtl" className="shrink-0 pt-4">
                      {dateLabel && (
                        <p className="text-[11px] tracking-[0.18em] text-cream-dim mb-2 uppercase">
                          {dateLabel}
                        </p>
                      )}
                      {item.description && (
                        <h3 className="font-display text-lg md:text-xl leading-[1.2] mb-2">
                          {item.description}
                        </h3>
                      )}
                      {item.details && (
                        <p className="text-cream-dim text-sm leading-relaxed line-clamp-2">
                          {item.details}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {items.length > visible && (
          <div
            dir="ltr"
            className="mt-8 flex items-center justify-center gap-8 text-cream-dim text-sm md:text-base select-none"
          >
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="السابق"
              className="p-2 hover:text-cream transition-colors duration-300 active:scale-95"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="min-w-[3.5ch] text-center tabular-nums tracking-wide">
              {index + 1}/{pages}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="التالي"
              className="p-2 hover:text-cream transition-colors duration-300 active:scale-95"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
