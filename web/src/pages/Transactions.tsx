import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  return status === 'needs_review' ? 'Needs review' : 'Confirmed';
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
    const selectedCategoryId = selectedValue === 'uncategorized' ? null : Number(selectedValue);

    if (
      selectedValue !== 'uncategorized' &&
      (!Number.isFinite(selectedCategoryId) || (selectedCategoryId as number) <= 0)
    ) {
      return;
    }

    if (selectedCategoryId === transaction.categoryId && transaction.status === 'confirmed') {
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
          status: selectedCategoryId === null ? 'needs_review' : 'confirmed'
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Failed to update transaction (${response.status})`;
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        data: {
          id: number;
          categoryId: number | null;
          categoryName: string | null;
          status: 'needs_review' | 'confirmed';
        };
      };

      setTransactions((previous) =>
        previous.map((item) =>
          item.id === transaction.id
            ? {
                ...item,
                categoryId: payload.data.categoryId,
                categoryName: payload.data.categoryName,
                status: payload.data.status
              }
            : item
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update transaction');
    } finally {
      setUpdatingTransactionIds((previous) => previous.filter((id) => id !== transaction.id));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Select
            options={monthOptions}
            value={month}
            onChange={(event) => onFilterChange('month', event.target.value)}
            aria-label="Filter by month"
          />

          <Select
            options={categoryFilterOptions}
            value={category}
            onChange={(event) => onFilterChange('category', event.target.value)}
            aria-label="Filter by category"
          />

          <Select
            options={statusOptions}
            value={status}
            onChange={(event) => onFilterChange('status', event.target.value)}
            aria-label="Filter by status"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--muted-foreground)]">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--muted-foreground)]">
                    No transactions found for these filters.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => {
                  const rowIsUpdating = updatingTransactionIds.includes(transaction.id);

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell className="font-medium">{transaction.merchant ?? transaction.description}</TableCell>
                      <TableCell className="max-w-[24rem] truncate" title={transaction.description}>
                        {transaction.description}
                      </TableCell>
                      <TableCell
                        className={transaction.type === 'debit' ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}
                      >
                        {formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={transaction.categoryId === null ? 'uncategorized' : String(transaction.categoryId)}
                          options={rowCategoryOptions}
                          disabled={rowIsUpdating}
                          onChange={(event) => {
                            void onCategoryAssign(transaction, event.target.value);
                          }}
                          aria-label={`Set category for transaction ${transaction.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'needs_review' ? 'warning' : 'success'}>
                          {formatStatus(transaction.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              Page {pageNumber} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!canGoPrevious}
                onClick={() => setOffset((previous) => Math.max(0, previous - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!canGoNext}
                onClick={() => setOffset((previous) => previous + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
