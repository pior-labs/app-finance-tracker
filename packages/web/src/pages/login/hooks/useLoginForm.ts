import { ChangeEvent, FormEvent, useCallback, useId, useState } from 'react';

type LoginFn = (email: string, password: string) => Promise<void>;

type UseLoginFormOptions = {
  login: LoginFn;
  onLoginSuccess: () => void;
};

export function useLoginForm({ login, onLoginSuccess }: UseLoginFormOptions) {
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  return {
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
  };
}
