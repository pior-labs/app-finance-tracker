import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadModal } from '@/components/UploadModal';

interface StatementListItem {
  id: number;
  uploadedBy: number;
  filename: string;
  originalFilename: string;
  institution: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
  uploadedByUser: {
    id: number;
    name: string;
    email: string;
  };
  transactionCount: number;
  status?: 'imported' | 'failed';
}

interface StatementsResponse {
  data: StatementListItem[];
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function formatPeriod(start: string | null, end: string | null): string {
  if (!start || !end) return '—';
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function StatementsPage() {
  const [statements, setStatements] = useState<StatementListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchStatements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/statements', { credentials: 'include' });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to load statements (${res.status})`);
      }
      const payload = (await res.json()) as StatementsResponse;
      setStatements(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatements();
  }, []);

  const sortedStatements = useMemo(
    () => [...statements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [statements]
  );

  const totalTx = statements.reduce((sum, s) => sum + s.transactionCount, 0);

  const deleteStatement = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/statements/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Failed to delete statement (${res.status})`);
      }
      await fetchStatements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete statement');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[var(--muted-foreground)]">
          {statements.length} statement{statements.length !== 1 ? 's' : ''} · {totalTx} transactions imported.
        </p>
        <Button onClick={() => setUploadOpen(true)}>+ Upload statement</Button>
      </div>

      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

      {/* Statements table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Tx</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[var(--muted-foreground)]">Loading statements...</TableCell>
                </TableRow>
              ) : sortedStatements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[var(--muted-foreground)]">No statements uploaded yet.</TableCell>
                </TableRow>
              ) : (
                sortedStatements.map((s) => {
                  const isFailed = s.status === 'failed' || s.transactionCount === 0;
                  return (
                    <TableRow key={s.id} className={isFailed ? 'bg-[var(--primary-soft)]' : undefined}>
                      <TableCell className="font-hand text-lg">{formatPeriod(s.periodStart, s.periodEnd)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-5 items-center justify-center rounded border-[1.3px] border-[var(--border)] thumb-hatch text-[8px] font-bold text-[var(--muted-foreground)]">
                            PDF
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">{s.originalFilename}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.3px] border-[var(--border)] bg-[var(--primary-soft)] font-hand text-[13px]">
                            {s.uploadedByUser?.name?.[0]?.toUpperCase() ?? '?'}
                          </span>
                          <span className="text-[13px]">{s.uploadedByUser?.name ?? `User ${s.uploadedBy}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[var(--muted-foreground)]">{formatDate(s.createdAt)}</TableCell>
                      <TableCell className="text-right font-bold">{s.transactionCount > 0 ? s.transactionCount : '—'}</TableCell>
                      <TableCell>
                        {isFailed ? (
                          <Badge variant="accent">failed</Badge>
                        ) : (
                          <Badge variant="success">✓ imported</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <button
                            className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border-[1.3px] border-[var(--border)] bg-[var(--card)] font-hand text-sm hover:bg-[var(--muted)]"
                            title="View transactions"
                          >
                            👁
                          </button>
                          <button
                            className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border-[1.3px] border-[var(--border)] bg-[var(--card)] font-hand text-sm hover:bg-[var(--muted)]"
                            title="Re-parse"
                          >
                            ↻
                          </button>
                          <button
                            onClick={() => void deleteStatement(s.id)}
                            className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border-[1.3px] border-[var(--border)] bg-[var(--card)] font-hand text-sm text-[var(--primary)] hover:bg-[var(--primary-soft)]"
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

      {/* Warning */}
      <Card className="bg-[var(--muted)] shadow-[var(--shadow-sketch-sm)]">
        <CardContent className="flex items-center gap-2 p-3 text-[13px]">
          <span>⚠</span>
          <span>
            Deleting a statement removes its transactions too.
            <strong> Re-parse</strong> tries again with the latest parser — non-destructive.
          </span>
        </CardContent>
      </Card>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploadComplete={() => void fetchStatements()} />
    </div>
  );
}
