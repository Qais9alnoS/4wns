import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { selectHomeEvents } from '@/lib/eventLogic';
import BestMediaSlider from '@/components/BestMediaSlider';
import EventsSection from '@/components/EventsSection';
import DiscographySection from '@/components/DiscographySection';
import Footer from '@/components/Footer';

export const revalidate = 0;

export default async function HomePage() {
  const [bestMedia, events] = await Promise.all([
    prisma.media.findMany({ where: { isBest: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.event.findMany(),
  ]);

  const { completed, upcoming } = selectHomeEvents(events);

  return (
    <main>
      {/* HERO */}
      <section className="pt-12 md:pt-16 pb-16 md:pb-24">
        <div className="max-w-[1160px] mx-auto px-5 md:px-7 grid grid-cols-1 md:grid-cols-[1fr_1.05fr] gap-10 md:gap-14 items-center">
          <div className="relative order-1">
            <div className="relative border border-[var(--line)] p-2.5 bg-gradient-to-b from-panel to-bg-soft -rotate-[1.4deg]">
              <div className="relative w-full aspect-[4/5]">
                <Image
                  src="/assets/band/group.jpg"
                  alt="أعضاء فرقة أربعة و نص"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover saturate-[0.92] contrast-[1.05]"
                />
              </div>
            </div>
            <div className="absolute -bottom-3.5 right-6 bg-gold text-bg font-display text-xs md:text-sm px-4 py-1.5 tracking-wide">
              دمشق، سوريا
            </div>
          </div>

          <div className="order-2">
            <div className="flex items-center gap-2.5 text-gold-light text-sm tracking-[3px] mb-4 fade-up">
              <span className="w-6 h-px bg-gold-light" />
              فرقة روك سورية
            </div>
            <h1
              className="font-display leading-none mb-5 fade-up"
              style={{ fontSize: 'clamp(3rem, 6.5vw, 5.2rem)', animationDelay: '.16s' }}
            >
              أربعة <span className="text-gold-light">و نص</span>
            </h1>
            <p
              className="text-cream-dim text-base md:text-lg leading-loose max-w-[52ch] mb-7 fade-up"
              style={{ animationDelay: '.3s' }}
            >
              أربع عزّيفة ... ونصّهم بيغنّي, فرقة روك عربي طالعة من قلب دمشق
            </p>
            <div
              className="flex flex-wrap gap-6 mb-8 text-sm text-cream-dim fade-up"
              style={{ animationDelay: '.42s' }}
            >
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[19px] h-[19px] text-gold-light">
                  <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.4" />
                </svg>
                <strong className="text-cream font-bold">سوريا</strong>
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[19px] h-[19px] text-gold-light">
                  <path d="M6 3v11.5" />
                  <circle cx="6" cy="17.5" r="3" />
                  <path d="M6 3l12-1.2v10.7" />
                  <circle cx="18" cy="14.3" r="3" />
                </svg>
                <strong className="text-cream font-bold">4 أعضاء</strong>
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[19px] h-[19px] text-gold-light">
                  <rect x="9" y="2.5" width="6" height="11" rx="3" />
                  <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
                  <path d="M12 17.5V21M9 21h6" />
                </svg>
                <strong className="text-cream font-bold">روك حي</strong>
              </div>
            </div>
            <a
              href="https://www.instagram.com/arb3awnoss_band/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-gold px-5 py-3 text-sm font-bold hover:bg-gold hover:text-bg transition-colors fade-up"
              style={{ animationDelay: '.54s' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="1" />
              </svg>
              تابعونا على انستغرام
            </a>
          </div>
        </div>
      </section>

      <BestMediaSlider items={bestMedia} />
      <EventsSection completed={completed} upcoming={upcoming} />
      <DiscographySection />
      <Footer />
    </main>
  );
}
