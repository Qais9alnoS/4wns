'use client';

import { useEffect, useState } from 'react';
import type { Media } from '@prisma/client';
import FilePicker from './FilePicker';

const BEST_LIMIT = 5;

export default function MediaManager() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // add-form state
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [details, setDetails] = useState('');
  const [isBest, setIsBest] = useState(false);

  // edit state
  const [editing, setEditing] = useState<Media | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDetails, setEditDetails] = useState('');

  const bestCount = items.filter((m) => m.isBest).length;

  async function load() {
    setLoading(true);
    const res = await fetch('/api/media');
    const data = await res.json();
    setItems(data.media || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('الرجاء اختيار ملف');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('type', type);
      form.append('description', description);
      form.append('date', date);
      form.append('details', details);
      form.append('isBest', String(isBest));
      const res = await fetch('/api/media', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل الرفع');
        setSubmitting(false);
        return;
      }
      setFile(null);
      setDescription('');
      setDate('');
      setDetails('');
      setIsBest(false);
      await load();
    } catch {
      setError('حدث خطأ أثناء الرفع');
    }
    setSubmitting(false);
  }

  async function toggleBest(item: Media) {
    setError('');
    const res = await fetch(`/api/media/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBest: !item.isBest }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'فشل التحديث');
      return;
    }
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('هل تريد حذف هذا العنصر؟')) return;
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
    load();
  }

  function handleEdit(item: Media) {
    setEditing(item);
    setEditDescription(item.description || '');
    setEditDate(item.date ? new Date(item.date).toISOString().split('T')[0] : '');
    setEditDetails(item.details || '');
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/media/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editDescription,
          date: editDate || null,
          details: editDetails,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل التحديث');
        setSubmitting(false);
        return;
      }
      setEditing(null);
      await load();
    } catch {
      setError('حدث خطأ أثناء التحديث');
    }
    setSubmitting(false);
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="border border-[var(--line)] bg-panel p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h3 className="md:col-span-2 font-display text-lg">إضافة وسائط جديدة</h3>

        {error && <div className="md:col-span-2 text-sm text-red-300 bg-red-900/20 border border-red-800 px-3 py-2 rounded">{error}</div>}

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الملف</label>
          <FilePicker accept="image/*,video/*" value={file} onChange={setFile} />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">النوع</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'IMAGE' | 'VIDEO')}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          >
            <option value="IMAGE">صورة</option>
            <option value="VIDEO">فيديو</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">الوصف (اختياري)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div>
          <label className="block text-sm text-cream-dim mb-1.5">التاريخ (اختياري)</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-cream-dim mb-1.5">تفاصيل إضافية (اختياري)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={2}
            className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-cream-dim">
          <input
            type="checkbox"
            checked={isBest}
            onChange={(e) => setIsBest(e.target.checked)}
            disabled={bestCount >= BEST_LIMIT}
          />
          تحديد كـ Best ({bestCount}/{BEST_LIMIT})
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 bg-gold text-bg font-bold py-2.5 hover:bg-gold-light transition-colors disabled:opacity-60"
        >
          {submitting ? 'جارِ الرفع...' : 'رفع'}
        </button>
      </form>

      {editing && (
        <form onSubmit={handleUpdate} className="border border-gold bg-panel p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h3 className="md:col-span-2 font-display text-lg">تعديل الوسائط</h3>

          {error && <div className="md:col-span-2 text-sm text-red-300 bg-red-900/20 border border-red-800 px-3 py-2 rounded">{error}</div>}

          <div className="md:col-span-2">
            <div className="relative w-full aspect-video bg-bg-soft mb-2 overflow-hidden">
              {editing.type === 'VIDEO' ? (
                <video src={editing.cloudinaryUrl} className="w-full h-full object-contain" controls />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editing.cloudinaryUrl} alt="" className="w-full h-full object-contain" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-cream-dim mb-1.5">الوصف (اختياري)</label>
            <input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
            />
          </div>

          <div>
            <label className="block text-sm text-cream-dim mb-1.5">التاريخ (اختياري)</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-cream-dim mb-1.5">تفاصيل إضافية (اختياري)</label>
            <textarea
              value={editDetails}
              onChange={(e) => setEditDetails(e.target.value)}
              rows={2}
              className="w-full bg-bg-soft border border-[var(--line)] px-3 py-2 text-cream"
            />
          </div>

          <button
            type="button"
            onClick={() => setEditing(null)}
            className="bg-bg-soft border border-[var(--line)] py-2.5 hover:border-cream transition-colors"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="bg-gold text-bg font-bold py-2.5 hover:bg-gold-light transition-colors disabled:opacity-60"
          >
            {submitting ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-cream-dim text-sm">جارِ التحميل...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border border-[var(--line)] bg-panel p-2">
              <div className="relative w-full aspect-square bg-bg-soft mb-2 overflow-hidden">
                {item.type === 'VIDEO' ? (
                  <video src={item.cloudinaryUrl} className="w-full h-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.cloudinaryUrl} alt="" className="w-full h-full object-cover" />
                )}
                {item.isBest && (
                  <span className="absolute top-1.5 right-1.5 bg-gold text-bg text-xs px-2 py-0.5 rounded">Best</span>
                )}
              </div>
              {item.description && <p className="text-xs text-cream-dim mb-1 truncate">{item.description}</p>}
              <div className="flex gap-1.5">
                <button
                  onClick={() => toggleBest(item)}
                  disabled={!item.isBest && bestCount >= BEST_LIMIT}
                  className="flex-1 text-xs border border-[var(--line)] py-1 hover:border-gold disabled:opacity-40"
                >
                  {item.isBest ? 'إزالة Best' : 'جعل Best'}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 text-xs border border-[var(--line)] py-1 hover:border-gold"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 text-xs border border-red-800 text-red-300 py-1 hover:bg-red-900/30"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
