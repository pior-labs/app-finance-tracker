import type { SelectOption } from '../types';

export const PAGE_SIZE = 15;
export const MERCHANT_DEBOUNCE_MS = 300;

export const statusOptions: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'confirmed', label: 'Confirmed' },
];
