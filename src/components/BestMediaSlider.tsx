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
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragX = useRef<number | null>(null);
  const dragged = useRef(false);

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

  const pages = maxIndex + 1;

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
                      <video
                        key={item.id}
                        src={item.cloudinaryUrl}
                        controls
                        controlsList="nodownload"
                        className="h-full w-full object-cover [&::-webkit-media-controls]:opacity-0 [&::-webkit-media-controls]:transition-opacity [&::-webkit-media-controls]:group-hover:opacity-100 [&::-webkit-media-controls]:group-active:opacity-100"
                      />
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
              className="px-1 text-lg leading-none hover:text-cream transition-colors active:scale-[0.98]"
            >
              &lt;
            </button>
            <span className="min-w-[3.5ch] text-center tabular-nums tracking-wide">
              {index + 1}/{pages}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="التالي"
              className="px-1 text-lg leading-none hover:text-cream transition-colors active:scale-[0.98]"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
