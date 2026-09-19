'use client';

import { useEffect, useState } from 'react';
import type { Event } from '@prisma/client';
import { fileToDataUri } from '@/lib/fileToDataUri';

const emptyForm = {
  name: '',
  date: '',
  time: '',
  location: '',
  description: '',
  instagramDmUrl: '',
  status: 'UPCOMING' as 'UPCOMING' | 'COMPLETED',
};

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(
      (data.events || []).sort((a: Event, b: Event) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(ev: Event) {
    setEditingId(ev.id);
    setForm({
      name: ev.name,
      date: new Date(ev.date).toISOString().slice(0, 10),
      time: ev.time || '',
      location: ev.location || '',
      description: ev.description || '',
      instagramDmUrl: ev.instagramDmUrl,
      status: ev.status,
    });
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setImage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (image) payload.image = await fileToDataUri(image);

      const res = await fetch(editingId ? `/api/events/${editingId}` : '/api/events', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل الحفظ');
        setSubmitting(false);
        return;
      }
      resetForm();
      await load();
    } catch {
      setError('حدث خطأ أثناء الحفظ');
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('هل تريد حذف هذا الحدث؟')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (editingId === id) resetForm();
    load();
  }

  async function toggleStatus(ev: Event) {
    const newStatus = ev.status === 'UPCOMING' ? 'COMPLETED' : 'UPCOMING';
    await fetch(`/api/events/${ev.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="border border-[var(--line)] bg-panel p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h3 className="md:col-span-2 font-display text-lg">{editingId ? 'تعديل حدث' : 'إضافة حدث جديد'}</h3>

        {error && <div className="md:col-span-2 text-sm text-red-300 bg-red-900/20 border border-red-800 px-3 py-2 rounded">{error}</div>}

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الاسم</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">التاريخ</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الوقت (اختياري)</label>
          <input
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            placeholder="مثال: 8:00 مساءً"
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الموقع (اختياري)</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-cream-dim mb-1.5">التفاصيل / الوصف (اختياري)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">رابط Instagram DM</label>
          <input
            value={form.instagramDmUrl}
            onChange={(e) => setForm({ ...form, instagramDmUrl: e.target.value })}
            required
            placeholder="https://ig.me/m/..."
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الحالة</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'UPCOMING' | 'COMPLETED' })}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          >
            <option value="UPCOMING">قادم</option>
            <option value="COMPLETED">منتهي</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-cream-dim mb-1.5">
            صورة الحدث {editingId ? '(اتركها فارغة للإبقاء على الصورة الحالية)' : '(اختياري)'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full text-sm text-cream-dim"
          />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-gold text-bg font-bold py-2.5 hover:bg-gold-light transition-colors disabled:opacity-60"
          >
            {submitting ? 'جارِ الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة الحدث'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 border border-[var(--line)] text-cream-dim hover:border-gold"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-cream-dim text-sm">جارِ التحميل...</p>
      ) : events.length === 0 ? (
        <p className="text-cream-dim text-sm">لا توجد أحداث بعد.</p>
      ) : (
        <div className="overflow-x-auto admin-scroll">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-cream-dim text-right border-b border-[var(--line)]">
                <th className="py-2 pl-3">الاسم</th>
                <th className="py-2 pl-3">التاريخ</th>
                <th className="py-2 pl-3">الحالة</th>
                <th className="py-2 pl-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-[var(--line)]">
                  <td className="py-2.5 pl-3">{ev.name}</td>
                  <td className="py-2.5 pl-3 text-cream-dim">
                    {new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' }).format(
                      new Date(ev.date)
                    )}
                  </td>
                  <td className="py-2.5 pl-3">
                    <button
                      onClick={() => toggleStatus(ev)}
                      className={`text-xs px-2 py-1 border ${
                        ev.status === 'UPCOMING' ? 'border-gold text-gold-light' : 'border-[var(--line)] text-cream-dim'
                      }`}
                    >
                      {ev.status === 'UPCOMING' ? 'قادم' : 'منتهي'}
                    </button>
                  </td>
                  <td className="py-2.5 pl-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(ev)} className="text-xs border border-[var(--line)] px-2.5 py-1 hover:border-gold">
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="text-xs border border-red-800 text-red-300 px-2.5 py-1 hover:bg-red-900/30"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
