import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ComponentType, type ReactNode, type SVGProps } from 'react';
import { Check, Info, TriangleAlert, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
  durationMs: number;
}

interface ToastCtx {
  toasts: Toast[];
  pushToast: (input: Omit<Toast, 'id' | 'durationMs'> & { durationMs?: number }) => number;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback<ToastCtx['pushToast']>((input) => {
    const id = nextId++;
    const toast: Toast = { id, durationMs: 4500, ...input };
    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const value = useMemo<ToastCtx>(() => ({ toasts, pushToast, dismissToast }), [toasts, pushToast, dismissToast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return { pushToast: ctx.pushToast, dismissToast: ctx.dismissToast };
}

export function ToastViewport() {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  const { toasts, dismissToast } = ctx;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.durationMs <= 0) return;
    const id = window.setTimeout(onDismiss, toast.durationMs);
    return () => window.clearTimeout(id);
  }, [toast.durationMs, onDismiss]);

  const variantStyle = VARIANT_STYLES[toast.variant];

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-frost/70 p-3.5 shadow-[0_14px_36px_-8px_rgba(45,36,24,0.22),inset_0_0_0_1px_rgba(var(--frost-rgb),0.55)] backdrop-blur-xl backdrop-saturate-150 animate-theme-toast-in motion-reduce:animate-none"
      style={{ background: variantStyle.background }}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: variantStyle.iconBg, boxShadow: variantStyle.iconShadow }}
      >
        <variantStyle.Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-serif text-[15px] font-medium leading-tight text-ink">{toast.title}</div>
        {toast.description && (
          <div className="mt-0.5 text-[12.5px] leading-snug text-ink-2">{toast.description}</div>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-ink-3 transition-colors hover:bg-frost/60 hover:text-ink"
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { background: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; iconBg: string; iconShadow: string }
> = {
  success: {
    background: 'linear-gradient(135deg, rgba(202,224,168,0.85), rgba(var(--surface-rgb),0.92))',
    Icon: Check,
    iconBg: 'linear-gradient(135deg, #cae0a8, #8eb567)',
    iconShadow: '0 4px 14px -2px rgba(93,138,63,0.3)',
  },
  error: {
    background: 'linear-gradient(135deg, rgba(248,215,192,0.85), rgba(var(--surface-rgb),0.92))',
    Icon: TriangleAlert,
    iconBg: 'linear-gradient(135deg, #f8d7c0, #c5704a)',
    iconShadow: '0 4px 14px -2px rgba(197,112,74,0.3)',
  },
  info: {
    background: 'linear-gradient(135deg, rgba(220,211,240,0.85), rgba(var(--surface-rgb),0.92))',
    Icon: Info,
    iconBg: 'linear-gradient(135deg, #dcd3f0, #a89bd1)',
    iconShadow: '0 4px 14px -2px rgba(120,104,170,0.3)',
  },
};
