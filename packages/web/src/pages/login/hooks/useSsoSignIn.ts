import { useCallback, useId, useState } from 'react';

type UseSsoSignInOptions = {
  loginWithSSO: () => Promise<void>;
};

export function useSsoSignIn({ loginWithSSO }: UseSsoSignInOptions) {
  const errorId = useId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSsoLogin = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // On success the browser is redirected away, so this never resolves.
      await loginWithSSO();
    } catch (ssoError) {
      setError(
        ssoError instanceof Error
          ? ssoError.message
          : 'Could not start sign-in. Try again in a moment.',
      );
      setLoading(false);
    }
  }, [loginWithSSO]);

  return {
    loading,
    error,
    errorId,
    onSsoLogin,
  };
}
