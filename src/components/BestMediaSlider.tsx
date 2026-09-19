'use client';

import { useState } from 'react';
import type { Media } from '@prisma/client';

export default function BestMediaSlider({ items }: { items: Media[] }) {
  const [index, setIndex] = useState(0);

  if (!items.length) return null;

  const current = items[index];
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + items.length) % items.length);

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-[1160px] mx-auto px-5 md:px-7">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-xl md:text-2xl tracking-wide">هايلايتس</h2>
          <div className="flex-1 h-px bg-[var(--line)]" />
        </div>

        <div className="relative border border-[var(--line)] bg-panel p-2 md:p-3">
          <div className="relative w-full aspect-video overflow-hidden bg-bg-soft">
            {current.type === 'VIDEO' ? (
              <video
                key={current.id}
                src={current.cloudinaryUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={current.id}
                src={current.cloudinaryUrl}
                alt={current.description || 'من أفضل لحظات أربعة و نص'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>

          {current.description && (
            <p className="text-cream-dim text-sm mt-3 px-1">{current.description}</p>
          )}

          {items.length > 1 && (
            <div className="flex items-center justify-between mt-3 px-1">
              <button
                onClick={() => go(-1)}
                aria-label="السابق"
                className="w-9 h-9 border border-gold text-cream hover:bg-gold hover:text-bg transition-colors"
              >
                ‹
              </button>
              <div className="flex gap-1.5">
                {items.map((it, i) => (
                  <button
                    key={it.id}
                    aria-label={`عنصر ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === index ? 'bg-gold-light' : 'bg-[var(--line)]'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => go(1)}
                aria-label="التالي"
                className="w-9 h-9 border border-gold text-cream hover:bg-gold hover:text-bg transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
