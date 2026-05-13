import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface UploadResult {
  transactionCount: number;
  periodStart: string | null;
  periodEnd: string | null;
  filename: string;
}

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

export function UploadModal({ open, onClose, onUploadComplete }: UploadModalProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  if (!open) return null;

  const reset = () => {
    setState('idle');
    setResult(null);
    setErrorMessage('');
    setDragOver(false);
  };

  const handleClose = () => {
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
      <div className="absolute inset-0 bg-border/45" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-sketch border-[1.5px] border-border bg-card p-5 shadow-sketch">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-hand text-2xl">Upload bank statement</h2>
          <button
            onClick={handleClose}
            className="flex h-5.5 w-5.5 items-center justify-center rounded-md border-[1.3px] border-border bg-card font-hand text-sm hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {/* Idle — drop zone */}
        {state === 'idle' && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-3 rounded-sketch-sm border-[1.5px] border-dashed p-8 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary-soft'
                  : 'border-muted-foreground hover:border-border hover:bg-muted'
              }`}
            >
              <div className="flex h-14 w-12 items-center justify-center rounded-md border-[1.3px] border-dashed border-muted-foreground thumb-hatch text-[13px] font-bold text-muted-foreground">
                PDF
              </div>
              <div className="font-hand text-xl">Drop your PDF here</div>
              <div className="text-[13px] text-muted-foreground">
                or <span className="text-primary underline">choose a file</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => onFileSelect(e.target.files?.[0])}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Only PDF statements from the supported bank format are supported for now.
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            </div>
          </>
        )}

        {/* Uploading — progress */}
        {state === 'uploading' && (
          <>
            <div className="flex flex-col items-center gap-3 rounded-sketch-sm border-[1.3px] border-border p-8 text-center">
              <div className="flex h-14 w-12 items-center justify-center rounded-md border-[1.3px] border-border bg-primary-soft text-[13px] font-bold text-muted-foreground">
                PDF
              </div>
              <div className="font-hand text-xl">Parsing statement…</div>
              <div className="h-2.5 w-3/4 overflow-hidden rounded-md border-[1.3px] border-border bg-muted">
                <div className="bar-fill h-full w-3/5 animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground">Reading transactions — this usually takes a few seconds</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            </div>
          </>
        )}

        {/* Success */}
        {state === 'success' && result && (
          <>
            <div className="rounded-sketch-sm border-[1.3px] border-border bg-good-soft p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[5px] border-[1.5px] border-border bg-good-soft font-hand text-lg text-good">
                  ✓
                </div>
                <div>
                  <div className="font-hand text-xl">Statement imported</div>
                  <div className="text-[13px]">
                    {result.transactionCount} transactions found
                    {result.periodStart && result.periodEnd && ` · ${result.periodStart} – ${result.periodEnd}`}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={handleClose}>Close</Button>
              <Button onClick={() => { handleClose(); navigate('/categorize'); }}>
                Categorize {result.transactionCount} →
              </Button>
            </div>
          </>
        )}

        {/* Error */}
        {state === 'error' && (
          <>
            <div className="rounded-sketch-sm border-[1.3px] border-border bg-primary-soft p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[5px] border-[1.5px] border-border bg-primary-soft font-hand text-lg text-primary">
                  !
                </div>
                <div>
                  <div className="font-hand text-xl">Couldn't parse this statement</div>
                  <div className="text-xs text-muted-foreground">{errorMessage}</div>
                </div>
              </div>
              <p className="mt-2 pl-11 text-[13px]">
                Try another PDF or check that it matches the supported bank format.
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button variant="outline" onClick={reset}>Try another file</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
