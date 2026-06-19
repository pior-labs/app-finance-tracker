import { memo } from 'react';
import { Search } from 'lucide-react';
import { statusOptions } from '../lib/constants';
import type { SelectOption } from '../types';

interface TransactionsFiltersProps {
  merchant: string;
  month: string;
  category: string;
  status: string;
  monthOptions: SelectOption[];
  categoryFilterOptions: SelectOption[];
  onMerchantChange: (value: string) => void;
  onFilterChange: (type: 'month' | 'category' | 'status', value: string) => void;
}

export const TransactionsFilters = memo(function TransactionsFilters({
  merchant,
  month,
  category,
  status,
  monthOptions,
  categoryFilterOptions,
  onMerchantChange,
  onFilterChange,
}: TransactionsFiltersProps) {
  return (
    <div
      className="flex flex-col gap-2 rounded-[28px] border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5 sm:rounded-full sm:px-4 sm:py-2.5"
      style={{
        background: 'rgba(var(--surface-rgb),0.55)',
        borderColor: 'rgba(var(--frost-rgb),0.8)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        boxShadow: '0 6px 22px -8px rgba(45,36,24,0.08)',
      }}
    >
      <div className="relative w-full sm:w-auto">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: 'var(--ink-3)' }}
          strokeWidth={2}
        />
        <input
          value={merchant}
          onChange={(event) => onMerchantChange(event.target.value)}
          placeholder="Search merchant..."
          aria-label="Search by merchant"
          inputMode="search"
          className="h-11 w-full rounded-full border-0 bg-frost/50 pl-9 pr-3 text-[15px] outline-none transition-colors placeholder:text-ink-3 focus:bg-frost/80 focus:ring-2 focus:ring-(--accent)/30 sm:h-9 sm:w-44 sm:pl-8 sm:text-sm"
          style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)' }}
        />
      </div>

      <div className="hidden h-5 w-px bg-[rgba(45,36,24,0.1)] sm:block" />

      <div className="grid grid-cols-1 gap-2 sm:contents">
        <select
          value={month}
          onChange={(event) => onFilterChange('month', event.target.value)}
          aria-label="Filter by month"
          className="h-11 min-w-0 cursor-pointer appearance-none rounded-full border-0 bg-frost/40 px-3.5 pr-7 text-[15px] outline-none transition-colors hover:bg-frost/70 focus:ring-2 focus:ring-(--accent)/30 sm:h-9 sm:text-sm"
          style={{ fontFamily: "'Outfit', sans-serif", color: month === 'all' ? 'var(--ink-3)' : 'var(--ink)', touchAction: 'manipulation' }}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={category}
          onChange={(event) => onFilterChange('category', event.target.value)}
          aria-label="Filter by category"
          className="h-11 min-w-0 cursor-pointer appearance-none rounded-full border-0 bg-frost/40 px-3.5 pr-7 text-[15px] outline-none transition-colors hover:bg-frost/70 focus:ring-2 focus:ring-(--accent)/30 sm:h-9 sm:text-sm"
          style={{ fontFamily: "'Outfit', sans-serif", color: category === 'all' ? 'var(--ink-3)' : 'var(--ink)', touchAction: 'manipulation' }}
        >
          {categoryFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => onFilterChange('status', event.target.value)}
          aria-label="Filter by status"
          className="h-11 min-w-0 cursor-pointer appearance-none rounded-full border-0 bg-frost/40 px-3.5 pr-7 text-[15px] outline-none transition-colors hover:bg-frost/70 focus:ring-2 focus:ring-(--accent)/30 sm:h-9 sm:text-sm"
          style={{ fontFamily: "'Outfit', sans-serif", color: status === 'all' ? 'var(--ink-3)' : 'var(--ink)', touchAction: 'manipulation' }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
});
