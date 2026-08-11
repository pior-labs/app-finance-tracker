import { LoginErrorMessage } from './LoginErrorMessage';
import { SsoSignInButton } from './SsoSignInButton';

type SignInPanelProps = {
  loading: boolean;
  error: string | null;
  errorId: string;
  onSsoLogin: () => void;
};

export function SignInPanel({ loading, error, errorId, onSsoLogin }: SignInPanelProps) {
  return (
    <section
      aria-labelledby="login-form-heading"
      className="theme-overlay-anim flex w-full items-center justify-center py-2 md:py-10"
      style={{ animationDelay: '120ms' }}
    >
      <div className="relative w-full max-w-96">
        <div className="theme-glass relative rounded-[28px] p-7 sm:p-9">
          <p className="font-serif text-[11px] uppercase tracking-[0.24em] text-ink-2">
            Single sign-on
          </p>

          <h2
            id="login-form-heading"
            className="mt-3 font-serif text-[26px] leading-[1.05] tracking-tight text-ink"
          >
            Sign <span className="italic text-accent">in</span>
          </h2>

          <div className="mt-5 flex flex-col gap-6">
            <p className="text-[15px] leading-[1.65] text-ink-2">
              finlens uses your Pior Labs account. You’ll sign in there, then land right back here.
            </p>

            <LoginErrorMessage id={errorId} error={error} />

            <SsoSignInButton
              loading={loading}
              errorId={errorId}
              hasError={Boolean(error)}
              onClick={onSsoLogin}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
