import { memo, useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatMonthLabel, getCurrentMonth } from '../lib/format';

function DashboardHeaderComponent({
  month,
  monthLabel,
  isCurrentMonth,
  availableMonths,
  onPickMonth,
}: {
  month: string;
  monthLabel: string;
  isCurrentMonth: boolean;
  availableMonths: string[];
  onPickMonth: (month: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerActiveIndex, setPickerActiveIndex] = useState(0);
  const [pickerMenuStyle, setPickerMenuStyle] = useState<CSSProperties | undefined>();
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const pickerOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const updatePickerMenuPosition = useCallback(() => {
    const trigger = pickerTriggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 16;
    const menuWidth = Math.min(256, window.innerWidth - viewportPadding * 2);
    const centeredLeft = rect.left + rect.width / 2 - menuWidth / 2;
    const left = Math.min(
      Math.max(viewportPadding, centeredLeft),
      Math.max(viewportPadding, window.innerWidth - viewportPadding - menuWidth),
    );

    setPickerMenuStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left,
      width: menuWidth,
      maxHeight: Math.max(160, window.innerHeight - rect.bottom - 24),
      overflowY: 'auto',
    });
  }, []);

  const closePickerAndReturnFocus = () => {
    setPickerOpen(false);
    pickerTriggerRef.current?.focus();
  };

  const pickMonthAndClose = (nextMonth: string) => {
    onPickMonth(nextMonth);
    setPickerOpen(false);
    pickerTriggerRef.current?.focus();
  };

  const openPicker = (focusFirst?: 'selected' | 'first' | 'last') => {
    const idx =
      focusFirst === 'first'
        ? 0
        : focusFirst === 'last'
          ? Math.max(0, availableMonths.length - 1)
          : Math.max(0, availableMonths.indexOf(month));

    setPickerActiveIndex(idx);
    updatePickerMenuPosition();
    setPickerOpen(true);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker('selected');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openPicker('last');
    }
  };

  const onListboxKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (availableMonths.length === 0) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePickerAndReturnFocus();
      }
      return;
    }

    const last = availableMonths.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPickerActiveIndex((i) => (i >= last ? 0 : i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPickerActiveIndex((i) => (i <= 0 ? last : i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setPickerActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setPickerActiveIndex(last);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePickerAndReturnFocus();
    } else if (e.key === 'Tab') {
      setPickerOpen(false);
    }
  };

  useEffect(() => {
    if (!pickerOpen) return;
    updatePickerMenuPosition();

    const onViewportChange = () => updatePickerMenuPosition();
    const onDocClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange);
    };
  }, [pickerOpen, updatePickerMenuPosition]);

  useEffect(() => {
    if (!pickerOpen) return;
    const node = pickerOptionRefs.current[pickerActiveIndex];
    if (node) node.focus();
  }, [pickerOpen, pickerActiveIndex]);

  return (
    <header className="flex flex-wrap items-end justify-between gap-6 px-0.5 pt-3 sm:px-1">
      <div>
        <div className="text-[13px] tracking-wide text-ink-3">
          Overview · <em className="font-serif italic text-ink-2">{monthLabel}</em>
        </div>
        <h1 className="my-1.5 font-serif text-[36px] font-normal leading-none tracking-[-0.03em] text-ink sm:text-[44px] lg:text-[56px]">
          {isCurrentMonth ? 'This month' : <em className="font-light italic text-accent">{monthLabel}</em>}
        </h1>
        <p className="m-0 max-w-130 text-[15px] text-ink-2 sm:text-base">Your spending, at a glance.</p>
      </div>
      <div ref={pickerRef} className="relative">
        <button
          ref={pickerTriggerRef}
          type="button"
          onClick={() => (pickerOpen ? closePickerAndReturnFocus() : openPicker('selected'))}
          onKeyDown={onTriggerKeyDown}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-frost/80 bg-frost/55 px-4 py-2 font-serif text-[15px] italic text-ink shadow-[0_6px_18px_rgba(45,36,24,0.05)] backdrop-blur-xl hover:bg-frost/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-4.5 sm:text-[17px]"
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          aria-controls="finlens-month-listbox"
        >
          <span>{monthLabel}</span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 text-ink-3" strokeWidth={2.25} />
        </button>
        {pickerOpen && (
          <div
            id="finlens-month-listbox"
            role="listbox"
            aria-label="Choose month"
            tabIndex={-1}
            onKeyDown={onListboxKeyDown}
            style={pickerMenuStyle}
            className="z-20 rounded-[18px] border border-frost/80 bg-[rgba(var(--surface-rgb),0.92)] p-1.5 shadow-[0_14px_36px_-8px_rgba(45,36,24,0.18),inset_0_0_0_1px_rgba(var(--frost-rgb),0.5)] backdrop-blur-xl backdrop-saturate-150 focus-visible:outline-none"
          >
            {availableMonths.length === 0 ? (
              <div className="px-3 py-2.5 text-[13px] text-ink-3">No months yet</div>
            ) : (
              availableMonths.map((m, idx) => {
                const isSelected = m === month;
                const isCurrent = m === getCurrentMonth();

                return (
                  <button
                    key={m}
                    ref={(node) => {
                      pickerOptionRefs.current[idx] = node;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={pickerActiveIndex === idx ? 0 : -1}
                    onClick={() => pickMonthAndClose(m)}
                    onFocus={() => setPickerActiveIndex(idx)}
                    className={[
                      'flex w-full cursor-pointer items-center justify-between rounded-xl border-0 px-3 py-2.5 text-left text-sm font-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                      isSelected ? 'bg-ink text-cream' : 'bg-transparent text-ink hover:bg-ink/5',
                    ].join(' ')}
                  >
                    <span>{formatMonthLabel(m)}</span>
                    {isCurrent && (
                      <span
                        className={[
                          'font-serif text-[11px] italic',
                          isSelected ? 'text-cream/80' : 'text-ink-3',
                        ].join(' ')}
                      >
                        current
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export const DashboardHeader = memo(DashboardHeaderComponent);
