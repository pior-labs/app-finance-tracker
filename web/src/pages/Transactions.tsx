import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const monthOptions = [
  { value: 'current', label: 'Current month' },
  { value: '2026-03', label: 'March 2026' }
];

const categoryOptions = [
  { value: 'all', label: 'All categories' },
  { value: 'uncategorized', label: 'Uncategorized' },
  { value: 'groceries', label: 'Groceries' }
];

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'confirmed', label: 'Confirmed' }
];

export function TransactionsPage() {
  const [month, setMonth] = useState('current');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const filters = useMemo(() => ({ month, category, status }), [month, category, status]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Scaffolded filters and table layout for Phase 1.</CardDescription>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
                  Placeholder rows. Current filters: {JSON.stringify(filters)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2026-04-01</TableCell>
                <TableCell>Sample transaction</TableCell>
                <TableCell className="text-red-500">-$12.99</TableCell>
                <TableCell>Uncategorized</TableCell>
                <TableCell>
                  <Badge variant="warning">needs_review</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
