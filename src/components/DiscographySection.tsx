import Reveal from './Reveal';

export default function DiscographySection() {
  return (
    <section className="py-12 md:py-16">
      <div className="w-full px-5 md:px-8 lg:px-10">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display text-xl md:text-2xl tracking-wide">الأعمال الموسيقية</h2>
          <div className="flex-1 h-px bg-[var(--line)]" />
        </div>
        <Reveal>
          <div className="border border-[var(--line)] bg-panel p-10 md:p-12 text-center">
            <p className="font-display text-2xl text-cream-dim">قريباً</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
