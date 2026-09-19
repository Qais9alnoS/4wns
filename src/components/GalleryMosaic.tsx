'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Media } from '@prisma/client';
import SkeletonBone from './SkeletonBone';

const GAP = 8;
const MIN_RATIO = 0.52;
const MAX_RATIO = 2.4;
const ratioCache = new Map<string, number>();

function clampRatio(ratio: number) {
  if (!Number.isFinite(ratio) || ratio <= 0) return 1;
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
}

function targetRowHeight(containerWidth: number) {
  if (containerWidth < 640) return 168;
  if (containerWidth < 1024) return 196;
  return 220;
}

function hasInfo(item: Media) {
  return Boolean(item.description || item.details || item.date);
}

function formatDate(d: string | Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));
}

function probeImageUrl(url: string) {
  if (url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/image/upload/w_48,c_limit,q_auto,f_auto/');
  }
  return url;
}

function cacheKey(item: Media) {
  return `${item.id}:${item.cloudinaryUrl}`;
}

function readRatio(w: number, h: number, fallback = 1) {
  if (!w || !h) return fallback;
  return w / h;
}

function probeItemRatio(item: Media) {
  const key = cacheKey(item);
  const cached = ratioCache.get(key);
  if (cached) return Promise.resolve(cached);

  return new Promise<number>((resolve) => {
    const finish = (ratio: number) => {
      ratioCache.set(key, ratio);
      resolve(ratio);
    };

    if (item.type === 'VIDEO') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const stop = () => {
        video.removeAttribute('src');
        video.load();
      };
      video.onloadedmetadata = () => {
        finish(readRatio(video.videoWidth, video.videoHeight, 16 / 9));
        stop();
      };
      video.onerror = () => {
        finish(16 / 9);
        stop();
      };
      video.src = item.cloudinaryUrl;
      return;
    }

    const img = new Image();
    img.onload = () => finish(readRatio(img.naturalWidth, img.naturalHeight));
    img.onerror = () => finish(1);
    img.src = probeImageUrl(item.cloudinaryUrl);
  });
}

type Tile = {
  id: string;
  ratio: number;
  width: number;
  height: number;
};

const SKELETON_RATIOS = [1.58, 0.72, 1.18, 1.02, 0.68, 1.72, 0.9, 1.38, 0.78, 1.12, 1.62, 0.74];

function layoutRows(entries: { id: string; ratio: number }[], containerWidth: number): Tile[][] {
  if (containerWidth <= 0 || entries.length === 0) return [];

  const rowH = targetRowHeight(containerWidth);
  const minH = Math.round(rowH * 0.72);

  const rows: { id: string; ratio: number }[][] = [];
  let current: { id: string; ratio: number }[] = [];
  let ratioSum = 0;

  const fits = (nextSum: number, count: number) => {
    const gaps = GAP * Math.max(0, count - 1);
    return nextSum * rowH + gaps <= containerWidth;
  };

  for (const entry of entries) {
    const ratio = clampRatio(entry.ratio);
    const nextCount = current.length + 1;
    const nextSum = ratioSum + ratio;

    if (current.length > 0 && !fits(nextSum, nextCount)) {
      rows.push(current);
      current = [{ id: entry.id, ratio }];
      ratioSum = ratio;
    } else {
      current.push({ id: entry.id, ratio });
      ratioSum = nextSum;
    }
  }
  if (current.length) rows.push(current);

  return rows.map((row, rowIndex) => {
    const gaps = GAP * Math.max(0, row.length - 1);
    const available = Math.max(120, containerWidth - gaps);
    const sum = row.reduce((acc, t) => acc + t.ratio, 0);
    const fillRow = rowIndex < rows.length - 1 || row.length >= 3;
    const ideal = available / sum;
    const heightCap = row.length === 1 ? Math.round(rowH * 1.35) : row.length === 2 ? 480 : Math.round(rowH * 1.55);
    let height = fillRow ? ideal : Math.min(ideal, rowH);
    height = Math.min(heightCap, Math.max(minH, height));

    let used = 0;
    return row.map((tile, i) => {
      const isLast = i === row.length - 1;
      const naturalWidth = tile.ratio * height;
      const width =
        fillRow && isLast ? Math.max(1, available - used) : Math.max(1, Math.round(naturalWidth));
      used += width;
      return { id: tile.id, ratio: tile.ratio, width, height };
    });
  });
}

