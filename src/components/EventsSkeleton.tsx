import SkeletonBone from './SkeletonBone';

function EventCardSkeleton() {
  return (
    <div className="flex aspect-square w-full flex-col overflow-hidden border border-[var(--line)] bg-panel">
      <SkeletonBone className="relative min-h-0 w-full flex-1" />
      <div className="shrink-0 p-5">
        <SkeletonBone className="h-[22px] w-[3.25rem] mb-2" />
        <SkeletonBone className="h-[1.35rem] md:h-[1.5rem] w-[78%] mb-1" />
        <SkeletonBone className="h-[1.25rem] w-[92%] mb-2" />
        <div className="min-h-[2.5em]">
          <SkeletonBone className="h-[1.25rem] w-full mb-1" />
          <SkeletonBone className="h-[1.25rem] w-[62%]" />
        </div>
      </div>
    </div>
  );
}

export default function EventsSkeleton() {
  return (
    <section className="py-12 md:py-16" aria-busy="true" aria-label="الحفلات">
      <div className="w-full px-5 md:px-8 lg:px-10">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display text-xl md:text-2xl tracking-wide">الحفلات</h2>
          <div className="flex-1 h-px bg-[var(--line)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
