import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, TriangleAlert, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface UploadResult {
  transactionCount: number;
  periodStart: string | null;
  periodEnd: string | null;
  filename: string;
}

interface StatementUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

export function StatementUploadModal({ open, onClose, onUploadComplete }: StatementUploadModalProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { pushToast } = useToast();

  if (!open) return null;

  const reset = () => {
    setState('idle');
    setResult(null);
    setErrorMessage('');
    setDragOver(false);
  };

  const notifySuccessIfNeeded = () => {
    if (state !== 'success' || !result) return;
    const period =
      result.periodStart && result.periodEnd ? `${result.periodStart} – ${result.periodEnd}` : result.filename;
    pushToast({
      variant: 'success',
      title: `Imported ${result.transactionCount} ${result.transactionCount === 1 ? 'transaction' : 'transactions'}`,
      description: period,
    });
  };

  const handleClose = () => {
    notifySuccessIfNeeded();
    reset();
    onClose();
  };

  const uploadFile = async (file: File) => {
    setState('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/statements/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? `Upload failed (${response.status})`);
      }

      const payload = (await response.json()) as {
        data: { originalFilename: string; periodStart: string | null; periodEnd: string | null };
        meta?: { insertedTransactions?: number };
      };

      setResult({
        transactionCount: payload.meta?.insertedTransactions ?? 0,
        periodStart: payload.data.periodStart,
        periodEnd: payload.data.periodEnd,
        filename: payload.data.originalFilename,
      });
      setState('success');
      onUploadComplete?.();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  };

  const onFileSelect = (file: File | undefined) => {
    if (!file) return;
    void uploadFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    onFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(45,36,24,0.3)', backdropFilter: 'blur(6px)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-[28px] border p-7"
        style={{
          background: 'rgba(255,253,247,0.94)',
          borderColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          boxShadow: '0 24px 60px -12px rgba(45,36,24,0.25), inset 0 0 0 1px rgba(255,255,255,0.5)',
        }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="m-0 text-2xl font-normal"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            Upload statement
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close upload dialog"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 transition-colors hover:bg-white/80"
            style={{ color: 'var(--ink-3)' }}
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </div>

        {/* ─── Idle — drop zone ─── */}
        {state === 'idle' && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-4 rounded-[20px] border-2 border-dashed p-10 text-center transition-all"
              style={{
                borderColor: dragOver ? 'rgba(142,181,103,0.6)' : 'rgba(45,36,24,0.15)',
                background: dragOver
                  ? 'linear-gradient(135deg, rgba(202,224,168,0.3), rgba(198,227,212,0.2))'
                  : 'rgba(255,255,255,0.3)',
              }}
            >
              {/* PDF badge */}
              <span
                className="flex h-14 w-11 items-center justify-center rounded-xl text-[11px] font-bold uppercase"
                style={{
                  background: 'linear-gradient(135deg, rgba(220,211,240,0.5), rgba(248,215,192,0.4))',
                  color: 'var(--ink-3)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  boxShadow: '0 4px 14px -4px rgba(45,36,24,0.08)',
                }}
              >
                PDF
              </span>
              <div
                className="text-xl font-normal"
                style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
              >
                Drop your PDF here
              </div>
              <div className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
                or{' '}
                <span className="font-medium underline underline-offset-2" style={{ color: 'var(--accent)' }}>
                  choose a file
                </span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => onFileSelect(e.target.files?.[0])}
            />
            <p className="mt-3 text-xs" style={{ color: 'var(--ink-3)' }}>
              Only PDF statements from the supported bank format are supported for now.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClose}
                className="cursor-pointer rounded-full border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)' }}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* ─── Uploading ─── */}
        {state === 'uploading' && (
          <>
            <div
              className="flex flex-col items-center gap-4 rounded-[20px] border p-10 text-center"
              style={{
                background: 'rgba(255,255,255,0.3)',
                borderColor: 'rgba(255,255,255,0.7)',
              }}
            >
              <span
                className="flex h-14 w-11 items-center justify-center rounded-xl text-[11px] font-bold uppercase"
                style={{
                  background: 'linear-gradient(135deg, rgba(202,224,168,0.5), rgba(248,215,192,0.3))',
                  color: 'var(--ink-3)',
                  border: '1px solid rgba(255,255,255,0.6)',
                }}
              >
                PDF
              </span>
              <div
                className="text-xl font-normal"
                style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
              >
                Parsing statement…
              </div>
              <div className="h-2 w-3/4 overflow-hidden rounded-full bg-[rgba(45,36,24,0.06)]">
                <div
                  className="h-full w-3/5 animate-pulse rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #cae0a8, #8eb567)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                  }}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
                Reading transactions — this usually takes a few seconds
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClose}
                className="cursor-pointer rounded-full border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)' }}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* ─── Success ─── */}
        {state === 'success' && result && (
          <>
            <div
              className="rounded-[20px] border p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(202,224,168,0.35), rgba(198,227,212,0.2))',
                borderColor: 'rgba(255,255,255,0.6)',
              }}
            >
              <div className="flex items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                  style={{
                    background: 'linear-gradient(135deg, #cae0a8, #8eb567)',
                    boxShadow: '0 4px 14px -2px rgba(93,138,63,0.3)',
                  }}
                >
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <div>
                  <div
                    className="text-xl font-normal"
                    style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                  >
                    Statement imported
                  </div>
                  <div className="mt-0.5 text-[13px]" style={{ color: 'var(--ink-2)' }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
                      {result.transactionCount}
                    </span>{' '}
                    transactions found
                    {result.periodStart && result.periodEnd && (
                      <span style={{ color: 'var(--ink-3)' }}>
                        {' '}· {result.periodStart} – {result.periodEnd}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={handleClose}
                className="cursor-pointer rounded-full border bg-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
                style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)' }}
              >
                Close
              </button>
              <button
                onClick={() => { handleClose(); navigate('/categorize'); }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
                }}
              >
                Categorize {result.transactionCount}
                <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          </>
        )}

        {/* ─── Error ─── */}
        {state === 'error' && (
          <>
            <div
              className="rounded-[20px] border p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(248,215,192,0.4), rgba(245,227,160,0.2))',
                borderColor: 'rgba(255,255,255,0.6)',
              }}
            >
              <div className="flex items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #f8d7c0, #c5704a)',
                    color: 'white',
                    boxShadow: '0 4px 14px -2px rgba(197,112,74,0.3)',
                  }}
                >
                  <TriangleAlert className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <div>
                  <div
                    className="text-xl font-normal"
                    style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                  >
                    Couldn't parse this statement
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: 'var(--ink-3)' }}>
                    {errorMessage}
                  </div>
                </div>
              </div>
              <p className="mt-3 pl-[52px] text-[13px]" style={{ color: 'var(--ink-2)' }}>
                Try another PDF or check that it matches the supported bank format.
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={handleClose}
                className="cursor-pointer rounded-full border bg-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
                style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', borderColor: 'rgba(45,36,24,0.15)' }}
              >
                Cancel
              </button>
              <button
                onClick={reset}
                className="cursor-pointer rounded-full border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: 'var(--ink)',
                  borderColor: 'rgba(45,36,24,0.2)',
                  background: 'transparent',
                }}
              >
                Try another file
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
