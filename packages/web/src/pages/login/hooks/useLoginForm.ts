import { ChangeEvent, FormEvent, useCallback, useId, useState } from 'react';

type LoginFn = (email: string, password: string) => Promise<void>;

type UseLoginFormOptions = {
  login: LoginFn;
  loginWithSSO: () => Promise<void>;
  onLoginSuccess: () => void;
};

export function useLoginForm({ login, loginWithSSO, onLoginSuccess }: UseLoginFormOptions) {
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onEmailChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const onPasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);

  const onTogglePassword = useCallback(() => {
    setShowPassword((value) => !value);
  }, []);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setLoading(true);

      try {
        await login(email, password);
        onLoginSuccess();
      } catch (loginError) {
        setError(loginError instanceof Error ? loginError.message : 'Login failed');
      } finally {
        setLoading(false);
      }
    },
    [email, login, onLoginSuccess, password],
  );

  const onSsoLogin = useCallback(async () => {
    setError(null);
    setSsoLoading(true);

    try {
      // On success the browser is redirected away, so this never resolves.
      await loginWithSSO();
    } catch (ssoError) {
      setError(ssoError instanceof Error ? ssoError.message : 'SSO login failed');
      setSsoLoading(false);
    }
  }, [loginWithSSO]);

  return {
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
  };
}
