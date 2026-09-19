'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: 'الرئيسية' },
  { href: '/gallery', label: 'المعرض' },
  { href: '/about', label: 'من نحن' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-[100] backdrop-blur-md bg-bg/72 border-b border-[var(--line)]">
      <div className="max-w-[1160px] mx-auto flex items-center justify-between gap-3 px-5 md:px-7 py-3">
        <button
          className="md:hidden text-cream text-2xl leading-none px-1"
          aria-label="القائمة"
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>

        <nav className={`${open ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:static top-full inset-x-0 md:inset-auto bg-bg md:bg-transparent border-b md:border-0 border-[var(--line)] gap-1 md:gap-6 px-5 md:px-0 py-3 md:py-0`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`py-2 md:py-0 text-sm tracking-wide transition-colors hover:text-gold-light ${
                pathname === l.href ? 'text-gold-light' : 'text-cream-dim'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="flex items-center gap-3">
          <span className="font-display text-xl md:text-2xl tracking-wide">
            أربعة <span className="text-gold-light">و نص</span>
          </span>
          <span className="w-11 h-11 rounded-full overflow-hidden border border-[var(--line)] flex-shrink-0 relative bg-panel">
            <Image src="/assets/logo/logo.jpg" alt="شعار فرقة أربعة و نص" fill sizes="44px" className="object-cover" />
          </span>
        </Link>
      </div>
    </header>
  );
}
