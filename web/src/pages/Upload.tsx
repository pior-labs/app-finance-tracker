import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatementListItem {
  id: number;
  uploadedBy: number;
  filename: string;
  originalFilename: string;
  institution: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  rawText: string | null;
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
  };
}

export function UploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingStatements, setLoadingStatements] = useState(true);
  const [statements, setStatements] = useState<StatementListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const onUpload = async () => {
    if (!selectedFile) {
      setError('Choose a PDF before uploading.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

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
      const uploadedStatement = payload.data;

      setSelectedFile(null);
      setSuccessMessage(`Uploaded ${uploadedStatement.originalFilename} successfully.`);
      await fetchStatements();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatDateTime = (value: string) => {
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
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload statement</CardTitle>
          <CardDescription>Upload a PDF statement to save it for shared household review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="file"
            accept="application/pdf"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={onUpload} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/transactions')}>
              View transactions
            </Button>
          </div>
          {selectedFile ? <p className="text-sm text-[var(--muted-foreground)]">Selected: {selectedFile.name}</p> : null}
          {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}
          {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Date uploaded</TableHead>
                <TableHead>Transaction count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingStatements ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                    Loading uploads...
                  </TableCell>
                </TableRow>
              ) : sortedStatements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
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
