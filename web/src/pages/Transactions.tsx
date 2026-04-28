import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  statement: {
    id: number;
    originalFilename: string;
    uploadedBy: number;
    uploadedByUser: {
      id: number;
      name: string;
      email: string;
    };
  };
}

interface TransactionsResponse {
  data: TransactionListItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const monthOptions = [
  { value: 'all', label: 'All months' },
  { value: '2024-05', label: 'May 2024' },
  { value: '2024-06', label: 'June 2024' }
];

const categoryOptions = [
  { value: 'all', label: 'All categories' },
  { value: 'uncategorized', label: 'Uncategorized' }
];

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'auto_categorized', label: 'Auto categorized' }
];

export function TransactionsPage() {
  const [month, setMonth] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', '200');
    if (month !== 'all') {
      params.set('month', month);
    }
    if (category !== 'all') {
      params.set('category', category);
    }
    if (status !== 'all') {
      params.set('status', status);
    }
    return params.toString();
  }, [month, category, status]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/transactions?${queryString}`, {
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
  }, [queryString]);

  const formatAmount = (cents: number) => {
    const value = Math.abs(cents) / 100;
    const formatted = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return cents < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>{total} transaction(s) in current filter.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Select options={monthOptions} value={month} onChange={(event) => setMonth(event.target.value)} />
          <Select options={categoryOptions} value={category} onChange={(event) => setCategory(event.target.value)} />
          <Select options={statusOptions} value={status} onChange={(event) => setStatus(event.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--muted-foreground)]">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--destructive)]">
                    {error}
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--muted-foreground)]">
                    No transactions found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={transaction.amount < 0 ? 'text-emerald-700' : 'text-red-500'}>
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.categoryName ?? 'Uncategorized'}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'confirmed' ? 'success' : 'warning'}>{transaction.status}</Badge>
                    </TableCell>
                    <TableCell>{transaction.statement.uploadedByUser?.name ?? `User ${transaction.statement.uploadedBy}`}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
