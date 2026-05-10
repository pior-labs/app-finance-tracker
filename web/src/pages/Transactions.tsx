import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, type SelectOption } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Category {
  id: number;
  name: string;
}

interface CategoryResponse {
  data: Category[];
}

interface TransactionListItem {
  id: number;
  statementId: number;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: 'debit' | 'credit';
  categoryId: number | null;
  categoryName: string | null;
  status: 'needs_review' | 'confirmed';
}

interface TransactionsResponse {
  data: TransactionListItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface StatsResponse {
  meta: {
    month: string;
    availableMonths: string[];
  };
}

const PAGE_SIZE = 50;

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'confirmed', label: 'Confirmed' },
];

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function isValidMonth(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}$/.test(value);
}

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-');
  const parsed = new Date(Number(year), Number(monthNumber) - 1, 1);
  if (Number.isNaN(parsed.getTime())) return month;
  return parsed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function formatAmount(cents: number): string {
  const value = Math.abs(cents) / 100;
  const formatted = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [month, setMonth] = useState(() => {
    const fromQuery = searchParams.get('month');
    return isValidMonth(fromQuery) ? fromQuery : getCurrentMonth();
  });
  const [category, setCategory] = useState(() => searchParams.get('category') ?? 'all');
  const [status, setStatus] = useState(() => {
    const raw = searchParams.get('status');
    return raw && ['all', 'needs_review', 'confirmed'].includes(raw) ? raw : 'all';
  });
  const [offset, setOffset] = useState(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTransactionIds, setUpdatingTransactionIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesResponse, statsResponse] = await Promise.all([
          fetch('/api/categories', { credentials: 'include' }),
          fetch('/api/transactions/stats', { credentials: 'include' }),
        ]);
        if (!categoriesResponse.ok) throw new Error(`Failed to load categories (${categoriesResponse.status})`);
        if (!statsResponse.ok) throw new Error(`Failed to load months (${statsResponse.status})`);

        const categoriesPayload = (await categoriesResponse.json()) as CategoryResponse;
        const statsPayload = (await statsResponse.json()) as StatsResponse;
        setCategories(categoriesPayload.data);
        const monthSet = new Set<string>([statsPayload.meta.month, ...statsPayload.meta.availableMonths, getCurrentMonth()]);
        setAvailableMonths(Array.from(monthSet).sort((a, b) => b.localeCompare(a)));
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load filters');
      }
    };
    void fetchFilterData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('month', month);
    if (category !== 'all') params.set('category', category);
    if (status !== 'all') params.set('status', status);
    if (params.toString() !== searchParams.toString()) setSearchParams(params, { replace: true });
  }, [month, category, status, searchParams, setSearchParams]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', String(PAGE_SIZE));
        params.set('offset', String(offset));
        params.set('month', month);
        if (category !== 'all') params.set('category', category);
        if (status !== 'all') params.set('status', status);

        const response = await fetch(`/api/transactions?${params.toString()}`, { credentials: 'include' });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error((payload as { error?: string }).error ?? `Failed to load transactions (${response.status})`);
        }
        const payload = (await response.json()) as TransactionsResponse;
        setTransactions(payload.data);
        setTotal(payload.pagination.total);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    void fetchTransactions();
  }, [month, category, status, offset]);

  const categoryFilterOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [
      { value: 'all', label: 'All categories' },
      { value: 'uncategorized', label: 'Uncategorized' },
    ];
    for (const cat of categories) {
      options.push({ value: String(cat.id), label: cat.name });
    }
    return options;
  }, [categories]);

  const rowCategoryOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'uncategorized', label: 'Uncategorized' },
      ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
    ],
    [categories]
  );

  const monthOptions = useMemo<SelectOption[]>(() => {
    const monthSet = new Set<string>([month, ...availableMonths]);
    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((v) => ({ value: v, label: formatMonthLabel(v) }));
  }, [month, availableMonths]);

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrevious = offset > 0;
  const canGoNext = offset + PAGE_SIZE < total;

  const onFilterChange = (type: 'month' | 'category' | 'status', value: string) => {
    if (type === 'month') setMonth(value);
    else if (type === 'category') setCategory(value);
    else setStatus(value);
    setOffset(0);
  };

  const onCategoryAssign = async (transaction: TransactionListItem, selectedValue: string) => {
    const selectedCategoryId = selectedValue === 'uncategorized' ? null : Number(selectedValue);
    if (selectedValue !== 'uncategorized' && (!Number.isFinite(selectedCategoryId) || (selectedCategoryId as number) <= 0)) return;
    if (selectedCategoryId === transaction.categoryId && transaction.status === 'confirmed') return;

    setUpdatingTransactionIds((prev) => [...prev, transaction.id]);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: selectedCategoryId, status: selectedCategoryId === null ? 'needs_review' : 'confirmed' }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to update transaction (${response.status})`);
      }
      const payload = (await response.json()) as {
        data: { id: number; categoryId: number | null; categoryName: string | null; status: 'needs_review' | 'confirmed' };
      };
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === transaction.id
            ? { ...item, categoryId: payload.data.categoryId, categoryName: payload.data.categoryName, status: payload.data.status }
            : item
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update transaction');
    } finally {
      setUpdatingTransactionIds((prev) => prev.filter((id) => id !== transaction.id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters + summary */}
      <div className="flex flex-wrap items-center gap-3">
        <Select options={monthOptions} value={month} onChange={(e) => onFilterChange('month', e.target.value)} aria-label="Filter by month" variant="dashed" className="w-auto" />
        <Select options={categoryFilterOptions} value={category} onChange={(e) => onFilterChange('category', e.target.value)} aria-label="Filter by category" variant="dashed" className="w-auto" />
        <Select options={statusOptions} value={status} onChange={(e) => onFilterChange('status', e.target.value)} aria-label="Filter by status" variant="dashed" className="w-auto" />
        <div className="flex-1" />
        <Badge variant="warning">
          {transactions.filter((t) => t.status === 'needs_review').length} needs review
        </Badge>
        <Badge variant="success">
          ✓ {Math.round((transactions.filter((t) => t.status === 'confirmed').length / Math.max(transactions.length, 1)) * 100)}% complete
        </Badge>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">Loading transactions...</TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No transactions found.</TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => {
                  const isUpdating = updatingTransactionIds.includes(tx.id);
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-muted-foreground">{tx.date}</TableCell>
                      <TableCell>
                        <span className="font-hand text-lg leading-none">{tx.merchant ?? tx.description}</span>
                      </TableCell>
                      <TableCell className="max-w-80 truncate text-[11px] text-muted-foreground" title={tx.description}>
                        {tx.description}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <span className={tx.type === 'credit' ? 'text-good' : ''}>
                          {formatAmount(tx.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={tx.categoryId === null ? 'uncategorized' : String(tx.categoryId)}
                          options={rowCategoryOptions}
                          disabled={isUpdating}
                          variant={tx.categoryId === null ? 'dashed' : 'default'}
                          onChange={(e) => void onCategoryAssign(tx, e.target.value)}
                          aria-label={`Set category for transaction ${tx.id}`}
                          className="w-32.5"
                        />
                      </TableCell>
                      <TableCell>
                        {tx.status === 'confirmed' ? (
                          <Badge variant="success">✓ confirmed</Badge>
                        ) : (
                          <Badge variant="warning">needs review</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <button
                            className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm hover:bg-muted"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm text-primary hover:bg-primary-soft"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">☐ select all</Button>
          <Button variant="ghost" size="sm">↩ undo</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={!canGoPrevious} onClick={() => setOffset((p) => Math.max(0, p - PAGE_SIZE))}>
            ← prev
          </Button>
          <span className="text-[13px] text-muted-foreground">
            {pageNumber} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!canGoNext} onClick={() => setOffset((p) => p + PAGE_SIZE)}>
            next →
          </Button>
        </div>
      </div>
    </div>
  );
}
