import { memo, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Category } from '../types';

interface DeleteCategoryModalProps {
  category: Category;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteCategoryModal = memo(function DeleteCategoryModal({
  category,
  deleting,
  onClose,
  onConfirm,
}: DeleteCategoryModalProps) {
  useEffect(() => {
    if (deleting) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleting, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-category-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(45,36,24,0.3)', backdropFilter: 'blur(6px)' }}
        onClick={() => {
          if (!deleting) onClose();
        }}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-md rounded-t-[28px] border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-[28px] sm:p-7 sm:pb-7"
        style={{
          background: 'rgba(255,253,247,0.94)',
          borderColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          boxShadow: '0 24px 60px -12px rgba(45,36,24,0.25), inset 0 0 0 1px rgba(255,255,255,0.5)',
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <h2
            id="delete-category-title"
            className="m-0 text-[22px] font-normal sm:text-2xl"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            Delete category?
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 text-sm transition-colors hover:bg-white/80 disabled:opacity-50 sm:h-7 sm:w-7 sm:text-xs"
            style={{ color: 'var(--ink-3)', touchAction: 'manipulation' }}
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
          </button>
        </div>
        <p className="text-sm" style={{ color: 'var(--ink-2)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--ink)' }}>{category.name}</strong>?
        </p>
        <p className="mt-2 text-xs" style={{ color: 'var(--ink-3)' }}>
          Transactions in this category will be moved to <strong>Other</strong>.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="min-h-11 cursor-pointer rounded-full border bg-transparent px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/50 disabled:opacity-50"
            style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)', touchAction: 'manipulation' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-0 px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 disabled:cursor-default disabled:opacity-50"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: 'var(--accent)',
              color: 'white',
              boxShadow: '0 6px 18px -6px rgba(197,112,74,0.4)',
              touchAction: 'manipulation',
            }}
          >
            {deleting ? 'Deleting...' : 'Yes, delete'}
          </button>
        </div>
      </div>
    </div>
  );
});
