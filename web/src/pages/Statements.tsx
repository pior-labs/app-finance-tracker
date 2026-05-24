import { useEffect, useMemo, useState } from 'react';
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
    <div className="flex flex-col gap-5">
      {/* ─── Header ─── */}
      <header className="flex flex-col gap-4 px-1 pt-1 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:pt-3">
        <div className="min-w-0">
          <div className="text-[12px] tracking-wide sm:text-[13px]" style={{ color: 'var(--ink-3)' }}>
            Uploads ·{' '}
            <em style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}>
              {statements.length} statement{statements.length !== 1 ? 's' : ''} · {totalTx} transactions imported
            </em>
          </div>
          <h1
            className="m-0 my-1.5 text-[34px] font-normal leading-[1.05] tracking-tight sm:text-[42px] sm:leading-none md:text-[52px]"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            Statements
          </h1>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-5 py-3 text-[15px] font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 sm:w-auto"
          style={{
            fontFamily: "'Outfit', sans-serif",
            background: 'var(--ink)',
            color: 'var(--cream)',
            boxShadow: '0 8px 22px -6px rgba(45,36,24,0.4)',
            touchAction: 'manipulation',
          }}
        >
          + Upload statement
        </button>
      </header>

      {error && (
        <p
          className="rounded-2xl border px-5 py-3 text-sm"
          style={{
            background: 'rgba(245,180,160,0.4)',
            borderColor: 'rgba(197,112,74,0.4)',
            color: '#6b3a1f',
          }}
        >
          {error}
        </p>
      )}

      {/* ─── Table (desktop) ─── */}
      <div
        className="hidden overflow-hidden rounded-[28px] border md:block"
        style={{
          background: 'rgba(255,253,247,0.55)',
          borderColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          boxShadow: '0 14px 44px -10px rgba(45,36,24,0.1), inset 0 0 0 1px rgba(255,255,255,0.45)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr
                className="border-b"
                style={{
                  background: 'linear-gradient(135deg, rgba(220,211,240,0.2), rgba(248,215,192,0.25), rgba(202,224,168,0.15))',
                  borderColor: 'rgba(45,36,24,0.08)',
                }}
              >
                <th className="h-11 px-5 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Period</th>
                <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>File</th>
                <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Uploaded by</th>
                <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Date</th>
                <th className="h-11 px-4 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Tx</th>
                <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Status</th>
                <th className="h-11 px-5 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-dashed" style={{ borderColor: 'rgba(45,36,24,0.08)' }}>
                    <td colSpan={7} className="px-5 py-4">
                      <div
                        className="h-4 animate-pulse rounded-full"
                        style={{
                          background: 'rgba(255,253,247,0.6)',
                          width: `${60 + (i % 3) * 15}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : sortedStatements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20">
                    <div className="flex flex-col items-center gap-4 text-center">
                      {/* Petal motif */}
                      <div className="relative h-16 w-16">
                        {['#cae0a8', '#f8d7c0', '#dcd3f0'].map((color, i) => (
                          <span
                            key={i}
                            className="absolute left-[19px] top-0 h-10 w-[26px] origin-[50%_100%]"
                            style={{
                              transform: `rotate(${i * 120}deg)`,
                              background: color,
                              borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
                            }}
                          />
                        ))}
                        <span
                          className="absolute left-[23px] top-[23px] z-[2] h-[18px] w-[18px] rounded-full border-2"
                          style={{ background: 'var(--cream)', borderColor: 'var(--ink)' }}
                        />
                      </div>
                      <h3
                        className="m-0 text-2xl font-normal"
                        style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                      >
                        No statements yet
                      </h3>
                      <p className="m-0 max-w-xs text-sm" style={{ color: 'var(--ink-3)' }}>
                        Upload your first bank statement and we'll import your transactions automatically.
                      </p>
                      <button
                        onClick={() => setUploadOpen(true)}
                        className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-full border-0 px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-px"
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          background: 'var(--ink)',
                          color: 'var(--cream)',
                          boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
                        }}
                      >
                        Upload statement →
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStatements.map((s) => {
                  const isFailed = s.status === 'failed' || s.transactionCount === 0;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-dashed transition-colors hover:bg-white/40"
                      style={{
                        borderColor: 'rgba(45,36,24,0.08)',
                        background: isFailed ? 'rgba(248,215,192,0.15)' : undefined,
                      }}
                    >
                      {/* Period */}
                      <td className="whitespace-nowrap px-5 py-3">
                        <span
                          className="text-[15px] font-medium"
                          style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                        >
                          {formatPeriod(s.periodStart, s.periodEnd)}
                        </span>
                      </td>

                      {/* File */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[8px] font-bold uppercase"
                            style={{
                              background: 'linear-gradient(135deg, rgba(220,211,240,0.5), rgba(248,215,192,0.4))',
                              color: 'var(--ink-3)',
                              border: '1px solid rgba(255,255,255,0.6)',
                            }}
                          >
                            PDF
                          </span>
                          <span className="max-w-[140px] truncate text-xs" style={{ color: 'var(--ink-3)' }}>
                            {s.originalFilename}
                          </span>
                        </div>
                      </td>

                      {/* Uploaded by */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
                            style={{
                              fontFamily: "'Fraunces', serif",
                              background: 'linear-gradient(135deg, #dcd3f0, #f8d7c0)',
                              color: 'var(--ink)',
                              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)',
                            }}
                          >
                            {s.uploadedByUser?.name?.[0]?.toUpperCase() ?? '?'}
                          </span>
                          <span className="text-[13px]" style={{ color: 'var(--ink)' }}>
                            {s.uploadedByUser?.name ?? `User ${s.uploadedBy}`}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-4 py-3 text-[12px]" style={{ color: 'var(--ink-3)' }}>
                        {formatDate(s.createdAt)}
                      </td>

                      {/* Tx count */}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span
                          className="text-[15px] font-medium"
                          style={{ fontFamily: "'Fraunces', serif", color: s.transactionCount > 0 ? 'var(--ink)' : 'var(--ink-3)' }}
                        >
                          {s.transactionCount > 0 ? s.transactionCount : '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {isFailed ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: 'rgba(248,215,192,0.7)',
                              color: 'var(--accent)',
                              border: '1px solid rgba(255,255,255,0.5)',
                            }}
                          >
                            failed
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: 'rgba(202,224,168,0.6)',
                              color: '#3d6b1f',
                              border: '1px solid rgba(255,255,255,0.5)',
                            }}
                          >
                            ✓ imported
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 text-xs transition-colors hover:bg-white/80"
                            style={{ color: 'var(--ink-2)' }}
                            title="View transactions"
                          >
                            👁
                          </button>
                          <button
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 text-xs transition-colors hover:bg-white/80"
                            style={{ color: 'var(--ink-2)' }}
                            title="Re-parse"
                          >
                            ↻
                          </button>
                          <button
                            onClick={() => void deleteStatement(s.id)}
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 text-xs transition-colors hover:bg-[rgba(248,215,192,0.7)]"
                            style={{ color: 'var(--accent)' }}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Card list (mobile) ─── */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[20px] border p-4"
              style={{
                background: 'rgba(255,253,247,0.55)',
                borderColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px) saturate(140%)',
                WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              }}
            >
              <div
                className="h-3.5 animate-pulse rounded-full motion-reduce:animate-none"
                style={{
                  background: 'rgba(45,36,24,0.06)',
                  width: `${55 + (i % 3) * 14}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
              <div
                className="mt-2.5 h-3 w-2/3 animate-pulse rounded-full motion-reduce:animate-none"
                style={{ background: 'rgba(45,36,24,0.05)', animationDelay: `${i * 0.1 + 0.05}s` }}
              />
            </div>
          ))
        ) : sortedStatements.length === 0 ? (
          <div
            className="rounded-[24px] border p-8 text-center"
            style={{
              background: 'rgba(255,253,247,0.55)',
              borderColor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              boxShadow: '0 14px 44px -10px rgba(45,36,24,0.1), inset 0 0 0 1px rgba(255,255,255,0.45)',
            }}
          >
            <div className="mx-auto flex flex-col items-center gap-4">
              {/* Petal motif */}
              <div className="relative h-14 w-14" aria-hidden="true">
                {['#cae0a8', '#f8d7c0', '#dcd3f0'].map((color, i) => (
                  <span
                    key={i}
                    className="absolute left-[16px] top-0 h-9 w-[22px] origin-[50%_100%]"
                    style={{
                      transform: `rotate(${i * 120}deg)`,
                      background: color,
                      borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
                    }}
                  />
                ))}
                <span
                  className="absolute left-[20px] top-[20px] z-[2] h-[16px] w-[16px] rounded-full border-2"
                  style={{ background: 'var(--cream)', borderColor: 'var(--ink)' }}
                />
              </div>
              <h3
                className="m-0 text-xl font-normal"
                style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
              >
                No statements yet
              </h3>
              <p className="m-0 max-w-xs text-[13px]" style={{ color: 'var(--ink-3)' }}>
                Upload your first bank statement and we'll import your transactions automatically.
              </p>
              <button
                onClick={() => setUploadOpen(true)}
                className="mt-1 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-0 px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
                  touchAction: 'manipulation',
                }}
              >
                Upload statement →
              </button>
            </div>
          </div>
        ) : (
          sortedStatements.map((s) => {
            const isFailed = s.status === 'failed' || s.transactionCount === 0;
            return (
              <article
                key={s.id}
                className="flex flex-col gap-3 rounded-[22px] border p-4"
                style={{
                  background: isFailed ? 'rgba(248,215,192,0.18)' : 'rgba(255,253,247,0.55)',
                  borderColor: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(20px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                  boxShadow: '0 6px 22px -10px rgba(45,36,24,0.08)',
                }}
              >
                {/* Top: period + status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] tracking-wide" style={{ color: 'var(--ink-3)' }}>
                      {formatDate(s.createdAt)}
                    </div>
                    <h3
                      className="m-0 mt-1 text-[17px] font-medium leading-snug"
                      style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                    >
                      {formatPeriod(s.periodStart, s.periodEnd)}
                    </h3>
                  </div>
                  {isFailed ? (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        background: 'rgba(248,215,192,0.7)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(255,255,255,0.5)',
                      }}
                    >
                      failed
                    </span>
                  ) : (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        background: 'rgba(202,224,168,0.6)',
                        color: '#3d6b1f',
                        border: '1px solid rgba(255,255,255,0.5)',
                      }}
                    >
                      <span aria-hidden="true">✓</span> imported
                    </span>
                  )}
                </div>

                {/* File row */}
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[8px] font-bold uppercase"
                    style={{
                      background: 'linear-gradient(135deg, rgba(220,211,240,0.5), rgba(248,215,192,0.4))',
                      color: 'var(--ink-3)',
                      border: '1px solid rgba(255,255,255,0.6)',
                    }}
                  >
                    PDF
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: 'var(--ink-3)' }} title={s.originalFilename}>
                    {s.originalFilename}
                  </span>
                </div>

                {/* Meta row: uploader + tx count */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
                      style={{
                        fontFamily: "'Fraunces', serif",
                        background: 'linear-gradient(135deg, #dcd3f0, #f8d7c0)',
                        color: 'var(--ink)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)',
                      }}
                    >
                      {s.uploadedByUser?.name?.[0]?.toUpperCase() ?? '?'}
                    </span>
                    <span className="truncate text-[13px]" style={{ color: 'var(--ink-2)' }}>
                      {s.uploadedByUser?.name ?? `User ${s.uploadedBy}`}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className="text-[15px] font-medium tabular-nums"
                      style={{ fontFamily: "'Fraunces', serif", color: s.transactionCount > 0 ? 'var(--ink)' : 'var(--ink-3)' }}
                    >
                      {s.transactionCount > 0 ? s.transactionCount : '—'}
                    </span>
                    <span className="ml-1 text-[11px]" style={{ color: 'var(--ink-3)' }}>
                      {s.transactionCount === 1 ? 'tx' : 'tx'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="-mx-1 flex items-center justify-end gap-1 border-t border-dashed pt-2"
                  style={{ borderColor: 'rgba(45,36,24,0.1)' }}
                >
                  <button
                    type="button"
                    aria-label="View transactions"
                    className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-white/60"
                    style={{ color: 'var(--ink-2)', touchAction: 'manipulation' }}
                  >
                    <span aria-hidden="true">👁</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Re-parse statement"
                    className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-white/60"
                    style={{ color: 'var(--ink-2)', touchAction: 'manipulation' }}
                  >
                    <span aria-hidden="true">↻</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteStatement(s.id)}
                    aria-label="Delete statement"
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-[rgba(248,215,192,0.7)]"
                    style={{ color: 'var(--accent)', fontFamily: "'Outfit', sans-serif", touchAction: 'manipulation' }}
                  >
                    <span aria-hidden="true">✕</span> Delete
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ─── Warning footer ─── */}
      <div
        className="flex items-start gap-2.5 rounded-[20px] border px-4 py-3 text-[12px] leading-snug sm:items-center sm:px-5 sm:py-3.5 sm:text-[13px]"
        style={{
          background: 'rgba(255,253,247,0.45)',
          borderColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(16px) saturate(130%)',
          WebkitBackdropFilter: 'blur(16px) saturate(130%)',
          color: 'var(--ink-3)',
        }}
      >
        <span aria-hidden="true" className="shrink-0">⚠</span>
        <span>
          Deleting a statement removes its transactions too.{' '}
          <strong style={{ color: 'var(--ink-2)' }}>Re-parse</strong> tries again with the latest parser — non-destructive.
        </span>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploadComplete={() => void fetchStatements()} />
    </div>
  );
}
