import { memo, useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { lighten } from '../lib/format';
import type { Category } from '../types';

interface CategoryPickerProps {
  categories: Category[];
  favoriteCategories: Category[];
  isLocked: boolean;
  onAssign: (categoryId: number) => void;
}

export const CategoryPicker = memo(function CategoryPicker({
  categories,
  favoriteCategories,
  isLocked,
  onAssign,
}: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const closeAndReturnFocus = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback((focus: 'first' | 'last' | 'current' = 'current') => {
    const last = categories.length - 1;
    if (last < 0) {
      setActiveIndex(0);
    } else if (focus === 'first') {
      setActiveIndex(0);
    } else if (focus === 'last') {
      setActiveIndex(last);
    } else {
      setActiveIndex((idx) => Math.max(0, Math.min(idx, last)));
    }
    setIsOpen(true);
  }, [categories.length]);

  const onTriggerKeyDown = useCallback((e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (isLocked) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu('first');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openMenu('last');
    }
  }, [isLocked, openMenu]);

  const onListboxKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isLocked) return;
    if (categories.length === 0) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAndReturnFocus();
      }
      return;
    }
    const last = categories.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i >= last ? 0 : i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? last : i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(last);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeAndReturnFocus();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const category = categories[activeIndex];
      if (!category) return;
      onAssign(category.id);
      closeAndReturnFocus();
    }
  }, [activeIndex, categories, closeAndReturnFocus, isLocked, onAssign]);

  useEffect(() => {
    if (!isOpen) return;
    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen]);

  return (
    <div className="relative z-10 px-5 pb-6 sm:px-7 sm:pb-7 md:px-9">
      <div
        className="mb-3 text-[13px] italic sm:mb-3.5 sm:text-sm"
        style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
      >
        Pick a category
      </div>
      <div className="flex flex-wrap gap-2">
        {favoriteCategories.map((cat, i) => (
          <button
            key={cat.id}
            type="button"
            disabled={isLocked}
            onClick={() => onAssign(cat.id)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-[15px] font-medium transition-all enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:scale-[1.03] enabled:active:translate-y-0 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-0 sm:text-sm motion-reduce:transform-none motion-reduce:transition-none"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: 'var(--ink)',
              borderColor: 'rgba(255,255,255,0.7)',
              background: `linear-gradient(135deg, ${lighten(cat.color, 0.7)}, ${lighten(cat.color, 0.82)})`,
              boxShadow: '0 4px 14px -4px rgba(45,36,24,0.1)',
              touchAction: 'manipulation',
            }}
          >
            <span
              aria-hidden="true"
              className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs md:inline-flex"
              style={{
                fontFamily: "'Fraunces', serif",
                background: 'rgba(255,255,255,0.65)',
                color: 'var(--ink-2)',
                boxShadow: 'inset 0 0 0 1px rgba(45,36,24,0.08)',
              }}
            >
              {i === 9 ? 0 : i + 1}
            </span>
            <span
              aria-hidden="true"
              className="mr-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: cat.color, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)' }}
            />
            <span className="whitespace-nowrap">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="relative mt-4" ref={menuRef}>
        <button
          ref={triggerRef}
          type="button"
          disabled={isLocked}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="categorize-category-listbox"
          onClick={() => (isOpen ? closeAndReturnFocus() : openMenu('current'))}
          onKeyDown={onTriggerKeyDown}
          className="flex min-h-11 w-full items-center justify-between rounded-full border px-5 py-2.5 text-sm italic transition-colors enabled:cursor-pointer enabled:hover:bg-white/75 disabled:cursor-not-allowed disabled:opacity-55"
          style={{
            fontFamily: "'Fraunces', serif",
            color: 'var(--ink-3)',
            background: 'rgba(255,255,255,0.5)',
            borderColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            touchAction: 'manipulation',
          }}
        >
          <span>All {categories.length} categories</span>
          {isOpen ? (
            <ChevronUp aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
          ) : (
            <ChevronDown aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
          )}
        </button>
        {isOpen ? (
          <div
            id="categorize-category-listbox"
            role="listbox"
            aria-label="Choose category"
            tabIndex={-1}
            onKeyDown={onListboxKeyDown}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-65 overflow-y-auto rounded-[22px] border p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none"
            style={{
              background: 'rgba(255,253,247,0.94)',
              borderColor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(24px) saturate(140%)',
              boxShadow: '0 16px 44px -10px rgba(45,36,24,0.2), inset 0 0 0 1px rgba(255,255,255,0.5)',
            }}
          >
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                ref={(node) => {
                  optionRefs.current[idx] = node;
                }}
                type="button"
                role="option"
                aria-selected={activeIndex === idx}
                tabIndex={activeIndex === idx ? 0 : -1}
                onFocus={() => setActiveIndex(idx)}
                disabled={isLocked}
                className="flex min-h-11 w-full items-center gap-2.5 rounded-[14px] border-0 bg-transparent px-3.5 py-2.5 text-left text-sm transition-colors enabled:cursor-pointer enabled:hover:bg-[rgba(45,36,24,0.06)] disabled:cursor-not-allowed disabled:opacity-55"
                style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)', touchAction: 'manipulation' }}
                onClick={() => {
                  onAssign(cat.id);
                  closeAndReturnFocus();
                }}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: cat.color, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)' }}
                />
                {cat.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
});
