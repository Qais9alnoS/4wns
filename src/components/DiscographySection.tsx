import Reveal from './Reveal';

export default function DiscographySection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1160px] mx-auto px-5 md:px-7">
        <h2 className="font-display text-xl md:text-2xl tracking-wide mb-8">الأعمال الموسيقية</h2>
        <Reveal>
          <div className="border border-[var(--line)] bg-panel p-10 md:p-12 text-center">
            <p className="font-display text-2xl text-cream-dim">قريباً</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
