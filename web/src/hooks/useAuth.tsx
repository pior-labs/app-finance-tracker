import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null) {
    const message = (payload as { message?: unknown; error?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }

    const error = (payload as { error?: unknown }).error;
    if (typeof error === 'string' && error.length > 0) {
      return error;
    }
  }

  return fallback;
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T;
  return payload;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/get-session', {
        credentials: 'include'
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const payload = (await parseJson<{
        user?: { id: string | number; name: string; email: string };
      }>(response)) as { user?: { id: string | number; name: string; email: string } };

      if (!payload.user) {
        setUser(null);
        return;
      }

      setUser({
        id: Number(payload.user.id),
        name: payload.user.name,
        email: payload.user.email
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const payload = await parseJson(response);
      throw new Error(toErrorMessage(payload, `Request failed: ${response.status}`));
    }

    const payload = await parseJson<{ user?: { id: string | number; name: string; email: string } }>(response);

    if (!payload.user) {
      await refresh();
      return;
    }

    setUser({
      id: Number(payload.user.id),
      name: payload.user.name,
      email: payload.user.email
    });
  };

  const logout = async (): Promise<void> => {
    const response = await fetch('/api/auth/sign-out', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const payload = await parseJson(response);
      throw new Error(toErrorMessage(payload, `Request failed: ${response.status}`));
    }

    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refresh
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
