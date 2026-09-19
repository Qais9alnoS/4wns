export default function Footer() {
  return (
    <footer className="py-11 md:py-14 border-t border-[var(--line)] text-center">
      <div className="max-w-[1160px] mx-auto px-5">
        <div className="font-display text-2xl mb-3">أربعة و نص</div>
        <a
          href="https://www.instagram.com/arb3awnoss_band/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-gold-light text-sm mb-6"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.4" cy="6.6" r="1" />
          </svg>
          arb3awnoss_band
        </a>
        <div className="text-cream-dim text-xs opacity-70 pt-4 border-t border-[var(--line)]">
          دمشق، سوريا
        </div>
      </div>
    </footer>
  );
}
