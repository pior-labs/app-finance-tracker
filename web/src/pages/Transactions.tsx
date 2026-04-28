import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  amount: number;
  type: 'debit' | 'credit';
  categoryId: number | null;
  categoryName: string | null;
  status: 'needs_review' | 'auto_categorized' | 'confirmed';
  categorizedBy: 'human' | 'ai' | null;
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

interface PatchTransactionResponse {
  data: {
    id: number;
    categoryId: number | null;
    categoryName: string | null;
    status: 'needs_review' | 'auto_categorized' | 'confirmed';
    categorizedBy: 'human' | 'ai' | null;
  };
}

const PAGE_SIZE = 50;

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'confirmed', label: 'Confirmed' }
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
  if (Number.isNaN(parsed.getTime())) {
    return month;
  }

  return parsed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function formatAmount(cents: number): string {
  const value = Math.abs(cents) / 100;
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatStatus(status: TransactionListItem['status']): string {
  if (status === 'needs_review') {
    return 'Needs review';
  }
  if (status === 'confirmed') {
    return 'Confirmed';
  }
  return 'Auto categorized';
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
          fetch('/api/transactions/stats', { credentials: 'include' })
        ]);

        if (!categoriesResponse.ok) {
          throw new Error(`Failed to load categories (${categoriesResponse.status})`);
        }
        if (!statsResponse.ok) {
          throw new Error(`Failed to load months (${statsResponse.status})`);
        }

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
    if (category !== 'all') {
      params.set('category', category);
    }
    if (status !== 'all') {
      params.set('status', status);
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
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
        if (category !== 'all') {
          params.set('category', category);
        }
        if (status !== 'all') {
          params.set('status', status);
        }

        const response = await fetch(`/api/transactions?${params.toString()}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message = (payload as { error?: string }).error ?? `Failed to load transactions (${response.status})`;
          throw new Error(message);
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
      { value: 'uncategorized', label: 'Uncategorized' }
    ];

    for (const categoryOption of categories) {
      options.push({
        value: String(categoryOption.id),
        label: categoryOption.name
      });
    }

    return options;
  }, [categories]);

  const rowCategoryOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'uncategorized', label: 'Uncategorized' },
      ...categories.map((categoryOption) => ({
        value: String(categoryOption.id),
        label: categoryOption.name
      }))
    ],
    [categories]
  );

  const monthOptions = useMemo<SelectOption[]>(() => {
    const monthSet = new Set<string>([month, ...availableMonths]);
    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((monthValue) => ({
        value: monthValue,
        label: formatMonthLabel(monthValue)
      }));
  }, [month, availableMonths]);

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrevious = offset > 0;
  const canGoNext = offset + PAGE_SIZE < total;

  const onFilterChange = (type: 'month' | 'category' | 'status', value: string) => {
    if (type === 'month') {
      setMonth(value);
    } else if (type === 'category') {
      setCategory(value);
    } else {
      setStatus(value);
    }

    setOffset(0);
  };

  const onCategoryAssign = async (transaction: TransactionListItem, selectedValue: string) => {
    if (selectedValue === 'uncategorized') {
      return;
    }

    const selectedCategoryId = Number(selectedValue);
    if (!Number.isFinite(selectedCategoryId) || selectedCategoryId <= 0 || selectedCategoryId === transaction.categoryId) {
      return;
    }

    setUpdatingTransactionIds((prev) => [...prev, transaction.id]);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category_id: selectedCategoryId,
          status: 'confirmed',
          categorized_by: 'human'
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Failed to update transaction (${response.status})`;
        throw new Error(message);
      }

      const payload = (await response.json()) as PatchTransactionResponse;

      setTransactions((previous) =>
        previous.map((row) =>
          row.id === transaction.id
            ? {
                ...row,
                categoryId: payload.data.categoryId,
                categoryName: payload.data.categoryName,
                status: payload.data.status,
                categorizedBy: payload.data.categorizedBy
              }
            : row
        )
      );

      if (category === 'uncategorized' || status === 'needs_review') {
        setTransactions((previous) => previous.filter((row) => row.id !== transaction.id));
        setTotal((previous) => Math.max(0, previous - 1));
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update transaction');
    } finally {
      setUpdatingTransactionIds((prev) => prev.filter((id) => id !== transaction.id));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {total} transaction(s) in current filter. Page {pageNumber} of {totalPages}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Select options={monthOptions} value={month} onChange={(event) => onFilterChange('month', event.target.value)} />
          <Select
            options={categoryFilterOptions}
            value={category}
            onChange={(event) => onFilterChange('category', event.target.value)}
          />
          <Select options={statusOptions} value={status} onChange={(event) => onFilterChange('status', event.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[var(--destructive)]">
                    {error}
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
                    No transactions found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => {
                  const isUpdating = updatingTransactionIds.includes(transaction.id);

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={transaction.type === 'debit' ? 'text-red-500' : 'text-green-500'}>
                        {formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Select
                          options={rowCategoryOptions}
                          value={transaction.categoryId ? String(transaction.categoryId) : 'uncategorized'}
                          onChange={(event) => void onCategoryAssign(transaction, event.target.value)}
                          disabled={isUpdating}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'confirmed' ? 'success' : 'warning'}>
                          {formatStatus(transaction.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))} disabled={!canGoPrevious || loading}>
              Previous
            </Button>
            <Button type="button" variant="outline" onClick={() => setOffset((value) => value + PAGE_SIZE)} disabled={!canGoNext || loading}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
