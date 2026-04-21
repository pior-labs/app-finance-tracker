import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth';
import { Button } from '@/components/ui/button';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('alex@finlens.local');
  const [password, setPassword] = useState('finlens123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await login(email.trim(), password);

      if (!result.ok) {
        const message = result.error ?? 'Unable to log in.';
        setError(message);
        toast.error(message);
        return;
      }

      toast.success('Welcome back.');
      navigate('/', { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="grid min-h-screen place-items-center bg-[linear-gradient(145deg,#f2f6fa_0%,#ffffff_45%,#e9f0f5_100%)] px-4 py-6">
      <form
        className="grid w-full max-w-md gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-semibold tracking-wide text-slate-900">FinLens</h1>
        <p className="mb-1 text-sm text-slate-600">Log in to access your household finance workspace.</p>

        <label htmlFor="email" className="text-sm font-semibold text-slate-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/40"
          required
        />

        <label htmlFor="password" className="text-sm font-semibold text-slate-800">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300/40"
          required
        />

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

        <Button
          type="submit"
          className="mt-1"
          disabled={submitting || loading}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </section>
  );
}
