import type { Metadata } from 'next';
import Image from 'next/image';
import Reveal from '@/components/Reveal';
import Footer from '@/components/Footer';

export const metadata: Metadata = { title: 'من نحن | أربعة و نص' };

const members = [
  {
    name: 'يزن القطان',
    role: 'ليد غيتار ومغني',
    instrument: 'غيتار',
    username: 'yazannmusic',
    url: 'https://www.instagram.com/yazannmusic/?hl=en',
    photo: '/assets/members/yazan.jpg',
  },
  {
    name: 'تيما ريماوي',
    role: 'بيسيست',
    instrument: 'بيس',
    username: 'timarimawi33',
    url: 'https://www.instagram.com/timarimawi33/?hl=en',
    photo: '/assets/members/tima.jpg',
  },
  {
    name: 'زين خلوف',
    role: 'كيبورديست ومغنية',
    instrument: 'كيبورد',
    username: 'zeine_k2',
    url: 'https://www.instagram.com/zeine_k2/?hl=en',
    photo: '/assets/members/zein.jpg',
  },
  {
    name: 'ليث قندلفت',
    role: 'درامر',
    instrument: 'درامز',
    username: 'laythkandalaft',
    url: 'https://www.instagram.com/laythkandalaft/?hl=en',
    photo: '/assets/members/laith.jpg',
  },
];

const InstaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6 flex-shrink-0">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="1" />
  </svg>
);

export default function AboutPage() {
  return (
    <main>
      <section className="pt-10 md:pt-14 pb-8 md:pb-10">
        <div className="max-w-[1160px] mx-auto px-5 md:px-7">

          <div>
            {members.map((m, i) => {
              const imgLeft = i % 2 === 0;
              return (
                <Reveal key={m.username}>
                  <div
                    className={`flex flex-col md:flex-row gap-9 md:gap-10 items-center md:items-stretch py-10 md:py-16 ${
                      i > 0 ? 'border-t border-[var(--line)] mt-2 md:pt-20' : 'pt-4 md:pt-6'
                    } ${imgLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div
                      className={`relative border border-[var(--line)] p-2.5 bg-gradient-to-b from-panel to-bg-soft max-w-[360px] md:max-w-[420px] w-full flex-shrink-0 ${
                        imgLeft ? 'md:-rotate-[1.6deg]' : 'md:rotate-[1.6deg]'
                      }`}
                    >
                      <span
                        className={`absolute -top-[18px] bg-bg border border-gold text-gold-light font-marker text-xl md:text-2xl tracking-wide px-4 pb-1 ${
                          imgLeft ? 'left-5 -rotate-2' : 'right-5 rotate-2'
                        }`}
                      >
                        {m.instrument}
                      </span>
                      <div className="relative w-full aspect-[3/4]">
                        <Image
                          src={m.photo}
                          alt={m.name}
                          fill
                          sizes="(max-width: 768px) 90vw, 420px"
                          className="object-cover grayscale-[0.1]"
                        />
                      </div>
                    </div>

                    <div
                      className={`flex-1 min-w-0 flex flex-col justify-center text-right ${
                        imgLeft ? 'md:text-right' : 'md:text-left'
                      }`}
                    >
                      <h3 className="font-display mb-4" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
                        {m.name}
                      </h3>
                      <div className="text-gold-light font-bold mb-8" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)' }}>
                        {m.role}
                      </div>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-3 text-cream hover:text-gold-light transition-colors self-start ${
                          imgLeft ? '' : 'md:self-end md:flex-row-reverse'
                        }`}
                        style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)' }}
                      >
                        <InstaIcon />
                        {m.username}@
                      </a>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
