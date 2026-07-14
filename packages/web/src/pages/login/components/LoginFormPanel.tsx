import { Eye, EyeOff } from 'lucide-react';
import type { ChangeEventHandler, FormEventHandler } from 'react';
import { LoginErrorMessage } from './LoginErrorMessage';
import { LoginField } from './LoginField';
import { LoginSubmitButton } from './LoginSubmitButton';

type LoginFormPanelProps = {
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  ssoLoading: boolean;
  error: string | null;
  emailId: string;
  passwordId: string;
  errorId: string;
  onEmailChange: ChangeEventHandler<HTMLInputElement>;
  onPasswordChange: ChangeEventHandler<HTMLInputElement>;
  onTogglePassword: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onSsoLogin: () => void;
};

export function LoginFormPanel({
  email,
  password,
  showPassword,
  loading,
  ssoLoading,
  error,
  emailId,
  passwordId,
  errorId,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onSsoLogin,
}: LoginFormPanelProps) {
  return (
    <section
      aria-labelledby="login-form-heading"
      className="theme-overlay-anim flex w-full items-center justify-center py-2 md:py-10"
      style={{ animationDelay: '120ms' }}
    >
      <div className="relative w-full max-w-110">
        <div className="theme-glass relative rounded-[28px] p-7 sm:p-9">
          <h2
            id="login-form-heading"
            className="mb-7 font-serif text-[26px] leading-[1.05] tracking-tight text-ink"
          >
            Sign <span className="italic text-accent">in</span>
          </h2>

          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <LoginField
              id={emailId}
              label="Email"
              type="email"
              value={email}
              autoComplete="email"
              inputMode="email"
              placeholder="you@household.co"
              onChange={onEmailChange}
            />

            <LoginField
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
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye aria-hidden="true" className="h-[18px] w-[18px]" />
                  )}
                </button>
              }
            />

            <LoginErrorMessage id={errorId} error={error} />

            <LoginSubmitButton loading={loading} errorId={errorId} hasError={Boolean(error)} />
          </form>

          <div className="my-6 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-ink/10" />
            <span className="text-[12px] font-medium uppercase tracking-wider text-ink-3">or</span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <button
            type="button"
            onClick={onSsoLogin}
            disabled={ssoLoading || loading}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-transparent px-5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ssoLoading ? 'Redirecting…' : 'Continue with Pior Labs'}
          </button>
        </div>
      </div>
    </section>
  );
}
