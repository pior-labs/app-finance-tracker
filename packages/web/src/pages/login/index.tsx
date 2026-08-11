import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BrandPanel } from './components/BrandPanel';
import { SignInPanel } from './components/SignInPanel';
import { useSsoSignIn } from './hooks/useSsoSignIn';

export function LoginPage() {
  const { user, loginWithSSO } = useAuth();
  const signIn = useSsoSignIn({ loginWithSSO });

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-cream font-sans text-ink">
      <div className="theme-mesh" aria-hidden="true">
        <div className="theme-blob b1" />
        <div className="theme-blob b2" />
        <div className="theme-blob b3" />
        <div className="theme-blob b4" />
        <div className="theme-blob b5" />
      </div>
      <div className="theme-grain" aria-hidden="true" />

      <main
        id="main-content"
        className="relative z-2 mx-auto grid min-h-dvh w-full max-w-310 grid-cols-1 gap-10 px-5 py-[max(2rem,env(safe-area-inset-top))] md:grid-cols-[1fr_1fr] md:gap-16 md:px-12 md:py-10 lg:gap-24 lg:px-16"
      >
        <BrandPanel />
        <SignInPanel {...signIn} />
      </main>
    </div>
  );
}
