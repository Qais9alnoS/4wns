'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MediaManager from '@/components/admin/MediaManager';
import EventManager from '@/components/admin/EventManager';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'media' | 'events'>('media');

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen px-5 md:px-7 py-8 max-w-[1160px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl">لوحة التحكم — أربعة و نص</h1>
        <button
          onClick={handleLogout}
          className="text-sm border border-[var(--line)] px-4 py-2 hover:border-gold text-cream-dim hover:text-cream transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-[var(--line)]">
        <button
          onClick={() => setTab('media')}
          className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
            tab === 'media' ? 'border-gold-light text-gold-light' : 'border-transparent text-cream-dim'
          }`}
        >
          إدارة الوسائط (Gallery)
        </button>
        <button
          onClick={() => setTab('events')}
          className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
            tab === 'events' ? 'border-gold-light text-gold-light' : 'border-transparent text-cream-dim'
          }`}
        >
          إدارة الحفلات (Events)
        </button>
      </div>

      {tab === 'media' ? <MediaManager /> : <EventManager />}
    </main>
  );
}
