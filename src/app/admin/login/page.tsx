'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل تسجيل الدخول');
        setLoading(false);
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('حدث خطأ، حاول مجددًا');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 bg-bg">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-[var(--line)] bg-panel p-8">
        <h1 className="font-display text-2xl mb-1 text-center">لوحة التحكم</h1>
        <p className="text-cream-dim text-sm text-center mb-6">أربعة و نص</p>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-800 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <label className="block text-sm text-cream-dim mb-1.5">اسم المستخدم</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 bg-bg-soft border border-[var(--line)] px-3 py-2.5 text-cream focus:border-gold outline-none"
          autoComplete="username"
          required
        />

        <label className="block text-sm text-cream-dim mb-1.5">كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 bg-bg-soft border border-[var(--line)] px-3 py-2.5 text-cream focus:border-gold outline-none"
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-bg font-bold py-2.5 hover:bg-gold-light transition-colors disabled:opacity-60"
        >
          {loading ? 'جارِ الدخول...' : 'دخول'}
        </button>
      </form>
    </main>
  );
}
