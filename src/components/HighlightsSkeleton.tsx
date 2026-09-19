import SkeletonBone from './SkeletonBone';

const GAP = 20;
const CARDS = 4;

export default function HighlightsSkeleton() {
  return (
    <section className="py-10 md:py-14" aria-busy="true" aria-label="هايلايتس">
      <div className="w-full px-5 md:px-8 lg:px-10 mb-8">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-xl md:text-2xl tracking-wide">هايلايتس</h2>
          <div className="flex-1 h-px bg-[var(--line)]" />
        </div>
      </div>

      <div className="w-full px-5 md:px-8 lg:px-10">
        <div dir="ltr" className="flex overflow-hidden" style={{ gap: GAP }}>
          {Array.from({ length: CARDS }).map((_, i) => (
            <article
              key={i}
              className="flex aspect-square shrink-0 flex-col w-full md:w-[calc((100%-20px)/2)] xl:w-[calc((100%-60px)/4)]"
            >
              <SkeletonBone className="relative min-h-0 w-full flex-1" />
              <div dir="rtl" className="shrink-0 pt-4">
                <SkeletonBone className="h-[11px] w-[7.2rem] mb-2" />
                <SkeletonBone className="h-[1.35rem] md:h-[1.5rem] w-[82%] mb-2" />
                <SkeletonBone className="h-[1.375rem] w-full mb-1" />
                <SkeletonBone className="h-[1.375rem] w-[68%]" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
