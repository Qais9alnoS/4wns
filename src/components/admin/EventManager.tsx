'use client';

import { useEffect, useState } from 'react';
import type { Event } from '@prisma/client';
import { fileToDataUri } from '@/lib/fileToDataUri';
import FilePicker from './FilePicker';

const emptyForm = {
  name: '',
  date: '',
  time: '',
  location: '',
  description: '',
  instagramDmUrl: '',
  status: 'UPCOMING' as 'UPCOMING' | 'COMPLETED',
};

type FormState = typeof emptyForm;

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [image, setImage] = useState<File | null>(null);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  function openEdit(ev: Event) {
    setEditingEvent(ev);
    setEditForm({
      name: ev.name,
      date: new Date(ev.date).toISOString().slice(0, 10),
      time: ev.time || '',
      location: ev.location || '',
      description: ev.description || '',
      instagramDmUrl: ev.instagramDmUrl || '',
      status: ev.status,
    });
    setEditImage(null);
    setEditError('');
  }

  function closeEdit() {
    setEditingEvent(null);
    setEditForm(emptyForm);
    setEditImage(null);
    setEditError('');
  }

  function resetCreateForm() {
    setForm(emptyForm);
    setImage(null);
    setError('');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (image) payload.image = await fileToDataUri(image);

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل الحفظ');
        setSubmitting(false);
        return;
      }
      resetCreateForm();
      await load();
    } catch {
      setError('حدث خطأ أثناء الحفظ');
    }
    setSubmitting(false);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEvent) return;
    setEditError('');
    setEditSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...editForm };
      if (editImage) payload.image = await fileToDataUri(editImage);

      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'فشل الحفظ');
        setEditSubmitting(false);
        return;
      }
      closeEdit();
      await load();
    } catch {
      setEditError('حدث خطأ أثناء الحفظ');
    }
    setEditSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('هل تريد حذف هذا الحدث؟')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (editingEvent?.id === id) closeEdit();
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

  function renderFields(
    state: FormState,
    setState: React.Dispatch<React.SetStateAction<FormState>>,
    file: File | null,
    setFile: (f: File | null) => void,
    opts?: { imageHint?: string; existingPreviewUrl?: string | null }
  ) {
    return (
      <>
        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الاسم</label>
          <input
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            required
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">التاريخ</label>
          <input
            type="date"
            value={state.date}
            onChange={(e) => setState({ ...state, date: e.target.value })}
            required
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الوقت (اختياري)</label>
          <input
            value={state.time}
            onChange={(e) => setState({ ...state, time: e.target.value })}
            placeholder="مثال: 8:00 مساءً"
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الموقع (اختياري)</label>
          <input
            value={state.location}
            onChange={(e) => setState({ ...state, location: e.target.value })}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-cream-dim mb-1.5">التفاصيل / الوصف (اختياري)</label>
          <textarea
            value={state.description}
            onChange={(e) => setState({ ...state, description: e.target.value })}
            rows={2}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">رابط Instagram DM (اختياري)</label>
          <input
            value={state.instagramDmUrl}
            onChange={(e) => setState({ ...state, instagramDmUrl: e.target.value })}
            placeholder="https://ig.me/m/..."
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الحالة</label>
          <select
            value={state.status}
            onChange={(e) => setState({ ...state, status: e.target.value as 'UPCOMING' | 'COMPLETED' })}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          >
            <option value="UPCOMING">قادم</option>
            <option value="COMPLETED">منتهي</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-cream-dim mb-1.5">
            صورة الحدث {opts?.imageHint ?? '(اختياري)'}
          </label>
          <FilePicker
            accept="image/*"
            value={file}
            onChange={setFile}
            existingPreviewUrl={opts?.existingPreviewUrl}
          />
        </div>
      </>
    );
  }

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className="border border-[var(--line)] bg-panel p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <h3 className="md:col-span-2 font-display text-lg">إضافة حدث جديد</h3>

        {error && (
          <div className="md:col-span-2 text-sm text-red-300 bg-red-900/20 border border-red-800 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {renderFields(form, setForm, image, setImage)}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-bg font-bold py-2.5 hover:bg-gold-light transition-colors disabled:opacity-60"
          >
            {submitting ? 'جارِ الحفظ...' : 'إضافة الحدث'}
          </button>
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
                      <button
                        onClick={() => openEdit(ev)}
                        className="text-xs border border-[var(--line)] px-2.5 py-1 hover:border-gold"
                      >
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

      {editingEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={(e) => {
            if (e.target === e.currentTarget && !editSubmitting) closeEdit();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-event-title"
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--line)] bg-panel p-5 admin-scroll"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="edit-event-title" className="font-display text-lg">
                تعديل حدث
              </h3>
              <button
                type="button"
                onClick={closeEdit}
                disabled={editSubmitting}
                className="text-cream-dim hover:text-cream text-sm px-2 py-1 border border-transparent hover:border-[var(--line)]"
              >
                إغلاق
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editError && (
                <div className="md:col-span-2 text-sm text-red-300 bg-red-900/20 border border-red-800 px-3 py-2 rounded">
                  {editError}
                </div>
              )}

              {renderFields(editForm, setEditForm, editImage, setEditImage, {
                imageHint: '(اتركها فارغة للإبقاء على الصورة الحالية)',
                existingPreviewUrl: editingEvent.imageUrl,
              })}

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 bg-gold text-bg font-bold py-2.5 hover:bg-gold-light transition-colors disabled:opacity-60"
                >
                  {editSubmitting ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={editSubmitting}
                  className="px-5 border border-[var(--line)] text-cream-dim hover:border-gold disabled:opacity-60"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
