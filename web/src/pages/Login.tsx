import { FormEvent, useId, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BrandMark } from '@/components/BrandMark';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-cream font-sans text-ink">
      <div className="bloom-mesh" aria-hidden="true">
        <div className="bloom-blob b1" />
        <div className="bloom-blob b2" />
        <div className="bloom-blob b3" />
        <div className="bloom-blob b4" />
        <div className="bloom-blob b5" />
      </div>
      <div className="bloom-grain" aria-hidden="true" />

      <main
        id="main-content"
        className="relative z-[2] mx-auto grid min-h-[100dvh] w-full max-w-310 grid-cols-1 gap-10 px-5 py-[max(2rem,env(safe-area-inset-top))] md:grid-cols-[1fr_1fr] md:gap-16 md:px-12 md:py-10 lg:gap-24 lg:px-16"
      >
        <BrandPanel />
        <FormPanel
          email={email}
          password={password}
          showPassword={showPassword}
          loading={loading}
          error={error}
          emailId={emailId}
          passwordId={passwordId}
          errorId={errorId}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
          onSubmit={onSubmit}
        />
      </main>
    </div>
  );
}

function BrandPanel() {
  return (
    <section
      aria-labelledby="login-brand-heading"
      className="bloom-overlay-anim relative flex flex-col justify-between gap-10 py-2 md:py-6"
    >
      <header className="flex items-center gap-3">
        <BrandMark size={36} />
        <span className="font-serif text-[22px] font-medium italic tracking-tight">finlens</span>
      </header>

      <div>
        <h1
          id="login-brand-heading"
          className="font-serif text-[clamp(44px,7.5vw,84px)] leading-[0.98] tracking-[-0.02em] text-ink"
        >
          Welcome
          <br />
          <span className="italic text-ink-2">back<span className="text-accent">.</span></span>
        </h1>
        <p className="mt-7 max-w-md text-[15px] leading-[1.65] text-ink-2">
          A shared, unhurried view of your household — statements, categories, and the small
          patterns that add up over a year.
        </p>
      </div>

      <div aria-hidden="true" />
    </section>
  );
}

type FormPanelProps = {
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  error: string | null;
  emailId: string;
  passwordId: string;
  errorId: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function FormPanel({
  email,
  password,
  showPassword,
  loading,
  error,
  emailId,
  passwordId,
  errorId,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: FormPanelProps) {
  return (
    <section
      aria-labelledby="login-form-heading"
      className="bloom-overlay-anim flex w-full items-center justify-center py-2 md:py-10"
      style={{ animationDelay: '120ms' }}
    >
      <div className="relative w-full max-w-110">
        <div className="bloom-glass relative rounded-[28px] p-7 sm:p-9">
          <h2
            id="login-form-heading"
            className="mb-7 font-serif text-[26px] leading-[1.05] tracking-tight text-ink"
          >
            Sign <span className="italic text-accent">in</span>
          </h2>

          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <Field
              id={emailId}
              label="Email"
              type="email"
              value={email}
              autoComplete="email"
              inputMode="email"
              placeholder="you@household.co"
              onChange={onEmailChange}
            />

            <Field
              id={passwordId}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={onPasswordChange}
              trailing={
                <button
                  type="button"
                  onClick={onTogglePassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="-mr-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-ink-3 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            <div
              id={errorId}
              role="alert"
              aria-live="polite"
              className={[
                'overflow-hidden text-[13px] leading-snug text-accent transition-[max-height,opacity,margin] duration-200 ease-out',
                error ? 'mt-0 max-h-24 opacity-100' : '-mt-3 max-h-0 opacity-0',
              ].join(' ')}
            >
              {error ? (
                <span className="flex items-start gap-2 rounded-2xl border border-accent/25 bg-[rgba(248,215,192,0.45)] px-3.5 py-2.5">
                  <DotIcon className="mt-1.5 h-1.5 w-1.5 shrink-0 fill-accent" />
                  <span>{error}</span>
                </span>
              ) : (
                <span aria-hidden="true">&nbsp;</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-describedby={error ? errorId : undefined}
              className="group relative mt-1 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full border border-ink/15 bg-ink px-6 py-3 font-sans text-[15px] font-medium text-cream shadow-[0_14px_36px_-12px_rgba(45,36,24,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-px hover:bg-[#3b3022] hover:shadow-[0_18px_42px_-12px_rgba(45,36,24,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-progress disabled:opacity-80 motion-reduce:hover:translate-y-0"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(120% 60% at 50% 0%, rgba(248,215,192,0.18), transparent 60%)',
                }}
              />
              <span className="relative">{loading ? 'Signing in…' : 'Sign in'}</span>
              {loading ? (
                <Spinner />
              ) : (
                <svg
                  aria-hidden="true"
                  className="relative h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8h10m0 0L9 4m4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type: string;
  value: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'numeric' | 'tel' | 'url' | 'search' | 'none';
  placeholder?: string;
  trailing?: React.ReactNode;
  onChange: (value: string) => void;
};

function Field({
  id,
  label,
  type,
  value,
  autoComplete,
  inputMode,
  placeholder,
  trailing,
  onChange,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-serif text-[11px] uppercase tracking-[0.24em] text-ink-2"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          value={value}
          required
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="peer w-full min-h-12 rounded-2xl border border-ink/15 bg-white/65 px-4 py-3 pr-12 font-sans text-[15px] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:font-sans placeholder:text-ink-3/70 hover:border-ink/25 hover:bg-white/80 focus:border-accent/60 focus:bg-white/95 focus:shadow-[0_0_0_4px_rgba(197,112,74,0.12),inset_0_1px_0_rgba(255,255,255,0.7)]"
        />
        {trailing && (
          <div className="absolute right-1.5 flex items-center justify-center">{trailing}</div>
        )}
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.4 4.3M6.7 7.5A17 17 0 0 0 2 12s3.5 6 10 6c1.4 0 2.6-.2 3.8-.6M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 6 6" aria-hidden="true" className={className}>
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="relative h-4 w-4 animate-spin"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 1-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
