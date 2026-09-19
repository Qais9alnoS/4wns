export default function Footer() {
  return (
    <footer className="py-11 md:py-14 border-t border-[var(--line)] bg-bg">
      <div
        dir="ltr"
        className="max-w-[1160px] mx-auto px-5 flex flex-col md:flex-row md:items-center md:justify-center gap-6 md:gap-10"
      >
        <div dir="rtl" className="text-center md:text-left">
          <div className="font-display text-2xl mb-3">أربعة و نص</div>
          <a
            href="https://www.instagram.com/arb3awnoss_band/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold-light text-sm mb-3"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.4" cy="6.6" r="1" />
            </svg>
            arb3awnoss_band
          </a>
          <div className="text-cream-dim text-xs opacity-70">دمشق، سوريا</div>
        </div>

        <div className="hidden md:block self-stretch w-px bg-[var(--line)]" aria-hidden />

        <a
          href="https://rizonway.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
        >
          <p className="text-gold-light text-xs md:text-sm font-bold leading-snug max-w-[14rem] text-right">
            This Website Made By Rizonway Team
          </p>
          <div
            className="w-14 h-14 shrink-0 bg-gold-light"
            style={{
              WebkitMaskImage: "url('/assets/rizonway (1).svg')",
              maskImage: "url('/assets/rizonway (1).svg')",
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskMode: 'luminance',
              maskMode: 'luminance',
            }}
            aria-hidden
          />
        </a>
      </div>
    </footer>
  );
}
