import type { Metadata } from 'next';
import { Cairo, Lalezar, Jomhuria } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

const lalezar = Lalezar({
  subsets: ['arabic', 'latin'],
  weight: '400',
  variable: '--font-lalezar',
  display: 'swap',
});

const jomhuria = Jomhuria({
  subsets: ['arabic', 'latin'],
  weight: '400',
  variable: '--font-jomhuria',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'أربعة و نص | فرقة روك - دمشق',
  description: 'أربعة عازفين... ونصّهم بيغنّي. فرقة روك سورية طالعة من قلب دمشق.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${lalezar.variable} ${jomhuria.variable} font-cairo bg-bg text-cream`}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
