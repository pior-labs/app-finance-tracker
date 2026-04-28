import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
}

interface StatementsResponse {
  data: StatementListItem[];
}

interface UploadResponse {
  data: {
    id: number;
    originalFilename: string;
    periodStart: string | null;
    periodEnd: string | null;
  };
  meta?: {
    insertedTransactions?: number;
  };
}

interface UploadSummary {
  filename: string;
  transactionCount: number;
  periodStart: string | null;
  periodEnd: string | null;
}

function formatDateLabel(value: string | null): string {
  if (!value) {
    return 'Unknown date';
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
}

function formatDateTime(value: string): string {
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingStatementId, setDeletingStatementId] = useState<number | null>(null);
  const [loadingStatements, setLoadingStatements] = useState(true);
  const [statements, setStatements] = useState<StatementListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);

  const sortedStatements = useMemo(
    () => [...statements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [statements]
  );

  const fetchStatements = async () => {
    setLoadingStatements(true);

    try {
      const response = await fetch('/api/statements', {
        credentials: 'include'
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Failed to load statements (${response.status})`;
        throw new Error(message);
      }

      const payload = (await response.json()) as StatementsResponse;
      setStatements(payload.data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load statements');
    } finally {
      setLoadingStatements(false);
    }
  };

  useEffect(() => {
    void fetchStatements();
  }, []);

  const uploadFile = async (file: File) => {
    setError(null);
    setUploadSummary(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/statements/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Upload failed (${response.status})`;
        throw new Error(message);
      }

      const payload = (await response.json()) as UploadResponse;

      setUploadSummary({
        filename: payload.data.originalFilename,
        transactionCount: payload.meta?.insertedTransactions ?? 0,
        periodStart: payload.data.periodStart,
        periodEnd: payload.data.periodEnd
      });

      await fetchStatements();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await uploadFile(file);
  };

  const onDeleteStatement = async (statement: StatementListItem) => {
    const confirmed = window.confirm(
      `Delete "${statement.originalFilename}" and its ${statement.transactionCount} transaction(s)? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setDeletingStatementId(statement.id);

    try {
      const response = await fetch(`/api/statements/${statement.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { error?: string }).error ?? `Delete failed (${response.status})`;
        throw new Error(message);
      }

      await fetchStatements();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed');
    } finally {
      setDeletingStatementId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload statement</CardTitle>
          <CardDescription>Select a PDF statement to parse and add to your shared transactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            disabled={uploading}
            onChange={(event) => void onFileChange(event)}
          />

          {uploading ? <p className="text-sm text-[var(--muted-foreground)]">Parsing statement...</p> : null}

          {uploadSummary ? (
            <div className="rounded-md border border-[var(--border)] bg-[var(--muted)]/40 p-4">
              <p className="text-sm font-medium">
                Found {uploadSummary.transactionCount} transactions from {formatDateLabel(uploadSummary.periodStart)} to{' '}
                {formatDateLabel(uploadSummary.periodEnd)}.
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{uploadSummary.filename}</p>
              <div className="mt-3">
                <Button asChild>
                  <Link to="/transactions">View transactions →</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past uploads</CardTitle>
          <CardDescription>Most recent uploads first.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Date uploaded</TableHead>
                <TableHead>Transaction count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingStatements ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
                    Loading uploads...
                  </TableCell>
                </TableRow>
              ) : sortedStatements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
                    No uploads yet.
                  </TableCell>
                </TableRow>
              ) : (
                sortedStatements.map((statement) => (
                  <TableRow key={statement.id}>
                    <TableCell className="font-medium">{statement.originalFilename}</TableCell>
                    <TableCell>{statement.uploadedByUser?.name ?? `User ${statement.uploadedBy}`}</TableCell>
                    <TableCell>{formatDateTime(statement.createdAt)}</TableCell>
                    <TableCell>{statement.transactionCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="outline" asChild>
                          <a href={`/api/statements/${statement.id}/file`} target="_blank" rel="noreferrer">
                            View
                          </a>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          disabled={deletingStatementId === statement.id}
                          onClick={() => void onDeleteStatement(statement)}
                        >
                          {deletingStatementId === statement.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </TableCell>
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
