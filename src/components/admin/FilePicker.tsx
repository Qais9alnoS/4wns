'use client';

import { useEffect, useId, useRef, useState } from 'react';

type FilePickerProps = {
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  /** When editing and no new file chosen, show this existing image URL as a tiny preview. */
  existingPreviewUrl?: string | null;
};

export default function FilePicker({
  accept = 'image/*',
  value,
  onChange,
  existingPreviewUrl,
}: FilePickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (!value.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const displayPreview = previewUrl || (!value ? existingPreviewUrl : null) || null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.files?.[0] || null);
  }

  function clear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center border border-[var(--line)] bg-bg-soft px-4 py-2 text-sm text-cream transition-colors hover:border-gold hover:text-gold-light"
      >
        اختار
      </label>

      {displayPreview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayPreview}
          alt="معاينة"
          className="h-10 w-10 shrink-0 border border-[var(--line)] object-cover"
        />
      ) : value && value.type.startsWith('video/') ? (
        <span className="text-sm text-cream-dim truncate max-w-[12rem]">{value.name}</span>
      ) : (
        <span className="text-sm text-cream-dim">لم يتم اختيار ملف</span>
      )}

      {value && (
        <button
          type="button"
          onClick={clear}
          className="text-xs text-cream-dim hover:text-cream underline underline-offset-2"
        >
          إزالة
        </button>
      )}
    </div>
  );
}
