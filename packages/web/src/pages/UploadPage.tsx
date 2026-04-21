import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface StatementListItem {
  id: number;
  uploadedBy: number;
  uploadedByName: string;
  filename: string;
  originalFilename: string;
  institution: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  rawText: string | null;
  createdAt: string;
  transactionCount: number;
}

interface UploadResponse {
  statement?: {
    id: number;
    uploadedBy: number;
    filename: string;
    originalFilename: string;
    createdAt: string;
  };
  error?: string;
}

interface StatementsResponse {
  statements?: StatementListItem[];
  error?: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statements, setStatements] = useState<StatementListItem[]>([]);
  const [loadingStatements, setLoadingStatements] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successStatementId, setSuccessStatementId] = useState<number | null>(null);

  const loadStatements = useCallback(async () => {
    const response = await fetch('/api/statements', {
      credentials: 'include'
    });

    const payload = (await response.json().catch(() => null)) as StatementsResponse | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? 'Unable to load statements.');
    }

    const nextStatements = payload?.statements ?? [];
    setStatements(nextStatements);
    return nextStatements;
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await fetch('/api/statements', {
          credentials: 'include'
        });

        const payload = (await response.json().catch(() => null)) as StatementsResponse | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? 'Unable to load statements.');
        }

        if (!mounted) {
          return;
        }

        setStatements(payload?.statements ?? []);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Unable to load statements.');
      } finally {
        if (mounted) {
          setLoadingStatements(false);
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const successStatement = useMemo(
    () =>
      successStatementId ? statements.find((statement) => statement.id === successStatementId) : null,
    [successStatementId, statements]
  );

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError('Choose a PDF file first.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/statements/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const payload = (await response.json().catch(() => null)) as UploadResponse | null;

      if (!response.ok || !payload?.statement) {
        throw new Error(payload?.error ?? 'Upload failed.');
      }

      const nextStatements = await loadStatements();
      const uploadedStatement = nextStatements.find((statement) => statement.id === payload.statement?.id);

      setSuccessStatementId(uploadedStatement?.id ?? payload.statement.id);
      setSelectedFile(null);
    } catch (err) {
      setSuccessStatementId(null);
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Upload Statement</h2>
      <p className="-mt-1 text-slate-600">
        Upload a PDF bank statement and add it to your shared household history.
      </p>

      <form
        className="grid max-w-2xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        onSubmit={handleUpload}
      >
        <label htmlFor="statementFile" className="text-sm font-semibold text-slate-800">
          Statement PDF
        </label>
        <input
          id="statementFile"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
          disabled={uploading}
        />
        <button
          type="submit"
          className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-65"
          disabled={uploading || !selectedFile}
        >
          {uploading ? 'Parsing statement...' : 'Upload PDF'}
        </button>
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      </form>

      {successStatement ? (
        <div className="max-w-3xl rounded-2xl border border-emerald-300 bg-emerald-50 p-4" role="status">
          <p className="mb-1 text-sm text-emerald-900">
            Found {successStatement.transactionCount} transactions
            {successStatement.periodStart && successStatement.periodEnd
              ? ` from ${successStatement.periodStart} to ${successStatement.periodEnd}.`
              : '.'}
          </p>
          <Link className="text-sm font-semibold text-emerald-800 hover:text-emerald-900" to="/transactions">
            View transactions -&gt;
          </Link>
        </div>
      ) : null}

      <section aria-live="polite" className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Past Uploads</h3>
        {loadingStatements ? <p className="text-slate-600">Loading uploads...</p> : null}
        {!loadingStatements && statements.length === 0 ? <p className="text-slate-600">No uploads yet.</p> : null}
        {!loadingStatements && statements.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-slate-700 uppercase">
                    Filename
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-slate-700 uppercase">
                    Uploaded by
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-slate-700 uppercase">
                    Uploaded at
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-slate-700 uppercase">
                    Transactions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statements.map((statement) => (
                  <tr key={statement.id} className="text-sm text-slate-700">
                    <td className="px-3 py-3">{statement.originalFilename}</td>
                    <td className="px-3 py-3">{statement.uploadedByName}</td>
                    <td className="px-3 py-3">{formatDate(statement.createdAt)}</td>
                    <td className="px-3 py-3">{statement.transactionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </section>
  );
}