function MosaicSkeletonRows({ rows }: { rows: Tile[][] }) {
  return (
    <div className="flex flex-col" style={{ gap: GAP }}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full" style={{ gap: GAP, height: row[0]?.height }}>
          {row.map((tile) => (
            <SkeletonBone
              key={tile.id}
              className="shrink-0"
              style={{ width: tile.width, height: tile.height }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function GalleryMosaicSkeleton({
  count = 12,
  width: widthProp,
}: {
  count?: number;
  width?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(0);

  useLayoutEffect(() => {
    if (widthProp) return;
    const el = rootRef.current;
    if (!el) return;

    const apply = () => setMeasured(el.clientWidth);
    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [widthProp]);

  const entries = Array.from({ length: Math.max(4, count) }, (_, i) => ({
    id: `sk-${i}`,
    ratio: SKELETON_RATIOS[i % SKELETON_RATIOS.length],
  }));
  const width = widthProp || measured;
  const rows = width ? layoutRows(entries, width) : [];

  return (
    <div ref={rootRef} className="w-full" aria-busy="true" aria-label="المعرض">
      {rows.length > 0 ? (
        <MosaicSkeletonRows rows={rows} />
      ) : (
        <div className="h-[168px] md:h-[196px] lg:h-[220px] skeleton-bone" />
      )}
    </div>
  );
}

export default function GalleryMosaic({
  items,
  onOpen,
}: {
  items: Media[];
  onOpen: (item: Media) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number> | null>(null);
  const [showMedia, setShowMedia] = useState(false);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const apply = () => setWidth(el.clientWidth);
    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setShowMedia(false);
    setRatios(null);

    Promise.all(items.map(probeItemRatio)).then((values) => {
      if (cancelled) return;
      const next: Record<string, number> = {};
      items.forEach((item, i) => {
        next[item.id] = values[i];
      });
      setRatios(next);
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  const ready = Boolean(width > 0 && ratios);
  const rows =
    ready && ratios
      ? layoutRows(
          items.map((item) => ({ id: item.id, ratio: ratios[item.id] ?? 1 })),
          width
        )
      : [];
  const itemById = new Map(items.map((item) => [item.id, item]));

  useLayoutEffect(() => {
    if (!ready) {
      setShowMedia(false);
      return;
    }

    setShowMedia(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShowMedia(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, items]);

  return (
    <div ref={rootRef} className="w-full">
      {!ready && <GalleryMosaicSkeleton count={items.length || 12} width={width || undefined} />}

      {ready && (
        <div className="flex flex-col" style={{ gap: GAP }}>
          {rows.map((row) => (
            <div
              key={row.map((t) => t.id).join('-')}
              className="flex w-full"
              style={{ gap: GAP, height: row[0]?.height }}
            >
              {row.map((tile) => {
                const item = itemById.get(tile.id);
                if (!item) return null;

                return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => onOpen(item)}
                  className="relative group shrink-0 overflow-hidden bg-panel text-right"
                  style={{ width: tile.width, height: tile.height }}
                >
                  {showMedia && item.type === 'VIDEO' && (
                    <video
                      src={item.cloudinaryUrl}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  )}
                  {showMedia && item.type !== 'VIDEO' && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.cloudinaryUrl}
                      alt={item.description || ''}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      loading="lazy"
                    />
                  )}

                  {item.type === 'VIDEO' && (
                    <span className="absolute inset-0 flex items-center justify-center text-cream text-3xl bg-black/20 md:group-hover:opacity-0 transition-opacity">
                      ▶
                    </span>
                  )}

                  {hasInfo(item) && (
                    <div className="hidden md:flex absolute inset-0 flex-col justify-end p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.description && (
                        <p className="text-cream text-sm font-bold leading-snug line-clamp-2">{item.description}</p>
                      )}
                      {item.details && (
                        <p className="text-cream-dim text-xs mt-1 line-clamp-2">{item.details}</p>
                      )}
                      {item.date && (
                        <p className="text-gold-light text-xs mt-1">{formatDate(item.date)}</p>
                      )}
                    </div>
                  )}
                </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
